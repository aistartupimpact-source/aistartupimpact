# Database Conventions

Naming and structural standards for the Prisma schema and PostgreSQL database.

---

## Naming Rules

| Element | Convention | Example |
|---------|-----------|---------|
| Table names | PascalCase (singular) | `AiTool`, `Startup`, `FundingRound` |
| Column names | camelCase | `isApproved`, `createdAt`, `websiteUrl` |
| Enum names | PascalCase | `ToolApprovalStatus`, `StartupStage` |
| Enum values | UPPER_SNAKE_CASE | `PENDING`, `PRE_SEED`, `SERIES_A` |
| Index names | Convention from Prisma | `@@index([field1, field2])` |
| Foreign keys | Related table name + `Id` | `categoryId`, `startupId`, `ownerId` |
| Junction tables | Both entity names | `ToolSystemTagMapping`, `ArticleTag` |

---

## Standard Columns

Every table should have:

```prisma
model Example {
  id        String   @id @default(cuid())
  // ... fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Tables that support soft delete add:
```prisma
  deletedAt DateTime?
```

---

## ID Strategy

- **Format**: `cuid()` — collision-resistant, URL-safe, sortable by time
- **Why not UUID**: cuids are shorter, more readable in logs
- **Why not autoincrement**: cuids are safe for distributed systems, no sequence conflicts
- **Exception**: Some tables use `@default(dbgenerated("gen_random_uuid()"))` for PostgreSQL-native UUIDs

---

## Boolean Flags

Always prefix with `is` or `has`:
```prisma
isApproved    Boolean @default(false)
isFeatured    Boolean @default(false)
isVerified    Boolean @default(false)
isActive      Boolean @default(true)
hasApi        Boolean @default(false)
hasMobileApp  Boolean @default(false)
```

---

## Timestamps

```prisma
createdAt DateTime @default(now())  // Auto-set on insert
updatedAt DateTime @updatedAt       // Auto-updated by Prisma
deletedAt DateTime?                  // Null = active, set = soft-deleted
```

> ⚠️ Stored in UTC without 'Z' suffix. Always append 'Z' before `new Date()` in JavaScript.
> Display with `timeZone: 'Asia/Kolkata'` for IST.

---

## Money / Financial Values

- Stored as `BigInt` in paise (Indian) or cents (USD)
- Never use `Float` or `Decimal` for money
- Convert on display: `amount / 100`

```prisma
totalBudgetPaise BigInt @default(0)  // ₹1,000 stored as 100000
amountUsd        BigInt @default(0)  // $100 stored as 10000
```

---

## JSON Columns

Use sparingly. Prefer normalized tables. Acceptable uses:
```prisma
foundersData    Json?       // Founder details (name, role, linkedin)
socialLinks     Json?       // { twitter, linkedin, github }
content         Json        // Rich text editor content (Article)
```

---

## Enums

Define as PostgreSQL enums in Prisma:
```prisma
enum PricingModel {
  FREE
  FREEMIUM
  PAID
  ENTERPRISE
  OPEN_SOURCE
}
```

- Values are UPPER_SNAKE_CASE
- Used for type safety + DB-level constraint
- Adding a value requires a migration

---

## Foreign Keys

```prisma
// Required relationship
categoryId String
ToolCategory ToolCategory @relation(fields: [categoryId], references: [id])

// Optional relationship
ownerId String?
FounderUser FounderUser? @relation(fields: [ownerId], references: [id], onDelete: Cascade)
```

### On Delete Behavior
| Pattern | When |
|---------|------|
| `Cascade` | Child cannot exist without parent (reviews, tags, clicks) |
| `SetNull` | Reference is informational, parent deletion shouldn't destroy child |
| (default) | Restrict — prevent deletion if children exist |

---

## Indexes

```prisma
@@index([status])                           // Single column filter
@@index([status, createdAt])                // Composite (common query pattern)
@@index([searchVector], type: Gin)          // Full-text search
@@index([slug])                             // Unique lookups
@@index([ownerId])                          // Foreign key lookups
@@index([isFeatured, status])              // Filtered listing
```

### Rules
- Index every foreign key
- Index every column used in WHERE clauses
- Index every column used in ORDER BY
- Composite indexes: most selective column first
- GIN indexes for tsvector and array columns

---

## Arrays

PostgreSQL native arrays for simple lists:
```prisma
founders        String[] @default([])    // ["John Doe", "Jane Smith"]
screenshotUrls  String[]                  // URL list
topSkills       String[]                  // Skill tags
```

---

## Unique Constraints

```prisma
slug    String @unique                    // URL-friendly identifier
email   String @unique                    // One account per email

@@unique([startupId, userId])             // One review per user per startup
@@unique([toolId, userId])                // One upvote per user per tool
@@unique([city, year, quarter])           // One stat entry per period
```

---

## Migration Best Practices

1. **Name descriptively**: `20250728_add_tool_upvote_table`
2. **One concern per migration**: Don't mix schema changes
3. **Always test locally first**: `npx prisma migrate dev`
4. **Never edit existing migrations**: Create new ones to fix
5. **Add data migrations separately**: Use raw SQL scripts
6. **Document breaking changes**: Note in PR description

---

## Related Documents

- [Database Overview](./OVERVIEW.md) — Setup, connection, workflow
- [Schema (ERD)](./SCHEMA.md) — Table relationships
- [Indexes](./INDEXES.md) — Performance indexes catalog
