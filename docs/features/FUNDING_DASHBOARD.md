# Feature: Funding Dashboard

## Purpose
Live view of AI startup funding — rounds, investors, and trends shaping where capital is moving.

## Architecture
- **Web app**: Funding page (`/funding`) with charts, filters, round listings
- **Admin app**: Funding round CRUD, investor management

## Business Logic
- Funding rounds linked to startups via `FundingRound.startupId`
- Round types: Pre-Seed, Seed, Series A/B/C, Growth, IPO
- Amounts stored in USD cents (BigInt) for precision
- Lead investors tracked per round
- Total funding aggregated per startup for directory display
- Announced date tracked for timeline display

## Database
- `FundingRound` — startupId, roundType, amountUsd, announcedAt, leadInvestors
- `Startup.totalFunding` — Aggregated from rounds (computed in queries)

## Key Files
- `apps/web/app/(public)/funding/page.tsx`
- `apps/admin/app/(dashboard)/funding-rounds/`
- `apps/admin/app/(dashboard)/funding-dir/`
