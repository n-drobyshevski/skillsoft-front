# Documentation Pages SSR, Caching, and Performance Optimization Plan

## Executive Summary

This plan outlines a comprehensive strategy to optimize the `docs/**` pages in the SkillSoft frontend application. The documentation pages are currently rendered dynamically but contain mostly static content, making them ideal candidates for static generation and aggressive caching.

**Key Goals:**
1. Convert documentation pages to static generation where possible
2. Apply appropriate `use cache` directive with `referenceData` profile
3. Fix navigation SSR without disabling it (resolve Radix hydration issues)
4. Optimize prefetching and loading states
5. Improve Time to First Byte (TTFB) and Largest Contentful Paint (LCP)

---

## Current State Analysis

### File Structure
```
frontend-app/app/(workspace)/docs/
├── layout.tsx                    # Three-column layout
├── loading.tsx                   # Loading skeleton
├── page.tsx                      # Docs home
├── getting-started/page.tsx
├── glossary/page.tsx
├── test-building/page.tsx
├── scoring/page.tsx
├── psychometrics/page.tsx
├── authoring/
│   ├── page.tsx
│   ├── competencies/page.tsx
│   ├── indicators/page.tsx
│   └── questions/page.tsx
├── best-practices/page.tsx
└── _components/
    ├── DocsNav.tsx              # Client component (uses usePathname)
    ├── DocsNavWrapper.tsx       # Dynamic import with ssr: false
    ├── DocsToc.tsx              # Client component (IntersectionObserver)
    ├── DocsSearch.tsx           # Client component (CommandDialog)
    ├── DocsFooterNav.tsx
    ├── DocsBreadcrumb.tsx
    └── MobileDocsNav.tsx        # Client component (Sheet)
```

### Current Issues

| Issue | Impact | Severity |
|-------|--------|----------|
| No static generation | Pages rendered on each request | High |
| `ssr: false` on DocsNav | Layout shift, slower FCP | Medium |
| No `use cache` directive | No build-time caching | High |
| Client-side TOC | Extra JS, delayed interactivity | Low |
| No prefetching optimization | Slower navigation | Medium |

### Page Characteristics

| Page | Data Dependencies | Recommended Rendering |
|------|-------------------|----------------------|
| /docs | None (static content) | Static + cache |
| /docs/getting-started | None | Static + cache |
| /docs/glossary | None | Static + cache |
| /docs/test-building | None | Static + cache |
| /docs/scoring | None | Static + cache |
| /docs/psychometrics | None | Static + cache |
| /docs/authoring | None | Static + cache |
| /docs/authoring/* | None | Static + cache |
| /docs/best-practices | None | Static + cache |

**Conclusion:** All 11 pages are static content with no runtime data dependencies.

---

## Implementation Plan

### Phase 1: Apply Static Caching to Layout and Pages (Priority: HIGH)

#### 1.1 Update `layout.tsx` with `use cache`

The layout should be cached since it renders static navigation structure.

**File:** `frontend-app/app/(workspace)/docs/layout.tsx`

```typescript
import { cacheLife } from 'next/cache';
import { DocsNavServer } from "./_components/DocsNavServer";
import { MobileDocsNavWrapper } from "./_components/MobileDocsNavWrapper";

// Cache the entire layout
'use cache';
cacheLife('referenceData'); // 30min stale, 1hr revalidate, 2hr expire

export const metadata = {
  title: "Документация | SkillSoft",
  description:
    "Внутренняя документация платформы оценки soft skills для HR-администраторов",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)]">
      {/* Left Sidebar - Server-rendered navigation */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-muted/30">
        <DocsNavServer />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
              <div className="min-w-0">{children}</div>
              <div className="hidden lg:block" id="docs-toc-container" />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation - Client-side only */}
      <MobileDocsNavWrapper />
    </div>
  );
}
```

#### 1.2 Update Individual Pages with `use cache`

**Example for `frontend-app/app/(workspace)/docs/page.tsx`:**

```typescript
import { cacheLife } from 'next/cache';
import { Metadata } from "next";
import Link from "next/link";
// ... other imports

'use cache';
cacheLife('referenceData');

export const metadata: Metadata = {
  title: "Документация | SkillSoft",
  description:
    "Добро пожаловать в документацию платформы оценки soft skills SkillSoft",
};

// ... rest of component unchanged
```

**Apply to all pages:**
- `docs/page.tsx`
- `docs/getting-started/page.tsx`
- `docs/glossary/page.tsx`
- `docs/test-building/page.tsx`
- `docs/scoring/page.tsx`
- `docs/psychometrics/page.tsx`
- `docs/authoring/page.tsx`
- `docs/authoring/competencies/page.tsx`
- `docs/authoring/indicators/page.tsx`
- `docs/authoring/questions/page.tsx`
- `docs/best-practices/page.tsx`

---

### Phase 2: Fix Navigation SSR Without Hydration Issues (Priority: HIGH)

The current approach uses `ssr: false` due to Radix UI hydration mismatches. There are several strategies to fix this:

#### 2.1 Strategy A: Server Component Navigation (Recommended)

Create a server component for navigation that renders static HTML, with client-side active state highlighting.

**New File:** `frontend-app/app/(workspace)/docs/_components/DocsNavServer.tsx`

```typescript
import { cacheLife } from 'next/cache';
import { docsNavigation } from "@/lib/docs/navigation";
import { DocsNavClient } from "./DocsNavClient";
import { DocsSearchTrigger } from "./DocsSearchTrigger";

// Server component - renders static navigation structure
export async function DocsNavServer() {
  'use cache';
  cacheLife('referenceData');

  return (
    <div className="flex h-full flex-col">
      {/* Search Button - Client component */}
      <div className="p-4 border-b">
        <DocsSearchTrigger />
      </div>

      {/* Navigation - Server-rendered structure, client-enhanced */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-6">
          {docsNavigation.map((section) => (
            <DocsNavSection key={section.title} section={section} />
          ))}
        </div>
      </nav>
    </div>
  );
}

// Server component for section rendering
function DocsNavSection({ section }: { section: typeof docsNavigation[0] }) {
  return (
    <div className="space-y-1">
      <h3 className="px-2 py-1.5 text-sm font-semibold text-foreground">
        {section.title}
      </h3>
      <ul className="space-y-1">
        {section.items.map((item) => (
          <DocsNavItem key={item.href} item={item} />
        ))}
      </ul>
    </div>
  );
}

// Import client component for active state
import { DocsNavItem } from "./DocsNavItem";
```

**New File:** `frontend-app/app/(workspace)/docs/_components/DocsNavItem.tsx`

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { NavItem } from "@/lib/docs/navigation";

interface DocsNavItemProps {
  item: NavItem;
  onLinkClick?: () => void;
}

/**
 * Client component for navigation item with active state
 * Minimal client-side logic - only pathname comparison
 */
export function DocsNavItem({ item, onLinkClick }: DocsNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onLinkClick}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <span className="truncate">{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {item.badge}
          </Badge>
        )}
      </Link>
    </li>
  );
}
```

#### 2.2 Strategy B: Collapsible with Stable IDs

If collapsible sections are needed, provide stable IDs to prevent hydration mismatches.

**Updated File:** `frontend-app/app/(workspace)/docs/_components/DocsNavCollapsible.tsx`

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { NavSection, NavItem } from "@/lib/docs/navigation";

interface DocsNavCollapsibleProps {
  section: NavSection;
  sectionIndex: number; // Stable identifier
  onLinkClick?: () => void;
}

/**
 * Collapsible navigation section with stable IDs
 * Uses sectionIndex for deterministic ID generation
 */
export function DocsNavCollapsible({
  section,
  sectionIndex,
  onLinkClick,
}: DocsNavCollapsibleProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Generate stable ID using index instead of useId
  const sectionId = `docs-nav-section-${sectionIndex}`;
  const contentId = `docs-nav-content-${sectionIndex}`;

  const isActive = section.items.some((item) => pathname === item.href);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        id={sectionId}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-accent/50 transition-colors"
      >
        <span>{section.title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Native collapsible without Radix */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={sectionId}
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="space-y-1 pt-1">
          {section.items.map((item) => {
            const isItemActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isItemActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
```

#### 2.3 Strategy C: Suppress Hydration Warning (Quick Fix)

For Radix components that generate IDs, add `suppressHydrationWarning`:

```typescript
// In collapsible wrapper - NOT recommended for production
<Collapsible
  open={isOpen}
  onOpenChange={setIsOpen}
  // Suppress only if absolutely necessary
>
  <CollapsibleTrigger
    className="..."
    suppressHydrationWarning
  >
    {/* ... */}
  </CollapsibleTrigger>
  <CollapsibleContent suppressHydrationWarning>
    {/* ... */}
  </CollapsibleContent>
</Collapsible>
```

**Recommendation:** Use Strategy A (Server Component Navigation) for best performance.

---

### Phase 3: Route Segment Configuration (Priority: MEDIUM)

Add route segment configuration to enforce static behavior.

**New File:** `frontend-app/app/(workspace)/docs/route-config.ts`

Export shared configuration for all docs routes.

**Update:** `frontend-app/app/(workspace)/docs/layout.tsx`

```typescript
// Route segment configuration
export const dynamic = 'force-static';  // Force static generation
export const revalidate = 3600;         // Revalidate every hour (ISR)
export const fetchCache = 'force-cache'; // Cache all fetches
export const runtime = 'nodejs';        // Use Node.js runtime
```

**For each page.tsx:**

```typescript
// Export static params if needed (docs pages don't have dynamic segments)
export const dynamic = 'force-static';
export const revalidate = 3600;
```

---

### Phase 4: Table of Contents Optimization (Priority: MEDIUM)

The `DocsToc` component currently uses `IntersectionObserver` for active section highlighting. This requires client-side JavaScript.

#### 4.1 Server-Rendered TOC Structure

**Updated File:** `frontend-app/app/(workspace)/docs/_components/DocsToc.tsx`

```typescript
import { DocsTocClient } from "./DocsTocClient";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface DocsTocProps {
  items: TocItem[];
  className?: string;
}

/**
 * Server component wrapper for TOC
 * Renders static structure, enhances with client-side highlighting
 */
export function DocsToc({ items, className }: DocsTocProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn("sticky top-20", className)}
      aria-label="Table of contents"
    >
      <p className="mb-3 text-sm font-semibold text-foreground">
        На этой странице
      </p>
      {/* Client component for active state tracking */}
      <DocsTocClient items={items} />
    </nav>
  );
}
```

**New File:** `frontend-app/app/(workspace)/docs/_components/DocsTocClient.tsx`

```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "./DocsToc";

interface DocsTocClientProps {
  items: TocItem[];
}

/**
 * Client component for TOC with active section highlighting
 */
export function DocsTocClient({ items }: DocsTocClientProps) {
  const [activeId, setActiveId] = useState<string>("");

  // IntersectionObserver for active section
  useEffect(() => {
    if (items.length === 0) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.reduce((prev, curr) =>
          prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
        );
        setActiveId(topEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-80px 0px -80% 0px",
      threshold: 0,
    });

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        const offset = 100;
        const offsetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        window.history.pushState(null, "", `#${id}`);
        setActiveId(id);
      }
    },
    []
  );

  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
            className={cn(
              "block py-1 transition-colors hover:text-foreground",
              item.level === 3 && "pl-3",
              activeId === item.id
                ? "text-primary font-medium border-l-2 border-primary pl-3 -ml-[2px]"
                : "text-muted-foreground"
            )}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
```

---

### Phase 5: Search Component Optimization (Priority: LOW)

The search component (CommandDialog) must remain client-side due to:
- Keyboard event listeners (Cmd+K)
- Dialog state management
- Router navigation

**Optimization:** Lazy load the dialog content.

**Updated File:** `frontend-app/app/(workspace)/docs/_components/DocsSearchTrigger.tsx`

```typescript
"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Lazy load the dialog to reduce initial bundle
const DocsSearchDialog = lazy(() =>
  import("./DocsSearchDialog").then(mod => ({ default: mod.DocsSearchDialog }))
);

/**
 * Search trigger button with lazy-loaded dialog
 * Reduces initial JS bundle size
 */
export function DocsSearchTrigger() {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground h-9 px-3"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span className="flex-1 text-left text-sm">Поиск...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>

      {open && (
        <Suspense fallback={null}>
          <DocsSearchDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}
```

---

### Phase 6: Link Prefetching Optimization (Priority: MEDIUM)

Next.js automatically prefetches links in viewport. Ensure optimal prefetching:

**Update navigation links:**

```typescript
<Link
  href={item.href}
  prefetch={true}  // Explicit prefetch
  // ... rest of props
>
```

**For footer navigation (DocsFooterNav):**

```typescript
// Prefetch adjacent pages for faster navigation
<Link href={prev.href} prefetch={true}>
  {/* Previous */}
</Link>
<Link href={next.href} prefetch={true}>
  {/* Next */}
</Link>
```

---

### Phase 7: Metadata Optimization (Priority: LOW)

Add `generateMetadata` for dynamic SEO where needed.

**Example enhancement:**

```typescript
import { Metadata } from "next";

// Static metadata (current approach - keep as is)
export const metadata: Metadata = {
  title: "Система оценивания | Документация | SkillSoft",
  description: "Как рассчитываются баллы и результаты в SkillSoft",
  openGraph: {
    title: "Система оценивания | SkillSoft",
    description: "Как рассчитываются баллы и результаты в SkillSoft",
    type: "article",
    locale: "ru_RU",
  },
};
```

---

## Implementation Priority Matrix

| Phase | Task | Priority | Effort | Impact |
|-------|------|----------|--------|--------|
| 1 | Add `use cache` to pages | HIGH | Low | High |
| 2 | Fix DocsNav SSR | HIGH | Medium | High |
| 3 | Route segment config | MEDIUM | Low | Medium |
| 4 | Split DocsToc server/client | MEDIUM | Medium | Medium |
| 5 | Lazy load search dialog | LOW | Low | Low |
| 6 | Prefetch optimization | MEDIUM | Low | Medium |
| 7 | Enhanced metadata | LOW | Low | Low |

---

## Implementation Order

### Week 1: Core Caching
1. Add `use cache` + `cacheLife('referenceData')` to all pages
2. Add route segment configuration (`dynamic = 'force-static'`)
3. Test build output to verify static generation

### Week 2: Navigation Fix
4. Create `DocsNavServer` server component
5. Create `DocsNavItem` client component
6. Replace `DocsNavWrapper` with new architecture
7. Test hydration - no console errors

### Week 3: Optimization
8. Split `DocsToc` into server/client components
9. Implement lazy loading for search dialog
10. Add explicit prefetch to navigation links
11. Performance audit with Lighthouse

---

## Verification Checklist

After implementation, verify:

- [ ] Build output shows pages as "Static" (not "Dynamic")
- [ ] No hydration mismatch errors in console
- [ ] Navigation renders on server (view source shows HTML)
- [ ] Active state highlighting works on client
- [ ] Search dialog opens with Cmd+K
- [ ] Mobile navigation works
- [ ] TOC active section tracking works
- [ ] Page transitions are smooth
- [ ] Lighthouse performance score > 90

---

## Rollback Plan

If issues occur:

1. **Hydration errors persist:** Revert to `ssr: false` wrapper
2. **Cache issues:** Remove `use cache` directive
3. **Build failures:** Remove route segment config

Keep the `DocsNavWrapper.tsx` file as backup during migration.

---

## Notes on Clerk Compatibility

The `next.config.ts` currently has `cacheComponents: false` due to Clerk compatibility issues. This affects the `use cache` directive behavior:

```typescript
// next.config.ts
cacheComponents: false, // Clerk compatibility
```

**Workaround:** The `use cache` directive still works at the page level even with `cacheComponents: false`. The directive is processed during build time for static pages.

If full `use cache` support is needed:
1. Monitor Clerk GitHub issue: https://github.com/clerk/javascript/pull/7119
2. Test with `cacheComponents: true` after Clerk update

---

## Performance Targets

| Metric | Current | Target |
|--------|---------|--------|
| TTFB | ~200ms | <100ms |
| FCP | ~1.2s | <0.8s |
| LCP | ~1.5s | <1.0s |
| TTI | ~2.0s | <1.5s |
| CLS | 0.1 | <0.05 |

---

## Sources

- [Next.js `use cache` Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [Next.js `cacheLife` Function](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [Next.js Caching Guide](https://nextjs.org/docs/app/guides/caching)
- [Next.js Static Generation](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [Radix UI SSR Guide](https://www.radix-ui.com/primitives/docs/guides/server-side-rendering)
- [Radix Hydration Issue #3700](https://github.com/radix-ui/primitives/issues/3700)
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Mastering Next.js 15 Caching](https://strapi.io/blog/mastering-nextjs-15-caching-dynamic-io-and-the-use-cache)
