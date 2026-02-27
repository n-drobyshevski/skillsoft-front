import { Clock, Target, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TemplateCardData } from '@/types/domain';
import { cn } from '@/lib/utils';

interface TemplateStatsProps {
  template: Pick<TemplateCardData, 'competencyCount' | 'timeLimitMinutes' | 'passingScore'>;
  /** 'pills' renders chip-style stats, 'inline' renders compact inline stats */
  variant?: 'pills' | 'inline';
  className?: string;
}

/**
 * Format duration — compact for inline variant, full for pills.
 */
function formatDuration(minutes: number, compact: boolean): string {
  if (minutes < 60) {
    return compact ? `${minutes}m` : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (compact) {
    return mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${hours}h`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * TemplateStats - Shared stats row for template cards.
 *
 * Extracted from duplicated markup in SharedTemplatesGrid and TestTemplateCard.
 */
export function TemplateStats({ template, variant = 'pills', className }: TemplateStatsProps) {
  const t = useTranslations('template');

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-4 text-xs text-muted-foreground tabular-nums', className)}>
        <span className="flex items-center gap-1">
          <Target className="h-3 w-3 shrink-0" aria-hidden="true" />
          {template.competencyCount} competencies
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          {template.timeLimitMinutes} min
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5 tabular-nums', className)} aria-label={t('testConfiguration')}>
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
        {formatDuration(template.timeLimitMinutes, false)}
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
        <Target className="h-3 w-3 shrink-0" aria-hidden="true" />
        {template.passingScore}%
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
        <BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
        {template.competencyCount} {t('skills')}
      </span>
    </div>
  );
}
