# Converge Digitals — LinkedIn Engine Design System (`design.md`)

> **Locked Design System Specification**  
> Formatted per Hallmark & Frontend Design Standards for Converge Digitals Internal Dashboard.

---

## 1. Aesthetic Direction & Principles

- **Genre**: Modern Dark Minimalist / Developer Dashboard (Linear & Vercel inspired).
- **Core Stance**: High legibility, dark neutral canvas, zero eye strain, minimal chrome, crisp 1px borders.
- **Audience**: Internal team (2–5 members) managing agency authority and lead generation.
- **Tone**: Punchy, authoritative, concise, bold claims — no corporate fluff.

---

## 2. Color System & Design Tokens

### Core Neutral Palette
```css
:root {
  /* Surface & Canvas */
  --bg-main: #0A0A0C;          /* Main application background */
  --bg-surface: #121216;       /* Card & sidebar container background */
  --bg-surface-hover: #1A1A22; /* Interactive element hover background */
  --bg-surface-active: #22222E;/* Selected / active container background */
  
  /* Borders & Dividers */
  --border-subtle: #23232F;    /* 1px structural hairline borders */
  --border-focus: #4F46E5;     /* Focus outline accent */

  /* Text & Content */
  --text-main: #F3F4F6;        /* High-contrast soft white body/headings */
  --text-muted: #9CA3AF;       /* Muted secondary labels & metadata */
  --text-dim: #6B7280;         /* Disabled text & subtle icons */
}
```

### Content Pillar Accent Tokens
Each of the 4 content pillars has a locked, semantic accent identity:

```css
:root {
  /* Pillar 1: Authority (Monday) — AI & Marketing Trends */
  --pillar-authority: #6366F1;
  --pillar-authority-bg: rgba(99, 102, 241, 0.12);
  --pillar-authority-border: rgba(99, 102, 241, 0.3);

  /* Pillar 2: Offer (Tuesday / Friday) — Services & Pricing */
  --pillar-offer: #10B981;
  --pillar-offer-bg: rgba(16, 185, 129, 0.12);
  --pillar-offer-border: rgba(16, 185, 129, 0.3);

  /* Pillar 3: Aradhya / AI Showcase (Wednesday) — Flagship AI Persona */
  --pillar-aradhya: #8B5CF6;
  --pillar-aradhya-bg: rgba(139, 92, 246, 0.12);
  --pillar-aradhya-border: rgba(139, 92, 246, 0.3);

  /* Pillar 4: Proof (Thursday) — Real Case Studies & Results */
  --pillar-proof: #F59E0B;
  --pillar-proof-bg: rgba(245, 158, 11, 0.12);
  --pillar-proof-border: rgba(245, 158, 11, 0.3);
}
```

---

## 3. Typography Hierarchy

| Role | Font Family | Weights | Usage |
|---|---|---|---|
| **Headings & Titles** | `Plus Jakarta Sans`, sans-serif | `600` (SemiBold), `700` (Bold) | Dashboard page titles, modal titles, section headers |
| **Body & UI** | `Inter`, sans-serif | `400` (Regular), `500` (Medium) | Post draft text, descriptions, chat messages, labels |
| **Data & Badges** | `JetBrains Mono`, monospace | `500` (Medium) | Pillar tags, dates, source tags (RSS/GitHub), metrics |

### Type Scale
- `text-xs`: 12px / 1.4 (`JetBrains Mono` badges & source tags)
- `text-sm`: 14px / 1.5 (`Inter` UI labels & table data)
- `text-base`: 16px / 1.6 (`Inter` post draft content & chat body)
- `text-lg`: 18px / 1.4 (`Plus Jakarta Sans` section titles)
- `text-xl`: 22px / 1.3 (`Plus Jakarta Sans` page titles)

---

## 4. Component Primitives & Layout

### 4.1 Layout Shell
- **Sidebar**: Fixed 260px left column. Dark surface (`#121216`), 1px right border (`#23232F`).
- **Main Canvas**: Fluid main content with max-width `1400px`, comfortable `32px` padding on desktop, responsive collapse on mobile.

### 4.2 Cards & Containers
- **Background**: `var(--bg-surface)` (`#121216`)
- **Border**: `1px solid var(--border-subtle)` (`#23232F`)
- **Border Radius**: `12px` (`rounded-xl`)
- **Hover State**: Background shifts to `var(--bg-surface-hover)` (`#1A1A22`), 150ms ease transition.

### 4.3 Interactive Buttons (8-State Compliance)
All interactive buttons adhere to strict visual state handling:
1. `default`: Surface background with subtle border.
2. `hover`: Slightly brighter background, crisp border contrast.
3. `:focus-visible`: 2px indigo focus ring (`var(--border-focus)`).
4. `:active`: `transform: scale(0.98)` press feedback.
5. `disabled`: Opacity `0.4`, `cursor: not-allowed`.
6. `loading`: Spinner/shimmer replace label, pointer events disabled.
7. `error`: Red border indicator with recovery option.
8. `success`: Brief emerald glow confirmation.

---

## 5. Signature Feature Specs

### Content Generator Stepper
1. **Step 1 — Auto-Sourced Idea Cards**: 5 cards auto-selected for today's pillar. Sourced from RSS/Reddit, GitHub sync, Competitor Research, or Client Log.
2. **Step 2 — 3 AI Draft Variations**: Displays 3 distinct post angles generated in Converge Digitals' tone.
3. **Step 3 — Conversational Refinement Panel**: Optional side-by-side chat view allowing natural prompts like *"make it 20% shorter"* or *"add pricing starting at $1,500"*.

---

## 6. Motion & Accessibility

- **Transition Durations**: `150ms` for hover/active micro-interactions; `250ms` for modal/slide-over panels.
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo for crisp, fast response).
- **Reduced Motion**: Respects `@media (prefers-reduced-motion: reduce)` by disabling transform transitions.
- **Accessibility**: Minimum `4.5:1` contrast ratio for all text elements against `--bg-main` and `--bg-surface`.

---

*This specification is locked for the `converge-linkedin-engine` project.*
