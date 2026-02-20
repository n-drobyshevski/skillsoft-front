'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, CheckCircle, SkipForward, Flag, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { QuestionType } from '@/types/domain';
import { AnswerSummaryItem, QuestionStatus } from '@/store/review-store';
import { LikertAnswerPreview, LikertAnswerExpanded } from './LikertAnswerCard';
import { SJTAnswerPreview, SJTAnswerExpanded } from './SJTAnswerCard';
import { MCQAnswerPreview, MCQAnswerExpanded } from './MCQAnswerCard';

interface AnswerCardProps {
  item: AnswerSummaryItem;
  questionNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

/** Static style config for status badges (labels are provided via translations) */
const STATUS_STYLE_CONFIG: Record<QuestionStatus, {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  answered: {
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  skipped: {
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    icon: <SkipForward className="w-3.5 h-3.5" />,
  },
  flagged: {
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    icon: <Flag className="w-3.5 h-3.5" />,
  },
  pending: {
    bgColor: 'bg-neutral-700/50',
    textColor: 'text-neutral-500',
    borderColor: 'border-neutral-700',
    icon: null,
  },
};

/** Maps status keys to translation keys */
const STATUS_LABEL_KEYS: Record<QuestionStatus, string> = {
  answered: 'answerCard.statusAnswered',
  skipped: 'answerCard.statusSkipped',
  flagged: 'answerCard.statusFlagged',
  pending: 'answerCard.statusPending',
};

/** Maps question type enum values to translation keys */
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
 * AnswerCard - Individual answer display card with expand/collapse
 *
 * Features:
 * - Collapsed view with question preview and answer summary
 * - Expanded view with full question and answer details
 * - Status indicators (answered, skipped, flagged)
 * - Question type badge
 * - Edit button for navigation back to question
 */
export function AnswerCard({
  item,
  questionNumber,
  isExpanded,
  onToggle,
  onEdit,
}: AnswerCardProps) {
  const t = useTranslations('assessment');
  const statusStyles = STATUS_STYLE_CONFIG[item.status];
  const statusLabel = t(STATUS_LABEL_KEYS[item.status]);
  const questionTypeLabelKey = QUESTION_TYPE_LABEL_KEYS[item.questionType];
  const questionTypeLabel = questionTypeLabelKey ? t(questionTypeLabelKey) : t('answerCard.typeDefault');

  // Determine which preview/expanded component to use
  const isLikert = item.questionType === 'LIKERT' || item.questionType === 'LIKERT_SCALE';
  const isSJT = item.questionType === 'SJT' || item.questionType === 'SITUATIONAL_JUDGMENT';

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        className={cn(
          "relative bg-neutral-900/50 border rounded-lg transition-all duration-200",
          isExpanded ? "border-neutral-700 bg-neutral-900/70" : "border-neutral-800",
          "hover:border-neutral-700",
          "focus-within:ring-2 focus-within:ring-emerald-500/30"
        )}
      >
        {/* Status indicator line */}
        {item.status !== 'answered' && item.status !== 'pending' && (
          <div
            className={cn(
              "absolute left-0 top-3 bottom-3 w-0.5 rounded-full",
              item.status === 'skipped' ? "bg-amber-500" : "bg-blue-500"
            )}
          />
        )}

        {/* Collapsed Header - always visible */}
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center gap-3 p-4 text-left min-h-[64px] cursor-pointer"
            aria-expanded={isExpanded}
          >
            {/* Question number badge */}
            <div
              className={cn(
                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                "text-sm font-bold tabular-nums",
                statusStyles.bgColor,
                statusStyles.textColor
              )}
            >
              {questionNumber}
            </div>

            {/* Question type badge */}
            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-800 text-neutral-500">
              {questionTypeLabel}
            </span>

            {/* Question text preview */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-300 line-clamp-1">
                {item.questionText}
              </p>
            </div>

            {/* Answer preview - collapsed only */}
            {!isExpanded && (
              <div className="shrink-0 hidden sm:flex items-center gap-2 max-w-[200px]">
                {isLikert ? (
                  <LikertAnswerPreview answer={item.answer} />
                ) : isSJT ? (
                  <SJTAnswerPreview answer={item.answer} answerDisplayText={item.answerDisplayText} />
                ) : (
                  <MCQAnswerPreview answer={item.answer} answerDisplayText={item.answerDisplayText} />
                )}
              </div>
            )}

            {/* Status icon */}
            {statusStyles.icon && (
              <div className={cn("shrink-0", statusStyles.textColor)}>
                {statusStyles.icon}
              </div>
            )}

            {/* Expand/collapse chevron */}
            <ChevronDown
              className={cn(
                "shrink-0 w-4 h-4 text-neutral-500 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="px-4 pb-4 pt-0 border-t border-neutral-800/50">
                  {/* Full question text */}
                  <div className="pt-4 pb-3">
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {item.questionText}
                    </p>
                  </div>

                  {/* Answer details - type specific */}
                  <div className="py-3 border-t border-neutral-800/50">
                    {isLikert ? (
                      <LikertAnswerExpanded answer={item.answer} />
                    ) : isSJT ? (
                      <SJTAnswerExpanded answer={item.answer} answerDisplayText={item.answerDisplayText} />
                    ) : (
                      <MCQAnswerExpanded answer={item.answer} answerDisplayText={item.answerDisplayText} />
                    )}
                  </div>

                  {/* Footer with metadata and edit button */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800/50">
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      {item.competencyName && (
                        <span className="truncate max-w-[150px]" title={item.competencyName}>
                          {item.competencyName}
                        </span>
                      )}
                      {item.timeSpentSeconds > 0 && (
                        <span className="tabular-nums">
                          {t('answerCard.timeSeconds', { seconds: item.timeSpentSeconds })}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="text-xs h-8 px-3 border-neutral-700 hover:bg-neutral-800 hover:text-white"
                    >
                      <Pencil className="w-3 h-3 mr-1.5" />
                      {t('answerCard.editButton')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
