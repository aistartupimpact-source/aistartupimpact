# Input Validation

How user input is validated across the platform.

---

## Strategy

1. **Client-side**: Immediate feedback (HTML5 attributes + JS checks)
2. **Server-side**: Never trust client — always validate on the server
3. **Database-level**: Constraints, enums, and NOT NULL as last defense

---

## Validation Libraries

| Tool | Where Used |
|------|-----------|
| Zod | Admin app form schemas (`apps/admin`) |
| Manual checks | API routes (`apps/web/app/api/`) |
| HTML5 attributes | Form inputs (`required`, `type="email"`, `maxLength`) |
| Prisma constraints | Database schema (unique, enum, NOT NULL) |

---

## API Route Validation Pattern

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Required field check
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Type/format check
  if (body.email && !isValidEmail(body.email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Length constraints
  if (body.description && body.description.length > 5000) {
    return NextResponse.json({ error: 'Description too long (max 5000 chars)' }, { status: 400 });
  }

  // Enum validation
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // ... proceed with business logic
}
```

---

## Admin Form Validation (Zod)

```typescript
import { z } from 'zod';

const toolSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  tagline: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  websiteUrl: z.string().url(),
  pricingModel: z.enum(['FREE', 'FREEMIUM', 'PAID', 'ENTERPRISE', 'OPEN_SOURCE']),
  categoryId: z.string().cuid(),
  freeTrialDays: z.number().int().min(0).max(365).optional(),
  startingPrice: z.number().int().min(0).optional(),
});
```

---

## Common Validation Rules

| Field | Validation | Error Message |
|-------|-----------|---------------|
| Email | RFC 5322 regex | "Invalid email format" |
| URL | `z.string().url()` or regex | "Invalid URL" |
| Slug | `/^[a-z0-9-]+$/` | "Slug must be lowercase alphanumeric with hyphens" |
| Rating | 1–5 integer | "Rating must be between 1 and 5" |
| Price | Non-negative integer (cents) | "Price must be a positive number" |
| Description | 50–5000 chars | "Description must be 50-5000 characters" |
| Name | 2–100 chars | "Name must be 2-100 characters" |

---

## File Upload Validation

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateUpload(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, and SVG files are allowed');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('File must be under 5MB');
  }
}
```

---

## SQL Injection Prevention

All database queries use parameterized templates:
```typescript
// ✓ Safe — parameterized
const tools = await sql`SELECT * FROM "AiTool" WHERE slug = ${userInput}`;

// ✗ NEVER — string concatenation
const tools = await sql(`SELECT * FROM "AiTool" WHERE slug = '${userInput}'`);
```

---

## XSS Prevention

User-generated content (reviews, descriptions) is sanitized:
```typescript
import sanitizeHtml from 'sanitize-html';

const cleanContent = sanitizeHtml(userInput, {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  allowedAttributes: { a: ['href'] },
});
```

---

## Anti-Gaming Validation

| Check | Rule | Endpoint |
|-------|------|----------|
| Account age | Must be 24+ hours old | Upvote |
| Daily cap | Max 20 upvotes/day | Upvote |
| One per entity | One upvote per tool per user | Upvote |
| One review per entity | Unique constraint [toolId, userId] | Review |

---

## Related Documents

- [Backend Overview](./OVERVIEW.md)
- [Security](../security/OVERVIEW.md)
- [Routes](./ROUTES.md)
