// Server-side source of truth for self-serve priced programs — the client only
// ever sends a packageId; the price is always looked up here, never trusted
// from the request body.
//
// taxCode values are Stripe Tax product tax codes (https://docs.stripe.com/tax/tax-codes),
// used so Stripe Tax classifies each line item correctly instead of defaulting
// to a generic goods category.
//
// installmentMonths overrides the default INSTALLMENT_MONTHS split for a
// given package — used for the advising packages below, where a flat 3-month
// split would mean a $3.3K+/month charge. Foundations has no override because
// it isn't installment-eligible at all.
const PACKAGES = {
  foundations: {
    name: 'Foundations',
    description: '8th–10th grade: 4-year course plan, extracurricular development, and early testing awareness (15 sessions/yr)',
    amount: 350000,
    taxCode: 'txcd_20060048', // Consulting Services
    installmentEligible: false,
  },
  'core-strategy': {
    name: 'Core Strategy & Application Season',
    description: '11th–12th grade: college list, testing, essays, applications, and financial aid guidance (50 sessions over 2 years)',
    amount: 990000,
    taxCode: 'txcd_20060048',
    installmentEligible: true,
    installmentMonths: 6,
  },
  'comprehensive-partnership': {
    name: 'Comprehensive Partnership',
    description: '9th grade through senior decision: one advisor, all four years of high school, ending with final college enrollment support (80 sessions)',
    amount: 1650000,
    taxCode: 'txcd_20060048',
    installmentEligible: true,
    installmentMonths: 12,
  },
  'ai-self-paced': {
    name: 'AI Self-Paced Program',
    description: "Adaptive SAT/ACT/PSAT practice, on the student's own schedule",
    amount: 89900,
    taxCode: 'txcd_20060058', // Training Services - Self-study Web-based
    installmentEligible: false,
  },
  'test-prep-12hr': {
    name: '12-Hour Program',
    description: 'A focused start toward a specific SAT/ACT/PSAT score goal',
    amount: 244900,
    taxCode: 'txcd_20060059', // Tutoring
    installmentEligible: true,
  },
  'test-prep-25hr': {
    name: '25-Hour Program',
    description: 'Our most common tutoring package',
    amount: 344900,
    taxCode: 'txcd_20060059',
    installmentEligible: true,
  },
  'test-prep-40hr': {
    name: '40-Hour Program',
    description: 'Deep, sustained SAT/ACT/PSAT prep across every section',
    amount: 454900,
    taxCode: 'txcd_20060059',
    installmentEligible: true,
  },
  'test-prep-unlimited': {
    name: 'Unlimited Top Scores Program',
    description: 'Tutoring continues until the target score is hit',
    amount: 489900,
    taxCode: 'txcd_20060059',
    installmentEligible: true,
  },
  'essay-advising': {
    name: 'Essay Advising Program',
    description: 'One-on-one support through brainstorming, drafts, and revisions',
    amount: 99900,
    taxCode: 'txcd_20060048', // Consulting Services
    installmentEligible: false,
  },
  'essay-bootcamp': {
    name: 'College Essay & Application Bootcamp',
    description: 'An intensive, condensed sprint through essays and the full application',
    amount: 149900,
    taxCode: 'txcd_20060048',
    installmentEligible: true,
  },
  'single-session': {
    name: 'Single Advising Session (1 hour)',
    description: 'One essay review, interview prep, or one-time strategy session',
    amount: 19500,
    taxCode: 'txcd_20060048',
    installmentEligible: false,
  },
  'essay-workbook': {
    name: 'College Essay Brainstorming & Guidelines',
    description: 'A self-paced digital guide with brainstorming exercises to find a personal statement topic, plus writing guidelines for structuring the essay',
    amount: 2900,
    taxCode: 'txcd_20060058', // Training Services - Self-study Web-based
    installmentEligible: false,
    digitalDelivery: true,
  },
};

// Installments split the full price evenly across this many monthly charges,
// with the first charge collected immediately at checkout. Implemented as a
// Stripe subscription capped with `cancel_at` so Stripe's own billing engine
// handles the remaining charges — no custom cron/scheduling needed.
const INSTALLMENT_MONTHS = 3;

module.exports = { PACKAGES, INSTALLMENT_MONTHS };
