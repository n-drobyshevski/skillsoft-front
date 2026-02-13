import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import { BigFiveReliability, ReliabilityStatus } from '@/types/psychometrics';
import { Brain, AlertTriangle, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { TriggerAuditButton } from '../_components/TriggerAuditButton';
import {
  BigFiveTraitCard,
  BigFiveComparisonChartLazy,
  TraitDetailAccordion,
  MobileTraitCarouselEnhanced,
  MobileVerticalBarChart,
  BigFiveClientWrapper,
} from './_components';
import { getPsychometricsBigFiveCached } from '@/services/api.cache.psychometrics';
import { getAuthHeaders } from '@/services/roleApi';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('psychometrics.bigFivePage');
  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
  };
}

/**
 * Fetch Big Five reliability data from the cached API
 */
async function getBigFiveData(): Promise<{
  reliabilityData: BigFiveReliability[];
  error: string | null;
}> {
  const authHeaders = await getAuthHeaders();
  const data = await getPsychometricsBigFiveCached(authHeaders);

  return {
    reliabilityData: data ?? [],
    error: data === null ? 'Failed to load Big Five data' : null,
  };
}

/**
 * Calculate summary statistics from the reliability data
 */
function calculateSummaryStats(data: BigFiveReliability[]) {
  const stats = {
    totalTraits: data.length,
    reliableCount: 0,
    acceptableCount: 0,
    unreliableCount: 0,
    insufficientDataCount: 0,
    averageAlpha: null as number | null,
    lowestAlpha: null as { trait: string; value: number } | null,
    highestAlpha: null as { trait: string; value: number } | null,
  };

  let alphaSum = 0;
  let alphaCount = 0;

  data.forEach((item) => {
    switch (item.reliabilityStatus) {
      case ReliabilityStatus.RELIABLE:
        stats.reliableCount++;
        break;
      case ReliabilityStatus.ACCEPTABLE:
        stats.acceptableCount++;
        break;
      case ReliabilityStatus.UNRELIABLE:
        stats.unreliableCount++;
        break;
      case ReliabilityStatus.INSUFFICIENT_DATA:
        stats.insufficientDataCount++;
        break;
    }

    // Use != null to catch both null and undefined
    if (item.cronbachAlpha != null && typeof item.cronbachAlpha === 'number') {
      alphaSum += item.cronbachAlpha;
      alphaCount++;

      if (stats.lowestAlpha === null || item.cronbachAlpha < stats.lowestAlpha.value) {
        stats.lowestAlpha = {
          trait: item.traitDisplayName ?? item.trait,
          value: item.cronbachAlpha,
        };
      }

      if (stats.highestAlpha === null || item.cronbachAlpha > stats.highestAlpha.value) {
        stats.highestAlpha = {
          trait: item.traitDisplayName ?? item.trait,
          value: item.cronbachAlpha,
        };
      }
    }
  });

  if (alphaCount > 0) {
    stats.averageAlpha = alphaSum / alphaCount;
  }

  return stats;
}

interface HeroBannerTranslations {
  traitsReliable: string;
  needsAttention: string;
  couldImprove: string;
  allReliable: string;
  awaitingData: string;
  average: string;
}

/**
 * Hero Banner - Quick health summary visible above the fold on mobile
 * Answers "Is there a problem?" in < 3 seconds
 */
function HeroBanner({ data, translations }: { data: BigFiveReliability[]; translations: HeroBannerTranslations }) {
  const stats = calculateSummaryStats(data);
  const totalWithData = stats.reliableCount + stats.acceptableCount + stats.unreliableCount;
  const allReliable = stats.reliableCount === totalWithData && totalWithData > 0;

  // Determine overall status
  const getOverallStatus = () => {
    if (stats.unreliableCount > 0) {
      return {
        text: translations.needsAttention,
        color: 'red',
        icon: XCircle
      };
    }
    if (stats.acceptableCount > 0) {
      return {
        text: translations.couldImprove,
        color: 'amber',
        icon: AlertTriangle
      };
    }
    if (allReliable) {
      return {
        text: translations.allReliable,
        color: 'emerald',
        icon: CheckCircle2
      };
    }
    return {
      text: translations.awaitingData,
      color: 'gray',
      icon: HelpCircle
    };
  };

  const status = getOverallStatus();
  const StatusIcon = status.icon;

  const colorClasses = {
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    amber: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800',
    red: 'from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800',
    gray: 'from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/20 border-gray-200 dark:border-gray-800',
  };

  const iconColorClasses = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
    gray: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div className={cn(
      'rounded-lg border p-4 bg-gradient-to-r',
      colorClasses[status.color as keyof typeof colorClasses]
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatusIcon className={cn('h-6 w-6 shrink-0', iconColorClasses[status.color as keyof typeof iconColorClasses])} />
          <div>
            <div className="font-semibold">
              {translations.traitsReliable}
            </div>
            <div className={cn('text-sm', iconColorClasses[status.color as keyof typeof iconColorClasses])}>
              {status.text}
            </div>
          </div>
        </div>
        {stats.averageAlpha !== null && (
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">{translations.average}</div>
            <div className="text-2xl font-bold tabular-nums">
              {stats.averageAlpha.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SummaryStatsCardTranslations {
  title: string;
  reliable: string;
  acceptable: string;
  unreliable: string;
  noData: string;
  averageAlpha: string;
  highest: string;
  lowest: string;
}

/**
 * Summary statistics card component
 */
function SummaryStatsCard({ data, translations }: { data: BigFiveReliability[]; translations: SummaryStatsCardTranslations }) {
  const stats = calculateSummaryStats(data);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          {translations.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile: 2x2 grid, Tablet+: 4 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Reliable */}
          <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.reliableCount}
            </div>
            <div className="text-xs text-muted-foreground">{translations.reliable}</div>
          </div>

          {/* Acceptable */}
          <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.acceptableCount}
            </div>
            <div className="text-xs text-muted-foreground">{translations.acceptable}</div>
          </div>

          {/* Unreliable */}
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center justify-center mb-1">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.unreliableCount}
            </div>
            <div className="text-xs text-muted-foreground">{translations.unreliable}</div>
          </div>

          {/* Insufficient Data */}
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20">
            <div className="flex items-center justify-center mb-1">
              <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.insufficientDataCount}
            </div>
            <div className="text-xs text-muted-foreground">{translations.noData}</div>
          </div>
        </div>

        {/* Average and Range - Stack on very small screens */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">{translations.averageAlpha}</div>
            <div className="text-xl font-bold tabular-nums">
              {stats.averageAlpha !== null ? stats.averageAlpha.toFixed(2) : '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">{translations.highest}</div>
            <div className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {stats.highestAlpha?.value != null ? stats.highestAlpha.value.toFixed(2) : '-'}
            </div>
            {stats.highestAlpha?.trait && (
              <div className="text-[11px] text-muted-foreground truncate">
                {stats.highestAlpha.trait}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">{translations.lowest}</div>
            <div className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {stats.lowestAlpha?.value != null ? stats.lowestAlpha.value.toFixed(2) : '-'}
            </div>
            {stats.lowestAlpha?.trait && (
              <div className="text-[11px] text-muted-foreground truncate">
                {stats.lowestAlpha.trait}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateTranslations {
  title: string;
  description: string;
}

/**
 * Empty state component when no data is available
 */
function EmptyState({ translations }: { translations: EmptyStateTranslations }) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-semibold text-lg mb-2">{translations.title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {translations.description}
        </p>
        <div className="mt-4">
          <TriggerAuditButton />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function BigFivePage() {
  const t = await getTranslations('psychometrics.bigFivePage');
  const { reliabilityData, error } = await getBigFiveData();

  // Pre-calculate stats for translations that need counts
  const stats = reliabilityData.length > 0 ? calculateSummaryStats(reliabilityData) : null;
  const totalWithData = stats
    ? stats.reliableCount + stats.acceptableCount + stats.unreliableCount
    : 0;

  // Prepare translations for child components
  const heroTranslations: HeroBannerTranslations = {
    traitsReliable: t('hero.traitsReliable', { reliable: stats?.reliableCount ?? 0, total: totalWithData }),
    needsAttention: t('hero.needsAttention', { count: stats?.unreliableCount ?? 0 }),
    couldImprove: t('hero.couldImprove', { count: stats?.acceptableCount ?? 0 }),
    allReliable: t('hero.allReliable'),
    awaitingData: t('hero.awaitingData'),
    average: t('hero.average'),
  };

  const summaryTranslations: SummaryStatsCardTranslations = {
    title: t('summary.title'),
    reliable: t('summary.reliable'),
    acceptable: t('summary.acceptable'),
    unreliable: t('summary.unreliable'),
    noData: t('summary.noData'),
    averageAlpha: t('summary.averageAlpha'),
    highest: t('summary.highest'),
    lowest: t('summary.lowest'),
  };

  const emptyStateTranslations: EmptyStateTranslations = {
    title: t('emptyState.title'),
    description: t('emptyState.description'),
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
      >
        <TriggerAuditButton />
      </PageHeader>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">{t('error.loadingError')}</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!error && reliabilityData.length === 0 && <EmptyState translations={emptyStateTranslations} />}

      {/* Main Content - Mobile-First Layout */}
      {reliabilityData.length > 0 && (
        <>
          {/* SECTION 1: Hero Banner - Quick health summary (visible above fold on mobile) */}
          <HeroBanner data={reliabilityData} translations={heroTranslations} />

          {/* SECTION 2: Summary Stats - Most important info for quick assessment */}
          <SummaryStatsCard data={reliabilityData} translations={summaryTranslations} />

          {/* SECTION 3: Comparison Chart */}
          <div>
            {/* Mobile: Vertical bar chart (portrait-friendly) */}
            <div className="lg:hidden">
              <MobileVerticalBarChart reliabilityData={reliabilityData} />
            </div>

            {/* Desktop: Horizontal bar chart (lazy-loaded to reduce bundle size) */}
            <div className="hidden lg:block">
              <BigFiveComparisonChartLazy reliabilityData={reliabilityData} />
            </div>
          </div>

          {/* SECTION 4: Trait Cards - Detailed view per trait */}
          {/* Mobile: Enhanced carousel with simplified cards and bottom sheet details */}
          {/* Wrapped in BigFiveClientWrapper to handle Zustand hydration */}
          <div className="sm:hidden">
            <BigFiveClientWrapper>
              <MobileTraitCarouselEnhanced reliabilityData={reliabilityData} />
            </BigFiveClientWrapper>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {reliabilityData.map((reliability) => (
              <BigFiveTraitCard key={reliability.id} reliability={reliability} />
            ))}
          </div>

          {/* SECTION 5: Trait Detail Accordion - Deep dive analysis */}
          {/* Wrapped in BigFiveClientWrapper to handle Zustand hydration */}
          <BigFiveClientWrapper>
            <TraitDetailAccordion reliabilityData={reliabilityData} />
          </BigFiveClientWrapper>
        </>
      )}
    </div>
  );
}
