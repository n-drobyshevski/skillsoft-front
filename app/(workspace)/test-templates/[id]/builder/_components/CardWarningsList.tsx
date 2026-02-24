'use client';

import { AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { CardWarning } from './hooks/useCardWarnings';

interface CardWarningsListProps {
  warnings: CardWarning[];
}

const levelStyles: Record<CardWarning['level'], string> = {
  error: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
  warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  info: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
};

function LevelIcon({ level }: { level: CardWarning['level'] }) {
  const iconClass = 'h-3.5 w-3.5 shrink-0 mt-0.5';
  if (level === 'error') return <XCircle className={iconClass} />;
  if (level === 'warning') return <AlertTriangle className={iconClass} />;
  return <Info className={iconClass} />;
}

/**
 * Inline list of CardWarning items with level-based color styling.
 * Uses i18n keys for health/preflight warnings, raw strings for simulation.
 * Returns null when the warnings array is empty.
 */
export function CardWarningsList({ warnings }: CardWarningsListProps) {
  const t = useTranslations('builder.card');

  if (warnings.length === 0) return null;

  return (
    <ul className="space-y-1.5" role="list" aria-label={t('warningsCount', { count: warnings.length })}>
      {warnings.map((warning) => (
        <li
          key={warning.id}
          className={cn(
            'flex items-start gap-2 p-2 rounded-lg text-xs',
            levelStyles[warning.level]
          )}
        >
          <LevelIcon level={warning.level} />
          <span className="flex-1">
            {warning.source === 'simulation'
              ? warning.messageKey
              : t(warning.messageKey, warning.messageParams)}
          </span>
        </li>
      ))}
    </ul>
  );
}
