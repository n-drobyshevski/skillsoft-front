'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveDemoProps {
  className?: string;
}

export function InteractiveDemo({ className }: InteractiveDemoProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (value: number) => {
    setSelectedValue(value);
    setShowFeedback(true);
  };

  return (
    <div className={cn('w-full max-w-sm p-6 rounded-2xl bg-card border border-border/50 shadow-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          Пример вопроса
        </span>
        <span className="text-xs text-muted-foreground">Коммуникация</span>
      </div>

      {/* Question */}
      <p className="text-sm font-medium mb-6 leading-relaxed">
        Я внимательно слушаю других и задаю уточняющие вопросы для лучшего понимания.
      </p>

      {/* Likert Scale */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Не согласен</span>
          <span>Согласен</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={cn(
                'w-9 h-9 rounded-full border-2 text-sm font-medium transition-all',
                'hover:border-primary hover:bg-primary/5',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'active:scale-95',
                selectedValue === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-muted text-muted-foreground'
              )}
              aria-label={`Оценка ${value} из 5`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && selectedValue && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-center">
          <span className="text-primary font-medium">
            Ответ записан: {selectedValue}/5
          </span>
          <p className="text-muted-foreground mt-1">
            Этот ответ относится к компетенции «Коммуникация»
          </p>
        </div>
      )}
    </div>
  );
}

export function MiniResultsPreview({ className }: { className?: string }) {
  const score = 87;
  const passing = true;
  const strokeDashoffset = 157 * (1 - score / 100);

  return (
    <div className={cn('w-full max-w-sm p-6 rounded-2xl bg-card border border-border/50 shadow-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
          Результаты оценки
        </span>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            passing
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          )}
        >
          {passing ? 'Пройдено' : 'Требует развития'}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center">
        <svg width="120" height="72" viewBox="0 0 120 72" className="mb-2">
          {/* Background arc */}
          <path
            d="M 10 62 A 50 50 0 0 1 110 62"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/30"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 10 62 A 50 50 0 0 1 110 62"
            stroke={passing ? '#10b981' : '#f59e0b'}
            strokeWidth="8"
            fill="none"
            strokeDasharray="157"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="text-center">
          <span className="text-3xl font-bold tabular-nums">{score}%</span>
          <p className="text-xs text-muted-foreground mt-1">Соответствие должности</p>
        </div>
      </div>

      {/* Mini gap bars */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Коммуникация</span>
          <span className="font-medium">92%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
        </div>
      </div>
    </div>
  );
}
