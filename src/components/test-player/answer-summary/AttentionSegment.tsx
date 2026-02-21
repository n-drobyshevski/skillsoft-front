'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, SkipForward, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AnswerSummaryItem, QuestionStatus } from '@/store/review-store';

interface AttentionSegmentProps {
  items: AnswerSummaryItem[];
  onEditAnswer: (questionId: string, questionIndex: number) => void;
}

/** Status styling for attention items */
const ATTENTION_STYLES: Record<
  Extract<QuestionStatus, 'skipped' | 'flagged'>,
  { icon: typeof SkipForward; color: string; bgColor: string; borderColor: string }
> = {
  skipped: {
    icon: SkipForward,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  flagged: {
    icon: Flag,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
};

/**
 * AttentionSegment - Section showing skipped + flagged questions.
 *
 * Always visible when attention items exist. Each card has a CTA button
 * with 44px min touch target for mobile accessibility.
 */
export function AttentionSegment({ items, onEditAnswer }: AttentionSegmentProps) {
  const t = useTranslations('assessment');

  if (items.length === 0) return null;

  const skippedCount = items.filter(i => i.status === 'skipped').length;
  const flaggedCount = items.filter(i => i.status === 'flagged').length;

  return (
    <section aria-label={t('answerSummary.needsAttentionLabel')}>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-1.5 rounded-md bg-amber-500/15">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            {t('answerSummary.needsAttention')}
          </h3>
          <p className="text-xs text-neutral-500">
            {skippedCount > 0 && t('answerSummary.skippedStat', { count: skippedCount })}
            {skippedCount > 0 && flaggedCount > 0 && ' · '}
            {flaggedCount > 0 && t('answerSummary.flaggedStat', { count: flaggedCount })}
          </p>
        </div>
      </div>

      {/* Attention cards */}
      <div className="space-y-2">
        {items.map(item => (
          <AttentionCard
            key={item.questionId}
            item={item}
            onEdit={() => onEditAnswer(item.questionId, item.questionIndex)}
          />
        ))}
      </div>
    </section>
  );
}

interface AttentionCardProps {
  item: AnswerSummaryItem;
  onEdit: () => void;
}

function getAttentionStyle(status: 'skipped' | 'flagged') {
  if (status === 'flagged') return ATTENTION_STYLES.flagged;
  return ATTENTION_STYLES.skipped;
}

function AttentionCard({ item, onEdit }: AttentionCardProps) {
  const t = useTranslations('assessment');
  const status = item.status as 'skipped' | 'flagged';
  const styles = getAttentionStyle(status);
  const Icon = styles.icon;

  const ctaLabel = status === 'skipped'
    ? t('answerSummary.answerThisQuestion')
    : t('answerSummary.reviewThisQuestion');

  return (
    <div
      className={cn(
        'rounded-lg border p-3 sm:p-4 transition-colors',
        styles.bgColor,
        styles.borderColor,
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status icon + number */}
        <div className={cn('shrink-0 mt-0.5', styles.color)}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-neutral-500">
              {t('answerSummary.questionLabel', { number: item.questionIndex + 1 })}
            </span>
          </div>
          <p className="text-sm text-neutral-300 line-clamp-2 mb-3">
            {item.questionText}
          </p>

          {/* CTA button -- 44px min touch target */}
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className={cn(
              'min-h-[44px] px-4 text-sm font-medium w-full sm:w-auto',
              'border-neutral-700 hover:bg-neutral-800 hover:text-white',
            )}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
