# PR4 Implementation Plan: Frontend Draft / UI Reference (REVISED)

## Overview

PR4, OpenClaude desktop app'in frontend skeleton'ını oluşturur. Website design system'e (monospace-first, orange accent, sharp corners) uygun React UI + theme system + layout infrastructure. Draft branch reference-only — final implementation yeniden yazılacak.

## Requirements (from spec)

- **10-15 shadcn base components** (~500 lines) — button, card, input, dialog, dropdown, select, tabs, switch, tooltip, badge, separator, scroll-area, skeleton
- **Layout components** (~250 lines) — AppShell, Sidebar, TitleBar
- **Theme system** (~250 lines) — globals.css with Fira Code, orange accent (#ff7a1a), light/dark toggle, sharp corners (radius: 0), CSS variables architecture
- **Routing skeleton** (~50 lines) — AppShell outlet only, NO placeholder pages (features in later PRs)
- **Infrastructure** (~200 lines) — TRPCProvider, ErrorBoundary, stores (theme, app), lib/utils
- **Tests** (~600 lines) — component rendering, theme toggle, layout tests
- **Theme extensibility** — multi-theme support için architecture hazırlığı

## NOT in PR4

- **ChatPage** → PR5 (Chat UI + Streaming)
- **SettingsPage + tabs** → PR8 (Settings UI)
- **EditorPage** → PR9 (Monaco Editor)
- **McpPage** → PR11 (MCP Management)
- **StatsPage** → PR13 (Stats)
- **ProjectsPage** → PR12 (Project Management)
- **Placeholder pages** — REMOVED (will be added organically in later PRs)

## Theme Extensibility Architecture

### Proposed Structure

```
src/renderer/lib/themes/
├── theme-config.ts         ← ThemeConfig interface + default configs
├── css-generator.ts        ← Runtime CSS variable generation
├── theme-provider.tsx      ← React context provider
└── index.ts                ← Exports

src/renderer/stores/
└── theme.ts                ← Jotai atom (localStorage → SQLite later)

src/renderer/styles/
└── globals.css             ← Fallback values baked-in
```

### ThemeConfig Structure

```typescript
interface ThemeConfig {
  id: string
  name: string
  type: 'light' | 'dark'
  colors: {
    accent: string       // Primary brand color
    background: string
    foreground: string
    ink: string          // Primary text
    muted: string
    border: string
    // ... semantic tokens
  }
  fonts?: {
    mono?: string        // Override monospace stack
  }
  radius?: number        // Override border radius (default: 0)
}
```

### ThemeProvider Logic

1. Read `themeAtom` (current theme ID)
2. Load `ThemeConfig` from registry
3. Generate CSS variables at runtime
4. Apply to `document.documentElement`
5. Persist to localStorage (PR6: SQLite settings table)

### CSS Variable Mapping

```css
/* globals.css fallbacks */
@theme {
  --color-accent: #ff7a1a;
  --color-background: #fbfaf7;
  --color-foreground: #1a1208;
  /* ... */
  --radius-md: 0;  /* Sharp corners */
}

/* Runtime overrides by ThemeProvider */
```

### Why JSON + Runtime

- Add theme = add JSON file (no CSS changes)
- Multi-theme future-ready
- User preference: localStorage → SQLite
- Per-project override possible (PR12+)

## Implementation Steps

### Phase 1: Theme Infrastructure (~200 lines)

**Files:**
1. `src/renderer/lib/themes/theme-config.ts` (~50 lines)
   - ThemeConfig interface
   - DEFAULT_LIGHT, DEFAULT_DARK configs

2. `src/renderer/lib/themes/css-generator.ts` (~40 lines)
   - `generateCSSVariables(colors)` function
   - `applyVariables(vars, element)` function

3. `src/renderer/lib/themes/theme-provider.tsx` (~80 lines)
   - React context provider
   - useEffect: apply CSS variables on theme change
   - localStorage persistence

4. `src/renderer/stores/theme.ts` (~30 lines)
   - Jotai atomWithStorage
   - ThemeId type: 'default-light' | 'default-dark' | 'system'

### Phase 2: CSS & Styling (~250 lines)

**Files:**
5. `src/renderer/styles/globals.css` (~150 lines)
   - @theme block with fallback values
   - Base layer: body font, scrollbar, selection
   - Focus styles, dashed borders

6. `tailwind.config.ts` (~40 lines)
   - Extend Tailwind theme with CSS variable colors
   - Enable `bg-[var(--color-accent)]` syntax

7. `src/renderer/main.tsx` (~60 lines)
   - Import globals.css
   - Wrap with ThemeProvider
   - App entry point

### Phase 3: UI Components (~500 lines)

**Files:**
8-22. `src/renderer/components/ui/*.tsx` (13 files)
   - button.tsx (~50 lines)
   - input.tsx (~40 lines)
   - card.tsx (~40 lines)
   - dialog.tsx (~60 lines)
   - dropdown-menu.tsx (~70 lines)
   - select.tsx (~80 lines)
   - tabs.tsx (~50 lines)
   - switch.tsx (~40 lines)
   - tooltip.tsx (~30 lines)
   - badge.tsx (~30 lines)
   - separator.tsx (~20 lines)
   - scroll-area.tsx (~40 lines)
   - skeleton.tsx (~20 lines)

**Styling rules:**
- All use `var(--color-*)` — NO hardcoded hex
- All inherit Fira Code font from body
- All use `rounded-md` (actually 0 from CSS variable)

23. `src/renderer/lib/utils.ts` (~10 lines)
   - `cn()` helper (clsx + tailwind-merge)

### Phase 4: Layout (~250 lines)

**Files:**
24. `src/renderer/components/layout/AppShell.tsx` (~80 lines)
   - Root layout with TitleBar + Sidebar + Outlet
   - Outlet for future route children (from later PRs)

25. `src/renderer/components/layout/TitleBar.tsx` (~60 lines)
   - Custom title bar with window controls
   - Theme toggle button
   - Draggable region

26. `src/renderer/components/layout/Sidebar.tsx` (~80 lines)
   - Collapsible sidebar
   - Logo + placeholder navigation structure
   - Collapse/expand button

27. `src/renderer/components/layout/SidebarItem.tsx` (~30 lines)
   - Sidebar navigation item
   - Icon + label, collapsed state

28. `src/renderer/components/Logo.tsx` (~30 lines)
   - OpenClaude brand logo
   - Monospace text, orange accent

### Phase 5: Infrastructure (~200 lines)

**Files:**
29. `src/renderer/contexts/TRPCProvider.tsx` (~50 lines)
   - tRPC React client setup
   - Preload bridge integration
   - Depends on PR2

30. `src/renderer/components/ErrorBoundary.tsx` (~30 lines)
   - React error boundary
   - Fallback UI with retry button

31. `src/renderer/stores/app.ts` (~30 lines)
   - Sidebar collapsed state atom
   - Window state atoms

32. `src/renderer/App.tsx` (~40 lines)
   - Root component
   - Provider wrapping (TRPCProvider, ThemeProvider, TooltipProvider)
   - BrowserRouter + Routes
   - **Single route:** `<Route element={<AppShell />} />` — NO child routes yet

### Phase 6: Routing Skeleton (REVISED)

**NO placeholder pages** — routing skeleton = outlet structure only

```tsx
// App.tsx routing (simplified)
<BrowserRouter>
  <Routes>
    <Route element={<AppShell />} />  {/* Outlet for future routes */}
  </Routes>
</BrowserRouter>
```

Later PRs will add:
- PR5: `<Route path="/" element={<ChatPage />} />`
- PR8: `<Route path="/settings" element={<SettingsPage />} />`
- PR9-13: Editor, MCP, Stats, Projects routes

**Why no placeholders?**
- Spec says "routing skeleton" = infrastructure only
- Placeholder pages = extra ~120 lines
- Features implement organically in their respective PRs
- Keeps PR4 at ~2000 lines (spec target)

### Phase 7: Tests (~600 lines)

**Files:**
33-35. `tests/renderer/themes/*.vitest.ts` (3 files, ~180 lines)
   - ThemeConfig loading
   - CSS variable generation
   - ThemeProvider render + persistence

36-38. `tests/renderer/layout/*.vitest.ts` (3 files, ~150 lines)
   - AppShell render
   - Sidebar collapse/expand
   - TitleBar controls mock

39-41. `tests/renderer/ui/*.vitest.ts` (3 files, ~150 lines)
   - Button render + variants
   - Card, Input render
   - Dialog open/close

42-43. `tests/renderer/stores/*.vitest.ts` (2 files, ~120 lines)
   - themeAtom persistence
   - appAtom sidebar state

## File List Summary

| Category | Files | Lines |
|----------|-------|-------|
| Theme Infrastructure | 4 | ~200 |
| CSS & Styling | 3 | ~250 |
| UI Components | 14 | ~510 |
| Layout | 5 | ~280 |
| Infrastructure | 4 | ~200 |
| Routing Skeleton | 1 | ~40 |
| Tests | 11 | ~600 |

**Total: ~1880 lines (spec target: ~2000)**

## Dependencies

```
PR4 depends on:
- PR1 (Electron shell, window controls preload)
- PR2 (tRPC infrastructure, preload bridge)
- PR3 (Database — not directly used, but app depends on it)

Theme Infrastructure (Phase 1) — independent
  ↓
CSS & Styling (Phase 2) — uses Phase 1 variable names
  ↓
UI Components (Phase 3) — uses Phase 2 globals.css
  ↓
Layout (Phase 4) — uses Phase 3 components
  ↓
Infrastructure (Phase 5) — uses PR2 for TRPCProvider
  ↓
Routing (Phase 6) — uses Phases 4-5
  ↓
Tests (Phase 7) — tests all previous
```

## Success Criteria

- [ ] Theme system: light/dark toggle works
- [ ] CSS variables: orange accent, Fira Code font applied
- [ ] No hardcoded colors in components
- [ ] Sharp corners (radius: 0) everywhere
- [ ] AppShell renders with TitleBar + Sidebar
- [ ] Sidebar collapse/expand functional
- [ ] Theme persists to localStorage
- [ ] ThemeConfig interface ready for future multi-theme
- [ ] TRPCProvider bridges to preload (mock IPC)
- [ ] **NO placeholder pages** — outlet structure only
- [ ] All tests pass (80%+ coverage)
- [ ] ~2000 lines total (spec target)

## Theme Extensibility: Future Multi-Theme

When multi-theme support needed (after all PRs done):

1. Add theme JSON files to `lib/themes/themes/`
2. Create `ThemePicker` dropdown component
3. Extend `themeAtom` to support arbitrary theme IDs
4. Migrate localStorage → SQLite `settings` table
5. Add per-project theme override in `projects` table

**Architecture ready, implementation deferred.**