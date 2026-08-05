// Vercel serverless function — confirms a completed Stripe Checkout Session
// before payment-success.html reveals a digital-delivery product (e.g.
// College Essay Brainstorming & Guidelines). Verification happens server-side against
// Stripe directly; a session_id alone is not enough to grant access unless
// Stripe confirms that session actually reached payment_status "paid".
const Stripe = require('stripe');
const { PACKAGES } = require('./_packages');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('Missing STRIPE_SECRET_KEY env var');
    return res.status(500).json({ error: 'Server not configured' });
  }
  const stripe = new Stripe(secretKey);

  const sessionId = (req.query.session_id || '').toString();
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const packageId = session.metadata && session.metadata.packageId;
    const pkg = PACKAGES[packageId];

    if (session.payment_status !== 'paid' || !pkg) {
      return res.status(200).json({ ok: false });
    }

    return res.status(200).json({
      ok: true,
      packageId,
      digitalDelivery: !!pkg.digitalDelivery,
    });
  } catch (err) {
    console.error('Stripe session verification error', err);
    return res.status(200).json({ ok: false });
  }
};
