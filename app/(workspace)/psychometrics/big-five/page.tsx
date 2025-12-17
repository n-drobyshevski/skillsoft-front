import { Metadata } from 'next';
import { psychometricsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import { BigFiveReliability, ReliabilityStatus } from '@/types/psychometrics';
import { Brain, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';

import { TriggerAuditButton } from '../_components/TriggerAuditButton';
import {
  BigFiveTraitCard,
  BigFiveComparisonChart,
  TraitDetailAccordion,
} from './_components';

export const metadata: Metadata = {
  title: 'Big Five Reliability - Psychometrics - SkillSoft',
  description: 'Cronbach Alpha reliability analysis for Big Five personality traits.',
};

/**
 * Fetch Big Five reliability data from the API
 */
async function getBigFiveData(): Promise<{
  reliabilityData: BigFiveReliability[];
  error: string | null;
}> {
  try {
    const data = await psychometricsApi.getBigFiveReliability();
    return { reliabilityData: data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load Big Five data.';
    return { reliabilityData: [], error: message };
  }
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

    if (item.cronbachAlpha !== null) {
      alphaSum += item.cronbachAlpha;
      alphaCount++;

      if (stats.lowestAlpha === null || item.cronbachAlpha < stats.lowestAlpha.value) {
        stats.lowestAlpha = {
          trait: item.traitDisplayName,
          value: item.cronbachAlpha,
        };
      }

      if (stats.highestAlpha === null || item.cronbachAlpha > stats.highestAlpha.value) {
        stats.highestAlpha = {
          trait: item.traitDisplayName,
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

/**
 * Summary statistics card component
 */
function SummaryStatsCard({ data }: { data: BigFiveReliability[] }) {
  const stats = calculateSummaryStats(data);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          Сводная статистика
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile: 2x2 grid, Tablet+: 4 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Reliable */}
          <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.reliableCount}
            </div>
            <div className="text-xs text-muted-foreground">Надежных</div>
          </div>

          {/* Acceptable */}
          <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.acceptableCount}
            </div>
            <div className="text-xs text-muted-foreground">Приемлемых</div>
          </div>

          {/* Unreliable */}
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.unreliableCount}
            </div>
            <div className="text-xs text-muted-foreground">Ненадежных</div>
          </div>

          {/* Insufficient Data */}
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20">
            <div className="flex items-center justify-center mb-1">
              <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.insufficientDataCount}
            </div>
            <div className="text-xs text-muted-foreground">Мало данных</div>
          </div>
        </div>

        {/* Average and Range - Stack on very small screens */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Средний Alpha</div>
            <div className="text-xl font-bold tabular-nums">
              {stats.averageAlpha !== null ? stats.averageAlpha.toFixed(2) : '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Наивысший</div>
            <div className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {stats.highestAlpha !== null ? stats.highestAlpha.value.toFixed(2) : '-'}
            </div>
            {stats.highestAlpha && (
              <div className="text-[10px] text-muted-foreground truncate">
                {stats.highestAlpha.trait}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Наименьший</div>
            <div className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {stats.lowestAlpha !== null ? stats.lowestAlpha.value.toFixed(2) : '-'}
            </div>
            {stats.lowestAlpha && (
              <div className="text-[10px] text-muted-foreground truncate">
                {stats.lowestAlpha.trait}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty state component when no data is available
 */
function EmptyState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-semibold text-lg mb-2">Нет данных Big Five</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Данные о надежности черт Big Five еще не рассчитаны.
          Запустите психометрический аудит для анализа.
        </p>
        <div className="mt-4">
          <TriggerAuditButton />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function BigFivePage() {
  const { reliabilityData, error } = await getBigFiveData();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title="Big Five Reliability"
        description="Cronbach's Alpha reliability analysis for personality trait measurements"
      >
        <TriggerAuditButton />
      </PageHeader>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">Data Loading Error</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!error && reliabilityData.length === 0 && <EmptyState />}

      {/* Main Content */}
      {reliabilityData.length > 0 && (
        <>
          {/* Hero Section: 5 Trait Cards - Horizontal scroll on mobile */}
          <div className="
            flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2
            -mx-4 px-4 sm:mx-0 sm:px-0
            sm:grid sm:grid-cols-2 sm:overflow-visible
            lg:grid-cols-3 xl:grid-cols-5
          " style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {reliabilityData.map((reliability) => (
              <div key={reliability.id} className="snap-start shrink-0 w-[280px] sm:w-auto">
                <BigFiveTraitCard reliability={reliability} />
              </div>
            ))}
            {/* Spacer for scroll padding on mobile */}
            <div className="w-4 shrink-0 sm:hidden" aria-hidden="true" />
          </div>

          {/* Charts Section: 2-column grid, stacked on mobile */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Horizontal bar chart */}
            <BigFiveComparisonChart reliabilityData={reliabilityData} />

            {/* Right: Summary stats */}
            <SummaryStatsCard data={reliabilityData} />
          </div>

          {/* Trait Detail Accordion - collapsed by default on mobile via defaultValue */}
          <TraitDetailAccordion reliabilityData={reliabilityData} />
        </>
      )}
    </div>
  );
}
