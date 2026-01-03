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
import { ReliabilityStatusBadge } from '../../_components/ReliabilityStatusBadge';
import {
  BigFiveReliability,
  BigFiveTrait,
  ReliabilityStatus,
} from '@/types/psychometrics';
import { TRAIT_COLORS, getTraitKey } from './BigFiveTraitCard';
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
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface TraitDetailDrawerProps {
  reliability: BigFiveReliability | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Get recommendation icon and type based on reliability status
 */
function getRecommendationMeta(status: ReliabilityStatus) {
  switch (status) {
    case ReliabilityStatus.RELIABLE:
      return { type: 'success' as const, icon: CheckCircle2 };
    case ReliabilityStatus.ACCEPTABLE:
      return { type: 'warning' as const, icon: Lightbulb };
    case ReliabilityStatus.UNRELIABLE:
      return { type: 'error' as const, icon: AlertCircle };
    default:
      return { type: 'info' as const, icon: Info };
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
 * Get recommendation translation keys based on reliability status
 */
function getRecommendationKeys(status: ReliabilityStatus): {
  titleKey: string;
  descriptionKey: string;
} {
  switch (status) {
    case ReliabilityStatus.RELIABLE:
      return {
        titleKey: 'recommendations.excellentReliability',
        descriptionKey: 'recommendations.excellentDescription',
      };
    case ReliabilityStatus.ACCEPTABLE:
      return {
        titleKey: 'recommendations.improvementRecommended',
        descriptionKey: 'recommendations.improvementDescription',
      };
    case ReliabilityStatus.UNRELIABLE:
      return {
        titleKey: 'recommendations.needsAttention',
        descriptionKey: 'recommendations.needsAttentionDescription',
      };
    default:
      return {
        titleKey: 'recommendations.insufficientData',
        descriptionKey: 'recommendations.insufficientDataDescription',
      };
  }
}

/**
 * Bottom sheet drawer for detailed trait information on mobile.
 * Provides full context without navigating away from the page.
 */
export function TraitDetailDrawer({
  reliability,
  open,
  onOpenChange,
}: TraitDetailDrawerProps) {
  const t = useTranslations('psychometrics.bigFive');
  const locale = useLocale();

  if (!reliability) return null;

  const colors = TRAIT_COLORS[reliability.trait];
  const traitKey = getTraitKey(reliability.trait);
  const recommendationMeta = getRecommendationMeta(reliability.reliabilityStatus);
  const recommendationKeys = getRecommendationKeys(reliability.reliabilityStatus);
  const RecommendationIcon = recommendationMeta.icon;
  const traitLabel = t(`traits.${traitKey}.label`);

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
              {traitLabel}
            </DrawerTitle>
            <DrawerDescription>
              {t(`traits.${traitKey}.description`)}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-5">
            {/* Alpha Score - Hero display */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {t('drawer.cronbachAlpha')}
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
                  {t('stats.competencies')}
                </div>
              </div>
              <div className={cn('rounded-lg p-3 text-center', colors.lightBg)}>
                <FileText className={cn('h-4 w-4 mx-auto mb-1', colors.text)} />
                <div className={cn('text-lg font-semibold tabular-nums', colors.text)}>
                  {reliability.totalItems ?? '-'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {t('stats.items')}
                </div>
              </div>
              <div className={cn('rounded-lg p-3 text-center', colors.lightBg)}>
                <Users className={cn('h-4 w-4 mx-auto mb-1', colors.text)} />
                <div className={cn('text-lg font-semibold tabular-nums', colors.text)}>
                  {reliability.sampleSize?.toLocaleString(locale) ?? '-'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {t('stats.responses')}
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('drawer.interpretation')}
              </h4>
              <div className="grid gap-2">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {t('drawer.highScore')}
                    </span>
                  </div>
                  <p className="text-sm">{t(`traits.${traitKey}.highScore`)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingDown className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {t('drawer.lowScore')}
                    </span>
                  </div>
                  <p className="text-sm">{t(`traits.${traitKey}.lowScore`)}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="font-medium">{t('drawer.significance')}: </span>
                {t(`traits.${traitKey}.importance`)}
              </div>
            </div>

            {/* Recommendation */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('drawer.recommendation')}
              </h4>
              <div
                className={cn(
                  'rounded-lg border p-3',
                  recommendationStyles[recommendationMeta.type]
                )}
              >
                <div className="flex gap-3">
                  <RecommendationIcon
                    className={cn('h-5 w-5 shrink-0 mt-0.5', iconStyles[recommendationMeta.type])}
                  />
                  <div>
                    <div className="font-medium text-sm">{t(recommendationKeys.titleKey)}</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t(recommendationKeys.descriptionKey, { trait: traitLabel })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last calculated */}
            {reliability.lastCalculatedAt && (
              <div className="text-xs text-muted-foreground text-right pt-2 border-t">
                {t('drawer.lastCalculated')}:{' '}
                {new Date(reliability.lastCalculatedAt).toLocaleString(locale, {
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
                {t('drawer.close')}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
