'use client';

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
  BigFiveTraitDisplay,
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

interface TraitDetailAccordionProps {
  reliabilityData: BigFiveReliability[];
  className?: string;
}

/**
 * Trait-specific recommendations based on reliability status
 */
function getRecommendations(
  trait: BigFiveTrait,
  status: ReliabilityStatus,
  alpha: number | null
): {
  type: 'success' | 'warning' | 'error' | 'info';
  icon: typeof CheckCircle2;
  title: string;
  description: string;
}[] {
  const traitLabel = BigFiveTraitDisplay[trait].label;
  const recommendations: ReturnType<typeof getRecommendations> = [];

  if (status === ReliabilityStatus.RELIABLE) {
    recommendations.push({
      type: 'success',
      icon: CheckCircle2,
      title: 'Отличная надежность',
      description: `Шкала "${traitLabel}" демонстрирует высокую внутреннюю согласованность. Результаты измерений стабильны и воспроизводимы.`,
    });
  } else if (status === ReliabilityStatus.ACCEPTABLE) {
    recommendations.push({
      type: 'warning',
      icon: TrendingUp,
      title: 'Рекомендуется улучшение',
      description: `Надежность приемлема, но рекомендуется добавить дополнительные вопросы или пересмотреть существующие для повышения точности измерения "${traitLabel}".`,
    });
  } else if (status === ReliabilityStatus.UNRELIABLE) {
    recommendations.push({
      type: 'error',
      icon: AlertCircle,
      title: 'Требуется внимание',
      description: `Низкая надежность шкалы "${traitLabel}". Необходимо провести анализ вопросов и удалить те, которые снижают согласованность.`,
    });
    recommendations.push({
      type: 'info',
      icon: Lightbulb,
      title: 'Рекомендация',
      description: 'Проверьте корреляцию каждого вопроса с общим баллом шкалы. Удалите вопросы с отрицательной или слабой корреляцией.',
    });
  } else {
    recommendations.push({
      type: 'info',
      icon: Info,
      title: 'Недостаточно данных',
      description: `Для расчета надежности шкалы "${traitLabel}" требуется больше ответов. Продолжайте сбор данных.`,
    });
  }

  // Add improvement suggestion if alpha is borderline
  if (alpha !== null && alpha >= 0.6 && alpha < 0.7) {
    recommendations.push({
      type: 'warning',
      icon: TrendingUp,
      title: 'Близко к порогу',
      description: 'Alpha находится на границе приемлемого уровня. Небольшие улучшения могут перевести шкалу в категорию "Надежная".',
    });
  }

  return recommendations;
}

/**
 * Get trait-specific description and interpretation guidelines
 */
function getTraitInterpretation(trait: BigFiveTrait): {
  highScore: string;
  lowScore: string;
  importance: string;
} {
  const interpretations: Record<BigFiveTrait, ReturnType<typeof getTraitInterpretation>> = {
    [BigFiveTrait.OPENNESS]: {
      highScore: 'Креативность, любознательность, готовность к новому опыту',
      lowScore: 'Практичность, традиционность, предпочтение проверенных методов',
      importance: 'Важно для ролей, требующих инноваций и творческого мышления',
    },
    [BigFiveTrait.CONSCIENTIOUSNESS]: {
      highScore: 'Организованность, надежность, целеустремленность',
      lowScore: 'Гибкость, спонтанность, менее структурированный подход',
      importance: 'Ключевой предиктор эффективности на большинстве позиций',
    },
    [BigFiveTrait.EXTRAVERSION]: {
      highScore: 'Энергичность, общительность, уверенность в социальных ситуациях',
      lowScore: 'Сдержанность, предпочтение индивидуальной работы',
      importance: 'Критично для позиций с высоким уровнем социального взаимодействия',
    },
    [BigFiveTrait.AGREEABLENESS]: {
      highScore: 'Сотрудничество, эмпатия, готовность помочь',
      lowScore: 'Независимость, конкурентность, прямолинейность',
      importance: 'Важно для командной работы и позиций обслуживания клиентов',
    },
    [BigFiveTrait.EMOTIONAL_STABILITY]: {
      highScore: 'Спокойствие, стрессоустойчивость, эмоциональный контроль',
      lowScore: 'Эмоциональная реактивность, чувствительность к стрессу',
      importance: 'Критично для позиций с высоким уровнем стресса и ответственности',
    },
  };

  return interpretations[trait];
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
 * showing detailed descriptions, statistics, and recommendations
 */
export function TraitDetailAccordion({ reliabilityData, className }: TraitDetailAccordionProps) {
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

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Детальный анализ черт
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          {sortedData.map((reliability) => {
            const colors = TRAIT_COLORS[reliability.trait];
            const traitInfo = BigFiveTraitDisplay[reliability.trait];
            const interpretation = getTraitInterpretation(reliability.trait);
            const recommendations = getRecommendations(
              reliability.trait,
              reliability.reliabilityStatus,
              reliability.cronbachAlpha
            );

            return (
              <AccordionItem
                key={reliability.id}
                value={reliability.trait}
                className={cn('border rounded-lg mb-2 last:mb-0', colors.border)}
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: colors.accent }}
                    />
                    <span className={cn('font-medium', colors.text)}>
                      {traitInfo.label}
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
                      <p className="text-sm">{traitInfo.description}</p>
                    </div>

                    {/* Interpretation Grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Высокий балл
                          </span>
                        </div>
                        <p className="text-sm">{interpretation.highScore}</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Низкий балл
                          </span>
                        </div>
                        <p className="text-sm">{interpretation.lowScore}</p>
                      </div>
                    </div>

                    {/* Importance note */}
                    <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                      <span className="font-medium">Значимость: </span>
                      {interpretation.importance}
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-lg border p-2">
                        <div className="text-lg font-bold tabular-nums">
                          {reliability.cronbachAlpha?.toFixed(2) ?? '-'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Alpha</div>
                      </div>
                      <div className="rounded-lg border p-2">
                        <div className="text-lg font-bold tabular-nums">
                          {reliability.contributingCompetencies ?? '-'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Компетенций</div>
                      </div>
                      <div className="rounded-lg border p-2">
                        <div className="text-lg font-bold tabular-nums">
                          {reliability.totalItems ?? '-'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Вопросов</div>
                      </div>
                      <div className="rounded-lg border p-2">
                        <div className="text-lg font-bold tabular-nums">
                          {reliability.sampleSize?.toLocaleString() ?? '-'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Ответов</div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Рекомендации
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
                        Рассчитано:{' '}
                        {new Date(reliability.lastCalculatedAt).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
