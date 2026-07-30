// Vercel serverless function — creates a Stripe Checkout Session for a
// self-serve package from api/_packages.js. The client sends only a
// packageId and planType; the price is always looked up server-side so a
// tampered client request can never set its own amount. The Stripe secret
// key lives only in the STRIPE_SECRET_KEY env var (Vercel project settings),
// never in client-side code.
const Stripe = require('stripe');
const { PACKAGES, INSTALLMENT_MONTHS } = require('./_packages');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('Missing STRIPE_SECRET_KEY env var');
    return res.status(500).json({ error: 'Server not configured' });
  }
  const stripe = new Stripe(secretKey);

  const body = req.body || {};
  const packageId = (body.packageId || '').toString();
  const planType = body.planType === 'installment' ? 'installment' : 'full';

  const pkg = PACKAGES[packageId];
  if (!pkg) {
    return res.status(400).json({ error: 'Unknown package' });
  }
  if (planType === 'installment' && !pkg.installmentEligible) {
    return res.status(400).json({ error: 'Installments are not available for this package' });
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${proto}://${host}`;

  const successUrl = `${origin}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/checkout.html?package=${encodeURIComponent(packageId)}&canceled=1`;

  const sessionParams = {
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: 'required',
    automatic_tax: { enabled: true },
    customer_creation: 'always',
    allow_promotion_codes: true,
    metadata: { packageId, planType },
  };

  if (planType === 'installment') {
    const months = pkg.installmentMonths || INSTALLMENT_MONTHS;
    const installmentAmount = Math.ceil(pkg.amount / months);
    const cancelAt = Math.floor(Date.now() / 1000) + months * 30 * 24 * 60 * 60;

    sessionParams.mode = 'subscription';
    sessionParams.subscription_data = {
      cancel_at: cancelAt,
      metadata: { packageId, planType },
    };
    sessionParams.line_items = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: pkg.name,
          description: `${months} monthly payments of $${(installmentAmount / 100).toFixed(2)}`,
          tax_code: pkg.taxCode,
        },
        unit_amount: installmentAmount,
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }];
  } else {
    sessionParams.mode = 'payment';
    sessionParams.line_items = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: pkg.name,
          description: pkg.description,
          tax_code: pkg.taxCode,
        },
        unit_amount: pkg.amount,
      },
      quantity: 1,
    }];
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error', err);
    return res.status(502).json({ error: 'Failed to start checkout' });
  }
};
