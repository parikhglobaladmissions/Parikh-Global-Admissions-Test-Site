// Vercel serverless function — Stripe webhook endpoint. Confirms a completed
// checkout (one-time or first installment payment) and upserts the buyer into
// HubSpot, mirroring the same upsert pattern api/consultation.js already uses.
// The webhook signing secret lives only in the STRIPE_WEBHOOK_SECRET env var.
//
// Signature verification needs the raw request body, so Vercel's automatic
// JSON body parsing is disabled below via `config.api.bodyParser = false`.
const Stripe = require('stripe');
const { PACKAGES, INSTALLMENT_MONTHS } = require('./_packages');

const HUBSPOT_CONTACT_UPSERT_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert';
const HUBSPOT_DEAL_CREATE_URL = 'https://api.hubapi.com/crm/v3/objects/deals';

// Confirmed against this portal's actual pipeline via the HubSpot CRM API —
// there is only one pipeline ("default" / "Sales Pipeline") and its stages
// are the HubSpot-standard set, so a completed payment always lands in the
// standard "closedwon" stage of that pipeline. If a dedicated enrollment
// pipeline/stage is ever created in HubSpot, update these two constants.
const HUBSPOT_DEAL_PIPELINE = 'default';
const HUBSPOT_DEAL_STAGE_WON = 'closedwon';

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstname = parts.shift() || '';
  const lastname = parts.join(' ');
  return { firstname, lastname };
}

// Upserts the buyer as a Contact and returns their HubSpot contact ID (needed
// to associate the Deal created below), or null if the upsert didn't run/fail.
async function upsertHubspotContact({ email, name, packageId, planType }) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token || !email) return null;

  const pkg = PACKAGES[packageId];
  const { firstname, lastname } = splitName(name);
  const planLabel = planType === 'installment' ? 'installment plan' : 'paid in full';

  const properties = {
    email,
    firstname,
    lastname,
    service_interest: pkg ? pkg.name : packageId,
    message: `Enrolled and paid online for "${pkg ? pkg.name : packageId}" (${planLabel}).`,
  };

  const hsRes = await fetch(HUBSPOT_CONTACT_UPSERT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      inputs: [{ idProperty: 'email', id: email, properties }],
    }),
  });

  const data = await hsRes.json().catch(() => ({}));
  const result = data.results && data.results[0];
  if (!hsRes.ok || (result && result.status === 'error')) {
    console.error('HubSpot contact upsert failed after payment', hsRes.status, JSON.stringify(data));
    return null;
  }
  return result ? result.id : null;
}

// Creates a Deal for the completed sale and associates it with the buyer's
// Contact record, so the payment shows up as real pipeline revenue instead
// of a note buried in the contact's message field.
async function createHubspotDeal({ contactId, packageId, planType, installmentMonths }) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token || !contactId) return;

  const pkg = PACKAGES[packageId];
  const planLabel = planType === 'installment' ? `Installment Plan (${installmentMonths} mo.)` : 'Paid in Full';

  const dealRes = await fetch(HUBSPOT_DEAL_CREATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      properties: {
        dealname: `${pkg ? pkg.name : packageId} — ${planLabel}`,
        amount: pkg ? (pkg.amount / 100).toFixed(2) : undefined,
        pipeline: HUBSPOT_DEAL_PIPELINE,
        dealstage: HUBSPOT_DEAL_STAGE_WON,
        closedate: new Date().toISOString(),
      },
    }),
  });

  const dealData = await dealRes.json().catch(() => ({}));
  if (!dealRes.ok || !dealData.id) {
    console.error('HubSpot deal creation failed after payment', dealRes.status, JSON.stringify(dealData));
    return;
  }

  const assocRes = await fetch(
    `https://api.hubapi.com/crm/v3/objects/deals/${dealData.id}/associations/contacts/${contactId}/deal_to_contact`,
    { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
  );
  if (!assocRes.ok) {
    console.error('HubSpot deal-to-contact association failed', assocRes.status, dealData.id, contactId);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    console.error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET env var');
    return res.status(500).json({ error: 'Server not configured' });
  }
  const stripe = new Stripe(secretKey);

  let event;
  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { packageId, planType } = session.metadata || {};
    const email = session.customer_details && session.customer_details.email;
    const name = session.customer_details && session.customer_details.name;

    try {
      const contactId = await upsertHubspotContact({ email, name, packageId, planType });
      const pkg = PACKAGES[packageId];
      const installmentMonths = pkg ? (pkg.installmentMonths || INSTALLMENT_MONTHS) : INSTALLMENT_MONTHS;
      await createHubspotDeal({ contactId, packageId, planType, installmentMonths });
    } catch (err) {
      console.error('Error syncing completed payment to HubSpot', err);
    }
  }

  // Always acknowledge receipt once the signature checks out — the payment
  // already succeeded on Stripe's side by this point, so a downstream CRM
  // hiccup (logged above) shouldn't cause Stripe to keep retrying delivery.
  return res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
