'use client';

/**
 * AlphaInterpretationScale - Visual scale showing Cronbach's Alpha zones
 *
 * Features:
 * - Color-coded zones from unacceptable (red) to excellent (green)
 * - Highlights the active zone based on current alpha value
 * - Accessible with proper ARIA labels
 * - i18n support via next-intl
 */

import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  ALPHA_INTERPRETATION_ZONES,
  getActiveAlphaZone,
} from '../_lib/competency-detail.utils';

interface AlphaInterpretationScaleProps {
  alpha: number | null;
  className?: string;
  showLabels?: boolean;
  showCurrentValue?: boolean;
}

export function AlphaInterpretationScale({
  alpha,
  className,
  showLabels = true,
  showCurrentValue = true,
}: AlphaInterpretationScaleProps) {
  const t = useTranslations('psychometrics.competencyDetail.alphaInterpretationScale');
  const activeZone = getActiveAlphaZone(alpha);
  const activeZoneIndex = activeZone
    ? ALPHA_INTERPRETATION_ZONES.findIndex((z) => z.label === activeZone.label)
    : -1;

  return (
    <div
      className={cn('space-y-3', className)}
      role="img"
      aria-label={
        alpha !== null && activeZone
          ? t('scaleAriaLabel', { alpha: alpha.toFixed(3), description: activeZone.description })
          : t('noDataAriaLabel')
      }
    >
      {/* Header */}
      {showLabels && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" aria-hidden="true" />
          <span>{t('scaleTitle')}</span>
        </div>
      )}

      {/* Visual Scale Bar */}
      <div
        className="flex gap-0.5 h-3 rounded-full overflow-hidden"
        aria-hidden="true"
      >
        {ALPHA_INTERPRETATION_ZONES.map((zone, index) => (
          <div
            key={zone.label}
            className={cn(
              'flex-1 transition-opacity duration-200',
              zone.color,
              index === activeZoneIndex
                ? 'ring-2 ring-offset-1 ring-foreground'
                : 'opacity-40'
            )}
            title={`${zone.label}: ${zone.description}`}
          />
        ))}
      </div>

      {/* Zone Labels */}
      {showLabels && (
        <div
          className="flex justify-between text-xs text-muted-foreground"
          aria-hidden="true"
        >
          {ALPHA_INTERPRETATION_ZONES.map((zone) => (
            <span key={zone.label} className="text-center">
              {zone.label}
            </span>
          ))}
        </div>
      )}

      {/* Current Value Indicator */}
      {showCurrentValue && alpha !== null && activeZone && (
        <p className="text-sm text-center">
          {t('currentValue')}{' '}
          <span className="font-bold tabular-nums">{alpha.toFixed(3)}</span>{' '}
          {t('correspondingLevel')}{' '}
          <span className="font-semibold">{activeZone.description}</span>
        </p>
      )}

      {/* No Data State */}
      {showCurrentValue && alpha === null && (
        <p className="text-sm text-center text-muted-foreground">
          {t('noDataMessage')}
        </p>
      )}
    </div>
  );
}

/**
 * Compact version for accordion headers or mobile summaries
 */
interface AlphaInterpretationBadgeProps {
  alpha: number | null;
  className?: string;
}

export function AlphaInterpretationBadge({
  alpha,
  className,
}: AlphaInterpretationBadgeProps) {
  const t = useTranslations('psychometrics.competencyDetail.alphaInterpretationScale');
  const activeZone = getActiveAlphaZone(alpha);

  if (!activeZone || alpha === null) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
          'bg-muted text-muted-foreground',
          className
        )}
      >
        {t('noDataBadge')}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        activeZone.bgColor,
        className
      )}
    >
      <span
        className={cn('w-2 h-2 rounded-full', activeZone.color)}
        aria-hidden="true"
      />
      {alpha.toFixed(2)} - {activeZone.description}
    </span>
  );
}

export default AlphaInterpretationScale;
