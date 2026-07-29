# Git Workflow

Standard git workflow for all contributors.

---

## Branch Strategy

```
main (production)
  └── feature/tool-comparison
  └── fix/upvote-display-bug
  └── chore/upgrade-dependencies
  └── docs/caching-architecture
```

**Rules**:
- `main` is always deployable (auto-deploys to production via Vercel)
- Never push directly to `main`
- All changes go through Pull Requests
- Feature branches are short-lived (< 1 week)

---

## Branch Naming

```
feature/short-description    → New functionality
fix/what-is-broken           → Bug fixes
chore/maintenance-task       → Refactoring, deps, config
docs/topic-name              → Documentation only
hotfix/critical-fix          → Emergency production fix
```

Keep names lowercase, use hyphens, max 3-4 words.

---

## Workflow

### 1. Create Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

### 2. Make Changes
- Commit frequently with meaningful messages
- Follow [Conventional Commits](https://www.conventionalcommits.org/)

```bash
git add <specific-files>        # Never git add .
git commit -m "feat(web): add tool comparison page"
```

### 3. Push and Create PR
```bash
git push -u origin feature/my-feature
```
Then create a PR on GitHub.

### 4. Review and Merge
- CI must pass (lint + build)
- 1 approval required
- **Squash merge** to main (clean history)

### 5. Clean Up
```bash
git checkout main
git pull origin main
git branch -d feature/my-feature
```

---

## Commit Standards

Format: `type(scope): description`

**Types**:
| Type | When |
|------|------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `chore` | Maintenance, deps, config |
| `docs` | Documentation only |
| `refactor` | Code restructuring (no behavior change) |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `ci` | CI/CD changes |

**Scopes**: `web`, `admin`, `api`, `db`, `infra`, `shared`

**Examples**:
```
feat(web): add AI events section to about page
fix(admin): correct IST timezone display in activity log
chore(db): add missing indexes on ToolUpvote table
docs(arch): document caching architecture
refactor(web): extract UpvoteButton into shared component
perf(web): add Redis caching for tool categories
```

---

## PR Guidelines

### Title
- Concise, under 70 characters
- Same format as commit: `feat(web): add comparison page`

### Description
```markdown
## Summary
Brief explanation of what and why.

## Changes
- Added comparison page at /tools/compare/[slugs]
- Created ComparisonTable component
- Added API route for fetching multiple tools

## Testing
- Tested with 2, 3, and 4 tools
- Verified mobile responsiveness
- Checked empty state

## Screenshots
(attach if UI changes)
```

### Before Submitting
- [ ] `npm run build` passes locally
- [ ] No TypeScript errors
- [ ] No console.log statements
- [ ] No secrets in code
- [ ] Relevant docs updated

---

## Protected Branch Rules (main)

- Require PR reviews (1 minimum)
- Require CI status checks to pass
- No force pushes
- No direct commits

---

## Hotfix Process

For critical production issues:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix
# Make minimal fix
git commit -m "fix(web): patch critical auth bypass"
git push -u origin hotfix/critical-fix
# Create PR → expedited review → merge
```

---

## Related Documents

- [CONTRIBUTING.md](../../CONTRIBUTING.md) — Full contribution guidelines
- [Coding Standards](./CODING_STANDARDS.md) — Code conventions
- [Deployment](../architecture/DEPLOYMENT.md) — What happens after merge
