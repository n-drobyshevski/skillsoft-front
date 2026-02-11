'use client';

import * as React from 'react';
import { HelpCircle, Info, Lightbulb } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type HelpVariant = 'help' | 'info' | 'tip';

interface HelpTooltipProps {
  /** The help text content */
  content: React.ReactNode;
  /** Visual variant of the icon */
  variant?: HelpVariant;
  /** Size of the icon */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className for the trigger */
  className?: string;
  /** Side of the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the tooltip */
  align?: 'start' | 'center' | 'end';
  /** Whether to show as inline (next to label) */
  inline?: boolean;
  /** Max width of tooltip content */
  maxWidth?: number;
}

const iconMap = {
  help: HelpCircle,
  info: Info,
  tip: Lightbulb,
};

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

const colorMap = {
  help: 'text-muted-foreground hover:text-foreground',
  info: 'text-blue-500/70 hover:text-blue-500',
  tip: 'text-amber-500/70 hover:text-amber-500',
};

/**
 * Contextual help tooltip for form fields and UI elements
 */
export function HelpTooltip({
  content,
  variant = 'help',
  size = 'sm',
  className,
  side = 'top',
  align = 'center',
  inline = true,
  maxWidth = 280,
}: HelpTooltipProps) {
  const Icon = iconMap[variant];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className={cn(
            'transition-colors cursor-help focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm',
            colorMap[variant],
            inline && 'inline-flex items-center ml-1',
            className
          )}
          onClick={(e) => e.preventDefault()}
        >
          <Icon className={sizeMap[size]} />
          <span className="sr-only">Help</span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="text-xs leading-relaxed"
          style={{ maxWidth }}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Field help wrapper that combines label with tooltip
 */
interface FieldHelpProps {
  label: string;
  help: string;
  required?: boolean;
  variant?: HelpVariant;
  className?: string;
}

export function FieldLabel({
  label,
  help,
  required = false,
  variant = 'help',
  className,
}: FieldHelpProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
      <HelpTooltip content={help} variant={variant} />
    </span>
  );
}

// Common help texts for reuse across forms
export const formHelp = {
  competency: {
    name: 'A clear, concise name that describes the competency. Use action-oriented language (e.g., "Strategic Decision Making").',
    description: 'Detailed explanation of what this competency measures and its importance. Include observable behaviors and outcomes.',
    category: 'Group competencies by domain to organize your competency framework. Categories help filter and search.',
    level: 'The expected proficiency level: Novice → Proficient → Advanced → Expert. This helps set appropriate expectations.',
    isActive: 'Active competencies are visible in assessments. Inactive ones are hidden but preserved for historical data.',
    approvalStatus: 'Track the review lifecycle: Draft → Pending Review → Approved. Only approved competencies can be used in official assessments.',
  },
  indicator: {
    title: 'A specific, observable behavior that demonstrates this competency. Be concrete and measurable.',
    description: 'Additional context about what this indicator measures and how to identify it in practice.',
    weight: 'Relative importance (0-1) of this indicator. All weights for a competency should sum to 1.0.',
    observabilityLevel: 'How easily this behavior can be observed in typical work situations.',
    measurementType: 'The method used to assess this indicator (e.g., self-assessment, peer review, manager evaluation).',
    examples: 'Concrete examples of behaviors that demonstrate this indicator. These guide assessors.',
    counterExamples: 'Behaviors that indicate lack of this competency. Helps avoid common misconceptions.',
  },
  question: {
    questionText: 'The question presented to respondents. Be clear, specific, and avoid double-barreled questions.',
    questionType: 'How respondents will answer: Multiple Choice (one answer), Multi-Select (many answers), Scale (rating), or Open-ended.',
    answerOptions: 'Possible responses with their point values. For scales, define the anchors clearly.',
    difficultyLevel: 'Foundational → Intermediate → Advanced → Specialized. Affects scoring and test composition.',
    scoringRubric: 'Guidelines for scoring responses, especially for open-ended questions.',
    timeLimit: 'Optional time limit in seconds. Leave empty for untimed questions.',
  },
} as const;

export default HelpTooltip;
