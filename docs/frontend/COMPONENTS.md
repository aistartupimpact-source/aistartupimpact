# Component Library

Catalog of shared and domain-specific React components.

---

## Design System Utilities

Custom CSS classes defined in `apps/web/app/globals.css`:

| Class | Usage |
|-------|-------|
| `btn-brand` | Primary CTA button (brand red, white text, rounded) |
| `card` | Card container (white bg, border, shadow, rounded-xl) |
| `input-field` | Form input (border, rounded, focus ring) |
| `font-sora` | Heading font (Sora) |
| `font-jakarta` | Body font (Plus Jakarta Sans) |
| `text-brand` | Brand red color |
| `text-navy` | Dark heading color |

---

## Shared Components (`apps/web/components/shared/`)

| Component | Props | Purpose |
|-----------|-------|---------|
| `CityAutocomplete` | `value, onChange, placeholder` | City search with API-backed suggestions |
| `ToolTagSelector` | `selectedTags, onChange, maxTags?` | Multi-select tag picker with typeahead |
| `CategoryCascadeSelect` | `value, onChange` | Parent → subcategory two-level picker |
| `FAQManager` | `faqs, onChange` | Add/edit/reorder FAQ items |

---

## Admin Shared Components (`apps/admin/components/shared/`)

| Component | Props | Purpose |
|-----------|-------|---------|
| `ProsConsManager` | `pros, cons, onUpdate` | Manage tool pros/cons lists |
| `AlternativeToolsManager` | `toolId, alternatives` | Link alternative tools (bidirectional) |
| `StartupLinker` | `toolId, linkedStartup` | Link tool to startup ("Built by") |
| `ToolTagSelector` | `selectedTags, onChange` | Admin tag picker |

---

## Tool Components (`apps/web/components/tools/`)

| Component | Purpose |
|-----------|---------|
| `UpvoteButton` | Upvote toggle with count, auth check, anti-gaming |
| `DiscoverySections` | Trending, Upvoted, New, Editor's Picks sections |
| `ComparisonTable` | Side-by-side tool comparison |

---

## Layout Components (`apps/web/components/layout/`)

| Component | Purpose |
|-----------|---------|
| `Navbar` | Top navigation bar (responsive, search, auth) |
| `Footer` | Site footer (links, socials, newsletter) |
| `MobileNav` | Bottom navigation for mobile |
| `Logo` | Logo component (light/dark variants) |

---

## Event Components (`apps/web/components/events/`)

| Component | Purpose |
|-----------|---------|
| `EventCard` | Event listing card |
| `CitySelect` | City picker for event location |

---

## Auth Components (`apps/web/components/auth/`)

| Component | Purpose |
|-----------|---------|
| `SignupSuccessPopup` | Post-signup confirmation modal |
| `LoginForm` | Email/password login form |
| `GoogleSignInButton` | OAuth trigger button |

---

## Component Patterns

### Props Interface
```typescript
interface UpvoteButtonProps {
  toolId: string;
  initialCount: number;
  initialUpvoted?: boolean;
  size?: 'sm' | 'md';
}
```

### Conditional Rendering
```typescript
import { clsx } from 'clsx';

<button className={clsx(
  'rounded-lg font-semibold transition-all',
  hasUpvoted ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
)}>
```

### Loading States
- Use `loading.tsx` files for page-level skeletons
- Use Suspense boundaries for component-level loading
- Inline spinners for button actions

### Confirmation Pattern
```typescript
// Type "DELETE" to confirm destructive actions
const [confirmText, setConfirmText] = useState('');
const canDelete = confirmText === 'DELETE';
```

---

## Related Documents

- [Frontend Overview](./OVERVIEW.md)
- [Coding Standards](../development/CODING_STANDARDS.md)
- [Folder Conventions](../development/FOLDER_CONVENTIONS.md)
