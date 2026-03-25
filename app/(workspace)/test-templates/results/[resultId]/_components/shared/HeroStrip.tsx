'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Download, Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CircularScore, formatDuration, formatDate, VARIANT_STYLES } from './hero-utils';
import { ExportDialog } from '@/components/results/ExportDialog';
import type { HeroStripProps } from './types';

export function HeroStrip({
  goal, templateName, completedAt, totalTimeSeconds,
  questionsAnswered, totalQuestions, overallPercentage,
  percentile, statusLabel, statusVariant, metadata,
  result, template, actions,
}: HeroStripProps) {
  const locale = useLocale();
  const t = useTranslations('results.shared.hero');
  const styles = VARIANT_STYLES[statusVariant];
  const showScore = goal !== 'OVERVIEW' && overallPercentage != null;
  const scoreValue = overallPercentage ?? 0;

  // Individual meta items for tooltip-wrapped rendering
  const metaItems: { text: string; tooltip: string }[] = [];
  metadata?.forEach(item => metaItems.push({ text: item.label, tooltip: item.label }));
  metaItems.push({ text: formatDate(completedAt, locale), tooltip: t('dateTooltip') });
  metaItems.push({ text: formatDuration(totalTimeSeconds, locale), tooltip: t('durationTooltip') });
  metaItems.push({
    text: t('questionsLabel', { answered: questionsAnswered, total: totalQuestions }),
    tooltip: t('questionsTooltip'),
  });

  return (
    <TooltipProvider>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">

        {/* ---- Mobile layout (<sm) ---- */}
        <div className="flex flex-col gap-2.5 p-4 sm:hidden">
          <div className="flex items-center gap-3 min-h-[44px]">
            {showScore && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div><CircularScore percentage={scoreValue} variant={statusVariant} size="xs" /></div>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t('scoreTooltip')}</TooltipContent>
              </Tooltip>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {showScore && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn('text-xl font-bold tabular-nums cursor-default', styles.iconText)}>
                        {Math.round(scoreValue)}%
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{t('scoreTooltip')}</TooltipContent>
                  </Tooltip>
                )}
                {statusLabel && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span><Badge className={cn('text-[10px] text-white', styles.badgeBg)}>{statusLabel}</Badge></span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{t('statusTooltip')}</TooltipContent>
                  </Tooltip>
                )}
                {goal === 'OVERVIEW' && percentile != null && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span><Badge className="text-[10px] text-white bg-violet-500 hover:bg-violet-600">{t('percentile', { value: percentile })}</Badge></span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{t('percentileTooltip')}</TooltipContent>
                  </Tooltip>
                )}
              </div>
              {showScore && percentile != null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[11px] text-muted-foreground tabular-nums cursor-default">
                      {t('percentile', { value: percentile })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{t('percentileTooltip')}</TooltipContent>
                </Tooltip>
              )}
            </div>
            <ActionIconGroup resultId={result?.id} />
          </div>
          <p className="text-[15px] font-semibold truncate">{templateName}</p>
          <MetaLine items={metaItems} />
        </div>

        {/* ---- Desktop layout (sm+) ---- */}
        <div className="hidden sm:flex items-center gap-4 px-6 h-[72px] lg:px-8">
          {/* Score ring */}
          {showScore && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div><CircularScore percentage={scoreValue} variant={statusVariant} size="xs" /></div>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t('scoreTooltip')}</TooltipContent>
            </Tooltip>
          )}

          {/* Score value + badge + percentile */}
          {showScore && (
            <div className="flex flex-col gap-1 shrink-0">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn('text-[22px] font-bold tabular-nums leading-none tracking-tight cursor-default', styles.iconText)}>
                      {scoreValue.toFixed(1)}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{t('scoreTooltip')}</TooltipContent>
                </Tooltip>
                {statusLabel && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn(
                        'text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border cursor-default',
                        statusVariant === 'success' && 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30',
                        statusVariant === 'warning' && 'bg-amber-500/12 text-amber-400 border-amber-500/30',
                        statusVariant === 'info' && 'bg-blue-500/12 text-blue-400 border-blue-500/30',
                        statusVariant === 'neutral' && 'bg-primary/12 text-primary border-primary/30',
                      )}>
                        {statusLabel}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{t('statusTooltip')}</TooltipContent>
                  </Tooltip>
                )}
              </div>
              {percentile != null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[11px] text-muted-foreground tabular-nums cursor-default">
                      {t('percentile', { value: percentile })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{t('percentileTooltip')}</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* OVERVIEW: no score, show percentile badge */}
          {goal === 'OVERVIEW' && percentile != null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Badge className="text-xs text-white bg-violet-500 hover:bg-violet-600 shrink-0">{t('percentile', { value: percentile })}</Badge></span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t('percentileTooltip')}</TooltipContent>
            </Tooltip>
          )}

          {/* Vertical divider */}
          {showScore && <div className="w-px h-9 bg-border shrink-0" aria-hidden="true" />}

          {/* Title + meta line */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <p className="text-[15px] font-semibold truncate leading-tight">{templateName}</p>
            <MetaLine items={metaItems} />
          </div>

          {/* Action buttons */}
          <ActionIconGroup resultId={result?.id} />
        </div>
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// MetaLine — renders individual meta items with tooltips separated by ·
// ============================================================================

function MetaLine({ items }: { items: { text: string; tooltip: string }[] }) {
  return (
    <p className="text-[11px] text-muted-foreground tabular-nums truncate flex items-center gap-0">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          {i > 0 && <span className="mx-1 opacity-50" aria-hidden="true">·</span>}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default hover:text-foreground transition-colors">{item.text}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[240px]">{item.tooltip}</TooltipContent>
          </Tooltip>
        </span>
      ))}
    </p>
  );
}

// ============================================================================
// ActionIconGroup — compact icon-only buttons with tooltips and real handlers
// ============================================================================

function ActionIconGroup({ resultId }: { resultId?: string }) {
  const t = useTranslations('results.shared.hero');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  async function handleShare() {
    const shareUrl = resultId
      ? `${window.location.origin}/test-templates/results/${resultId}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('linkCopied'), { description: shareUrl, duration: 3000 });
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = shareUrl; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select(); document.execCommand('copy');
      document.body.removeChild(el);
      toast.success(t('linkCopiedShort'));
    }
  }

  return (
    <>
      <div className="flex items-center gap-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation" aria-label={t('downloadPdf')} onClick={() => setExportDialogOpen(true)}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('download')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation" aria-label={t('shareResults')} onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('share')}</TooltipContent>
        </Tooltip>
      </div>
      {resultId && (
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          resultId={resultId}
        />
      )}
    </>
  );
}
