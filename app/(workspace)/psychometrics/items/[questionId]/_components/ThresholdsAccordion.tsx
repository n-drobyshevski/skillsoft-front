'use client';

import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import {
  MetricComparisonRow,
  MetricComparisonList,
} from '../../../_components';
import { useTranslations } from 'next-intl';

interface ThresholdsAccordionProps {
  /** Difficulty index value */
  difficultyIndex: number | null | undefined;
  /** Discrimination index value */
  discriminationIndex: number | null | undefined;
  /** Response count */
  responseCount: number;
  /** Additional className */
  className?: string;
}

/**
 * Get status badge for threshold compliance
 */
function getComplianceStatus(
  difficultyIndex: number | null | undefined,
  discriminationIndex: number | null | undefined,
  responseCount: number,
  t: ReturnType<typeof useTranslations>
): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const issues: string[] = [];

  if (difficultyIndex != null) {
    if (difficultyIndex < 0.2 || difficultyIndex > 0.9) {
      issues.push('p');
    }
  }

  if (discriminationIndex != null) {
    if (discriminationIndex < 0.25) {
      issues.push('rpb');
    }
  }

  if (responseCount < 50) {
    issues.push('n');
  }

  if (issues.length === 0) {
    return { label: t('thresholds.allNormal'), variant: 'secondary' };
  } else if (issues.length === 1) {
    return { label: t('thresholds.oneWarning'), variant: 'outline' };
  } else {
    return { label: t('thresholds.multipleWarnings', { count: issues.length }), variant: 'destructive' };
  }
}

/**
 * ThresholdsAccordion - Threshold comparison section
 *
 * Mobile: Collapsible accordion with compliance badge
 * Desktop: Always-visible Card
 *
 * Shows current values vs recommended thresholds for key metrics.
 */
export function ThresholdsAccordion({
  difficultyIndex,
  discriminationIndex,
  responseCount,
  className,
}: ThresholdsAccordionProps) {
  const isMobile = useIsMobile();
  const t = useTranslations('psychometrics');
  const status = getComplianceStatus(difficultyIndex, discriminationIndex, responseCount, t);

  const content = (
    <MetricComparisonList>
      <MetricComparisonRow
        label={t('thresholds.difficultyIndex')}
        currentValue={difficultyIndex}
        threshold={{ min: 0.2, max: 0.9 }}
        description={t('thresholds.difficultyRange')}
      />
      <MetricComparisonRow
        label={t('thresholds.discriminationIndex')}
        currentValue={discriminationIndex}
        threshold={{ min: 0.25, max: 1 }}
        description={t('thresholds.discriminationRange')}
      />
      <MetricComparisonRow
        label={t('thresholds.responseCountLabel')}
        currentValue={responseCount}
        threshold={{ min: 50, max: 10000 }}
        format="integer"
        description={t('thresholds.responseCountRange')}
        showBar={false}
      />
    </MetricComparisonList>
  );

  // Desktop: Always-visible Card
  if (!isMobile) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('thresholds.title')}
            <Badge variant={status.variant} className="ml-auto">
              {status.label}
            </Badge>
          </CardTitle>
          <CardDescription>
            {t('thresholds.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  // Mobile: Collapsible accordion
  return (
    <Accordion
      type="single"
      collapsible
      className={cn('rounded-lg border bg-card', className)}
    >
      <AccordionItem value="thresholds" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <BarChart3 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-medium truncate">{t('thresholds.mobileTitle')}</span>
            <Badge variant={status.variant} className="ml-auto mr-2">
              {status.label}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <p className="text-sm text-muted-foreground mb-3">
            {t('thresholds.description')}
          </p>
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default ThresholdsAccordion;
