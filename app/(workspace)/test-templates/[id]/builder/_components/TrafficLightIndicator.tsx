'use client';

import { cn } from '@/lib/utils';
import type { TrafficLightStatus } from './hooks/useCardWarnings';

interface TrafficLightIndicatorProps {
  status: TrafficLightStatus;
  className?: string;
}

const statusStyles: Record<TrafficLightStatus, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500 animate-pulse',
};

/**
 * Small stateless colored dot indicating the traffic-light status of a card.
 * Pulses when red to draw attention to errors.
 */
export function TrafficLightIndicator({ status, className }: TrafficLightIndicatorProps) {
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full shrink-0',
        statusStyles[status],
        className
      )}
      aria-hidden="true"
    />
  );
}
