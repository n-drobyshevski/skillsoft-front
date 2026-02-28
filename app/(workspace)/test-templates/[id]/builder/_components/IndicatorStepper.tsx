'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredIndicator } from '@/store/blueprint-store';
import { useTranslations } from 'next-intl';

interface IndicatorStepperProps {
  indicator: StoredIndicator;
  onChange: (id: string, value: number) => void;
  disabled?: boolean;
}

export function IndicatorStepper({ indicator, onChange, disabled }: IndicatorStepperProps) {
  const t = useTranslations('builder.card');

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <span className="text-xs sm:text-sm font-medium text-foreground/80 line-clamp-2 sm:line-clamp-1 sm:flex-1 sm:min-w-0">
        {indicator.title}
      </span>

      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
        <Button
          variant="ghost"
          className={cn(
            'h-11 w-11 sm:h-9 sm:w-9 rounded-full p-0',
            'active:scale-[0.98] touch-manipulation'
          )}
          onClick={() => onChange(indicator.id, Math.max(0, indicator.weight - 5))}
          disabled={disabled || indicator.weight <= 0}
          aria-label={t('decreaseIndicatorWeight', { name: indicator.title })}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>

        <span className="text-xs font-medium tabular-nums w-10 text-center text-foreground/70">
          {indicator.weight}%
        </span>

        <Button
          variant="ghost"
          className={cn(
            'h-11 w-11 sm:h-9 sm:w-9 rounded-full p-0',
            'active:scale-[0.98] touch-manipulation'
          )}
          onClick={() => onChange(indicator.id, Math.min(100, indicator.weight + 5))}
          disabled={disabled || indicator.weight >= 100}
          aria-label={t('increaseIndicatorWeight', { name: indicator.title })}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
