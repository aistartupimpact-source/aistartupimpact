# Form Standardization Plan
**Date:** May 21, 2026  
**Goal:** Unified startup/tool submission forms across Admin and Founder portals with FAQ management

---

## 🎯 Current Issues

### 1. **Inconsistent Forms**
- Admin: Modal overlay form (cramped)
- Founder: Full page form (better UX)
- Different fields between admin and founder
- No FAQ management in either

### 2. **Missing Features**
- ❌ No FAQ management for startups
- ❌ No FAQ management for tools
- ❌ Can't load existing FAQs for updates
- ❌ Admin form is overlay (not full page)

---

## 📋 Requirements

### 1. **Standardize Forms**
- Same fields in Admin and Founder portal
- Full page form in Admin (not overlay)
- Consistent UI/UX across both
- Industry-grade form design

### 2. **Add FAQ Management**
- Add/edit/delete FAQs for startups
- Add/edit/delete FAQs for tools
- Load existing FAQs when editing
- FAQ preview before save

### 3. **Field Consistency**

**Current Admin Fields:**
- Name, Tagline, Description
- Stage, Location
- Website URL, Logo
- Founded Year, Employee Count, Impact Score
- Featured toggle

**Current Founder Fields:**
- Name, Tagline, Description
- Website URL, LinkedIn, Twitter
- Founded Year, Stage, Employee Count
- Headquarters, Founders, Logo

**Missing in Founder:**
- Impact Score (admin only)
- Featured toggle (admin only)

**Missing in Admin:**
- LinkedIn URL
- Twitter URL
- Founders list

---

## 🎨 Proposed Solution

### Phase 1: Unified Startup Form Component

**Create:** `apps/web/components/shared/StartupFormFields.tsx`

**All Fields (Unified):**
```typescript
interface StartupFormData {
  // Basic Info
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  
  // URLs
  websiteUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  
  // Company Details
  stage: StartupStage;
  foundedYear?: number;
  headquartersCity?: string;
  employeeCount?: number;
  
  // Founders
  founders: string[]; // Array of founder names
  
  // Admin Only
  impactScore?: number; // 1-100
  isFeatured?: boolean;
  
  // FAQs
  faqs: Array<{
    id?: string;
    question: string;
    answer: string;
    order: number;
  }>;
}
```

### Phase 2: Admin Full Page Form

**Create:** `apps/admin/app/(dashboard)/startups-dir/new/page.tsx`  
**Create:** `apps/admin/app/(dashboard)/startups-dir/[id]/edit/page.tsx`

**Features:**
- Full page layout (not modal)
- Multi-step form (Basic → Details → FAQs → Review)
- Same fields as founder portal + admin-only fields
- FAQ management section
- Preview before save

### Phase 3: FAQ Management Component

**Create:** `apps/web/components/shared/FAQManager.tsx`

**Features:**
- Add new FAQ
- Edit existing FAQ
- Delete FAQ
- Reorder FAQs (drag & drop)
- Preview FAQ display
- Character limits (question: 200, answer: 1000)

### Phase 4: Tool Forms (Same Pattern)

**Apply same standardization to tools:**
- Unified tool form component
- Admin full page form
- FAQ management
- Consistent fields

---

## 📐 Detailed Implementation

### 1. Shared Form Component Structure

```
apps/web/components/shared/
├── StartupFormFields.tsx      # Reusable form fields
├── ToolFormFields.tsx          # Reusable tool fields
├── FAQManager.tsx              # FAQ CRUD component
├── ImageUploader.tsx           # Logo/image upload
└── FormPreview.tsx             # Preview before save
```

### 2. Admin Pages Structure

```
apps/admin/app/(dashboard)/
├── startups-dir/
│   ├── page.tsx                # List view (keep existing)
│   ├── new/
│   │   └── page.tsx            # NEW: Full page create form
│   └── [id]/
│       └── edit/
│           └── page.tsx        # NEW: Full page edit form
└── tools-dir/
    ├── page.tsx                # List view (keep existing)
    ├── new/
    │   └── page.tsx            # NEW: Full page create form
    └── [id]/
        └── edit/
            └── page.tsx        # NEW: Full page edit form
```

### 3. Form Sections

#### Section 1: Basic Information
- Company Name *
- Tagline * (max 200 chars)
- Description * (max 1000 chars)
- Logo Upload

#### Section 2: URLs & Social
- Website URL *
- LinkedIn URL
- Twitter/X URL

#### Section 3: Company Details
- Founded Year
- Funding Stage *
- Team Size (Employee Count)
- Headquarters City

#### Section 4: Founders
- Founder Names (comma-separated or multi-input)
- Auto-link to founder profiles if exist

#### Section 5: Admin Settings (Admin Only)
- Impact Score (1-100)
- Featured Toggle
- Featured Until Date

#### Section 6: FAQs
- FAQ Manager Component
- Add/Edit/Delete/Reorder
- Preview

#### Section 7: Review & Submit
- Preview all data
- Edit any section
- Submit button

---

## 🎨 UI/UX Design

### Multi-Step Form Layout

```
┌─────────────────────────────────────────────────────┐
│  Step 1: Basic Info → Step 2: Details → Step 3: FAQs │
│  ●────────────────── ○──────────────── ○─────────── │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                       │
│  [Form Fields for Current Step]                      │
│                                                       │
│  [Character Counters]                                │
│  [Validation Messages]                               │
│                                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  [Back Button]              [Save Draft] [Next Step] │
└─────────────────────────────────────────────────────┘
```

### FAQ Manager UI

```
┌─────────────────────────────────────────────────────┐
│  FAQs (3)                              [+ Add FAQ]   │
├─────────────────────────────────────────────────────┤
│  ⋮  1. What is your startup about?        [Edit] [×]│
│     Brief description of the startup...              │
├─────────────────────────────────────────────────────┤
│  ⋮  2. Who are your target customers?     [Edit] [×]│
│     Our target customers are...                      │
├─────────────────────────────────────────────────────┤
│  ⋮  3. What makes you different?          [Edit] [×]│
│     We differentiate through...                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### 1. Database Schema Updates

**Add FAQ tables:**

```sql
-- Startup FAQs
CREATE TABLE "StartupFAQ" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "startupId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "StartupFAQ_startupId_fkey" 
    FOREIGN KEY ("startupId") 
    REFERENCES "Startup"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "StartupFAQ_startupId_idx" ON "StartupFAQ"("startupId");
CREATE INDEX "StartupFAQ_order_idx" ON "StartupFAQ"("order");

-- Tool FAQs
CREATE TABLE "ToolFAQ" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "toolId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "ToolFAQ_toolId_fkey" 
    FOREIGN KEY ("toolId") 
    REFERENCES "AiTool"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "ToolFAQ_toolId_idx" ON "ToolFAQ"("toolId");
CREATE INDEX "ToolFAQ_order_idx" ON "ToolFAQ"("order");
```

### 2. API Endpoints

**Startup FAQs:**
- `POST /api/admin/startups/[id]/faqs` - Create FAQ
- `PUT /api/admin/startups/[id]/faqs/[faqId]` - Update FAQ
- `DELETE /api/admin/startups/[id]/faqs/[faqId]` - Delete FAQ
- `PUT /api/admin/startups/[id]/faqs/reorder` - Reorder FAQs

**Tool FAQs:**
- `POST /api/admin/tools/[id]/faqs` - Create FAQ
- `PUT /api/admin/tools/[id]/faqs/[faqId]` - Update FAQ
- `DELETE /api/admin/tools/[id]/faqs/[faqId]` - Delete FAQ
- `PUT /api/admin/tools/[id]/faqs/reorder` - Reorder FAQs

### 3. Form Validation

```typescript
const startupSchema = z.object({
  name: z.string().min(2).max(100),
  tagline: z.string().min(10).max(200),
  description: z.string().min(50).max(1000),
  websiteUrl: z.string().url(),
  linkedinUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  stage: z.enum(STARTUP_STAGES),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
  headquartersCity: z.string().max(100).optional(),
  employeeCount: z.number().min(1).optional(),
  founders: z.array(z.string()).min(1),
  logoUrl: z.string().url().optional(),
  impactScore: z.number().min(1).max(100).optional(),
  isFeatured: z.boolean().optional(),
  faqs: z.array(z.object({
    question: z.string().min(10).max(200),
    answer: z.string().min(20).max(1000),
    order: z.number(),
  })).optional(),
});
```

---

## 📊 Implementation Phases

### Phase 1: Database & API (Week 1)
- [ ] Add FAQ tables to Prisma schema
- [ ] Run migrations
- [ ] Create FAQ API endpoints
- [ ] Test CRUD operations

### Phase 2: Shared Components (Week 1-2)
- [ ] Create `StartupFormFields` component
- [ ] Create `ToolFormFields` component
- [ ] Create `FAQManager` component
- [ ] Create `ImageUploader` component
- [ ] Create `FormPreview` component

### Phase 3: Admin Full Page Forms (Week 2)
- [ ] Create admin startup create page
- [ ] Create admin startup edit page
- [ ] Create admin tool create page
- [ ] Create admin tool edit page
- [ ] Remove modal overlays
- [ ] Add multi-step navigation

### Phase 4: Update Founder Forms (Week 2-3)
- [ ] Update founder startup form to use shared component
- [ ] Update founder tool form to use shared component
- [ ] Add FAQ management to founder forms
- [ ] Test consistency

### Phase 5: Testing & Polish (Week 3)
- [ ] Test all forms
- [ ] Test FAQ CRUD
- [ ] Test form validation
- [ ] Test image uploads
- [ ] Polish UI/UX
- [ ] Add loading states
- [ ] Add error handling

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ Same fields in admin and founder forms
- ✅ Admin uses full page (not modal)
- ✅ FAQ management works for startups
- ✅ FAQ management works for tools
- ✅ Can load existing FAQs for editing
- ✅ Form validation works
- ✅ Image upload works
- ✅ Preview before save works

### UX Requirements
- ✅ Consistent design across admin/founder
- ✅ Clear multi-step navigation
- ✅ Helpful validation messages
- ✅ Character counters
- ✅ Loading states
- ✅ Error handling
- ✅ Mobile responsive

### Technical Requirements
- ✅ TypeScript type-safe
- ✅ Reusable components
- ✅ Proper error handling
- ✅ Database constraints
- ✅ API validation
- ✅ Zero build errors

---

## 📝 Example: FAQ Manager Component

```typescript
interface FAQ {
  id?: string;
  question: string;
  answer: string;
  order: number;
}

interface FAQManagerProps {
  faqs: FAQ[];
  onChange: (faqs: FAQ[]) => void;
  maxFaqs?: number;
}

export function FAQManager({ faqs, onChange, maxFaqs = 10 }: FAQManagerProps) {
  const [editing, setEditing] = useState<number | null>(null);
  
  const addFAQ = () => {
    if (faqs.length >= maxFaqs) return;
    onChange([...faqs, { question: '', answer: '', order: faqs.length }]);
    setEditing(faqs.length);
  };
  
  const updateFAQ = (index: number, updates: Partial<FAQ>) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };
  
  const deleteFAQ = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };
  
  const reorderFAQ = (fromIndex: number, toIndex: number) => {
    const updated = [...faqs];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated.map((faq, i) => ({ ...faq, order: i })));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">FAQs ({faqs.length}/{maxFaqs})</h3>
        <button onClick={addFAQ} disabled={faqs.length >= maxFaqs}>
          + Add FAQ
        </button>
      </div>
      
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          faq={faq}
          isEditing={editing === index}
          onEdit={() => setEditing(index)}
          onSave={() => setEditing(null)}
          onChange={(updates) => updateFAQ(index, updates)}
          onDelete={() => deleteFAQ(index)}
          onMoveUp={() => index > 0 && reorderFAQ(index, index - 1)}
          onMoveDown={() => index < faqs.length - 1 && reorderFAQ(index, index + 1)}
        />
      ))}
    </div>
  );
}
```

---

## 🚀 Next Steps

1. **Review this plan** - Confirm requirements
2. **Approve database changes** - FAQ tables
3. **Start Phase 1** - Database & API
4. **Implement components** - Shared form components
5. **Update admin** - Full page forms
6. **Update founder** - Use shared components
7. **Test everything** - End-to-end testing

---

**Estimated Time:** 2-3 weeks  
**Complexity:** Medium-High  
**Impact:** High (better UX, consistency, SEO)  
**Priority:** High

