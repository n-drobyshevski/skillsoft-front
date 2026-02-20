'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, SkipForward, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionType } from '@/types/domain';
import { AnswerSummaryItem, QuestionStatus } from '@/store/review-store';

interface CompactAnswerRowProps {
  item: AnswerSummaryItem;
  questionNumber: number;
}

/** Status icon mapping for the compact row */
const STATUS_ICONS: Record<QuestionStatus, React.ReactNode> = {
  answered: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  skipped: <SkipForward className="w-3.5 h-3.5 text-amber-400" />,
  flagged: <Flag className="w-3.5 h-3.5 text-blue-400" />,
  pending: null,
};

/** Status badge color for the question number circle */
const STATUS_BADGE_STYLES: Record<QuestionStatus, string> = {
  answered: 'bg-emerald-500/20 text-emerald-400',
  skipped: 'bg-amber-500/20 text-amber-400',
  flagged: 'bg-blue-500/20 text-blue-400',
  pending: 'bg-neutral-700/50 text-neutral-500',
};

/** Maps question type enum values to translation keys (same as AnswerCard) */
const QUESTION_TYPE_LABEL_KEYS: Partial<Record<QuestionType, string>> = {
  LIKERT: 'answerCard.typeScale',
  LIKERT_SCALE: 'answerCard.typeScale',
  SJT: 'answerCard.typeSituational',
  SITUATIONAL_JUDGMENT: 'answerCard.typeSituational',
  MCQ: 'answerCard.typeChoice',
  MULTIPLE_CHOICE: 'answerCard.typeChoice',
  SINGLE_CHOICE: 'answerCard.typeChoice',
  OPEN_TEXT: 'answerCard.typeText',
  BEHAVIORAL_EXAMPLE: 'answerCard.typeBehavioral',
};

/**
 * CompactAnswerRow - Minimal single-line representation of an answer
 *
 * Displays in the compact summary view:
 * - Question number badge (Q1, Q2, etc.) with status coloring
 * - Status icon (answered, skipped, flagged)
 * - Question type badge (MCQ, SJT, Likert, etc.)
 * - Score if available (e.g., "3/5" for Likert)
 */
export function CompactAnswerRow({ item, questionNumber }: CompactAnswerRowProps) {
  const t = useTranslations('assessment');

  const questionTypeLabelKey = QUESTION_TYPE_LABEL_KEYS[item.questionType];
  const questionTypeLabel = questionTypeLabelKey
    ? t(questionTypeLabelKey)
    : t('answerCard.typeDefault');

  const statusIcon = STATUS_ICONS[item.status];
  const badgeStyle = STATUS_BADGE_STYLES[item.status];

  // Derive score display for Likert answers
  const scoreDisplay = getScoreDisplay(item);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg',
        'bg-neutral-900/30 border border-neutral-800/50',
        'transition-colors hover:border-neutral-700/50'
      )}
    >
      {/* Question number badge */}
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          'text-xs font-bold tabular-nums',
          badgeStyle
        )}
      >
        {t('answerSummary.questionLabel', { number: questionNumber })}
      </div>

      {/* Status icon */}
      <div className="shrink-0 w-4 flex items-center justify-center">
        {statusIcon}
      </div>

      {/* Question type badge */}
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-800 text-neutral-500">
        {questionTypeLabel}
      </span>

      {/* Spacer */}
      <div className="flex-1 min-w-0" />

      {/* Score display */}
      {scoreDisplay && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-neutral-400">
          {scoreDisplay}
        </span>
      )}
    </div>
  );
}

/**
 * Extracts a score display string from the answer item.
 * Returns a compact score representation or null if not applicable.
 */
function getScoreDisplay(item: AnswerSummaryItem): string | null {
  if (item.status === 'skipped' || item.status === 'pending') {
    return null;
  }

  const answer = item.answer;
  if (!answer) return null;

  // Likert: show value/5
  if (
    (item.questionType === 'LIKERT' || item.questionType === 'LIKERT_SCALE') &&
    answer.likertValue !== undefined
  ) {
    return `${answer.likertValue}/5`;
  }

  return null;
}
