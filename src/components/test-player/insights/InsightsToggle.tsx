'use client';

import React, { useEffect, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTestDriveStore } from '@/store/test-drive-store';
import { cn } from '@/lib/utils';

/**
 * InsightsToggle - Floating button to toggle the test-drive insights panel
 *
 * Features:
 * - Positioned at bottom-right corner
 * - Amber glow effect to distinguish from normal mode
 * - Keyboard shortcut (Alt+I) to toggle
 * - Tooltip with shortcut hint
 * - Accessible with proper ARIA attributes
 */
export function InsightsToggle() {
  const isTestDriveMode = useTestDriveStore((state) => state.isTestDriveMode);
  const isPanelOpen = useTestDriveStore((state) => state.isPanelOpen);
  const togglePanel = useTestDriveStore((state) => state.togglePanel);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Alt+I to toggle panel
      if (e.altKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        togglePanel();
      }
    },
    [togglePanel]
  );

  // Register keyboard shortcut
  useEffect(() => {
    if (isTestDriveMode) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isTestDriveMode, handleKeyDown]);

  // Don't render if not in test-drive mode
  if (!isTestDriveMode) {
    return null;
  }

  return (
    <div className={cn(
      'fixed z-50',
      // Mobile: position above navigation with safe area handling
      'bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-4',
      // Desktop: higher position
      'sm:bottom-24 sm:right-6'
    )}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={togglePanel}
            size="lg"
            className={cn(
              'rounded-full shadow-lg transition-all duration-300',
              // Smaller on mobile, larger on desktop
              'h-12 w-12 sm:h-14 sm:w-14',
              'bg-amber-500 hover:bg-amber-600 text-white',
              'border-2 border-amber-400/50',
              // Glow effect
              'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
              'hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]',
              // Active state when panel is open
              isPanelOpen && 'ring-2 ring-amber-300 ring-offset-2 ring-offset-neutral-950',
              // Pulse animation when panel is closed
              !isPanelOpen && 'animate-pulse'
            )}
            aria-label={isPanelOpen ? 'Close insights panel' : 'Open insights panel'}
            aria-expanded={isPanelOpen}
            aria-controls="test-drive-insights-panel"
          >
            <Eye className={cn(
              'h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200',
              isPanelOpen && 'scale-110'
            )} />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="bg-neutral-900 border-amber-500/50 text-white hidden sm:block"
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium">
              {isPanelOpen ? 'Скрыть панель анализа' : 'Открыть панель анализа'}
            </span>
            <span className="text-xs text-neutral-400">
              Сочетание клавиш: Alt+I
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
