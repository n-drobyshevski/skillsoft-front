'use client';

import * as React from 'react';
import { HelpCircle, Info, BookOpen } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { usePsychometricHelp } from './usePsychometricHelp';

type HelpVariant = 'help' | 'info' | 'learn';

interface HelpTooltipProps {
  /** The help text content - can be string or ReactNode for complex content */
  children: React.ReactNode;
  /** Visual variant of the icon */
  variant?: HelpVariant;
  /** Size of the icon */
  size?: 'xs' | 'sm' | 'md';
  /** Side of the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Additional className for the trigger */
  className?: string;
  /** Whether to show as inline (next to text) */
  inline?: boolean;
  /** Optional title for the tooltip */
  title?: string;
}

const iconMap = {
  help: HelpCircle,
  info: Info,
  learn: BookOpen,
};

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

const colorMap = {
  help: 'text-muted-foreground/70 hover:text-muted-foreground',
  info: 'text-blue-500/70 hover:text-blue-500',
  learn: 'text-amber-500/70 hover:text-amber-500',
};

/**
 * HelpTooltip - Help icon with tooltip for explaining technical psychometric terms
 */
export function HelpTooltip({
  children,
  variant = 'help',
  size = 'sm',
  side = 'top',
  className,
  inline = true,
  title,
}: HelpTooltipProps) {
  const Icon = iconMap[variant];
  const t = useTranslations('psychometrics.help');

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          'transition-colors cursor-help focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm',
          colorMap[variant],
          inline && 'inline-flex items-center align-middle ml-0.5',
          className
        )}
        onClick={(e) => e.preventDefault()}
      >
        <Icon className={sizeMap[size]} />
        <span className="sr-only">{t('screenReaderLabel')}</span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-xs text-xs leading-relaxed"
      >
        {title && (
          <p className="font-semibold mb-1">{title}</p>
        )}
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * LabelWithHelp - Combines a label with an inline help tooltip
 */
interface LabelWithHelpProps {
  label: string;
  help: React.ReactNode;
  helpTitle?: string;
  variant?: HelpVariant;
  className?: string;
  labelClassName?: string;
}

export function LabelWithHelp({
  label,
  help,
  helpTitle,
  variant = 'help',
  className,
  labelClassName,
}: LabelWithHelpProps) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <span className={labelClassName}>{label}</span>
      <HelpTooltip variant={variant} title={helpTitle}>
        {help}
      </HelpTooltip>
    </span>
  );
}

// NOTE: Old hardcoded psychometricHelp object removed - all content now comes from usePsychometricHelp hook
// which provides i18n-translated content via next-intl

/**
 * Pre-built help tooltips for common psychometric terms
 * These components use the usePsychometricHelp hook for i18n support
 *
 * MIGRATION NOTE: Old hardcoded psychometricHelp object was removed.
 * All content now comes from usePsychometricHelp hook via next-intl.
 */
export function DifficultyHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return (
    <HelpTooltip className={className} title={help.difficulty.title}>
      {help.difficulty.content}
    </HelpTooltip>
  );
}

export function DiscriminationHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return (
    <HelpTooltip className={className} title={help.discrimination.title}>
      {help.discrimination.content}
    </HelpTooltip>
  );
}

export function CronbachAlphaHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return (
    <HelpTooltip className={className} title={help.cronbachAlpha.title}>
      {help.cronbachAlpha.content}
    </HelpTooltip>
  );
}

export function ValidityStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return (
    <HelpTooltip className={className} title={help.validityStatus.title}>
      {help.validityStatus.content}
    </HelpTooltip>
  );
}

export function ResponseCountHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return (
    <HelpTooltip className={className} title={help.responseCount.title}>
      {help.responseCount.content}
    </HelpTooltip>
  );
}

export function BigFiveHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return (
    <HelpTooltip className={className} title={help.bigFive.title}>
      {help.bigFive.content}
    </HelpTooltip>
  );
}

export function AverageDiscriminationHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.averageDiscrimination.title}>{help.averageDiscrimination.content}</HelpTooltip>;
}

export function AverageAlphaHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.averageAlpha.title}>{help.averageAlpha.content}</HelpTooltip>;
}

export function ActiveItemsHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.activeItemsPercent.title}>{help.activeItemsPercent.content}</HelpTooltip>;
}

export function ReliableCompetenciesHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.reliableCompetenciesPercent.title}>{help.reliableCompetenciesPercent.content}</HelpTooltip>;
}

export function FlaggedItemsHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.flaggedItems.title}>{help.flaggedItems.content}</HelpTooltip>;
}

// Section Headers
export function ItemStatusSectionHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.itemStatusSection.title}>{help.itemStatusSection.content}</HelpTooltip>;
}

export function CompetencyReliabilitySectionHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.competencyReliabilitySection.title}>{help.competencyReliabilitySection.content}</HelpTooltip>;
}

export function BigFiveReliabilitySectionHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.bigFiveReliabilitySection.title}>{help.bigFiveReliabilitySection.content}</HelpTooltip>;
}

// Item Status Helpers
export function ActiveStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.activeStatus.title}>{help.activeStatus.content}</HelpTooltip>;
}

export function ProbationStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.probationStatus.title}>{help.probationStatus.content}</HelpTooltip>;
}

export function FlaggedForReviewStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.flaggedForReviewStatus.title}>{help.flaggedForReviewStatus.content}</HelpTooltip>;
}

export function RetiredStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.retiredStatus.title}>{help.retiredStatus.content}</HelpTooltip>;
}

// Competency Reliability Helpers
export function ReliableCompetencyStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.reliableCompetencyStatus.title}>{help.reliableCompetencyStatus.content}</HelpTooltip>;
}

export function AcceptableCompetencyStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.acceptableCompetencyStatus.title}>{help.acceptableCompetencyStatus.content}</HelpTooltip>;
}

export function UnreliableCompetencyStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.unreliableCompetencyStatus.title}>{help.unreliableCompetencyStatus.content}</HelpTooltip>;
}

export function InsufficientDataCompetencyHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.insufficientDataCompetency.title}>{help.insufficientDataCompetency.content}</HelpTooltip>;
}

// Big Five Reliability Status Helpers
export function ReliableTraitStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.reliableTraitStatus.title}>{help.reliableTraitStatus.content}</HelpTooltip>;
}

export function AcceptableTraitStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.acceptableTraitStatus.title}>{help.acceptableTraitStatus.content}</HelpTooltip>;
}

export function UnreliableTraitStatusHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.unreliableTraitStatus.title}>{help.unreliableTraitStatus.content}</HelpTooltip>;
}

export function InsufficientDataTraitHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.insufficientDataTrait.title}>{help.insufficientDataTrait.content}</HelpTooltip>;
}

// Big Five Trait Helpers
export function TraitOpennessHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.traitOpenness.title} variant="learn">{help.traitOpenness.content}</HelpTooltip>;
}

export function TraitConscientiousnessHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.traitConscientiousness.title} variant="learn">{help.traitConscientiousness.content}</HelpTooltip>;
}

export function TraitExtraversionHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.traitExtraversion.title} variant="learn">{help.traitExtraversion.content}</HelpTooltip>;
}

export function TraitAgreeablenessHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.traitAgreeableness.title} variant="learn">{help.traitAgreeableness.content}</HelpTooltip>;
}

export function TraitEmotionalStabilityHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.traitEmotionalStability.title} variant="learn">{help.traitEmotionalStability.content}</HelpTooltip>;
}

// Average Big Five Alpha
export function AverageBigFiveAlphaHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.averageBigFiveAlpha.title}>{help.averageBigFiveAlpha.content}</HelpTooltip>;
}

// ============================================================================
// Dashboard Hero Helpers
// ============================================================================

export function HealthScoreHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.healthScore.title}>{help.healthScore.content}</HelpTooltip>;
}

export function HealthScoreBreakdownHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.healthScoreBreakdown.title} variant="info">{help.healthScoreBreakdown.content}</HelpTooltip>;
}

export function ActiveItemsWeightHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.activeItemsWeight.title}>{help.activeItemsWeight.content}</HelpTooltip>;
}

export function ReliableCompetenciesWeightHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.reliableCompetenciesWeight.title}>{help.reliableCompetenciesWeight.content}</HelpTooltip>;
}

export function NonFlaggedItemsWeightHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.nonFlaggedItemsWeight.title}>{help.nonFlaggedItemsWeight.content}</HelpTooltip>;
}

export function HeroTotalItemsHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.heroTotalItems.title}>{help.heroTotalItems.content}</HelpTooltip>;
}

export function HeroActiveRateHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.heroActiveRate.title}>{help.heroActiveRate.content}</HelpTooltip>;
}

export function HeroIssuesHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.heroIssues.title}>{help.heroIssues.content}</HelpTooltip>;
}

// ============================================================================
// Item Quality Scatter Chart Helpers
// ============================================================================

export function ItemQualityMapHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.itemQualityMap.title} variant="info">{help.itemQualityMap.content}</HelpTooltip>;
}

export function ZoneOptimalHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.zoneOptimal.title}>{help.zoneOptimal.content}</HelpTooltip>;
}

export function ZoneTooEasyHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.zoneTooEasy.title}>{help.zoneTooEasy.content}</HelpTooltip>;
}

export function ZoneTooHardHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.zoneTooHard.title}>{help.zoneTooHard.content}</HelpTooltip>;
}

export function ZoneToxicHelp({ className }: { className?: string }) {
  const help = usePsychometricHelp();
  return <HelpTooltip className={className} title={help.zoneToxic.title}>{help.zoneToxic.content}</HelpTooltip>;
}

/**
 * Table header with help tooltip (uses i18n hook)
 */
interface TableHeaderWithHelpProps {
  label: string;
  helpKey: keyof ReturnType<typeof usePsychometricHelp>;
  className?: string;
}

export function TableHeaderWithHelp({
  label,
  helpKey,
  className,
}: TableHeaderWithHelpProps) {
  const help = usePsychometricHelp();
  const item = help[helpKey];

  return (
    <LabelWithHelp
      label={label}
      help={item.content}
      helpTitle={item.title}
      className={className}
    />
  );
}

export default HelpTooltip;
