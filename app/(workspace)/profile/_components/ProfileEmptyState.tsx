'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateVariant =
  | 'no-tests'        // No tests taken yet
  | 'no-competencies' // No competency data
  | 'no-passport'     // No Big Five profile
  | 'no-results'      // No results for filter
  | 'new-user';       // Welcome new user

interface ProfileEmptyStateProps {
  variant: EmptyStateVariant;
  className?: string;
  showCta?: boolean;
  ctaHref?: string;
  onCtaClick?: () => void;
}

/**
 * SVG Illustrations for each empty state variant
 * Simple, modern, minimal outline style with consistent 24x24 viewBox
 */

function ClipboardCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Clipboard body */}
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      {/* Clipboard top */}
      <rect x="9" y="3" width="6" height="4" rx="1" />
      {/* Checkmark */}
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Trophy handles */}
      <path d="M6 9H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M18 9h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      {/* Trophy cup */}
      <path d="M8 4h8v8a4 4 0 0 1-8 0V4Z" />
      {/* Trophy base */}
      <path d="M12 16v2" />
      <path d="M8 22h8" />
      <path d="M10 18h4" />
      {/* Star decoration */}
      <path d="m12 7-.5 1-1 .5 1 .5.5 1 .5-1 1-.5-1-.5Z" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Left hemisphere */}
      <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v.5a2.5 2.5 0 0 0-1.5 2.27 2.5 2.5 0 0 0-.5 4.73v.5a2.5 2.5 0 0 0 .5 4.73 2.5 2.5 0 0 0 2 2.77v.5A2.5 2.5 0 0 0 12 22" />
      {/* Right hemisphere */}
      <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v.5a2.5 2.5 0 0 1 1.5 2.27 2.5 2.5 0 0 1 .5 4.73v.5a2.5 2.5 0 0 1-.5 4.73 2.5 2.5 0 0 1-2 2.77v.5A2.5 2.5 0 0 1 12 22" />
      {/* Center line */}
      <path d="M12 2v20" />
      {/* Neural connections */}
      <path d="M9 8h1" />
      <path d="M14 8h1" />
      <path d="M9 12h1" />
      <path d="M14 12h1" />
    </svg>
  );
}

function SearchXIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Search circle */}
      <circle cx="11" cy="11" r="7" />
      {/* Search handle */}
      <path d="m21 21-4.35-4.35" />
      {/* X mark inside */}
      <path d="m9 9 4 4" />
      <path d="m13 9-4 4" />
    </svg>
  );
}

function WavingHandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Hand with waving motion */}
      <path d="M18.5 12.5c.83.83.83 2.17 0 3l-4.5 4.5a3.5 3.5 0 0 1-5 0l-5.5-5.5a1.5 1.5 0 0 1 2.12-2.12l.88.88" />
      <path d="M8 14.5V6a1.5 1.5 0 0 1 3 0v4" />
      <path d="M11 10.5V5a1.5 1.5 0 0 1 3 0v5" />
      <path d="M14 10.5V6a1.5 1.5 0 0 1 3 0v5.5" />
      <path d="M17 11.5V9a1.5 1.5 0 0 1 3 0v3" />
      {/* Motion lines */}
      <path d="M3.5 8.5c-.5-.5-.5-1.5 0-2s1.5-.5 2 0" opacity={0.5} />
      <path d="M2 12c-.5-.5-.5-1.5 0-2" opacity={0.3} />
    </svg>
  );
}

/**
 * Configuration for each empty state variant
 */
interface VariantConfig {
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass: string;
  bgColorClass: string;
  defaultCtaHref: string;
}

// Common hrefs used across multiple variants
const HREF_TEST_TEMPLATES = '/test-templates';
const HREF_MY_TESTS = '/my-tests';

const VARIANT_CONFIG: Record<EmptyStateVariant, VariantConfig> = {
  'no-tests': {
    icon: ClipboardCheckIcon,
    iconColorClass: 'text-blue-500 dark:text-blue-400',
    bgColorClass: 'bg-blue-100 dark:bg-blue-900/30',
    defaultCtaHref: HREF_TEST_TEMPLATES,
  },
  'no-competencies': {
    icon: TrophyIcon,
    iconColorClass: 'text-amber-500 dark:text-amber-400',
    bgColorClass: 'bg-amber-100 dark:bg-amber-900/30',
    defaultCtaHref: HREF_TEST_TEMPLATES,
  },
  'no-passport': {
    icon: BrainIcon,
    iconColorClass: 'text-purple-500 dark:text-purple-400',
    bgColorClass: 'bg-purple-100 dark:bg-purple-900/30',
    defaultCtaHref: HREF_TEST_TEMPLATES,
  },
  'no-results': {
    icon: SearchXIcon,
    iconColorClass: 'text-muted-foreground',
    bgColorClass: 'bg-muted',
    defaultCtaHref: HREF_MY_TESTS,
  },
  'new-user': {
    icon: WavingHandIcon,
    iconColorClass: 'text-emerald-500 dark:text-emerald-400',
    bgColorClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    defaultCtaHref: HREF_TEST_TEMPLATES,
  },
};

/**
 * Safe variant config getter
 * Uses a switch statement to satisfy eslint security/detect-object-injection
 */
function getVariantConfig(variant: EmptyStateVariant): VariantConfig {
  switch (variant) {
    case 'no-tests':
      return VARIANT_CONFIG['no-tests'];
    case 'no-competencies':
      return VARIANT_CONFIG['no-competencies'];
    case 'no-passport':
      return VARIANT_CONFIG['no-passport'];
    case 'no-results':
      return VARIANT_CONFIG['no-results'];
    case 'new-user':
      return VARIANT_CONFIG['new-user'];
    default:
      // TypeScript exhaustive check - should never reach here
      return VARIANT_CONFIG['no-tests'];
  }
}


/**
 * ProfileEmptyState - Reusable empty state component for profile page
 *
 * Features:
 * - Multiple variants for different empty state scenarios
 * - Inline SVG illustrations (no external dependencies)
 * - Full i18n support via next-intl
 * - Optional call-to-action button
 * - Responsive design with centered layout
 * - Staggered fade-in animation
 *
 * @example
 * ```tsx
 * <ProfileEmptyState variant="no-tests" showCta />
 * <ProfileEmptyState variant="no-results" onCtaClick={handleClearFilters} />
 * ```
 */
export function ProfileEmptyState({
  variant,
  className,
  showCta = true,
  ctaHref,
  onCtaClick,
}: ProfileEmptyStateProps) {
  const t = useTranslations('profile.empty');
  const config = getVariantConfig(variant);
  const Icon = config.icon;

  // Use variant directly as translation key (e.g., 'no-tests', 'new-user')
  const translationKey = variant;
  const resolvedCtaHref = ctaHref ?? config.defaultCtaHref;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-8 px-4',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon container with muted background - 64x64px */}
      <div
        className={cn(
          'flex items-center justify-center w-16 h-16 rounded-2xl mb-4',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          config.bgColorClass
        )}
      >
        <Icon
          className={cn(
            'w-8 h-8',
            config.iconColorClass
          )}
        />
      </div>

      {/* Title - text-base font-semibold */}
      <h3
        className={cn(
          'text-base font-semibold text-foreground mb-1.5 max-w-[280px]',
          'animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-75'
        )}
      >
        {t(`${translationKey}.title`)}
      </h3>

      {/* Description - text-sm text-muted-foreground */}
      <p
        className={cn(
          'text-sm text-muted-foreground max-w-[280px] leading-relaxed',
          'animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-100'
        )}
      >
        {t(`${translationKey}.description`)}
      </p>

      {/* CTA Button with primary variant */}
      {showCta && (
        <div
          className={cn(
            'mt-4',
            'animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-150'
          )}
        >
          {onCtaClick ? (
            <Button
              variant="default"
              size="sm"
              onClick={onCtaClick}
              className="min-h-[44px] touch-manipulation"
            >
              {t(`${translationKey}.cta`)}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              asChild
              className="min-h-[44px] touch-manipulation"
            >
              <Link href={resolvedCtaHref}>
                {t(`${translationKey}.cta`)}
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Export individual illustrations for reuse in other components
 */
export {
  ClipboardCheckIcon,
  TrophyIcon,
  BrainIcon,
  SearchXIcon,
  WavingHandIcon,
};

export type { EmptyStateVariant, ProfileEmptyStateProps };
