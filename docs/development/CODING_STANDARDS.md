# Coding Standards

Conventions and patterns used across the AI Startup Impact codebase.

---

## TypeScript

- Strict mode enabled (`"strict": true`)
- No `any` — use `unknown` with type guards, or define interfaces
- Explicit return types on all exported functions
- Prefer `const` over `let`, never use `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Destructure objects/arrays where it improves readability

```typescript
// ✓ Good
export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const tools = await sql`SELECT * FROM "AiTool" WHERE slug = ${slug} LIMIT 1`;
  return tools[0] ?? null;
}

// ✗ Bad
export async function getToolBySlug(slug: any) {
  var tools = await sql`SELECT * FROM "AiTool" WHERE slug = ${slug} LIMIT 1`;
  return tools[0];
}
```

---

## React / Next.js

### Server vs Client Components
- **Default**: Server Components (no directive needed)
- **Add `'use client'`** only when: hooks, event handlers, browser APIs, or state needed
- Keep client components small — extract server data fetching to parent

### Component Patterns
```typescript
// Server Component (default)
export default async function ToolsPage() {
  const tools = await getApprovedTools();
  return <ToolsList tools={tools} />;
}

// Client Component (when interactivity needed)
'use client';
export default function UpvoteButton({ toolId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  // ...
}
```

### Data Fetching
- Server Components: Direct Prisma/SQL queries (no fetch needed)
- Client mutations: `fetch('/api/...')` to API routes
- Forms: Server Actions (`'use server'`) in admin/founder dashboards
- Lists: Server-rendered with ISR (`export const revalidate = 60`)

---

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `ToolTagSelector.tsx` |
| Page files | `page.tsx` | `app/(public)/tools/page.tsx` |
| Layout files | `layout.tsx` | `app/(public)/layout.tsx` |
| API routes | `route.ts` | `app/api/tools/[id]/route.ts` |
| Utility files | camelCase | `formatCurrency.ts` |
| Lib files | kebab-case | `founder-auth.ts`, `cache-invalidate.ts` |
| Constants | UPPER_SNAKE | `DAILY_UPVOTE_CAP`, `MAX_UPLOAD_SIZE` |
| DB enums | PascalCase | `APPROVED`, `PRE_SEED`, `FREEMIUM` |
| DB columns | camelCase | `isApproved`, `createdAt`, `searchVector` |
| CSS classes | Tailwind utilities | `text-brand`, `font-sora` |
| Env vars | UPPER_SNAKE | `DATABASE_URL`, `RESEND_API_KEY` |

---

## File Organization

```
// Feature page structure
app/(public)/tools/
├── page.tsx              → Page component (data fetching + layout)
├── loading.tsx           → Loading skeleton (optional)
├── error.tsx             → Error boundary (optional)
└── [slug]/
    ├── page.tsx          → Detail page
    └── opengraph-image-*/→ Dynamic OG image

// Shared component
components/shared/
└── ToolTagSelector.tsx   → One component per file, named export
```

---

## API Routes

### Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Auth check
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Validation
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    // 3. Business logic + DB
    const result = await sql`INSERT INTO ... VALUES ...`;

    // 4. Response
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Rules
- Always wrap in try/catch
- Return typed error responses: `{ error: string }`
- Use HTTP status codes correctly (401, 403, 404, 429, 500)
- Log errors with `console.error` (picked up by Sentry)
- Rate limit public endpoints with `@upstash/ratelimit`

---

## Server Actions (Admin/Founder)

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { neon } from '@neondatabase/serverless';
import { logAuditEvent } from '@/lib/audit-log';

const sql = neon(process.env.DATABASE_URL!);

export async function approveToolAction(id: string) {
  try {
    await sql`UPDATE "AiTool" SET status = 'APPROVED' WHERE id = ${id}`;
    await logAuditEvent({ action: 'APPROVE_TOOL', resourceType: 'tool', resourceId: id });
    revalidatePath('/tools');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to approve' };
  }
}
```

### Rules
- Return `{ success: boolean, error?: string }` — never throw
- Call `revalidatePath()` to invalidate ISR cache
- Call `invalidateCache()` for Redis keys
- Log admin actions via `logAuditEvent()`
- Check permissions via `canDelete()` for destructive ops

---

## Database Queries

### Use Raw SQL for complex queries
```typescript
const rows = await sql`
  SELECT s.id, s.name, s.slug,
         COALESCE(SUM(fr."amountUsd") / 100, 0) AS "totalFunding"
  FROM "Startup" s
  LEFT JOIN "FundingRound" fr ON fr."startupId" = s.id
  WHERE s."deletedAt" IS NULL AND s."isApproved" = true
  GROUP BY s.id
  ORDER BY "totalFunding" DESC
  LIMIT 20
`;
```

### Use Prisma for simple CRUD
```typescript
const tool = await prisma.aiTool.findUnique({
  where: { slug },
  include: { ToolCategory: true },
});
```

---

## Styling (Tailwind)

- Utility-first — compose classes directly on elements
- Never use `@apply` (defeats purpose of utility-first)
- Use `clsx()` for conditional classes
- Custom utilities: `btn-brand`, `card`, `input-field` (defined in globals.css)
- Fonts: `font-sora` (headings), `font-jakarta` (body)
- Colors: `text-brand`, `text-navy`, `bg-brand/10`

```typescript
import { clsx } from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded-lg font-semibold transition-colors',
  isActive ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
)}>
```

---

## Error Handling

| Layer | Pattern |
|-------|---------|
| API routes | try/catch → return `{ error }` with status code |
| Server actions | try/catch → return `{ success: false, error }` |
| Server Components | try/catch → show fallback UI |
| Client Components | Error boundaries + toast notifications |
| Database | Graceful fallback (never break the page) |

---

## Things to Avoid

- `console.log` in production code (use `console.error` for errors only)
- `@ts-ignore` or `@ts-expect-error` (fix the type instead)
- `git add .` (stage specific files)
- Inline styles (use Tailwind)
- `useEffect` for data fetching (use Server Components)
- New UI libraries (we have Tailwind + Lucide)
- Hardcoded URLs (use env vars)
- `SELECT *` in SQL (specify columns)
