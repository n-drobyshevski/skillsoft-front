'use client';

import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * Big Five personality traits profile
 */
interface BigFiveProfile {
  OPENNESS: number;
  CONSCIENTIOUSNESS: number;
  EXTRAVERSION: number;
  AGREEABLENESS: number;
  EMOTIONAL_STABILITY: number;
}

interface MobileBigFiveBarsProps {
  profile: BigFiveProfile;
  className?: string;
}

/**
 * Trait configuration with colors matching the radar chart
 */
const TRAIT_CONFIG = {
  OPENNESS: {
    colorClass: 'bg-violet-500',
    textClass: 'text-violet-600 dark:text-violet-400',
  },
  CONSCIENTIOUSNESS: {
    colorClass: 'bg-blue-500',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  EXTRAVERSION: {
    colorClass: 'bg-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  AGREEABLENESS: {
    colorClass: 'bg-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  EMOTIONAL_STABILITY: {
    colorClass: 'bg-cyan-500',
    textClass: 'text-cyan-600 dark:text-cyan-400',
  },
} as const;

/**
 * Trait display order
 */
const TRAIT_ORDER: Array<keyof BigFiveProfile> = [
  'OPENNESS',
  'CONSCIENTIOUSNESS',
  'EXTRAVERSION',
  'AGREEABLENESS',
  'EMOTIONAL_STABILITY',
];

/**
 * MobileBigFiveBars - Mobile-friendly alternative to radar chart
 *
 * Displays Big Five personality traits as horizontal progress bars
 * optimized for mobile viewports with:
 * - Touch-friendly 44px minimum touch targets
 * - Clear visual hierarchy with trait names, bars, and scores
 * - Full i18n support
 * - Proper accessibility with aria-labels
 */
export function MobileBigFiveBars({ profile, className }: MobileBigFiveBarsProps) {
  const t = useTranslations('profile.passport');

  return (
    <div
      className={cn('space-y-1', className)}
      role="list"
      aria-label={t('title')}
    >
      {TRAIT_ORDER.map((trait) => {
        // eslint-disable-next-line security/detect-object-injection
        const score = profile[trait];
        // eslint-disable-next-line security/detect-object-injection
        const config = TRAIT_CONFIG[trait];
        const traitName = t(`traits.${trait}`);

        return (
          <div
            key={trait}
            className="flex items-center gap-2 min-h-[44px] touch-manipulation"
            role="listitem"
          >
            {/* Trait name */}
            <span
              className="w-24 text-xs font-medium truncate"
              title={traitName}
            >
              {traitName}
            </span>

            {/* Progress bar with custom color */}
            <div className="flex-1 relative">
              <Progress
                value={score}
                className="h-2 bg-muted"
                aria-label={`${traitName}: ${score}%`}
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
              />
              {/* Custom color overlay for the indicator */}
              <div
                className={cn(
                  'absolute inset-0 h-2 rounded-full transition-all duration-500',
                  config.colorClass
                )}
                style={{ width: `${score}%` }}
                aria-hidden="true"
              />
            </div>

            {/* Score value */}
            <span
              className={cn(
                'w-8 text-xs font-bold tabular-nums text-right',
                config.textClass
              )}
              aria-hidden="true"
            >
              {score}
            </span>
          </div>
        );
      })}

      {/* Screen reader summary */}
      <div className="sr-only">
        {TRAIT_ORDER.map((trait) => {
          // eslint-disable-next-line security/detect-object-injection
          const score = profile[trait];
          return `${t(`traits.${trait}`)}: ${score}%. `;
        })}
      </div>
    </div>
  );
}
