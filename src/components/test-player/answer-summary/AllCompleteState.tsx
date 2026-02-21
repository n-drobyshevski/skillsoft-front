'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';

/**
 * AllCompleteState - Celebration state when all questions are answered.
 *
 * Displays a checkmark icon and congratulatory message.
 * Centered, responsive, dark theme.
 */
export function AllCompleteState() {
  const t = useTranslations('assessment');

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-5">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl scale-150" />
        <div className="relative p-4 rounded-full bg-emerald-500/15 border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-1.5">
        {t('answerSummary.allCompleteTitle')}
      </h3>
      <p className="text-sm text-neutral-400 max-w-xs">
        {t('answerSummary.allCompleteDescription')}
      </p>
    </div>
  );
}
