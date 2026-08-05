// Vercel serverless function — Stripe webhook endpoint. Confirms a completed
// checkout (one-time or first installment payment), upserts the buyer into
// HubSpot (mirroring the same upsert pattern api/consultation.js already
// uses), and for digital-delivery packages emails instant access via Resend.
// The webhook signing secret lives only in the STRIPE_WEBHOOK_SECRET env var.
//
// Signature verification needs the raw request body, so Vercel's automatic
// JSON body parsing is disabled below via `config.api.bodyParser = false`.
const Stripe = require('stripe');
const { PACKAGES, INSTALLMENT_MONTHS } = require('./_packages');

const HUBSPOT_CONTACT_UPSERT_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert';
const HUBSPOT_DEAL_CREATE_URL = 'https://api.hubapi.com/crm/v3/objects/deals';
const RESEND_API_URL = 'https://api.resend.com/emails';
const SITE_URL = 'https://passagepointadmissions.com';

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

// Emails instant access to a digital-delivery purchase via Resend, so the
// buyer doesn't have to stay on or return to payment-success.html to get in.
// The link re-uses the same session_id-based verification api/verify-purchase
// already does, so it grants access the same way the on-page link does.
async function sendGuideEmail({ email, packageId, sessionId }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !email) return;

  const pkg = PACKAGES[packageId];
  const guideUrl = `${SITE_URL}/essay-workbook-content.html?session_id=${encodeURIComponent(sessionId)}`;
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'Passage Point Admissions <contact@passagepointadmissions.com>';

  const emailRes = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [email],
      subject: `Your ${pkg ? pkg.name : 'guide'} is ready`,
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; color: #2B2F36;">
          <p style="text-transform: uppercase; letter-spacing: 0.14em; font-size: 11px; font-weight: 600; color: #B8892B;">Passage Point Admissions</p>
          <h1 style="font-size: 20px; color: #12233F;">Thanks for your purchase</h1>
          <p style="line-height: 1.6;">Your ${pkg ? pkg.name : 'guide'} is ready. Click below for instant access, no need to log in or wait for anything else.</p>
          <p style="text-align: center; margin: 28px 0;">
            <a href="${guideUrl}" style="background: #B8892B; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: bold; display: inline-block;">View Your Guide</a>
          </p>
          <p style="font-size: 13px; color: #6b7a93;">If the button doesn't work, copy and paste this link into your browser:<br>${guideUrl}</p>
          <p style="font-size: 13px; color: #6b7a93; margin-top: 24px;">A separate receipt is on its way from Stripe.</p>
        </div>
      `,
    }),
  });

  if (!emailRes.ok) {
    const errData = await emailRes.json().catch(() => ({}));
    console.error('Resend guide-delivery email failed', emailRes.status, JSON.stringify(errData));
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
    const pkg = PACKAGES[packageId];

    try {
      const contactId = await upsertHubspotContact({ email, name, packageId, planType });
      const installmentMonths = pkg ? (pkg.installmentMonths || INSTALLMENT_MONTHS) : INSTALLMENT_MONTHS;
      await createHubspotDeal({ contactId, packageId, planType, installmentMonths });
    } catch (err) {
      console.error('Error syncing completed payment to HubSpot', err);
    }

    if (pkg && pkg.digitalDelivery) {
      try {
        await sendGuideEmail({ email, packageId, sessionId: session.id });
      } catch (err) {
        console.error('Error sending digital-delivery email via Resend', err);
      }
    }

    // Checkout Session's subscription_data doesn't accept cancel_at at creation
    // time, so the installment plan is capped here instead, once the real
    // subscription exists.
    if (planType === 'installment' && session.subscription) {
      try {
        const months = pkg ? (pkg.installmentMonths || INSTALLMENT_MONTHS) : INSTALLMENT_MONTHS;
        const cancelAt = Math.floor(Date.now() / 1000) + months * 30 * 24 * 60 * 60;
        await stripe.subscriptions.update(session.subscription, { cancel_at: cancelAt });
      } catch (err) {
        console.error('Error capping installment subscription with cancel_at', err);
      }
    }
  }

  // Always acknowledge receipt once the signature checks out — the payment
  // already succeeded on Stripe's side by this point, so a downstream CRM
  // hiccup (logged above) shouldn't cause Stripe to keep retrying delivery.
  return res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
