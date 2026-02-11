'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { UiLink } from '@/components/ui/ui-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  PsychometricHealthReport,
  FlaggedItemSummary,
  DiscriminationFlag,
  DifficultyFlag,
} from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

// Severity levels
type Severity = 'critical' | 'high' | 'medium' | 'info';

interface Insight {
  id: string;
  severity: Severity;
  title: string;
  message: string;
  explanation: string;
  actions: string[];
  link?: string;
  linkText?: string;
  count?: number;
}

// Severity configuration
const severityConfig: Record<Severity, {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
}> = {
  critical: {
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-900',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  high: {
    icon: AlertTriangle,
    iconColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-900',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  medium: {
    icon: AlertCircle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-900',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-900',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
};

// Generate insights from report data using translations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslateFunction = (key: string, values?: Record<string, any>) => string;

function generateInsights(
  report: PsychometricHealthReport,
  flaggedItems: FlaggedItemSummary[],
  t: TranslateFunction
): Insight[] {
  const insights: Insight[] = [];

  // Critical: Negative discrimination items
  const negativeItems = flaggedItems.filter(
    item => item.discriminationFlag === DiscriminationFlag.NEGATIVE
  );
  if (negativeItems.length > 0) {
    insights.push({
      id: 'negative-discrimination',
      severity: 'critical',
      title: t('negativeDiscrimination.title'),
      message: t('negativeDiscrimination.message', { count: negativeItems.length }),
      explanation: t('negativeDiscrimination.explanation'),
      actions: [
        t('negativeDiscrimination.action1'),
        t('negativeDiscrimination.action2'),
        t('negativeDiscrimination.action3'),
      ],
      link: '/psychometrics/flagged',
      linkText: t('negativeDiscrimination.linkText'),
      count: negativeItems.length,
    });
  }

  // High: Too easy questions
  const tooEasyItems = flaggedItems.filter(
    item => item.difficultyFlag === DifficultyFlag.TOO_EASY
  );
  if (tooEasyItems.length > 0) {
    insights.push({
      id: 'too-easy',
      severity: 'high',
      title: t('tooEasy.title'),
      message: t('tooEasy.message', { count: tooEasyItems.length }),
      explanation: t('tooEasy.explanation'),
      actions: [
        t('tooEasy.action1'),
        t('tooEasy.action2'),
        t('tooEasy.action3'),
      ],
      link: '/psychometrics/items?difficulty=TOO_EASY',
      linkText: t('tooEasy.linkText'),
      count: tooEasyItems.length,
    });
  }

  // High: Too hard questions
  const tooHardItems = flaggedItems.filter(
    item => item.difficultyFlag === DifficultyFlag.TOO_HARD
  );
  if (tooHardItems.length > 0) {
    insights.push({
      id: 'too-hard',
      severity: 'high',
      title: t('tooHard.title'),
      message: t('tooHard.message', { count: tooHardItems.length }),
      explanation: t('tooHard.explanation'),
      actions: [
        t('tooHard.action1'),
        t('tooHard.action2'),
        t('tooHard.action3'),
      ],
      link: '/psychometrics/items?difficulty=TOO_HARD',
      linkText: t('tooHard.linkText'),
      count: tooHardItems.length,
    });
  }

  // Medium: Low reliability competencies
  if (report.unreliableCompetencies > 0) {
    insights.push({
      id: 'unreliable-competencies',
      severity: 'medium',
      title: t('unreliableCompetencies.title'),
      message: t('unreliableCompetencies.message', { count: report.unreliableCompetencies }),
      explanation: t('unreliableCompetencies.explanation'),
      actions: [
        t('unreliableCompetencies.action1'),
        t('unreliableCompetencies.action2'),
        t('unreliableCompetencies.action3'),
      ],
      link: '/psychometrics/competencies?status=UNRELIABLE',
      linkText: t('unreliableCompetencies.linkText'),
      count: report.unreliableCompetencies,
    });
  }

  // Medium: Items on probation
  if (report.probationItems > 10) {
    insights.push({
      id: 'probation-items',
      severity: 'medium',
      title: t('probationItems.title'),
      message: t('probationItems.message', { count: report.probationItems }),
      explanation: t('probationItems.explanation'),
      actions: [
        t('probationItems.action1'),
        t('probationItems.action2'),
        t('probationItems.action3'),
      ],
      link: '/psychometrics/items?status=PROBATION',
      linkText: t('probationItems.linkText'),
      count: report.probationItems,
    });
  }

  // Info: Good reliability
  if (report.reliableCompetencies > 0 && report.unreliableCompetencies === 0) {
    insights.push({
      id: 'all-reliable',
      severity: 'info',
      title: t('allReliable.title'),
      message: t('allReliable.message', { count: report.reliableCompetencies + report.acceptableCompetencies }),
      explanation: t('allReliable.explanation'),
      actions: [
        t('allReliable.action1'),
        t('allReliable.action2'),
      ],
      link: '/psychometrics/competencies',
      linkText: t('allReliable.linkText'),
    });
  }

  // Sort by severity
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    info: 3,
  };

  return insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

interface ActionableInsightCardProps {
  insight: Insight;
  className?: string;
  compact?: boolean;
  /** Translation labels for UI elements */
  labels?: {
    suggestedActions: string;
    viewDetails: string;
  };
}

export function ActionableInsightCard({
  insight,
  className,
  compact = false,
  labels,
}: ActionableInsightCardProps) {
  const t = useTranslations('psychometrics.insights');
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  const suggestedActionsLabel = labels?.suggestedActions ?? t('suggestedActions');
  const viewDetailsLabel = labels?.viewDetails ?? t('viewDetails');

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-3 rounded-lg border',
          config.bgColor,
          config.borderColor,
          className
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{insight.title}</p>
            {insight.count !== undefined && (
              <Badge variant="secondary" className={cn('text-xs', config.badgeColor)}>
                {insight.count}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {insight.message}
          </p>
          {insight.link && (
            <UiLink
              href={insight.link}
              variant="underline"
              size="sm"
              trailingIcon={<ChevronRight className="h-3 w-3" />}
              className="mt-1"
            >
              {insight.linkText || viewDetailsLabel}
            </UiLink>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(config.bgColor, config.borderColor, className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconColor)} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">{insight.title}</CardTitle>
              {insight.count !== undefined && (
                <Badge variant="secondary" className={config.badgeColor}>
                  {insight.count}
                </Badge>
              )}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 min-h-[44px] min-w-[44px] -mr-2 -mt-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-sm">{insight.explanation}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{insight.message}</p>

        {/* Suggested actions */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            {suggestedActionsLabel}
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-5">
            {insight.actions.map((action, index) => (
              <li key={index} className="list-disc">
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* Action link */}
        {insight.link && (
          <Link href={insight.link}>
            <Button variant="outline" size="sm" className="w-full mt-2 min-h-[44px]">
              {insight.linkText || viewDetailsLabel}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

// Container component that generates and displays insights
interface ActionableInsightsListProps {
  report: PsychometricHealthReport;
  maxInsights?: number;
  compact?: boolean;
  className?: string;
}

export function ActionableInsightsList({
  report,
  maxInsights = 5,
  compact = false,
  className,
}: ActionableInsightsListProps) {
  const t = useTranslations('psychometrics.insights');

  const insights = useMemo(
    () => generateInsights(report, report.topFlaggedItems, t).slice(0, maxInsights),
    [report, maxInsights, t]
  );

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{t('noInsights.title')}</p>
            <p className="text-sm">{t('noInsights.description')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {insights.map(insight => (
        <ActionableInsightCard
          key={insight.id}
          insight={insight}
          compact={compact}
        />
      ))}
    </div>
  );
}

// Single insight card for specific conditions
interface SingleInsightProps {
  type: 'negative-rpb' | 'too-easy' | 'too-hard' | 'low-alpha' | 'custom';
  value?: number;
  customInsight?: Insight;
  className?: string;
}

export function SingleInsightCard({ type, value, customInsight, className }: SingleInsightProps) {
  const t = useTranslations('psychometrics.insights.singleInsight');

  const insight = useMemo((): Insight | null => {
    if (customInsight) return customInsight;

    const formattedValue = value?.toFixed(2) ?? 'N/A';

    switch (type) {
      case 'negative-rpb':
        return {
          id: 'negative-rpb',
          severity: 'critical',
          title: t('negativeRpb.title'),
          message: t('negativeRpb.message', { value: formattedValue }),
          explanation: t('negativeRpb.explanation'),
          actions: [
            t('negativeRpb.action1'),
            t('negativeRpb.action2'),
            t('negativeRpb.action3'),
          ],
        };
      case 'too-easy':
        return {
          id: 'too-easy',
          severity: 'high',
          title: t('tooEasy.title'),
          message: t('tooEasy.message', { value: formattedValue }),
          explanation: t('tooEasy.explanation'),
          actions: [
            t('tooEasy.action1'),
            t('tooEasy.action2'),
          ],
        };
      case 'too-hard':
        return {
          id: 'too-hard',
          severity: 'high',
          title: t('tooHard.title'),
          message: t('tooHard.message', { value: formattedValue }),
          explanation: t('tooHard.explanation'),
          actions: [
            t('tooHard.action1'),
            t('tooHard.action2'),
          ],
        };
      case 'low-alpha':
        return {
          id: 'low-alpha',
          severity: 'medium',
          title: t('lowAlpha.title'),
          message: t('lowAlpha.message', { value: formattedValue }),
          explanation: t('lowAlpha.explanation'),
          actions: [
            t('lowAlpha.action1'),
            t('lowAlpha.action2'),
            t('lowAlpha.action3'),
          ],
        };
      default:
        return null;
    }
  }, [type, value, customInsight, t]);

  if (!insight) return null;

  return <ActionableInsightCard insight={insight} className={className} />;
}
