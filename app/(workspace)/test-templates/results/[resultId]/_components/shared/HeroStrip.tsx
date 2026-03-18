'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Download, Share2, Clock, CheckCircle2,
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
  const styles = VARIANT_STYLES[statusVariant];
  const showScore = goal !== 'OVERVIEW' && overallPercentage != null;
  const scoreValue = overallPercentage ?? 0;

  // Build combined meta string: "O*NET: 15-1252.00 · Mar 15, 2026 · 42m · 78/80 questions"
  const metaParts: string[] = [];
  metadata?.forEach(item => metaParts.push(item.label));
  metaParts.push(formatDate(completedAt, locale));
  metaParts.push(formatDuration(totalTimeSeconds, locale));
  metaParts.push(`${questionsAnswered}/${totalQuestions} questions`);
  const metaLine = metaParts.join(' · ');

  return (
    <TooltipProvider>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">

        {/* ---- Mobile layout (<sm) ---- */}
        <div className="flex flex-col gap-2.5 p-4 sm:hidden">
          <div className="flex items-center gap-3 min-h-[44px]">
            {showScore && (
              <CircularScore percentage={scoreValue} variant={statusVariant} size="xs" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {showScore && (
                  <span className={cn('text-xl font-bold tabular-nums', styles.iconText)}>
                    {Math.round(scoreValue)}%
                  </span>
                )}
                {statusLabel && (
                  <Badge className={cn('text-[10px] text-white', styles.badgeBg)}>
                    {statusLabel}
                  </Badge>
                )}
                {goal === 'OVERVIEW' && percentile != null && (
                  <Badge className="text-[10px] text-white bg-violet-500 hover:bg-violet-600">
                    {percentile}th percentile
                  </Badge>
                )}
              </div>
              {showScore && percentile != null && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {percentile}th percentile
                </span>
              )}
            </div>
            <ActionIconGroup resultId={result?.id} />
          </div>
          <p className="text-[15px] font-semibold truncate">{templateName}</p>
          <p className="text-[11px] text-muted-foreground tabular-nums truncate">{metaLine}</p>
        </div>

        {/* ---- Desktop layout (sm+) ---- */}
        <div className="hidden sm:flex items-center gap-4 px-6 h-[72px] lg:px-8">
          {/* Score ring */}
          {showScore && (
            <CircularScore percentage={scoreValue} variant={statusVariant} size="xs" />
          )}

          {/* Score value + badge + percentile */}
          {showScore && (
            <div className="flex flex-col gap-1 shrink-0">
              <div className="flex items-center gap-2">
                <span className={cn('text-[22px] font-bold tabular-nums leading-none tracking-tight', styles.iconText)}>
                  {scoreValue.toFixed(1)}%
                </span>
                {statusLabel && (
                  <span className={cn(
                    'text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border',
                    statusVariant === 'success' && 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30',
                    statusVariant === 'warning' && 'bg-amber-500/12 text-amber-400 border-amber-500/30',
                    statusVariant === 'info' && 'bg-blue-500/12 text-blue-400 border-blue-500/30',
                    statusVariant === 'neutral' && 'bg-primary/12 text-primary border-primary/30',
                  )}>
                    {statusLabel}
                  </span>
                )}
              </div>
              {percentile != null && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {percentile}th percentile
                </span>
              )}
            </div>
          )}

          {/* OVERVIEW: no score, show percentile badge */}
          {goal === 'OVERVIEW' && percentile != null && (
            <Badge className="text-xs text-white bg-violet-500 hover:bg-violet-600 shrink-0">
              {percentile}th percentile
            </Badge>
          )}

          {/* Vertical divider */}
          {showScore && <div className="w-px h-9 bg-border shrink-0" aria-hidden="true" />}

          {/* Title + meta line */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <p className="text-[15px] font-semibold truncate leading-tight">{templateName}</p>
            <p className="text-[11px] text-muted-foreground tabular-nums truncate">{metaLine}</p>
          </div>

          {/* Action buttons */}
          <ActionIconGroup resultId={result?.id} />
        </div>
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// ActionIconGroup — compact icon-only buttons with tooltips and real handlers
// ============================================================================

function ActionIconGroup({ resultId }: { resultId?: string }) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  async function handleShare() {
    const shareUrl = resultId
      ? `${window.location.origin}/test-templates/results/${resultId}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard', { description: shareUrl, duration: 3000 });
    } catch {
      // Fallback
      const t = document.createElement('textarea');
      t.value = shareUrl; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); document.execCommand('copy');
      document.body.removeChild(t);
      toast.success('Link copied');
    }
  }

  return (
    <>
      <div className="flex items-center gap-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation" aria-label="Download PDF" onClick={() => setExportDialogOpen(true)}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Download</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation" aria-label="Share results" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Share</TooltipContent>
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
