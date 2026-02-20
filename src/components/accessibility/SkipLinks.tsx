'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * SkipLinks - Keyboard navigation aid for screen reader users
 *
 * Features:
 * - Hidden until focused (Tab key)
 * - Allows skipping repetitive navigation
 * - Multiple skip targets support
 * - Smooth scroll to target
 * - Focus management
 * - Bilingual support (EN/RU) via next-intl accessibility namespace
 */

export interface SkipLinkTarget {
  /** ID of the target element */
  id: string;
  /** Translation key within the 'accessibility' namespace (e.g. 'skipToMainContent') */
  labelKey: string;
  /** Fallback label if translation is unavailable */
  fallbackLabel: string;
}

export interface SkipLinksProps {
  /** Skip link targets */
  links?: SkipLinkTarget[];
  /** Custom class name */
  className?: string;
}

// Default skip links for most pages
const defaultLinks: SkipLinkTarget[] = [
  { id: 'main-content', labelKey: 'skipToMainContent', fallbackLabel: 'Skip to main content' },
  { id: 'navigation', labelKey: 'skipToNavigation', fallbackLabel: 'Skip to navigation' },
];

export function SkipLinks({ links = defaultLinks, className }: SkipLinksProps) {
  const t = useTranslations('accessibility');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      // Set tabindex to make element focusable if it isn't
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      // Scroll to target
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus target
      target.focus({ preventScroll: true });
    }
  };

  return (
    <nav
      aria-label="Skip links"
      className={cn(
        'fixed top-0 left-0 z-[100] bg-background',
        className
      )}
    >
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              onClick={(e) => handleClick(e, link.id)}
              className={cn(
                // Hidden by default, visible on focus
                'sr-only focus:not-sr-only',
                // Styling when visible
                'focus:absolute focus:top-2 focus:left-2',
                'focus:z-[100] focus:px-4 focus:py-2',
                'focus:bg-primary focus:text-primary-foreground',
                'focus:rounded-md focus:shadow-lg',
                'focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'focus:outline-none',
                // Animation
                'transition-transform duration-200',
                'focus:translate-y-0'
              )}
            >
              {t(link.labelKey as Parameters<typeof t>[0])}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * MainContentAnchor - Target anchor for "Skip to main content"
 *
 * Place this at the beginning of your main content area
 */
export function MainContentAnchor({ className }: { className?: string }) {
  return (
    <div
      id="main-content"
      tabIndex={-1}
      className={cn('outline-none', className)}
      aria-label="Main content"
    />
  );
}

/**
 * NavigationAnchor - Target anchor for "Skip to navigation"
 */
export function NavigationAnchor({ className }: { className?: string }) {
  return (
    <div
      id="navigation"
      tabIndex={-1}
      className={cn('outline-none', className)}
      aria-label="Navigation"
    />
  );
}

/**
 * SkipLinkTarget - Generic target anchor component
 */
export interface SkipLinkTargetProps {
  id: string;
  label: string;
  className?: string;
}

export function SkipLinkTargetAnchor({ id, label, className }: SkipLinkTargetProps) {
  return (
    <div
      id={id}
      tabIndex={-1}
      className={cn('outline-none', className)}
      aria-label={label}
    />
  );
}

/**
 * Preset skip link configurations for different page types.
 * Each entry uses a translation key from the 'accessibility' namespace.
 */
export const SKIP_LINK_PRESETS = {
  dashboard: [
    { id: 'main-content', labelKey: 'skipToMainContent', fallbackLabel: 'Skip to main content' },
    { id: 'sidebar', labelKey: 'skipToSidebar', fallbackLabel: 'Skip to sidebar' },
    { id: 'quick-actions', labelKey: 'skipToQuickActions', fallbackLabel: 'Skip to quick actions' },
  ],
  table: [
    { id: 'main-content', labelKey: 'skipToMainContent', fallbackLabel: 'Skip to main content' },
    { id: 'table-content', labelKey: 'skipToTable', fallbackLabel: 'Skip to table' },
    { id: 'pagination', labelKey: 'skipToPagination', fallbackLabel: 'Skip to pagination' },
  ],
  form: [
    { id: 'main-content', labelKey: 'skipToMainContent', fallbackLabel: 'Skip to main content' },
    { id: 'form-content', labelKey: 'skipToForm', fallbackLabel: 'Skip to form' },
    { id: 'form-actions', labelKey: 'skipToFormActions', fallbackLabel: 'Skip to form actions' },
  ],
  testPlayer: [
    { id: 'main-content', labelKey: 'skipToQuestion', fallbackLabel: 'Skip to question' },
    { id: 'answer-options', labelKey: 'skipToAnswerOptions', fallbackLabel: 'Skip to answer options' },
    { id: 'navigation', labelKey: 'skipToNavigation', fallbackLabel: 'Skip to navigation' },
  ],
  psychometrics: [
    { id: 'main-content', labelKey: 'skipToMainContent', fallbackLabel: 'Skip to main content' },
    { id: 'charts', labelKey: 'skipToCharts', fallbackLabel: 'Skip to charts' },
    { id: 'data-table', labelKey: 'skipToDataTable', fallbackLabel: 'Skip to data table' },
  ],
} as const;

export default SkipLinks;
