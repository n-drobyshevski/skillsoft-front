'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ResultTabDefinition } from './types';

// ============================================================================
// Accent color mappings
// ============================================================================

const ACCENT_CLASSES = {
  emerald: {
    active: 'text-emerald-600 dark:text-emerald-400 border-emerald-500',
    hover: 'hover:text-emerald-600 dark:hover:text-emerald-400',
  },
  violet: {
    active: 'text-violet-600 dark:text-violet-400 border-violet-500',
    hover: 'hover:text-violet-600 dark:hover:text-violet-400',
  },
  blue: {
    active: 'text-blue-600 dark:text-blue-400 border-blue-500',
    hover: 'hover:text-blue-600 dark:hover:text-blue-400',
  },
};

// ============================================================================
// Props
// ============================================================================

interface ResultTabsProps {
  tabs: ResultTabDefinition[];
  accentColor?: 'emerald' | 'violet' | 'blue';
  className?: string;
}

// ============================================================================
// ResultTabs — sticky horizontal tab navigation with scroll spy
// ============================================================================

export function ResultTabs({
  tabs,
  accentColor = 'blue',
  className,
}: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? '');
  const accent = ACCENT_CLASSES[accentColor];
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll spy: activate tab for section entering the top viewport zone
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            // Convert "section-{id}" back to tab id
            const tabId = sectionId.replace(/^section-/, '');
            setActiveTab(tabId);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );

    const observer = observerRef.current;

    for (const tab of tabs) {
      const el = document.getElementById(`section-${tab.id}`);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [tabs]);

  function handleTabClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    setActiveTab(id);
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav
      role="tablist"
      aria-label="Result sections"
      className={cn(
        'sticky z-30 bg-card/95 backdrop-blur-sm border-b border-border',
        // Offset below HeroStrip using the CSS custom property defined in globals.css
        '[top:var(--hero-strip-height)]',
        className,
      )}
    >
      {/* Scrollable tab row — hidden scrollbar on mobile */}
      <div
        className={cn(
          'flex overflow-x-auto px-4 sm:px-6 lg:px-8',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <a
              key={tab.id}
              role="tab"
              href={`#section-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`section-${tab.id}`}
              onClick={(e) => handleTabClick(e, tab.id)}
              className={cn(
                // Base
                'flex items-center gap-1.5 px-3 h-11 text-xs font-medium',
                'whitespace-nowrap border-b-2 transition-colors duration-150',
                'touch-manipulation',
                // Inactive
                !isActive && [
                  'border-transparent text-muted-foreground',
                  accent.hover,
                ],
                // Active
                isActive && [accent.active],
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
