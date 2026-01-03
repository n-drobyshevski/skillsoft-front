'use client';

/**
 * CompetencyDetailAccordion - Progressive disclosure wrapper for mobile
 *
 * Features:
 * - Accordion-based sections on mobile
 * - Full expanded layout on desktop
 * - Summary badges in accordion headers
 * - 44px minimum touch targets
 * - Auto-expands "Items" section if issues exist
 * - Expandable items list with "Show all" button
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlphaGauge,
  MetricComparisonRow,
  MetricComparisonList,
  AlphaIfDeletedList,
} from '../../../_components';
import { AlphaInterpretationScale, AlphaInterpretationBadge } from './AlphaInterpretationScale';
import { ThresholdSummaryBadge } from './ThresholdSummaryBadge';
import { getAlphaQuality, sortAlphaIfDeleted, getProblematicItems } from '../_lib/competency-detail.utils';
import type { CompetencyReliabilityDetail } from '@/types/psychometrics';

interface CompetencyDetailAccordionProps {
  detail: CompetencyReliabilityDetail;
  className?: string;
}

export function CompetencyDetailAccordion({
  detail,
  className,
}: CompetencyDetailAccordionProps) {
  const t = useTranslations('psychometrics');
  const isMobile = useIsMobile();
  const alphaQuality = getAlphaQuality(detail.cronbachAlpha);

  // Sort and analyze items
  const sortedAlphaIfDeleted = useMemo(
    () => sortAlphaIfDeleted(detail.alphaIfDeleted),
    [detail.alphaIfDeleted]
  );
  const problematicItems = useMemo(
    () => getProblematicItems(sortedAlphaIfDeleted),
    [sortedAlphaIfDeleted]
  );

  // Determine which section to auto-expand
  const hasIssues = detail.itemsLoweringAlpha && detail.itemsLoweringAlpha.length > 0;
  const defaultExpandedSection = hasIssues ? 'items-analysis' : undefined;

  // Desktop: Render full layout without accordion
  if (!isMobile) {
    return <DesktopDetailLayout detail={detail} className={className} />;
  }

  // Mobile: Accordion-based progressive disclosure
  return (
    <Card className={cn('overflow-hidden', className)}>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultExpandedSection}
        className="w-full"
      >
        {/* Alpha Gauge Section */}
        <AccordionItem value="alpha-gauge" className="border-b">
          <AccordionTrigger className="py-4 px-4 min-h-[52px] hover:no-underline [&>svg]:size-4">
            <div className="flex items-center justify-between w-full pr-2">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">{t('competencyDetail.accordion.visualGauge')}</span>
              </div>
              <AlphaInterpretationBadge alpha={detail.cronbachAlpha} />
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="flex flex-col items-center gap-4">
              <AlphaGauge value={detail.cronbachAlpha} size="lg" />
              <div className="w-full p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-center">
                  <span className={cn('font-bold', alphaQuality.textClass)}>
                    {alphaQuality.label}
                  </span>
                  {' - '}
                  <span className="text-muted-foreground">
                    {alphaQuality.description}
                  </span>
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Interpretation Scale Section */}
        <AccordionItem value="interpretation" className="border-b">
          <AccordionTrigger className="py-4 px-4 min-h-[52px] hover:no-underline [&>svg]:size-4">
            <div className="flex items-center justify-between w-full pr-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-500" aria-hidden="true" />
                <span className="text-sm font-medium">{t('competencyDetail.accordion.interpretation')}</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <AlphaInterpretationScale alpha={detail.cronbachAlpha} />
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <h4 className="font-medium text-sm mb-1">{t('competencyDetail.accordion.whatItMeans')}</h4>
              <p className="text-xs text-muted-foreground">
                {detail.cronbachAlpha === null ? (
                  t('competencyDetail.accordion.reliabilityMessages.insufficientData')
                ) : detail.cronbachAlpha >= 0.7 ? (
                  t('competencyDetail.accordion.reliabilityMessages.good')
                ) : detail.cronbachAlpha >= 0.6 ? (
                  t('competencyDetail.accordion.reliabilityMessages.acceptable')
                ) : (
                  t('competencyDetail.accordion.reliabilityMessages.low')
                )}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Threshold Comparison Section */}
        <AccordionItem value="thresholds" className="border-b">
          <AccordionTrigger className="py-4 px-4 min-h-[52px] hover:no-underline [&>svg]:size-4">
            <div className="flex items-center justify-between w-full pr-2">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-blue-500" aria-hidden="true" />
                <span className="text-sm font-medium">{t('competencyDetail.accordion.thresholdValues')}</span>
              </div>
              <ThresholdSummaryBadge
                cronbachAlpha={detail.cronbachAlpha}
                sampleSize={detail.sampleSize}
                itemCount={detail.itemCount}
              />
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <MetricComparisonList>
              <MetricComparisonRow
                label={t('competencyDetail.accordion.metrics.cronbachAlpha')}
                currentValue={detail.cronbachAlpha}
                threshold={{ min: 0.7, max: 1 }}
                format="decimal3"
                description={t('competencyDetail.accordion.thresholdDescriptions.alphaGood')}
              />
              <MetricComparisonRow
                label={t('competencyDetail.accordion.metrics.sampleSize')}
                currentValue={detail.sampleSize}
                threshold={{ min: 100, max: 10000 }}
                format="integer"
                description={t('competencyDetail.accordion.thresholdDescriptions.sampleMinimum')}
                showBar={false}
              />
              <MetricComparisonRow
                label={t('competencyDetail.accordion.metrics.itemCount')}
                currentValue={detail.itemCount}
                threshold={{ min: 3, max: 30 }}
                format="integer"
                description={t('competencyDetail.accordion.thresholdDescriptions.itemsOptimal')}
                showBar={false}
              />
            </MetricComparisonList>
          </AccordionContent>
        </AccordionItem>

        {/* Items Analysis Section */}
        {sortedAlphaIfDeleted.length > 0 && (
          <AccordionItem value="items-analysis" className="border-b-0">
            <AccordionTrigger className="py-4 px-4 min-h-[52px] hover:no-underline [&>svg]:size-4">
              <div className="flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-2">
                  {hasIssues ? (
                    <AlertTriangle className="size-4 text-amber-500" aria-hidden="true" />
                  ) : (
                    <TrendingUp className="size-4 text-emerald-500" aria-hidden="true" />
                  )}
                  <span className="text-sm font-medium">{t('competencyDetail.accordion.itemsAnalysis')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {problematicItems.length > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                    >
                      {t('competencyDetail.accordion.needAttention', { count: problematicItems.length })}
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <AlphaIfDeletedList
                entries={sortedAlphaIfDeleted}
                currentAlpha={detail.cronbachAlpha}
                showCard={false}
                initialDisplayCount={5}
              />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </Card>
  );
}

/**
 * Desktop layout - Full cards without accordion
 */
interface DesktopDetailLayoutProps {
  detail: CompetencyReliabilityDetail;
  className?: string;
}

function DesktopDetailLayout({ detail, className }: DesktopDetailLayoutProps) {
  const t = useTranslations('psychometrics');
  const alphaQuality = getAlphaQuality(detail.cronbachAlpha);
  const sortedAlphaIfDeleted = sortAlphaIfDeleted(detail.alphaIfDeleted);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Two-column grid for gauges */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alpha Gauge Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" aria-hidden="true" />
              {t('competencyDetail.accordion.metrics.cronbachAlpha')}
            </CardTitle>
            <CardDescription>{t('competencyDetail.accordion.internalConsistency')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            <AlphaGauge value={detail.cronbachAlpha} size="lg" />
          </CardContent>
        </Card>

        {/* Interpretation Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              {t('competencyDetail.accordion.interpretation')}
            </CardTitle>
            <CardDescription>{t('competencyDetail.accordion.reliabilityScale')}</CardDescription>
          </CardHeader>
          <CardContent>
            <AlphaInterpretationScale alpha={detail.cronbachAlpha} />
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">{t('competencyDetail.accordion.whatItMeansDesktop')}</h4>
              <p className="text-sm text-muted-foreground">
                {detail.cronbachAlpha === null ? (
                  t('competencyDetail.accordion.reliabilityMessages.insufficientDataDetailed')
                ) : detail.cronbachAlpha >= 0.7 ? (
                  t('competencyDetail.accordion.reliabilityMessages.goodDetailed')
                ) : detail.cronbachAlpha >= 0.6 ? (
                  t('competencyDetail.accordion.reliabilityMessages.acceptableDetailed')
                ) : (
                  t('competencyDetail.accordion.reliabilityMessages.lowDetailed')
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Comparison - Full width */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('competencyDetail.accordion.thresholdComparison')}</CardTitle>
          <CardDescription>
            {t('competencyDetail.accordion.thresholdComparisonDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetricComparisonList>
            <MetricComparisonRow
              label={t('competencyDetail.accordion.metrics.cronbachAlpha')}
              currentValue={detail.cronbachAlpha}
              threshold={{ min: 0.7, max: 1 }}
              format="decimal3"
              description={t('competencyDetail.accordion.thresholdDescriptions.alphaGoodDetailed')}
            />
            <MetricComparisonRow
              label={t('competencyDetail.accordion.metrics.sampleSize')}
              currentValue={detail.sampleSize}
              threshold={{ min: 100, max: 10000 }}
              format="integer"
              description={t('competencyDetail.accordion.thresholdDescriptions.sampleMinimumDetailed')}
              showBar={false}
            />
            <MetricComparisonRow
              label={t('competencyDetail.accordion.metrics.itemCount')}
              currentValue={detail.itemCount}
              threshold={{ min: 3, max: 30 }}
              format="integer"
              description={t('competencyDetail.accordion.thresholdDescriptions.itemsOptimalDetailed')}
              showBar={false}
            />
          </MetricComparisonList>
        </CardContent>
      </Card>

      {/* Alpha if Deleted Analysis - Uses shared component */}
      {sortedAlphaIfDeleted.length > 0 && (
        <AlphaIfDeletedList
          entries={sortedAlphaIfDeleted}
          currentAlpha={detail.cronbachAlpha}
          showCard={true}
        />
      )}
    </div>
  );
}

export default CompetencyDetailAccordion;
