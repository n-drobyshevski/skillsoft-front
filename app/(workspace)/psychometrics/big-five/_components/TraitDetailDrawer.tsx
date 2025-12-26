'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
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
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
} from 'lucide-react';

interface TraitDetailDrawerProps {
  reliability: BigFiveReliability | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Get trait-specific interpretation guidelines
 */
function getTraitInterpretation(trait: BigFiveTrait): {
  highScore: string;
  lowScore: string;
  importance: string;
} {
  const interpretations: Record<BigFiveTrait, ReturnType<typeof getTraitInterpretation>> = {
    [BigFiveTrait.OPENNESS]: {
      highScore: 'Creativity, curiosity, openness to new experiences',
      lowScore: 'Practicality, preference for routine and tradition',
      importance: 'Important for roles requiring innovation and creative thinking',
    },
    [BigFiveTrait.CONSCIENTIOUSNESS]: {
      highScore: 'Organization, reliability, goal-orientation',
      lowScore: 'Flexibility, spontaneity, less structured approach',
      importance: 'Key predictor of performance across most positions',
    },
    [BigFiveTrait.EXTRAVERSION]: {
      highScore: 'Energy, sociability, assertiveness',
      lowScore: 'Reserved, preference for individual work',
      importance: 'Critical for high social interaction roles',
    },
    [BigFiveTrait.AGREEABLENESS]: {
      highScore: 'Cooperation, empathy, willingness to help',
      lowScore: 'Independence, competitiveness, directness',
      importance: 'Important for teamwork and customer service',
    },
    [BigFiveTrait.EMOTIONAL_STABILITY]: {
      highScore: 'Calmness, stress resilience, emotional control',
      lowScore: 'Emotional reactivity, sensitivity to stress',
      importance: 'Critical for high-stress, high-responsibility positions',
    },
  };

  return interpretations[trait];
}

/**
 * Get status-specific recommendation
 */
function getRecommendation(status: ReliabilityStatus, traitLabel: string) {
  switch (status) {
    case ReliabilityStatus.RELIABLE:
      return {
        type: 'success' as const,
        icon: CheckCircle2,
        title: 'Excellent Reliability',
        description: `The "${traitLabel}" scale demonstrates high internal consistency. Measurement results are stable and reproducible.`,
      };
    case ReliabilityStatus.ACCEPTABLE:
      return {
        type: 'warning' as const,
        icon: Lightbulb,
        title: 'Room for Improvement',
        description: `Reliability is acceptable, but consider adding questions or reviewing existing ones to improve measurement accuracy for "${traitLabel}".`,
      };
    case ReliabilityStatus.UNRELIABLE:
      return {
        type: 'error' as const,
        icon: AlertCircle,
        title: 'Needs Attention',
        description: `Low reliability for "${traitLabel}". Review questions and remove those that lower consistency.`,
      };
    default:
      return {
        type: 'info' as const,
        icon: Info,
        title: 'Insufficient Data',
        description: `More responses are needed to calculate reliability for "${traitLabel}". Continue data collection.`,
      };
  }
}

const recommendationStyles = {
  success: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
  warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  error: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
};

const iconStyles = {
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

/**
 * Bottom sheet drawer for detailed trait information on mobile.
 * Provides full context without navigating away from the page.
 */
export function TraitDetailDrawer({
  reliability,
  open,
  onOpenChange,
}: TraitDetailDrawerProps) {
  if (!reliability) return null;

  const colors = TRAIT_COLORS[reliability.trait];
  const traitInfo = BigFiveTraitDisplay[reliability.trait];
  const interpretation = getTraitInterpretation(reliability.trait);
  const recommendation = getRecommendation(reliability.reliabilityStatus, traitInfo.label);
  const RecommendationIcon = recommendation.icon;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="overflow-y-auto">
          <DrawerHeader className="text-left">
            {/* Colored accent bar */}
            <div
              className="w-16 h-1.5 rounded-full mb-4"
              style={{ backgroundColor: colors.accent }}
            />
            <DrawerTitle className={cn('text-xl', colors.text)}>
              {traitInfo.label}
            </DrawerTitle>
            <DrawerDescription>
              {traitInfo.description}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-5">
            {/* Alpha Score - Hero display */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Cronbach's Alpha
                </div>
                <div
                  className="text-4xl font-bold tabular-nums"
                  style={{ color: colors.accent }}
                >
                  {reliability.cronbachAlpha?.toFixed(2) ?? '-'}
                </div>
              </div>
              <ReliabilityStatusBadge
                status={reliability.reliabilityStatus}
                showIcon={true}
                className="text-sm"
              />
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className={cn('rounded-lg p-3 text-center', colors.lightBg)}>
                <BarChart3 className={cn('h-4 w-4 mx-auto mb-1', colors.text)} />
                <div className={cn('text-lg font-semibold tabular-nums', colors.text)}>
                  {reliability.contributingCompetencies ?? '-'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Competencies
                </div>
              </div>
              <div className={cn('rounded-lg p-3 text-center', colors.lightBg)}>
                <FileText className={cn('h-4 w-4 mx-auto mb-1', colors.text)} />
                <div className={cn('text-lg font-semibold tabular-nums', colors.text)}>
                  {reliability.totalItems ?? '-'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Items
                </div>
              </div>
              <div className={cn('rounded-lg p-3 text-center', colors.lightBg)}>
                <Users className={cn('h-4 w-4 mx-auto mb-1', colors.text)} />
                <div className={cn('text-lg font-semibold tabular-nums', colors.text)}>
                  {reliability.sampleSize?.toLocaleString() ?? '-'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Responses
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Interpretation
              </h4>
              <div className="grid gap-2">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      High Score
                    </span>
                  </div>
                  <p className="text-sm">{interpretation.highScore}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingDown className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Low Score
                    </span>
                  </div>
                  <p className="text-sm">{interpretation.lowScore}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="font-medium">Significance: </span>
                {interpretation.importance}
              </div>
            </div>

            {/* Recommendation */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Recommendation
              </h4>
              <div
                className={cn(
                  'rounded-lg border p-3',
                  recommendationStyles[recommendation.type]
                )}
              >
                <div className="flex gap-3">
                  <RecommendationIcon
                    className={cn('h-5 w-5 shrink-0 mt-0.5', iconStyles[recommendation.type])}
                  />
                  <div>
                    <div className="font-medium text-sm">{recommendation.title}</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last calculated */}
            {reliability.lastCalculatedAt && (
              <div className="text-xs text-muted-foreground text-right pt-2 border-t">
                Last calculated:{' '}
                {new Date(reliability.lastCalculatedAt).toLocaleString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>

          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
