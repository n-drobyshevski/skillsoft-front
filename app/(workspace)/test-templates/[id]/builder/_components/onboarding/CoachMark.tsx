'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourStep } from '@/hooks/useOnboardingTour';

/**
 * Coach Mark Component - Phase 5.1
 *
 * Renders a spotlight overlay with tooltip for onboarding tours.
 * Highlights a target element and shows contextual information.
 */

interface CoachMarkProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function CoachMark({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}: CoachMarkProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Find and measure target element
  useEffect(() => {
    const findTarget = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      } else {
        // If target not found, center the tooltip
        setTargetRect(null);
      }
    };

    // Delay to allow for any animations
    const delay = step.delay ?? 100;
    const timer = setTimeout(() => {
      findTarget();
      setIsVisible(true);
    }, delay);

    // Update on resize
    window.addEventListener('resize', findTarget);
    window.addEventListener('scroll', findTarget);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', findTarget);
      window.removeEventListener('scroll', findTarget);
    };
  }, [step]);

  // Calculate tooltip position
  const getTooltipPosition = (): React.CSSProperties => {
    if (!targetRect) {
      // Center on screen
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Approximate

    const placement = step.placement ?? 'bottom';

    switch (placement) {
      case 'top':
        return {
          position: 'absolute',
          top: targetRect.top - tooltipHeight - padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
      case 'bottom':
        return {
          position: 'absolute',
          top: targetRect.top + targetRect.height + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
      case 'left':
        return {
          position: 'absolute',
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.left - tooltipWidth - padding,
        };
      case 'right':
        return {
          position: 'absolute',
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.left + targetRect.width + padding,
        };
      case 'center':
      default:
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const isLastStep = stepIndex === totalSteps - 1;
  const isFirstStep = stepIndex === 0;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  if (!isVisible) {
    return null;
  }

  const content = (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onSkip}
        aria-hidden="true"
      />

      {/* Spotlight cutout (if target found and spotlight enabled) */}
      {targetRect && step.spotlight !== false && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
          }}
        >
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse" />
        </div>
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className={cn(
          'z-[10000] w-80 rounded-xl border bg-card shadow-2xl',
          'animate-in fade-in slide-in-from-bottom-4 duration-300'
        )}
        style={getTooltipPosition()}
        role="dialog"
        aria-labelledby="coach-mark-title"
        aria-describedby="coach-mark-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Step {stepIndex + 1} of {totalSteps}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 -mr-2"
            onClick={onSkip}
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3
            id="coach-mark-title"
            className="text-base font-semibold text-foreground"
          >
            {step.title}
          </h3>
          <p
            id="coach-mark-content"
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {step.content}
          </p>

          {/* Action button if provided */}
          {step.actionLabel && step.onAction && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                step.onAction?.();
                onNext();
              }}
            >
              {step.actionLabel}
            </Button>
          )}
        </div>

        {/* Footer with navigation */}
        <div className="p-4 pt-0 space-y-3">
          {/* Progress bar */}
          <Progress value={progress} className="h-1" />

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={isFirstStep}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              size="sm"
              onClick={isLastStep ? onComplete : onNext}
              className="gap-1"
            >
              {isLastStep ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  // Render in portal to ensure proper z-index stacking
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(content, document.body);
}
