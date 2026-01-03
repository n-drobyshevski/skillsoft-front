import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { UiLink } from '@/components/ui/ui-link';
import {
  getPsychometricsItemDetailCached,
  getPsychometricsFlaggedItemsCached,
} from '@/services/api.cache.psychometrics';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ValidityStatusBadge,
  DiscriminationGauge,
  DifficultyGauge,
  MetricComparisonRow,
  MetricComparisonList,
  SuggestedActionsCard,
  SimilarItemsCard,
} from '../../_components';
import { FlaggedItemDetailClient } from './_components/FlaggedItemDetailClient';
import { MobileFlaggedItemLayoutWrapper } from './_components/MobileFlaggedItemLayoutWrapper';
import {
  AlertTriangle,
  AlertOctagon,
  Target,
  TrendingUp,
  Users,
  Clock,
  FileText,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import {
  ItemStatisticsDetail,
  DiscriminationFlag,
  DifficultyFlag,
  FlaggedItemSummary,
} from '@/types/psychometrics';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('psychometrics.flaggedPage.detail');
  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
  };
}

interface PageProps {
  params: Promise<{ itemId: string }>;
}

async function getItemDetail(questionId: string, errorMessage: string) {
  const item = await getPsychometricsItemDetailCached(questionId);
  return {
    item,
    error: item === null ? errorMessage : null,
  };
}

async function getSimilarFlaggedItems() {
  const items = await getPsychometricsFlaggedItemsCached();
  return { items: items ?? [], error: null };
}

// Severity level type
type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

// Translation function type for reasons
type ReasonTranslator = {
  (key: 'negativeDiscrimination'): string;
  (key: 'criticalDiscrimination'): string;
  (key: 'weakDiscrimination'): string;
  (key: 'tooHard'): string;
  (key: 'tooEasy'): string;
  (key: 'insufficientResponses'): string;
  (key: 'manualReview'): string;
};

// Get flag reason and severity
function getFlagDetails(
  item: ItemStatisticsDetail,
  tReasons: ReasonTranslator
): {
  severity: SeverityLevel;
  reasons: string[];
  color: string;
  bgClass: string;
  borderClass: string;
  icon: typeof AlertTriangle;
} {
  const reasons: string[] = [];

  // Severity priority: 0 = low, 1 = medium, 2 = high, 3 = critical
  let severityLevel = 0;

  // Check discrimination
  if (item.discriminationFlag === DiscriminationFlag.NEGATIVE) {
    reasons.push(tReasons('negativeDiscrimination'));
    severityLevel = 3; // critical
  } else if (item.discriminationFlag === DiscriminationFlag.CRITICAL) {
    reasons.push(tReasons('criticalDiscrimination'));
    severityLevel = Math.max(severityLevel, 2); // high
  } else if (item.discriminationFlag === DiscriminationFlag.WARNING) {
    reasons.push(tReasons('weakDiscrimination'));
    severityLevel = Math.max(severityLevel, 1); // medium
  }

  // Check difficulty
  if (item.difficultyFlag === DifficultyFlag.TOO_HARD) {
    reasons.push(tReasons('tooHard'));
    severityLevel = Math.max(severityLevel, 2); // high
  } else if (item.difficultyFlag === DifficultyFlag.TOO_EASY) {
    reasons.push(tReasons('tooEasy'));
    severityLevel = Math.max(severityLevel, 2); // high
  }

  // Check response count
  if (item.responseCount < 30) {
    reasons.push(tReasons('insufficientResponses'));
    severityLevel = Math.max(severityLevel, 1); // medium
  }

  // Default if no specific issues found
  if (reasons.length === 0) {
    reasons.push(tReasons('manualReview'));
    severityLevel = Math.max(severityLevel, 1); // medium
  }

  // Convert severity level to string
  const severityMap: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];
  const severity = severityMap[severityLevel];

  const severityConfig = {
    critical: {
      color: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 dark:bg-red-950/30',
      borderClass: 'border-red-500',
      icon: AlertOctagon,
    },
    high: {
      color: 'text-orange-600 dark:text-orange-400',
      bgClass: 'bg-orange-50 dark:bg-orange-950/30',
      borderClass: 'border-orange-500',
      icon: AlertTriangle,
    },
    medium: {
      color: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/30',
      borderClass: 'border-amber-500',
      icon: AlertTriangle,
    },
    low: {
      color: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      borderClass: 'border-blue-500',
      icon: AlertTriangle,
    },
  };

  return {
    severity,
    reasons,
    ...severityConfig[severity],
  };
}

// Translation function type for actions
type ActionTranslator = {
  (key: 'considerRemoval'): string;
  (key: 'negativeRpbDescription'): string;
  (key: 'checkAnswerKey'): string;
  (key: 'answerKeyDescription'): string;
  (key: 'reformulateQuestion'): string;
  (key: 'reformulateDescription'): string;
  (key: 'reviewOptions'): string;
  (key: 'reviewOptionsDescription'): string;
  (key: 'monitorMetrics'): string;
  (key: 'monitorDescription'): string;
  (key: 'simplifyWording'): string;
  (key: 'simplifyDescription'): string;
  (key: 'addHints'): string;
  (key: 'addHintsDescription'): string;
  (key: 'increaseComplexity'): string;
  (key: 'increaseDescription'): string;
  (key: 'collectMoreData'): string;
  (key: 'collectDescription', params: { count: number }): string;
};

// Generate suggested actions based on item metrics
function generateSuggestedActions(
  item: ItemStatisticsDetail,
  tActions: ActionTranslator
) {
  const actions: Array<{
    title: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Based on discrimination
  if (item.discriminationFlag === DiscriminationFlag.NEGATIVE) {
    actions.push({
      title: tActions('considerRemoval'),
      description: tActions('negativeRpbDescription'),
      priority: 'high',
    });
    actions.push({
      title: tActions('checkAnswerKey'),
      description: tActions('answerKeyDescription'),
      priority: 'high',
    });
  } else if (item.discriminationFlag === DiscriminationFlag.CRITICAL) {
    actions.push({
      title: tActions('reformulateQuestion'),
      description: tActions('reformulateDescription'),
      priority: 'high',
    });
    actions.push({
      title: tActions('reviewOptions'),
      description: tActions('reviewOptionsDescription'),
      priority: 'medium',
    });
  } else if (item.discriminationFlag === DiscriminationFlag.WARNING) {
    actions.push({
      title: tActions('monitorMetrics'),
      description: tActions('monitorDescription'),
      priority: 'medium',
    });
  }

  // Based on difficulty
  if (item.difficultyFlag === DifficultyFlag.TOO_HARD) {
    actions.push({
      title: tActions('simplifyWording'),
      description: tActions('simplifyDescription'),
      priority: 'medium',
    });
    actions.push({
      title: tActions('addHints'),
      description: tActions('addHintsDescription'),
      priority: 'low',
    });
  } else if (item.difficultyFlag === DifficultyFlag.TOO_EASY) {
    actions.push({
      title: tActions('increaseComplexity'),
      description: tActions('increaseDescription'),
      priority: 'medium',
    });
  }

  // Based on response count
  if (item.responseCount < 50) {
    actions.push({
      title: tActions('collectMoreData'),
      description: tActions('collectDescription', { count: item.responseCount }),
      priority: 'low',
    });
  }

  // Use existing recommendations from backend
  if (item.recommendations?.length > 0) {
    item.recommendations.forEach((rec) => {
      // Avoid duplicates
      if (!actions.some((a) => a.title === rec || a.description === rec)) {
        actions.push({
          title: rec,
          priority: 'medium',
        });
      }
    });
  }

  return actions;
}

export default async function FlaggedItemDetailPage({ params }: PageProps) {
  const { itemId } = await params;
  const t = await getTranslations('psychometrics.flaggedPage.detail');
  const locale = await getLocale();

  const [{ item, error }, { items: flaggedItems }] = await Promise.all([
    getItemDetail(itemId, t('failedToLoadData')),
    getSimilarFlaggedItems(),
  ]);

  if (!item && !error) {
    notFound();
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
        <PageHeader title={t('errorLoading')} />
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">{t('error')}</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create translation functions for reasons and actions
  const tReasons = ((key: string) => t(`reasons.${key}`)) as ReasonTranslator;
  const tActions = ((key: string, params?: { count: number }) =>
    params ? t(`actions.${key}`, params) : t(`actions.${key}`)) as ActionTranslator;

  const flagDetails = getFlagDetails(item!, tReasons);
  const suggestedActions = generateSuggestedActions(item!, tActions);
  const FlagIcon = flagDetails.icon;

  // Convert flagged items to SimilarItem format
  const similarItems = flaggedItems.map((fi: FlaggedItemSummary) => ({
    questionId: fi.questionId,
    questionText: fi.questionText || '',
    competencyName: fi.competencyName || undefined,
    validityStatus: fi.validityStatus,
    discriminationFlag: fi.discriminationFlag || undefined,
    discriminationIndex: fi.discriminationIndex,
  }));

  return (
    <MobileFlaggedItemLayoutWrapper item={item!} similarItems={flaggedItems}>
      {/* Desktop Layout - hidden on mobile by wrapper */}
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
        {/* Back navigation */}
        <UiLink
          href="/psychometrics/flagged"
          variant="muted"
          leadingIcon={<ArrowLeft className="h-4 w-4" />}
        >
          {t('backToList')}
        </UiLink>

      <PageHeader
        title={t('pageTitle')}
        description={item!.competencyName}
      >
        <div className="flex items-center gap-2">
          <ValidityStatusBadge status={item!.validityStatus} size="lg" />
        </div>
      </PageHeader>

      {/* Alert Banner */}
      <Card className={`border-l-4 ${flagDetails.borderClass} ${flagDetails.bgClass}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg bg-background/50 ${flagDetails.color}`}>
              <FlagIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`font-semibold ${flagDetails.color}`}>
                  {t(`severity.${flagDetails.severity}`)}
                </h3>
                <Badge
                  variant="outline"
                  className={flagDetails.color}
                >
                  {t(`severity.${flagDetails.severity}Badge`)}
                </Badge>
              </div>
              <ul className="space-y-1">
                {flagDetails.reasons.map((reason, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('questionSection.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{item!.questionText}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">
              {t('questionSection.competency')}{' '}
              <Link
                href={`/psychometrics/competencies/${item!.competencyName}`}
                className="font-medium text-primary hover:underline"
              >
                {item!.competencyName}
              </Link>
            </span>
            <span className="text-muted-foreground">
              {t('questionSection.indicator')}{' '}
              <span className="font-medium text-foreground">{item!.indicatorTitle}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Gauges Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('gauges.difficultyTitle')}
            </CardTitle>
            <CardDescription>
              {t('gauges.difficultyDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <DifficultyGauge value={item!.difficultyIndex} size="lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('gauges.discriminationTitle')}
            </CardTitle>
            <CardDescription>
              {t('gauges.discriminationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <DiscriminationGauge value={item!.discriminationIndex} size="lg" />
          </CardContent>
        </Card>
      </div>

      {/* Metrics Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('comparison.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricComparisonList>
            <MetricComparisonRow
              label={t('comparison.difficulty')}
              currentValue={item!.difficultyIndex}
              threshold={{ min: 0.2, max: 0.9 }}
              description={t('comparison.difficultyDescription')}
            />
            <MetricComparisonRow
              label={t('comparison.discrimination')}
              currentValue={item!.discriminationIndex}
              threshold={{ min: 0.25, max: 1 }}
              description={t('comparison.discriminationDescription')}
            />
            <MetricComparisonRow
              label={t('comparison.responseCount')}
              currentValue={item!.responseCount}
              threshold={{ min: 50, max: 10000 }}
              format="integer"
              description={t('comparison.responseDescription')}
              showBar={false}
            />
          </MetricComparisonList>
        </CardContent>
      </Card>

      {/* Additional Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('stats.responses')}</p>
                <p className="text-2xl font-bold mt-1">{item!.responseCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item!.responseCount < 50 ? t('stats.insufficient') : t('stats.sufficient')}
                </p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('stats.lastCalculation')}</p>
                <p className="text-lg font-bold mt-1">
                  {item!.lastCalculatedAt
                    ? new Date(item!.lastCalculatedAt).toLocaleDateString(locale)
                    : '-'}
                </p>
                {item!.lastCalculatedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item!.lastCalculatedAt).toLocaleTimeString(locale)}
                  </p>
                )}
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        {item!.previousDiscriminationIndex != null && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('stats.previousRpb')}</p>
                    <p className="text-2xl font-bold mt-1">
                      {item!.previousDiscriminationIndex.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('stats.rpbChange')}</p>
                    {item!.discriminationIndex != null && (
                      <p
                        className={`text-2xl font-bold mt-1 ${
                          item!.discriminationIndex > item!.previousDiscriminationIndex
                            ? 'text-emerald-600'
                            : item!.discriminationIndex < item!.previousDiscriminationIndex
                              ? 'text-red-600'
                              : ''
                        }`}
                      >
                        {item!.discriminationIndex > item!.previousDiscriminationIndex ? '+' : ''}
                        {(item!.discriminationIndex - item!.previousDiscriminationIndex).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Two-column layout for actions and similar items */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Suggested Actions */}
        <SuggestedActionsCard
          title={t('actions.title')}
          actions={suggestedActions}
          maxVisible={6}
        />

        {/* Similar Flagged Items */}
        <SimilarItemsCard
          title={t('similarItems.title')}
          description={t('similarItems.description')}
          items={similarItems}
          currentItemId={item!.questionId}
          maxItems={5}
          basePath="/psychometrics/flagged"
        />
      </div>

      {/* Client-side interactive components */}
      <FlaggedItemDetailClient item={item!} />

      {/* Link to full item details */}
      <div className="flex justify-center">
        <Link href={`/psychometrics/items/${item!.questionId}`}>
          <Button variant="outline" className="gap-2">
            {t('fullStats')}
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      </div>
    </MobileFlaggedItemLayoutWrapper>
  );
}
