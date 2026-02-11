'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SwipeIndicators
 *
 * Visual feedback indicators for mobile swipe gestures.
 * Shows directional indicators during swipe navigation.
 */

export interface SwipeState {
  isSwiping: boolean;
  direction: -1 | 0 | 1; // -1 = left, 0 = none, 1 = right
  offsetX: number;
}

export interface SwipeIndicatorsProps {
  swipeState: SwipeState;
  canSwipeNext: boolean;
  canSwipePrevious: boolean;
  className?: string;
}

export function SwipeIndicators({
  swipeState,
  canSwipeNext,
  canSwipePrevious,
  className,
}: SwipeIndicatorsProps) {
  if (!swipeState.isSwiping) {
    return null;
  }

  const opacity = Math.min(Math.abs(swipeState.offsetX) / 100, 0.8);

  return (
    <div className={cn('pointer-events-none', className)}>
      {/* Left indicator (swipe right = go back) */}
      {canSwipePrevious && swipeState.direction === 1 && (
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-opacity"
          style={{ opacity }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800/80 backdrop-blur-sm">
            <ChevronLeft className="w-6 h-6 text-neutral-300" />
          </div>
        </div>
      )}

      {/* Right indicator (swipe left = go next) */}
      {canSwipeNext && swipeState.direction === -1 && (
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-opacity"
          style={{ opacity }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600/80 backdrop-blur-sm">
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SwipeHint
 *
 * Shows a hint for first-time users about swipe navigation.
 */
export interface SwipeHintProps {
  visible: boolean;
  onDismiss: () => void;
}

export function SwipeHint({ visible, onDismiss }: SwipeHintProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-800/90 backdrop-blur-sm rounded-full text-sm text-neutral-300 flex items-center gap-2 animate-pulse"
      onClick={onDismiss}
    >
      <ChevronLeft className="w-4 h-4" />
      <span>Свайпните для навигации</span>
      <ChevronRight className="w-4 h-4" />
    </div>
  );
}

export default SwipeIndicators;
