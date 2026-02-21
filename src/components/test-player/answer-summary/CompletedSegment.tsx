'use client';

import { useTranslations } from 'next-intl';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CompactAnswerRow } from './cards/CompactAnswerRow';
import { AnswerSummaryItem } from '@/store/review-store';

interface CompletedSegmentProps {
  items: AnswerSummaryItem[];
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * CompletedSegment - Collapsible section for answered questions.
 *
 * Collapsed by default to reduce visual noise. Shows compact answer rows
 * when expanded. Header displays count of completed items.
 */
export function CompletedSegment({ items, isExpanded, onToggle }: CompletedSegmentProps) {
  const t = useTranslations('assessment');

  if (items.length === 0) return null;

  return (
    <section aria-label={t('answerSummary.completedLabel')}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        {/* Section header -- clickable toggle */}
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'w-full flex items-center justify-between py-3 px-3 rounded-lg',
              'bg-neutral-900/30 border border-neutral-800/50',
              'hover:border-neutral-700/50 transition-colors',
              'min-h-[44px] cursor-pointer',
            )}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500/70" />
              <span className="text-sm font-medium text-neutral-400">
                {t('answerSummary.completedCount', { count: items.length })}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-neutral-500 transition-transform duration-200',
                isExpanded && 'rotate-180',
              )}
            />
          </button>
        </CollapsibleTrigger>

        {/* Collapsed content: compact answer rows */}
        <CollapsibleContent>
          <div className="space-y-1 mt-2">
            {items.map(item => (
              <CompactAnswerRow
                key={item.questionId}
                item={item}
                questionNumber={item.questionIndex + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
