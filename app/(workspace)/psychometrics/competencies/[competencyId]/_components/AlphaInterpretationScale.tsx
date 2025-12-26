/**
 * AlphaInterpretationScale - Visual scale showing Cronbach's Alpha zones
 *
 * Features:
 * - Color-coded zones from unacceptable (red) to excellent (green)
 * - Highlights the active zone based on current alpha value
 * - Accessible with proper ARIA labels
 * - Server Component (no interactivity needed)
 */

import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
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
          ? `Шкала интерпретации Alpha Кронбаха. Текущее значение ${alpha.toFixed(3)} соответствует уровню: ${activeZone.description}`
          : 'Шкала интерпретации Alpha Кронбаха. Данные отсутствуют.'
      }
    >
      {/* Header */}
      {showLabels && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" aria-hidden="true" />
          <span>Шкала интерпретации Alpha Кронбаха</span>
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
          Текущее значение{' '}
          <span className="font-bold tabular-nums">{alpha.toFixed(3)}</span>{' '}
          соответствует уровню:{' '}
          <span className="font-semibold">{activeZone.description}</span>
        </p>
      )}

      {/* No Data State */}
      {showCurrentValue && alpha === null && (
        <p className="text-sm text-center text-muted-foreground">
          Недостаточно данных для определения уровня надежности
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
        Нет данных
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
