'use client';

import { useMemo } from 'react';
import Link from 'next/link';
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

// Generate insights from report data
function generateInsights(
  report: PsychometricHealthReport,
  flaggedItems: FlaggedItemSummary[]
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
      title: 'Questions may be misleading',
      message: `${negativeItems.length} question(s) have negative discrimination, meaning wrong answers correlate with higher overall scores.`,
      explanation: 'This typically happens when questions are confusing, have incorrect answer keys, or measure something different than intended.',
      actions: [
        'Review question wording for ambiguity',
        'Verify the correct answer is properly marked',
        'Consider removing or revising these questions',
      ],
      link: '/psychometrics/flagged',
      linkText: 'Review flagged items',
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
      title: 'Questions may be too easy',
      message: `${tooEasyItems.length} question(s) have very high success rates (p > 0.9), providing little differentiation.`,
      explanation: 'When almost everyone answers correctly, the question does not help distinguish between skill levels.',
      actions: [
        'Increase complexity of the question',
        'Add more challenging answer options',
        'Consider replacing with more discriminating items',
      ],
      link: '/psychometrics/items?difficulty=TOO_EASY',
      linkText: 'View easy items',
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
      title: 'Questions may be too difficult',
      message: `${tooHardItems.length} question(s) have very low success rates (p < 0.2), which may frustrate test-takers.`,
      explanation: 'When almost no one answers correctly, the question may be beyond the expected skill level or poorly worded.',
      actions: [
        'Simplify the question wording',
        'Ensure the content matches the target audience',
        'Check if the correct answer is achievable',
      ],
      link: '/psychometrics/items?difficulty=TOO_HARD',
      linkText: 'View difficult items',
      count: tooHardItems.length,
    });
  }

  // Medium: Low reliability competencies
  if (report.unreliableCompetencies > 0) {
    insights.push({
      id: 'unreliable-competencies',
      severity: 'medium',
      title: 'Test Reliability below recommended',
      message: `${report.unreliableCompetencies} competency measurement(s) have Cronbach's Alpha below 0.6.`,
      explanation: "Test Reliability Score (Cronbach's Alpha) measures internal consistency. Low values suggest the questions may not be measuring the same underlying competency.",
      actions: [
        'Review questions for alignment with the competency',
        'Consider adding more questions to increase reliability',
        'Remove items that lower the overall reliability',
      ],
      link: '/psychometrics/competencies?status=UNRELIABLE',
      linkText: 'View unreliable competencies',
      count: report.unreliableCompetencies,
    });
  }

  // Medium: Items on probation
  if (report.probationItems > 10) {
    insights.push({
      id: 'probation-items',
      severity: 'medium',
      title: 'Many items awaiting validation',
      message: `${report.probationItems} question(s) are still gathering data (< 50 responses).`,
      explanation: 'Psychometric metrics require sufficient response data to be reliable. Consider increasing test deployment.',
      actions: [
        'Increase test deployment to gather more responses',
        'Review items after 50+ responses',
        'Consider prioritizing critical competency areas',
      ],
      link: '/psychometrics/items?status=PROBATION',
      linkText: 'View probation items',
      count: report.probationItems,
    });
  }

  // Info: Good reliability
  if (report.reliableCompetencies > 0 && report.unreliableCompetencies === 0) {
    insights.push({
      id: 'all-reliable',
      severity: 'info',
      title: 'All competencies are reliable',
      message: `All ${report.reliableCompetencies + report.acceptableCompetencies} competency measurements meet reliability standards.`,
      explanation: 'Your assessment instruments are performing well. Continue monitoring for any changes.',
      actions: [
        'Continue regular psychometric audits',
        'Monitor for any degradation over time',
      ],
      link: '/psychometrics/competencies',
      linkText: 'View all competencies',
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
}

export function ActionableInsightCard({
  insight,
  className,
  compact = false,
}: ActionableInsightCardProps) {
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

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
            <Link
              href={insight.link}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              {insight.linkText || 'View details'}
              <ChevronRight className="h-3 w-3" />
            </Link>
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
              <Button variant="ghost" size="icon" className="h-6 w-6">
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
            Suggested actions:
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
            <Button variant="outline" size="sm" className="w-full mt-2">
              {insight.linkText || 'View details'}
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
  const insights = useMemo(
    () => generateInsights(report, report.topFlaggedItems).slice(0, maxInsights),
    [report, maxInsights]
  );

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No actionable insights at this time</p>
            <p className="text-sm">Your assessment items are performing well</p>
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
  const insight = useMemo((): Insight | null => {
    if (customInsight) return customInsight;

    switch (type) {
      case 'negative-rpb':
        return {
          id: 'negative-rpb',
          severity: 'critical',
          title: 'Negative Question Effectiveness',
          message: `This question has a Question Effectiveness (rpb) of ${value?.toFixed(2) ?? 'N/A'}, indicating it may be misleading.`,
          explanation: 'Wrong answers are correlating with higher overall scores. This suggests the question is confusing or the answer key may be incorrect.',
          actions: [
            'Review the question wording',
            'Verify the correct answer is marked',
            'Consider retiring this question',
          ],
        };
      case 'too-easy':
        return {
          id: 'too-easy',
          severity: 'high',
          title: 'Very Easy Question',
          message: `This question has a difficulty (p) of ${value?.toFixed(2) ?? 'N/A'}. Almost everyone answers it correctly.`,
          explanation: 'Questions with p > 0.9 provide little value in distinguishing between skill levels.',
          actions: [
            'Increase question complexity',
            'Add more challenging distractors',
          ],
        };
      case 'too-hard':
        return {
          id: 'too-hard',
          severity: 'high',
          title: 'Very Difficult Question',
          message: `This question has a difficulty (p) of ${value?.toFixed(2) ?? 'N/A'}. Very few people answer it correctly.`,
          explanation: 'Questions with p < 0.2 may be beyond the expected skill level or poorly worded.',
          actions: [
            'Simplify the question',
            'Check if content matches target audience',
          ],
        };
      case 'low-alpha':
        return {
          id: 'low-alpha',
          severity: 'medium',
          title: 'Low Reliability Score',
          message: `This competency has a Test Reliability Score of ${value?.toFixed(2) ?? 'N/A'}, below the recommended 0.7 threshold.`,
          explanation: 'Low reliability suggests the questions may not be consistently measuring the same competency.',
          actions: [
            'Review question alignment',
            'Consider adding more questions',
            'Remove inconsistent items',
          ],
        };
      default:
        return null;
    }
  }, [type, value, customInsight]);

  if (!insight) return null;

  return <ActionableInsightCard insight={insight} className={className} />;
}
