'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle, HelpCircle, Lightbulb } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================================
// Types
// ============================================================================

export type QuestionType = 'LIKERT' | 'SJT' | 'MCQ' | 'OPEN_ENDED' | 'RANKING' | 'GENERAL';
export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

interface ValidationFeedbackProps {
  /** The validation error message */
  message: string;
  /** Type of question for contextual guidance */
  questionType?: QuestionType;
  /** Severity level */
  severity?: ValidationSeverity;
  /** Custom guidance text (overrides auto-generated) */
  guidance?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the help tooltip */
  showHelp?: boolean;
  /** Compact mode for tight spaces */
  compact?: boolean;
}

// ============================================================================
// Guidance Generation
// ============================================================================

/**
 * Generate contextual guidance based on question type and error
 */
function getQuestionTypeGuidance(questionType: QuestionType, message: string): string {
  // Detect common validation patterns
  const isLengthError = message.toLowerCase().includes('символ') ||
                        message.toLowerCase().includes('character') ||
                        message.toLowerCase().includes('length');
  const isRequiredError = message.toLowerCase().includes('required') ||
                          message.toLowerCase().includes('обязательно');
  const isSelectionError = message.toLowerCase().includes('select') ||
                           message.toLowerCase().includes('выберите');

  switch (questionType) {
    case 'LIKERT':
      if (isRequiredError || isSelectionError) {
        return 'Choose the option that best reflects your typical behavior or attitude. There are no right or wrong answers.';
      }
      return 'Likert scales measure agreement or frequency. Select the point that best matches your response.';

    case 'SJT':
      if (isSelectionError) {
        return 'Rank the response options from most to least effective. Consider how you would actually behave in this situation.';
      }
      return 'Situational judgment tests assess your decision-making. Think about what action would be most appropriate.';

    case 'MCQ':
      if (isRequiredError) {
        return 'Select the answer you believe is correct. Only one option can be chosen.';
      }
      return 'Multiple choice questions have one correct answer. Read all options before selecting.';

    case 'OPEN_ENDED':
      if (isLengthError) {
        return 'Provide a detailed response. Include specific examples from your experience to support your answer.';
      }
      if (isRequiredError) {
        return 'This question requires a written response. Take time to articulate your thoughts clearly.';
      }
      return 'Open-ended questions allow you to express yourself freely. Be specific and provide examples.';

    case 'RANKING':
      return 'Drag items to reorder them from highest to lowest priority. Each position matters.';

    default:
      return 'Please review your response and ensure it meets the requirements shown.';
  }
}

/**
 * Get icon and colors for severity level
 */
function getSeverityConfig(severity: ValidationSeverity) {
  switch (severity) {
    case 'error':
      return {
        Icon: AlertTriangle,
        containerClass: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
        iconClass: 'text-red-600 dark:text-red-400',
        textClass: 'text-red-800 dark:text-red-200',
        guidanceClass: 'text-red-700 dark:text-red-300',
      };
    case 'warning':
      return {
        Icon: AlertTriangle,
        containerClass: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
        iconClass: 'text-amber-600 dark:text-amber-400',
        textClass: 'text-amber-800 dark:text-amber-200',
        guidanceClass: 'text-amber-700 dark:text-amber-300',
      };
    case 'info':
      return {
        Icon: Info,
        containerClass: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
        iconClass: 'text-blue-600 dark:text-blue-400',
        textClass: 'text-blue-800 dark:text-blue-200',
        guidanceClass: 'text-blue-700 dark:text-blue-300',
      };
    case 'success':
      return {
        Icon: CheckCircle,
        containerClass: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
        iconClass: 'text-emerald-600 dark:text-emerald-400',
        textClass: 'text-emerald-800 dark:text-emerald-200',
        guidanceClass: 'text-emerald-700 dark:text-emerald-300',
      };
  }
}

// ============================================================================
// Component
// ============================================================================

/**
 * ValidationFeedback - Inline validation with contextual guidance
 *
 * Features:
 * - Severity-based styling (error, warning, info, success)
 * - Question-type-specific guidance
 * - Compact mode for tight spaces
 * - Accessible with ARIA live region
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ValidationFeedback
 *   message="Please select an option"
 *   questionType="LIKERT"
 * />
 *
 * // With custom guidance
 * <ValidationFeedback
 *   message="Response too short"
 *   questionType="OPEN_ENDED"
 *   guidance="Your response should include at least 100 characters."
 * />
 *
 * // Compact for inline use
 * <ValidationFeedback
 *   message="Required field"
 *   compact
 * />
 * ```
 */
export function ValidationFeedback({
  message,
  questionType = 'GENERAL',
  severity = 'error',
  guidance,
  className,
  showHelp = true,
  compact = false,
}: ValidationFeedbackProps) {
  const config = getSeverityConfig(severity);
  const autoGuidance = getQuestionTypeGuidance(questionType, message);
  const displayGuidance = guidance ?? autoGuidance;

  // Compact mode - just icon and message
  if (compact) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={cn(
          'flex items-center gap-2 text-sm',
          config.textClass,
          className
        )}
      >
        <config.Icon className={cn('h-4 w-4 shrink-0', config.iconClass)} />
        <span>{message}</span>
        {showHelp && displayGuidance && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Show guidance"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-sm">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <p>{displayGuidance}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // Full mode - card with guidance
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        config.containerClass,
        className
      )}
    >
      <config.Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconClass)} />
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className={cn('font-medium text-sm', config.textClass)}>
          {message}
        </p>
        {displayGuidance && (
          <div className={cn(
            'flex items-start gap-2 text-xs',
            config.guidanceClass
          )}>
            <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
            <p>{displayGuidance}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ValidationSuccess - Positive feedback for valid input
 */
export function ValidationSuccess({
  message = 'Looks good!',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400',
        className
      )}
    >
      <CheckCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * FieldError - Simple inline error for form fields
 * Works well with react-hook-form's FormMessage pattern
 */
export function FieldError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={cn(
        'text-sm font-medium text-destructive flex items-center gap-1.5 mt-1',
        className
      )}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

export default ValidationFeedback;
