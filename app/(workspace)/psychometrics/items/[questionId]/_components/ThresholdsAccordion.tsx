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
  responseCount: number
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
    return { label: 'Все в норме', variant: 'secondary' };
  } else if (issues.length === 1) {
    return { label: '1 предупреждение', variant: 'outline' };
  } else {
    return { label: `${issues.length} предупреждения`, variant: 'destructive' };
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
  const status = getComplianceStatus(difficultyIndex, discriminationIndex, responseCount);

  const content = (
    <MetricComparisonList>
      <MetricComparisonRow
        label="Индекс сложности (p)"
        currentValue={difficultyIndex}
        threshold={{ min: 0.2, max: 0.9 }}
        description="Оптимальный диапазон: 0.2 - 0.9"
      />
      <MetricComparisonRow
        label="Индекс различения (rpb)"
        currentValue={discriminationIndex}
        threshold={{ min: 0.25, max: 1 }}
        description="Хорошее значение: >= 0.25, отличное: >= 0.35"
      />
      <MetricComparisonRow
        label="Количество ответов"
        currentValue={responseCount}
        threshold={{ min: 50, max: 10000 }}
        format="integer"
        description="Минимум 50 ответов для надежной статистики"
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
            Сравнение с пороговыми значениями
            <Badge variant={status.variant} className="ml-auto">
              {status.label}
            </Badge>
          </CardTitle>
          <CardDescription>
            Текущие показатели относительно рекомендуемых диапазонов
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
            <span className="font-medium truncate">Пороговые значения</span>
            <Badge variant={status.variant} className="ml-auto mr-2">
              {status.label}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Текущие показатели относительно рекомендуемых диапазонов
          </p>
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default ThresholdsAccordion;
