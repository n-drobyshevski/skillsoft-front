'use client';

import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SkippedWarningBannerProps {
  skippedCount: number;
  onReviewSkipped: () => void;
}

/**
 * SkippedWarningBanner - Warning banner for skipped questions
 *
 * Displayed at the top of the answer list when there are skipped questions.
 * Provides quick navigation to review skipped items.
 */
export function SkippedWarningBanner({
  skippedCount,
  onReviewSkipped,
}: SkippedWarningBannerProps) {
  if (skippedCount === 0) return null;

  const getSkippedText = (count: number) => {
    if (count === 1) return '1 вопрос пропущен';
    if (count < 5) return `${count} вопроса пропущено`;
    return `${count} вопросов пропущено`;
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0 p-2 bg-amber-500/20 rounded-full">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-400">
              {getSkippedText(skippedCount)}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Пропущенные вопросы будут засчитаны как неотвеченные
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReviewSkipped}
          className="shrink-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
        >
          Просмотреть
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
