'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AnswerCard } from './cards/AnswerCard';
import { AnswerSummaryItem, CompetencyGroup } from '@/store/review-store';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AnswerCardListProps {
  items: AnswerSummaryItem[];
  competencyGroups?: CompetencyGroup[];
  expandedCardIds: Set<string>;
  onToggleCard: (cardId: string) => void;
  onEditAnswer: (questionId: string, questionIndex: number) => void;
  groupByCompetency?: boolean;
}

/**
 * AnswerCardList - List of answer cards with optional competency grouping
 *
 * Features:
 * - Flat list or grouped by competency
 * - Staggered animation on mount
 * - Expand/collapse individual cards
 * - Edit button navigation
 */
export function AnswerCardList({
  items,
  competencyGroups,
  expandedCardIds,
  onToggleCard,
  onEditAnswer,
  groupByCompetency = false,
}: AnswerCardListProps) {
  // Sort items by question index for flat list
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.questionIndex - b.questionIndex);
  }, [items]);

  // Render flat list
  if (!groupByCompetency || !competencyGroups?.length) {
    return (
      <div className="space-y-2 sm:space-y-3">
        {sortedItems.map((item, index) => (
          <motion.div
            key={item.questionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: Math.min(index * 0.02, 0.5), // Cap delay at 0.5s
              ease: 'easeOut',
            }}
          >
            <AnswerCard
              item={item}
              questionNumber={item.questionIndex + 1}
              isExpanded={expandedCardIds.has(item.questionId)}
              onToggle={() => onToggleCard(item.questionId)}
              onEdit={() => onEditAnswer(item.questionId, item.questionIndex)}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // Render grouped by competency
  return (
    <div className="space-y-4">
      {competencyGroups.map((group, groupIndex) => (
        <CompetencyGroupSection
          key={group.competencyId}
          group={group}
          groupIndex={groupIndex}
          expandedCardIds={expandedCardIds}
          onToggleCard={onToggleCard}
          onEditAnswer={onEditAnswer}
        />
      ))}
    </div>
  );
}

interface CompetencyGroupSectionProps {
  group: CompetencyGroup;
  groupIndex: number;
  expandedCardIds: Set<string>;
  onToggleCard: (cardId: string) => void;
  onEditAnswer: (questionId: string, questionIndex: number) => void;
}

function CompetencyGroupSection({
  group,
  groupIndex,
  expandedCardIds,
  onToggleCard,
  onEditAnswer,
}: CompetencyGroupSectionProps) {
  const [isGroupExpanded, setIsGroupExpanded] = React.useState(true);

  // Sort items within group by question index
  const sortedItems = useMemo(() => {
    return [...group.items].sort((a, b) => a.questionIndex - b.questionIndex);
  }, [group.items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: groupIndex * 0.1,
        ease: 'easeOut',
      }}
    >
      <Collapsible open={isGroupExpanded} onOpenChange={setIsGroupExpanded}>
        {/* Group Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between py-2 px-1 group">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
                {group.competencyName}
              </h3>
              <span className="text-xs text-neutral-500">
                ({group.items.length})
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Group stats */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400 tabular-nums">
                  {group.answeredCount} отв.
                </span>
                {group.skippedCount > 0 && (
                  <span className="text-amber-400 tabular-nums">
                    {group.skippedCount} проп.
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-neutral-500 transition-transform duration-200",
                  isGroupExpanded && "rotate-180"
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Group Content */}
        <CollapsibleContent>
          <div className="space-y-2 sm:space-y-3 pt-2">
            {sortedItems.map((item, index) => (
              <motion.div
                key={item.questionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.02,
                  ease: 'easeOut',
                }}
              >
                <AnswerCard
                  item={item}
                  questionNumber={item.questionIndex + 1}
                  isExpanded={expandedCardIds.has(item.questionId)}
                  onToggle={() => onToggleCard(item.questionId)}
                  onEdit={() => onEditAnswer(item.questionId, item.questionIndex)}
                />
              </motion.div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
