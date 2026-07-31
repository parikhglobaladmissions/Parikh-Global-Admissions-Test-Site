# Parikh Global Admissions — Master Project Checklist

Status reflects only what is verifiable from this project's files and conversation history. Unchecked items are not confirmed done — they may be in progress elsewhere (legal, CRM vendor, etc.) but there's no evidence of that in this workspace.

## 1. Website Infrastructure
- [x] Purchase the domain name — `passagepointadmissions.com` is live
- [x] Registrar pricing researched — see Strategy Brief §9 (Cloudflare/Spaceship flat ~$9.77–9.98/yr vs. GoDaddy promo-then-$22+/yr); worth confirming current registrar and moving at renewal if it's not one of these
- [x] Purchase hosting plan — Vercel, connected to GitHub repo, auto-deploys on push
- [ ] Confirm hosting plan has scalability headroom (check Vercel plan tier)
- [x] Additional domain recommendations researched — see Strategy Brief §9 (`.org`/`.net` defensive registrations); still needs actual purchase
- [x] SSL certificate confirmed active — live site loads over HTTPS (verified 2026-07-29)
- [ ] Confirm backup strategy/process
- [x] Email hosting configured — Google Workspace/Gmail active for the domain, `contact@passagepointadmissions.com` set as primary
- [x] `hello@` → `contact@` sitewide swap and `llms.txt` pricing fix — confirmed live on production 2026-07-31

## 2. Branding & Marketing Materials
- [x] Company logo finalized (`Brand_Assets/Parikh_Brand_At_A_Glance.png`)
- [x] Business cards designed (`print-collateral/business-card.html`)
- [x] Flyer package built (`print-collateral/flyers.html`)
- [x] Brochure/digital marketing collateral built (`print-collateral/brochure.html`)
- [x] Marketing checklist / SOP document prepared — see Strategy Brief §8

## 3. Website Development
- [x] Website copy — substantial pages already built (home, about, philosophy, pricing, FAQs)
- [x] Service pages — 10 built (`services/*.html`)
- [x] Landing pages — location pages (8) and school pages (9) built
- [ ] Video landing pages
- [x] Blog article system — 14 articles + blog index built
- [x] Resource pages — parent-guides (5) + resources.html built
- [ ] Admissions pages review/finalization
- [x] Calls-to-action — present sitewide
- [x] Contact forms — functional multi-step form on `schedule-consultation.html`, posts to a real backend, validates, has mailto fallback
- [x] Inquiry funnels — form → API → HubSpot lead capture pipeline is built and wired up

## 4. CRM & Technology Integration
- [x] CRM integration — **HubSpot** (not LeadSquared as originally scoped — flag this discrepancy) via `api/consultation.js`, a Vercel serverless function that upserts contacts with mapped custom properties
- [ ] Parent portal
- [ ] Student portal
- [x] API integrations — HubSpot Contacts API (upsert) live; GTM dataLayer lead event on submit
- [x] Inquiry forms (functional, connected to CRM) — see above
- [ ] Scheduling system (beyond the inquiry form itself — no calendar booking found)
- [ ] CRM automation (workflows would live inside HubSpot's own UI — not visible from this codebase)
- [ ] Lead routing (same — HubSpot-side config, not confirmed)
- [ ] Email automation
- [ ] Workflow automation
- [ ] Application tracking process

## 5. Business Email Setup
- [x] Primary business email live — `contact@passagepointadmissions.com` (Google Workspace)
- [ ] General inquiries address
- [ ] Admissions address
- [ ] Student Success address
- [ ] Parent Support address
- [ ] Partnerships address
- [ ] Billing address
- [ ] Executive Office address
- [ ] Marketing address
- [ ] Forwarding rules standardized
- [ ] Email signatures standardized/branded

## 6. SEO & Digital Marketing Foundation
- [x] Local SEO groundwork — 8 location-specific landing pages built
- [x] National SEO strategy documented — see Strategy Brief §3
- [x] GEO (Generative Engine Optimization) — `llms.txt` built: full AI-answer-engine summary of firm, services, pricing, FAQs
- [x] Technical SEO — `sitemap.xml` and `robots.txt` present, GTM installed sitewide, schema markup on 66/71 pages (LocalBusiness, Organization, FAQPage, BreadcrumbList)
- [x] Keyword strategy documented — see Strategy Brief §3 (clusters by intent: transactional, comparison, awareness, AI-era)
- [!] Competitor keyword analysis — qualitative comparison done (Strategy Brief §3); true volume/difficulty data needs a paid tool (Ahrefs/SEMrush) not available in this workspace
- [ ] Internal linking strategy audit
- [x] Schema markup — confirmed sitewide (66/71 pages), not just homepage
- [x] AI search optimization — `robots.txt` explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended; `llms.txt` built for AI assistants
- [x] Strategy compared against competitors — see Strategy Brief §4

## 7. Google Business Profile Rollout
*(Strategy Brief §6 has the full process — but surfaced a real compliance issue first: nothing on the site lists a staffed street address, and Google prohibits 4 separate listings for one practice at one address. Rollout plan branches on one question only you can answer: 4 genuinely staffed offices, or one practice serving multiple markets? See the brief for both compliant paths.)*
- [x] Business phone number acquired — (561) 408-6686 (Google Voice), added sitewide 2026-07-31 (footer, schema `telephone` field, schedule-consultation page, print collateral, llms.txt). This was a hard requirement for GBP profile creation; the staffed-address question above is now the only remaining blocker.
- [ ] Boca Raton profile (blocked on the question above)
- [ ] Wellington / Palm Beach profile (blocked on the question above)
- [ ] Coral Gables profile (blocked on the question above)
- [ ] Miami Beach profile (blocked on the question above)
- [x] Verification requirements documented — Strategy Brief §6
- [x] Virtual office/address options documented — Strategy Brief §6 (short answer: not compliant; real staffed address required)
- [ ] Photos (process documented in §6; not yet executed)
- [ ] Categories (process documented in §6; not yet executed)
- [ ] Services listed (process documented in §6; not yet executed)
- [x] Reviews strategy documented — Strategy Brief §6
- [x] Posts strategy documented — Strategy Brief §6 (weekly, repurposed from blog)
- [x] Q&A process documented — Strategy Brief §6
- [x] Ongoing optimization process documented — Strategy Brief §6

## 8. Independent Educational Consultant Positioning
- [x] Professional memberships research — Strategy Brief §7 (IECA, HECA, NACAC compared)
- [x] Certifications research — Strategy Brief §7 (CEP credential via AICEP)
- [x] Website trust indicators — partial: `about.html` has a "Credentials & Affiliations" section (founder's DMD/MS/MPH, NTPA affiliation via a separate tutoring venture) — but no admissions-specific industry credentials listed yet; recommended sequence in §7
- [x] Industry associations (firm-level) — Strategy Brief §7
- [x] Best practices from leading firms — Strategy Brief §7's recommended sequence (NACAC → IECA Associate → CEP)

## 9. Social Media Strategy
*(Full plan in Strategy Brief §5. No social links/icons found anywhere on the live site — no platform presence connected yet, so this is all planning, nothing executed.)*
- [x] LinkedIn plan — §5 (high priority, 2–3x/week)
- [x] Instagram plan — §5 (high priority, 4–5x/week)
- [x] Facebook plan — §5 (medium priority, 2–3x/week)
- [x] TikTok plan — §5 (medium priority, 3–4x/week)
- [x] YouTube plan — §5 (medium-high priority)
- [x] X plan — §5 (low priority, opportunistic)
- [x] Branding standards — §5 (reuse existing navy/gold/serif system, no separate social identity)
- [x] Posting frequency — §5 (per-platform cadence table)
- [x] Content calendar — §5 (6 content pillars + month-one rollout sequence)
- [x] Educational videos — covered under content pillars, §5
- [x] Student success stories — covered under content pillars, §5
- [x] Parent education content — covered under content pillars, §5
- [x] College admissions tips content — covered under content pillars, §5
- [x] AI/career-focused content — covered under content pillars, §5
- [x] Short-form video strategy — §5 (TikTok/Reels/Shorts cadence)

## 10. Blog & Content Strategy
- [x] Initial article set published (14 posts covering admissions trends, financial aid, SAT/ACT, career planning, grad admissions, international admissions, AI in education, parent resources)
- [ ] Ongoing weekly publishing cadence defined
- [ ] Editorial calendar

## 11. Competitor Analysis
*(Positioning-level comparison against IvyWise, Command Education, Ivy Coach, College Coach, CollegeWise, AcceptU, Accepted, Ivy Scholars — Strategy Brief §4.)*
- [ ] Website design comparison — needs a line-by-line site audit; flagged as needing dedicated tooling
- [ ] UX comparison — same as above
- [!] Services comparison — geographic/positioning covered in §4; not a full service-by-service audit
- [x] Technology comparison — §4
- [x] SEO comparison — §4 (GEO/AI-search visibility specifically)
- [x] Content strategy comparison — §4
- [!] Lead generation comparison — touched on via the technology row in §4; not a dedicated funnel-by-funnel comparison
- [x] Trust/credibility comparison — §4 (pricing transparency, no-guarantee stance)
- [x] Automation comparison — §4
- [x] AI integration comparison — §4 (AI ethics policy)

## 12. Corporate Formation
*(Checked: privacy policy, terms of service, and footer copyright ("© 2026 Passage Point Admissions") show no entity suffix (LLC/Inc.) or registered-agent language — no evidence of formation status in this workspace, has to be confirmed with whoever's handling the legal filing.)*
- [ ] Sunbiz registration
- [ ] Corporate filings
- [ ] EIN
- [ ] Business licenses
- [ ] Banking requirements
- [ ] Compliance checklist
- [ ] Required documentation
- [ ] Operational setup

---
*Last updated: 2026-07-29. Update this file as items are confirmed complete — items outside this workspace (legal, CRM vendor, ad accounts) need to be reported back to be checked off.*
