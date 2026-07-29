# Contributing to AI Startup Impact

Thank you for your interest in contributing. This guide covers the workflow, standards, and expectations for all contributors.

---

## Getting Started

1. Read the [README.md](README.md) for project overview
2. Follow [docs/development/SETUP.md](docs/development/SETUP.md) for local setup
3. Review the coding standards below before writing code

---

## Branch Naming

```
feature/short-description    → New features
fix/issue-description        → Bug fixes
chore/task-description       → Maintenance, refactoring, deps
docs/topic                   → Documentation only
```

Examples:
- `feature/tool-comparison-page`
- `fix/upvote-count-display`
- `chore/upgrade-prisma`
- `docs/caching-architecture`

---

## Commit Standards

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(web): add tool comparison page
fix(admin): correct bulk delete permission check
chore(db): add missing indexes on ToolUpvote
docs(arch): document caching strategy
```

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `ci`

**Scopes**: `web`, `admin`, `api`, `db`, `infra`, `shared`

---

## Pull Request Process

### Before Opening a PR
- [ ] Code compiles (`npm run build` passes)
- [ ] Lint passes (`npm run lint`)
- [ ] Tested locally (manual verification)
- [ ] No secrets or `.env` values committed
- [ ] Database migrations included if schema changed

### PR Description Template
```markdown
## Summary
What changed and why.

## Changes
- Added X
- Fixed Y
- Updated Z

## Testing
How this was verified locally.

## Screenshots
(if UI changes)
```

### Review Expectations
- 1 approval required before merge
- CI must pass (lint + build)
- Address all review comments or explain why not
- Merge via **squash merge** to keep history clean

---

## Coding Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` + type guards)
- Explicit return types on exported functions
- Prefer `const` over `let`

### React / Next.js
- Server Components by default
- Add `'use client'` only when hooks/interactivity needed
- Use `clsx()` for conditional classes (not template literals)
- Forms: controlled inputs with server action submission

### Naming
| What | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ToolTagSelector.tsx` |
| Utilities | camelCase | `formatCurrency.ts` |
| Routes | kebab-case | `app/(public)/tools/page.tsx` |
| Constants | UPPER_SNAKE | `MAX_UPLOAD_SIZE` |
| DB columns | camelCase | `isApproved`, `createdAt` |
| Env vars | UPPER_SNAKE | `DATABASE_URL` |

### File Organization
- One component per file
- Co-locate related files (component + types + utils)
- Shared code goes in `components/shared/` or `lib/`

---

## Documentation Requirements

- Feature PRs must update relevant docs or create a follow-up issue
- New API endpoints need at minimum: method, path, auth, description
- New env vars must be added to `.env.example` with a comment

---

## What NOT to Do

- Don't push directly to `main`
- Don't commit `.env` files or secrets
- Don't use `git add .` without reviewing staged files
- Don't skip TypeScript errors with `@ts-ignore`
- Don't add dependencies without checking for alternatives already in the project
- Don't introduce new UI libraries (we use Tailwind + Lucide icons)

---

## Need Help?

- Check [docs/troubleshooting/](docs/troubleshooting/) for common issues
- Ask in the team Slack channel
- Tag the relevant code owner in your PR
