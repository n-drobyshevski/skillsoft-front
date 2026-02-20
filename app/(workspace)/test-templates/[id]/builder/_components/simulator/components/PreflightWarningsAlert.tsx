'use client';

/**
 * PreflightWarningsAlert
 *
 * Displays preflight validation warnings in a visible, inline format
 * instead of hiding them in a tooltip. This improves UX by making
 * configuration issues immediately apparent.
 */

import React, { memo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AlertTriangle, ChevronDown, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PreflightValidationResult, PreflightWarning } from '../hooks/usePreflightValidation';

// ============================================
// TYPES
// ============================================

interface PreflightWarningsAlertProps {
  /** Preflight validation result */
  validation: PreflightValidationResult;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Optional class name */
  className?: string;
}

// ============================================
// HELPER COMPONENTS
// ============================================

interface WarningItemProps {
  warning: PreflightWarning;
}

const WarningItem = memo(function WarningItem({ warning }: WarningItemProps) {
  const Icon = warning.type === 'error' ? XCircle : warning.type === 'warning' ? AlertTriangle : Info;
  const colorClass =
    warning.type === 'error'
      ? 'text-destructive'
      : warning.type === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-blue-600 dark:text-blue-400';

  return (
    <li className="flex items-start gap-2 text-xs">
      <Icon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', colorClass)} aria-hidden="true" />
      <span className="text-muted-foreground">{warning.message}</span>
    </li>
  );
});

// ============================================
// COMPACT ALERT (Single line with expand)
// ============================================

interface CompactAlertProps {
  validation: PreflightValidationResult;
  className?: string;
}

function CompactAlert({ validation, className }: CompactAlertProps) {
  const t = useTranslations('builder.simulator');
  const [isExpanded, setIsExpanded] = useState(false);
  const allIssues = [...validation.errors, ...validation.warnings];
  const hasErrors = validation.hasErrors;

  if (allIssues.length === 0) return null;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Alert
        variant={hasErrors ? 'destructive' : 'default'}
        className={cn(
          'py-2',
          !hasErrors && 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20',
          className
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full text-left"
            aria-expanded={isExpanded}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={cn(
                  'h-4 w-4',
                  hasErrors ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'
                )}
              />
              <span className="text-xs font-medium">
                {t('preflight.issuesDetected', { count: allIssues.length })}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-2 space-y-1.5 pl-6">
            {allIssues.map((issue) => (
              <WarningItem key={issue.id} warning={issue} />
            ))}
          </ul>
        </CollapsibleContent>
      </Alert>
    </Collapsible>
  );
}

// ============================================
// FULL ALERT (All warnings visible)
// ============================================

interface FullAlertProps {
  validation: PreflightValidationResult;
  className?: string;
}

function FullAlert({ validation, className }: FullAlertProps) {
  const t = useTranslations('builder.simulator');
  const allIssues = [...validation.errors, ...validation.warnings];
  const hasErrors = validation.hasErrors;

  if (allIssues.length === 0) return null;

  return (
    <Alert
      variant={hasErrors ? 'destructive' : 'default'}
      className={cn(
        !hasErrors && 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20',
        className
      )}
    >
      <AlertTriangle
        className={cn(
          'h-4 w-4',
          hasErrors ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'
        )}
      />
      <AlertTitle className="text-sm">
        {hasErrors ? t('preflight.configurationRequired') : t('preflight.preflightWarnings')}
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1.5">
          {allIssues.map((issue) => (
            <WarningItem key={issue.id} warning={issue} />
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export const PreflightWarningsAlert = memo(function PreflightWarningsAlert({
  validation,
  compact = false,
  className,
}: PreflightWarningsAlertProps) {
  // Don't render if no issues
  if (!validation.hasWarnings && !validation.hasErrors) {
    return null;
  }

  if (compact) {
    return <CompactAlert validation={validation} className={className} />;
  }

  return <FullAlert validation={validation} className={className} />;
});

export default PreflightWarningsAlert;
