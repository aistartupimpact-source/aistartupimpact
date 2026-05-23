# Day 1 Implementation Guide - Get Click Data Today

## Goal
Have real tool click tracking working by end of day. You'll see actual data in your database.

## Timeline: 6 hours

---

## Morning Session (3 hours)

### Step 1: Database Migration (30 minutes)

#### 1.1 Update Prisma Schema

```prisma
// packages/database/prisma/schema.prisma

// Add enum (before models)
enum ClickSource {
  TOOL_DETAIL
  DIRECTORY
  HOMEPAGE
  SEARCH
  RELATED
  COMPARISON
  OTHER
}

// Update AffiliateClick model
model AffiliateClick {
  id          String      @id @default(cuid())
  toolId      String
  
  sessionHash String
  ipHash      String
  referrer    String?
  sourcePage  ClickSource @default(OTHER)
  
  device      String?
  browser     String?
  os          String?
  country     String?
  
  createdAt   DateTime    @default(now())
  
  AiTool      AiTool      @relation(fields: [toolId], references: [id], onDelete: Cascade)

  @@index([toolId, createdAt])
  @@index([createdAt])
  @@index([ipHash, toolId, createdAt])
}
```

#### 1.2 Create and Run Migration

```bash
cd packages/database
npx prisma migrate dev --name add-click-source-tracking
npx prisma generate
```

#### 1.3 Verify Migration

```bash
# Check database
npx prisma studio
# Look for ClickSource enum and updated AffiliateClick table
```

---

### Step 2: Security Functions (1 hour)

#### 2.1 Create Security File

```typescript
// apps/web/lib/security.ts
import { createHash } from 'crypto';
import { prisma } from '@aistartupimpact/database';

// Bot user agents to filter
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegram',
  'slackbot',
  'discordbot',
  'applebot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'rogerbot',
  'screaming frog',
  'crawler',
  'spider',
  'bot',
  'scraper',
];

export function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

export async function checkRateLimit(
  ip: string,
  toolId: string
): Promise<boolean> {
  const ipHash = hashIP(ip);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const clickCount = await prisma.affiliateClick.count({
    where: {
      ipHash,
      toolId,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  return clickCount < 5;
}
```

#### 2.2 Test Security Functions

```typescript
// Quick test in Node REPL or create test file
import { isBot } from './lib/security';

console.log(isBot('Googlebot/2.1')); // true
console.log(isBot('Mozilla/5.0 Chrome/120.0')); // false
```

---

### Step 3: Tracking Function (1 hour)

#### 3.1 Create Tracking File

```typescript
// apps/web/lib/tool-tracking.ts
import { NextRequest } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { createHash } from 'crypto';

type ClickSource = 
  | 'TOOL_DETAIL'
  | 'DIRECTORY'
  | 'HOMEPAGE'
  | 'SEARCH'
  | 'RELATED'
  | 'COMPARISON'
  | 'OTHER';

interface TrackClickParams {
  toolId: string;
  source: ClickSource;
  request: NextRequest;
}

function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'TABLET';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'MOBILE';
  }
  return 'DESKTOP';
}

function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('opera/') || ua.includes('opr/')) return 'Opera';
  return 'Other';
}

function getOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('win')) return 'Windows';
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  return 'Other';
}

function createHash256(value: string): string {
  return createHash('sha256').update(value).digest('hex').substring(0, 16);
}

export async function trackToolClick({
  toolId,
  source,
  request,
}: TrackClickParams): Promise<void> {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || null;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    const ipHash = createHash256(ip);
    const sessionHash = createHash256(`${ip}-${userAgent}`);

    const device = getDeviceType(userAgent);
    const browser = getBrowser(userAgent);
    const os = getOS(userAgent);
    
    // Cloudflare provides country code for free
    const country = request.headers.get('cf-ipcountry') || null;

    // Prisma auto-generates id with cuid()
    await prisma.affiliateClick.create({
      data: {
        toolId,
        sessionHash,
        ipHash,
        referrer,
        sourcePage: source,
        device,
        browser,
        os,
        country,
      },
    });
  } catch (error) {
    console.error('Tool click tracking error:', error);
  }
}
```

---

## Afternoon Session (3 hours)

### Step 4: API Route (1 hour)

#### 4.1 Create API Route

```typescript
// apps/web/app/api/tools/click/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { trackToolClick } from '@/lib/tool-tracking';
import { isBot, checkRateLimit } from '@/lib/security';
import { prisma } from '@aistartupimpact/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const toolId = searchParams.get('toolId');
  const source = searchParams.get('source');

  if (!toolId || !source) {
    return NextResponse.json(
      { error: 'Missing toolId or source' },
      { status: 400 }
    );
  }

  const validSources = ['TOOL_DETAIL', 'DIRECTORY', 'HOMEPAGE', 'SEARCH', 'RELATED', 'COMPARISON', 'OTHER'];
  if (!validSources.includes(source)) {
    return NextResponse.json(
      { error: 'Invalid source' },
      { status: 400 }
    );
  }

  const tool = await prisma.aiTool.findUnique({
    where: { id: toolId },
    select: { websiteUrl: true },
  });

  if (!tool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
  }

  const userAgent = request.headers.get('user-agent') || '';
  if (isBot(userAgent)) {
    return NextResponse.redirect(tool.websiteUrl, 302);
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const rateLimitOk = await checkRateLimit(ip, toolId);
  if (!rateLimitOk) {
    return NextResponse.redirect(tool.websiteUrl, 302);
  }

  trackToolClick({
    toolId,
    source: source as any,
    request,
  }).catch(err => {
    console.error('Click tracking failed:', err);
  });

  return NextResponse.redirect(tool.websiteUrl, 302);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
```

#### 4.2 Test API Route

```bash
# Start dev server
npm run dev

# Test in browser or curl
curl -I "http://localhost:3000/api/tools/click?toolId=SOME_TOOL_ID&source=TOOL_DETAIL"
# Should return 302 redirect
```

---

### Step 5: Component (1 hour)

#### 5.1 Create Component

```typescript
// apps/web/components/tools/ToolCTAButton.tsx
'use client';

import { ExternalLink } from 'lucide-react';

export type ClickSource = 
  | 'TOOL_DETAIL'
  | 'DIRECTORY'
  | 'HOMEPAGE'
  | 'SEARCH'
  | 'RELATED'
  | 'COMPARISON'
  | 'OTHER';

interface ToolCTAButtonProps {
  toolId: string;
  toolName: string;
  source: ClickSource;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function ToolCTAButton({
  toolId,
  toolName,
  source,
  variant = 'primary',
  className = '',
  children = 'Visit Website',
  showIcon = true,
}: ToolCTAButtonProps) {
  
  const href = `/api/tools/click?toolId=${encodeURIComponent(toolId)}&source=${source}`;

  const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors';
  const variantClasses = {
    primary: 'bg-brand text-white hover:bg-brand/90',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
    outline: 'border-2 border-brand text-brand hover:bg-brand hover:text-white',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label={`Visit ${toolName} website`}
    >
      {children}
      {showIcon && <ExternalLink className="w-4 h-4" />}
    </a>
  );
}
```

---

### Step 6: Integration (1 hour)

#### 6.1 Find Tool Detail Page

```bash
# Find the tool detail page
find apps/web -name "*[slug]*" -type f | grep tool
```

#### 6.2 Update Tool Detail Page

```typescript
// apps/web/app/(public)/tools/[slug]/page.tsx (or similar)
import { ToolCTAButton } from '@/components/tools/ToolCTAButton';

export default async function ToolDetailPage({ params }: { params: { slug: string } }) {
  const tool = await getTool(params.slug);
  
  return (
    <div>
      <h1>{tool.name}</h1>
      <p>{tool.description}</p>
      
      {/* Replace existing link with ToolCTAButton */}
      <ToolCTAButton
        toolId={tool.id}
        toolName={tool.name}
        source="TOOL_DETAIL"
        variant="primary"
      >
        Visit {tool.name}
      </ToolCTAButton>
    </div>
  );
}
```

#### 6.3 Test End-to-End

1. Visit a tool detail page
2. Click "Visit Website" button
3. Should redirect to tool website
4. Check database for click record:

```sql
SELECT * FROM "AffiliateClick" ORDER BY "createdAt" DESC LIMIT 5;
```

---

## End of Day 1 Checklist

### ✅ Completed
- [ ] Migration run successfully
- [ ] Security functions working
- [ ] Tracking function working
- [ ] API route responding with 302
- [ ] Component created
- [ ] Integrated on tool detail page
- [ ] Clicks being tracked in database

### 🎉 Success Criteria
- Click a tool button → redirects to tool website
- Check database → see click record with:
  - Tool ID
  - Source: TOOL_DETAIL
  - Device type
  - Browser
  - Country (if on Cloudflare/Vercel)
  - Timestamp

### 📊 Verify Data

```sql
-- Check total clicks
SELECT COUNT(*) FROM "AffiliateClick";

-- Check recent clicks
SELECT 
  t.name as tool_name,
  ac."sourcePage",
  ac.device,
  ac.browser,
  ac.country,
  ac."createdAt"
FROM "AffiliateClick" ac
JOIN "AiTool" t ON t.id = ac."toolId"
ORDER BY ac."createdAt" DESC
LIMIT 10;

-- Check clicks by source
SELECT "sourcePage", COUNT(*) as count
FROM "AffiliateClick"
GROUP BY "sourcePage";
```

---

## Next Steps (Day 2+)

### Day 2: Expand Integration
- Add to tool cards in directory
- Add to homepage featured tools
- Add to search results

### Day 3-4: Admin Dashboard
- Create analytics tab
- Show click stats
- Show top tools
- Add charts

### Day 5: Polish
- Add export functionality
- Add filters
- Optimize queries

---

## Troubleshooting

### No clicks showing up?
1. Check API route is accessible: `curl http://localhost:3000/api/tools/click?toolId=xxx&source=TOOL_DETAIL`
2. Check database connection
3. Check console for errors
4. Verify tool ID is correct

### Redirect not working?
1. Check tool has websiteUrl in database
2. Check API route returns 302
3. Check browser console for errors

### Rate limit blocking you?
1. Clear rate limit: `DELETE FROM "AffiliateClick" WHERE "ipHash" = 'your_hash';`
2. Or wait 1 hour
3. Or temporarily increase limit in code

---

**By end of Day 1, you'll have real click tracking data! 🎉**
