'use client';

import { useEffect, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReliabilityStatusBadge } from '../../_components/ReliabilityStatusBadge';
import {
  BigFiveReliability,
  BigFiveTrait,
  ReliabilityStatus,
} from '@/types/psychometrics';
import { TRAIT_COLORS } from './BigFiveTraitCard';
import { cn } from '@/lib/utils';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useAccordionState } from '@/stores/useBigFivePageStore';
import { useLocale, useTranslations } from 'next-intl';

/**
 * Maps BigFiveTrait enum to translation key suffix
 */
const TRAIT_KEYS: Record<BigFiveTrait, string> = {
  [BigFiveTrait.OPENNESS]: 'openness',
  [BigFiveTrait.CONSCIENTIOUSNESS]: 'conscientiousness',
  [BigFiveTrait.EXTRAVERSION]: 'extraversion',
  [BigFiveTrait.AGREEABLENESS]: 'agreeableness',
  [BigFiveTrait.EMOTIONAL_STABILITY]: 'emotionalStability',
};

interface TraitDetailAccordionProps {
  reliabilityData: BigFiveReliability[];
  className?: string;
}

type TranslationFunction = ReturnType<typeof useTranslations<'psychometrics.bigFivePage'>>;

/**
 * Trait-specific recommendations based on reliability status
 */
function getRecommendations(
  trait: BigFiveTrait,
  status: ReliabilityStatus,
  alpha: number | null,
  t: TranslationFunction
): {
  type: 'success' | 'warning' | 'error' | 'info';
  icon: typeof CheckCircle2;
  title: string;
  description: string;
}[] {
  const traitKey = TRAIT_KEYS[trait];
  const traitLabel = t(`traits.${traitKey}.label` as Parameters<TranslationFunction>[0]);
  const recommendations: ReturnType<typeof getRecommendations> = [];

  if (status === ReliabilityStatus.RELIABLE) {
    recommendations.push({
      type: 'success',
      icon: CheckCircle2,
      title: t('recommendations.excellentReliability'),
      description: t('recommendations.excellentDescription', { trait: traitLabel }),
    });
  } else if (status === ReliabilityStatus.ACCEPTABLE) {
    recommendations.push({
      type: 'warning',
      icon: TrendingUp,
      title: t('recommendations.improvementRecommended'),
      description: t('recommendations.improvementDescription', { trait: traitLabel }),
    });
  } else if (status === ReliabilityStatus.UNRELIABLE) {
    recommendations.push({
      type: 'error',
      icon: AlertCircle,
      title: t('recommendations.needsAttention'),
      description: t('recommendations.needsAttentionDescription', { trait: traitLabel }),
    });
    recommendations.push({
      type: 'info',
      icon: Lightbulb,
      title: t('recommendations.actionRecommendation'),
      description: t('recommendations.actionDescription'),
    });
  } else {
    recommendations.push({
      type: 'info',
      icon: Info,
      title: t('recommendations.insufficientData'),
      description: t('recommendations.insufficientDataDescription', { trait: traitLabel }),
    });
  }

  // Add improvement suggestion if alpha is borderline
  if (alpha !== null && alpha >= 0.6 && alpha < 0.7) {
    recommendations.push({
      type: 'warning',
      icon: TrendingUp,
      title: t('recommendations.nearThreshold'),
      description: t('recommendations.nearThresholdDescription'),
    });
  }

  return recommendations;
}

/**
 * Get trait-specific description and interpretation guidelines using translations
 */
function getTraitInterpretation(
  trait: BigFiveTrait,
  t: TranslationFunction
): {
  highScore: string;
  lowScore: string;
  importance: string;
} {
  const traitKey = TRAIT_KEYS[trait];
  return {
    highScore: t(`traits.${traitKey}.highScore` as Parameters<TranslationFunction>[0]),
    lowScore: t(`traits.${traitKey}.lowScore` as Parameters<TranslationFunction>[0]),
    importance: t(`traits.${traitKey}.importance` as Parameters<TranslationFunction>[0]),
  };
}

const recommendationStyles = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
  },
};

/**
 * Expandable accordion section for each Big Five trait
 * showing detailed descriptions, statistics, and recommendations.
 *
 * Features:
 * - Auto-expands traits with UNRELIABLE or ACCEPTABLE status on mount
 * - State persisted via Zustand store (sessionStorage)
 * - Supports multiple expanded items simultaneously
 */
export function TraitDetailAccordion({ reliabilityData, className }: TraitDetailAccordionProps) {
  const hasAutoExpandedRef = useRef(false);
  const t = useTranslations('psychometrics.bigFivePage');
  const locale = useLocale();

  // Use Zustand store for accordion state
  const { expandedItems, toggle, expandProblematic } = useAccordionState();

  // Sort by trait order for consistent display
  const sortedData = [...reliabilityData].sort((a, b) => {
    const order = [
      BigFiveTrait.OPENNESS,
      BigFiveTrait.CONSCIENTIOUSNESS,
      BigFiveTrait.EXTRAVERSION,
      BigFiveTrait.AGREEABLENESS,
      BigFiveTrait.EMOTIONAL_STABILITY,
    ];
    return order.indexOf(a.trait) - order.indexOf(b.trait);
  });

  // Auto-expand problematic traits on initial mount
  useEffect(() => {
    // Only auto-expand once per session, and only if no items are already expanded
    if (hasAutoExpandedRef.current || expandedItems.length > 0) return;

    const traitStatuses = reliabilityData.map((r) => ({
      trait: r.trait,
      status: r.reliabilityStatus,
    }));

    expandProblematic(traitStatuses);
    hasAutoExpandedRef.current = true;
  }, [reliabilityData, expandProblematic, expandedItems.length]);

  // Handle accordion value changes (toggle)
  const handleValueChange = (values: string[]) => {
    // Find the difference to determine which item was toggled
    const currentSet = new Set(expandedItems);
    const newSet = new Set(values);

    // Find newly added items
    for (const trait of values) {
      if (!currentSet.has(trait as BigFiveTrait)) {
        toggle(trait as BigFiveTrait);
        return;
      }
    }

    // Find removed items
    for (const trait of expandedItems) {
      if (!newSet.has(trait)) {
        toggle(trait);
        return;
      }
    }
  };

  /**
   * Format date using locale-aware formatting
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t('accordion.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion
          type="multiple"
          value={expandedItems}
          onValueChange={handleValueChange}
          className="w-full"
        >
          {sortedData.map((reliability) => {
            const colors = TRAIT_COLORS[reliability.trait];
            const traitKey = TRAIT_KEYS[reliability.trait];
            const interpretation = getTraitInterpretation(reliability.trait, t);
            const recommendations = getRecommendations(
              reliability.trait,
              reliability.reliabilityStatus,
              reliability.cronbachAlpha,
              t
            );

            return (
              <AccordionItem
                key={reliability.id}
                value={reliability.trait}
                className={cn('border rounded-lg mb-2 last:mb-0', colors.border)}
              >
                <AccordionTrigger className="px-4 min-h-[52px] hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: colors.accent }}
                    />
                    <span className={cn('font-medium', colors.text)}>
                      {t(`traits.${traitKey}.label` as Parameters<TranslationFunction>[0])}
                    </span>
                    <div className="flex items-center gap-2 ml-auto mr-4">
                      <Badge variant="outline" className="font-mono">
                        {reliability.cronbachAlpha?.toFixed(2) ?? '-'}
                      </Badge>
                      <ReliabilityStatusBadge status={reliability.reliabilityStatus} />
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4">
                  <div className="space-y-4 pt-2">
                    {/* Description */}
                    <div className={cn('rounded-lg p-3', colors.bg)}>
                      <p className="text-sm">
                        {t(`traits.${traitKey}.description` as Parameters<TranslationFunction>[0])}
                      </p>
                    </div>

                    {/* Interpretation Grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {t('accordion.highScore')}
                          </span>
                        </div>
                        <p className="text-sm">{interpretation.highScore}</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {t('accordion.lowScore')}
                          </span>
                        </div>
                        <p className="text-sm">{interpretation.lowScore}</p>
                      </div>
                    </div>

                    {/* Importance note */}
                    <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                      <span className="font-medium">{t('accordion.importance')} </span>
                      {interpretation.importance}
                    </div>

                    {/* Statistics - 2x2 on mobile, 4 columns on desktop */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2 text-center">
                      <div className="rounded-lg border p-3 sm:p-2">
                        <div className="text-xl sm:text-lg font-bold tabular-nums">
                          {reliability.cronbachAlpha?.toFixed(2) ?? '-'}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{t('accordion.alpha')}</div>
                      </div>
                      <div className="rounded-lg border p-3 sm:p-2">
                        <div className="text-xl sm:text-lg font-bold tabular-nums">
                          {reliability.contributingCompetencies ?? '-'}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{t('accordion.competencies')}</div>
                      </div>
                      <div className="rounded-lg border p-3 sm:p-2">
                        <div className="text-xl sm:text-lg font-bold tabular-nums">
                          {reliability.totalItems ?? '-'}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{t('accordion.items')}</div>
                      </div>
                      <div className="rounded-lg border p-3 sm:p-2">
                        <div className="text-xl sm:text-lg font-bold tabular-nums">
                          {reliability.sampleSize?.toLocaleString() ?? '-'}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{t('accordion.responses')}</div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('accordion.recommendations')}
                      </h4>
                      {recommendations.map((rec, index) => {
                        const styles = recommendationStyles[rec.type];
                        const Icon = rec.icon;

                        return (
                          <div
                            key={index}
                            className={cn(
                              'rounded-lg border p-3',
                              styles.bg,
                              styles.border
                            )}
                          >
                            <div className="flex gap-3">
                              <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', styles.icon)} />
                              <div>
                                <div className="font-medium text-sm">{rec.title}</div>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {rec.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Last calculated info */}
                    {reliability.lastCalculatedAt && (
                      <div className="text-xs text-muted-foreground text-right">
                        {t('accordion.calculated')}{' '}
                        {formatDate(reliability.lastCalculatedAt)}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
