# Feature: India AI Hub

## Purpose
Dedicated section for India's AI landscape — government schemes, policies, support programs, and ecosystem resources.

## Architecture
- **Web app**: `/india-ai` hub page + `/india-ai/schemes/*` sub-pages
- **Admin app**: India AI content management

## Content
- IndiaAI Mission overview (₹10,372 Crore government initiative)
- Government schemes and their application processes
- Policy updates and analysis
- AI research institutions
- Talent statistics by city
- India-specific AI ecosystem data

## Business Logic
- Mix of static content and dynamic data
- Schemes have: name, budget, eligibility, application URL
- Researcher profiles from `AIResearcher` table
- Talent stats from `TalentStats` table (per city, per year)
- City-level ecosystem data

## Database
- `AIResearcher` — AI researchers (university, position, citations, h-index)
- `TalentStats` — City-level talent data (engineers, salaries, skills)

## Key Files
- `apps/web/app/(public)/india-ai/page.tsx` — Hub page
- `apps/web/app/(public)/india-ai/schemes/` — Scheme pages
- `apps/web/components/india-ai/` — India AI components
- `apps/admin/app/(dashboard)/india-ai/` — Admin management
