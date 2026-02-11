'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UiLink } from '@/components/ui/ui-link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ValidityStatusBadge, SuggestedActionsCard, SimilarItemsCard } from '../../../_components';
import { MobileSeverityBanner } from './MobileSeverityBanner';
import {
  MobileMetricPill,
  DifficultyPill,
  DiscriminationPill,
  ResponseCountPill,
} from './MobileMetricPill';
import { StickyActionBar } from './StickyActionBar';
import {
  ItemStatisticsDetail,
  DiscriminationFlag,
  DifficultyFlag,
  FlaggedItemSummary,
} from '@/types/psychometrics';
import {
  ArrowLeft,
  FileText,
  Target,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  History,
  Lightbulb,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

// Severity level type
type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

// Translation function type
type TranslationFunction = ReturnType<typeof useTranslations<'psychometrics.flaggedDetail'>>;

// Get flag severity and reasons
function getFlagDetails(
  item: ItemStatisticsDetail,
  t: TranslationFunction
): {
  severity: SeverityLevel;
  reasons: string[];
} {
  const reasons: string[] = [];
  let severityLevel = 0; // 0 = low, 1 = medium, 2 = high, 3 = critical

  // Check discrimination
  if (item.discriminationFlag === DiscriminationFlag.NEGATIVE) {
    reasons.push(t('reasons.negativeDiscrimination'));
    severityLevel = 3;
  } else if (item.discriminationFlag === DiscriminationFlag.CRITICAL) {
    reasons.push(t('reasons.criticalDiscrimination'));
    severityLevel = Math.max(severityLevel, 2);
  } else if (item.discriminationFlag === DiscriminationFlag.WARNING) {
    reasons.push(t('reasons.weakDiscrimination'));
    severityLevel = Math.max(severityLevel, 1);
  }

  // Check difficulty
  if (item.difficultyFlag === DifficultyFlag.TOO_HARD) {
    reasons.push(t('reasons.tooHard'));
    severityLevel = Math.max(severityLevel, 2);
  } else if (item.difficultyFlag === DifficultyFlag.TOO_EASY) {
    reasons.push(t('reasons.tooEasy'));
    severityLevel = Math.max(severityLevel, 2);
  }

  // Check response count
  if (item.responseCount < 30) {
    reasons.push(t('reasons.insufficientResponses'));
    severityLevel = Math.max(severityLevel, 1);
  }

  // Default if no specific issues
  if (reasons.length === 0) {
    reasons.push(t('reasons.flaggedForManualReview'));
    severityLevel = Math.max(severityLevel, 1);
  }

  const severityMap: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];
  return {
    severity: severityMap[severityLevel],
    reasons,
  };
}

// Generate suggested actions
function generateSuggestedActions(
  item: ItemStatisticsDetail,
  t: TranslationFunction
) {
  const actions: Array<{
    title: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  if (item.discriminationFlag === DiscriminationFlag.NEGATIVE) {
    actions.push({
      title: t('suggestedActions.considerRemoval'),
      description: t('suggestedActions.considerRemovalDesc'),
      priority: 'high',
    });
    actions.push({
      title: t('suggestedActions.checkAnswerKey'),
      description: t('suggestedActions.checkAnswerKeyDesc'),
      priority: 'high',
    });
  } else if (item.discriminationFlag === DiscriminationFlag.CRITICAL) {
    actions.push({
      title: t('suggestedActions.reformulateQuestion'),
      description: t('suggestedActions.reformulateQuestionDesc'),
      priority: 'high',
    });
  } else if (item.discriminationFlag === DiscriminationFlag.WARNING) {
    actions.push({
      title: t('suggestedActions.monitorMetrics'),
      description: t('suggestedActions.monitorMetricsDesc'),
      priority: 'medium',
    });
  }

  if (item.difficultyFlag === DifficultyFlag.TOO_HARD) {
    actions.push({
      title: t('suggestedActions.simplifyWording'),
      priority: 'medium',
    });
  } else if (item.difficultyFlag === DifficultyFlag.TOO_EASY) {
    actions.push({
      title: t('suggestedActions.increaseComplexity'),
      priority: 'medium',
    });
  }

  if (item.responseCount < 50) {
    actions.push({
      title: t('suggestedActions.collectMoreData'),
      description: t('suggestedActions.collectMoreDataDesc', { count: item.responseCount }),
      priority: 'low',
    });
  }

  // Add backend recommendations
  if (item.recommendations?.length > 0) {
    item.recommendations.forEach((rec) => {
      if (!actions.some((a) => a.title === rec || a.description === rec)) {
        actions.push({ title: rec, priority: 'medium' });
      }
    });
  }

  return actions;
}

interface MobileFlaggedItemLayoutProps {
  item: ItemStatisticsDetail;
  similarItems: FlaggedItemSummary[];
}

/**
 * MobileFlaggedItemLayout - Mobile-optimized layout for flagged item detail
 *
 * Features:
 * - Condensed header with back navigation
 * - Collapsible severity banner
 * - Compact metric pills in a row
 * - Accordion sections for secondary content
 * - Fixed bottom action bar
 */
export function MobileFlaggedItemLayout({ item, similarItems }: MobileFlaggedItemLayoutProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const t = useTranslations('psychometrics.flaggedDetail');
  const flagDetails = getFlagDetails(item, t);
  const suggestedActions = generateSuggestedActions(item, t);

  // Convert flagged items to SimilarItem format
  const similarItemsFormatted = similarItems.map((fi) => ({
    questionId: fi.questionId,
    questionText: fi.questionText || '',
    competencyName: fi.competencyName || undefined,
    validityStatus: fi.validityStatus,
    discriminationFlag: fi.discriminationFlag || undefined,
    discriminationIndex: fi.discriminationIndex,
  }));

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-1 flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <UiLink
              href="/psychometrics/flagged"
              variant="muted"
              className="flex items-center gap-1 text-sm min-h-[44px] -ml-2 pl-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">{t('backToFlagged')}</span>
            </UiLink>

            <ValidityStatusBadge status={item.validityStatus} size="md" />
          </div>

          {/* Competency breadcrumb */}
          <div className="px-3 pb-2">
            <p className="text-xs text-muted-foreground truncate">{item.competencyName}</p>
          </div>
        </header>

        {/* Main content - scrollable */}
        <main className="flex-1 p-3 pb-24 space-y-4">
          {/* Severity Banner - Collapsible */}
          <MobileSeverityBanner
            severity={flagDetails.severity}
            reasons={flagDetails.reasons}
            defaultExpanded={flagDetails.severity === 'critical'}
          />

          {/* Question Preview */}
          <Card>
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('questionText')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-sm leading-relaxed mb-3">{item.questionText}</p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Link
                  href={`/psychometrics/competencies/${item.competencyName}`}
                  className="hover:underline"
                >
                  {item.competencyName}
                </Link>
                <span>•</span>
                <span>{item.indicatorTitle}</span>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Row - Compact pills */}
          <div className="grid grid-cols-3 gap-2">
            <DifficultyPill value={item.difficultyIndex} size="sm" />
            <DiscriminationPill value={item.discriminationIndex} size="sm" />
            <ResponseCountPill value={item.responseCount} size="sm" />
          </div>

          {/* Accordion sections for secondary content */}
          <Accordion type="single" collapsible className="space-y-2">
            {/* Suggested Actions */}
            {suggestedActions.length > 0 && (
              <AccordionItem value="actions" className="border rounded-lg px-3">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="h-4 w-4" />
                    <span>{t('accordion.suggestedActions')}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {suggestedActions.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-2">
                    {suggestedActions.slice(0, 4).map((action, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                            action.priority === 'high' && 'bg-red-500',
                            action.priority === 'medium' && 'bg-amber-500',
                            action.priority === 'low' && 'bg-blue-500'
                          )}
                        />
                        <div>
                          <p className="font-medium">{action.title}</p>
                          {action.description && (
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Additional Stats */}
            <AccordionItem value="stats" className="border rounded-lg px-3">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BarChart3 className="h-4 w-4" />
                  <span>{t('accordion.additionalStats')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">{t('stats.responses')}</p>
                    <p className="font-semibold">{item.responseCount}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">{t('stats.lastCalculation')}</p>
                    <p className="font-semibold">
                      {item.lastCalculatedAt
                        ? new Date(item.lastCalculatedAt).toLocaleDateString('ru-RU')
                        : '-'}
                    </p>
                  </div>
                  {item.previousDiscriminationIndex != null && (
                    <>
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">{t('stats.previousRpb')}</p>
                        <p className="font-semibold">{item.previousDiscriminationIndex.toFixed(2)}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">{t('stats.rpbChange')}</p>
                        <p
                          className={cn(
                            'font-semibold',
                            item.discriminationIndex != null &&
                              item.discriminationIndex > item.previousDiscriminationIndex &&
                              'text-emerald-600',
                            item.discriminationIndex != null &&
                              item.discriminationIndex < item.previousDiscriminationIndex &&
                              'text-red-600'
                          )}
                        >
                          {item.discriminationIndex != null
                            ? `${item.discriminationIndex > item.previousDiscriminationIndex ? '+' : ''}${(item.discriminationIndex - item.previousDiscriminationIndex).toFixed(2)}`
                            : '-'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Distractor Efficiency */}
            {item.distractorEfficiency && Object.keys(item.distractorEfficiency).length > 0 && (
              <AccordionItem value="distractors" className="border rounded-lg px-3">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-4 w-4" />
                    <span>{t('accordion.distractorEfficiency')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-2">
                    {Object.entries(item.distractorEfficiency).map(([option, efficiency]) => (
                      <div key={option} className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 justify-center text-xs">
                          {option}
                        </Badge>
                        <div className="flex-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${Math.min(efficiency * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-mono w-10 text-right">
                          {(efficiency * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {t('distractorNote')}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Status History */}
            {item.statusChangeHistory && item.statusChangeHistory.length > 0 && (
              <AccordionItem value="history" className="border rounded-lg px-3">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <History className="h-4 w-4" />
                    <span>{t('accordion.statusHistory')}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {item.statusChangeHistory.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-3">
                    {item.statusChangeHistory.slice(0, 5).map((change, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <ValidityStatusBadge status={change.fromStatus} size="sm" />
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <ValidityStatusBadge status={change.toStatus} size="sm" />
                        </div>
                        {change.reason && (
                          <p className="text-xs text-muted-foreground">{change.reason}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(change.timestamp).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Similar Items */}
            {similarItemsFormatted.length > 0 && (
              <AccordionItem value="similar" className="border rounded-lg px-3">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    <span>{t('accordion.similarItems')}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {Math.min(similarItemsFormatted.length, 5)}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-2">
                    {similarItemsFormatted
                      .filter((si) => si.questionId !== item.questionId)
                      .slice(0, 5)
                      .map((si) => (
                        <Link
                          key={si.questionId}
                          href={`/psychometrics/flagged/${si.questionId}`}
                          className="block p-2 -mx-2 rounded-md hover:bg-accent/50 transition-colors"
                        >
                          <p className="text-sm line-clamp-1">{si.questionText}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              rpb: {si.discriminationIndex?.toFixed(2) ?? '-'}
                            </span>
                            <ValidityStatusBadge status={si.validityStatus} size="sm" />
                          </div>
                        </Link>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Link to full stats */}
          <div className="pt-2">
            <Link href={`/psychometrics/items/${item.questionId}`}>
              <Button variant="outline" className="w-full gap-2 h-11">
                {t('viewFullStats')}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>

        {/* Sticky Action Bar */}
        <StickyActionBar item={item} />
      </div>
    );
  }

  // Desktop layout - return null to use the original layout
  return null;
}

export default MobileFlaggedItemLayout;
