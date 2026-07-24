// Vercel serverless function — receives the "Schedule a Consultation" form
// submission and upserts the lead into HubSpot as a Contact. The HubSpot
// access token lives only in the HUBSPOT_ACCESS_TOKEN env var (Vercel
// project settings), never in client-side code.

const HUBSPOT_UPSERT_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert';

// student_grade_level_20 is a HubSpot enumeration property — it only accepts
// these internal option values, not the form's display text.
const GRADE_LEVEL_MAP = {
  'Middle School (6th-8th)': '-5yRNrKLJ2-h0IL0POvRh',
  '9th Grade': 'khpNByAh8ZiQ7L5lyZLmP',
  '10th Grade': 'khpNByAh8ZiQ7L5lyZLmP',
  '11th Grade': 'tMN3jkmqZlUCWNtAkkvJT',
  '12th Grade': 'TZ62JqW0KeQBt5jTPkMz3',
  'Current College / Transfer Student': '30woy-ApS8nCmQrF1Puwe',
  'Graduate / Professional School Applicant': 'NgytyMjgqP-lYpymVqdrl',
};

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  const firstname = parts.shift() || '';
  const lastname = parts.join(' ');
  return { firstname, lastname };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    console.error('Missing HUBSPOT_ACCESS_TOKEN env var');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const body = req.body || {};
  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const phone = (body.phone || '').toString().trim();
  const grade = (body.grade || '').toString().trim();
  const interest = (body.interest || '').toString().trim();
  const message = (body.message || '').toString().trim();

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const { firstname, lastname } = splitName(name);

  const properties = {
    email,
    firstname,
    lastname,
    phone,
    student_grade_level_20: GRADE_LEVEL_MAP[grade],
    service_interest: interest,
    message,
  };

  try {
    const hsRes = await fetch(HUBSPOT_UPSERT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inputs: [
          {
            idProperty: 'email',
            id: email,
            properties,
          },
        ],
      }),
    });

    const data = await hsRes.json().catch(() => ({}));

    if (!hsRes.ok || (data.results && data.results[0] && data.results[0].status === 'error')) {
      console.error('HubSpot upsert failed', hsRes.status, JSON.stringify(data));
      return res.status(502).json({ error: 'Failed to save lead' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('HubSpot request error', err);
    return res.status(502).json({ error: 'Failed to reach HubSpot' });
  }
};
