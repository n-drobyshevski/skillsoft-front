'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Clock, CircleDot, MessageSquare, CheckSquare, CheckCircle, RotateCcw } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { cn } from '@/lib/utils';

const typeColors = { likert: 'bg-emerald-500', sjt: 'bg-amber-500', mcq: 'bg-blue-500' };

export function AssessmentTypesSection() {
  const t = useTranslations('landing.assessments');

  return (
    <section className="py-10 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center space-y-3 mb-8 md:mb-20">
          <Badge variant="outline" className="mb-2 md:mb-4">{t('badge')}</Badge>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {t('title')} <span className="text-primary">{t('titleHighlight')}</span>
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <ScrollReveal delay={0}>
            <InteractiveLikertCard />
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <InteractiveSJTCard />
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <InteractiveMCQCard />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function InteractiveLikertCard() {
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const t = useTranslations('landing.assessments');

  const handleSelect = (value: number) => {
    setSelected(value);
    setIsAnswered(true);
  };

  const handleReset = () => {
    setSelected(null);
    setIsAnswered(false);
  };

  return (
    <div className={cn(
      'h-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-card border-2 transition-all duration-300',
      isAnswered
        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
        : 'border-border/50 hover:border-border hover:shadow-lg'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn('px-2.5 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1.5', typeColors.likert)}>
          <CircleDot className="w-3.5 h-3.5" />{t('likert.label')}
        </div>
        <div className="flex items-center gap-2">
          {isAnswered && (
            <button
              onClick={handleReset}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              aria-label={t('reset')}
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <span className="text-sm font-medium text-muted-foreground">70%</span>
        </div>
      </div>

      <p className="text-sm font-medium mb-2">{t('likert.question')}</p>
      <p className="text-xs text-muted-foreground mb-4">{t('likert.instruction')}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => handleSelect(n)}
              className={cn(
                'w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-200',
                'hover:scale-110 active:scale-95',
                selected === n
                  ? 'border-emerald-500 bg-emerald-500 text-white scale-110 shadow-md'
                  : 'border-muted text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950'
              )}
              aria-label={t('likert.ratingLabel', { value: n })}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{t('likert.disagree')}</span>
          <span>{t('likert.agree')}</span>
        </div>
      </div>

      {isAnswered && selected && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              {t('likert.recorded', { value: selected })}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/50">
        <Clock className="w-3.5 h-3.5" />
        <span>{t('likert.avgTime')}</span>
      </div>
    </div>
  );
}

function InteractiveSJTCard() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const t = useTranslations('landing.assessments');

  const opts = [
    { l: 'A', t: t('sjt.optionA'), correct: false },
    { l: 'B', t: t('sjt.optionB'), correct: true },
    { l: 'C', t: t('sjt.optionC'), correct: false },
  ];

  const handleSelect = (letter: string) => {
    setSelected(letter);
    setIsAnswered(true);
  };

  const handleReset = () => {
    setSelected(null);
    setIsAnswered(false);
  };

  return (
    <div className={cn(
      'h-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-card border-2 transition-all duration-300',
      isAnswered
        ? 'border-amber-500/50 shadow-lg shadow-amber-500/10'
        : 'border-border/50 hover:border-border hover:shadow-lg'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn('px-2.5 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1.5', typeColors.sjt)}>
          <MessageSquare className="w-3.5 h-3.5" />{t('sjt.label')}
        </div>
        <div className="flex items-center gap-2">
          {isAnswered && (
            <button
              onClick={handleReset}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              aria-label={t('reset')}
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <span className="text-sm font-medium text-muted-foreground">25%</span>
        </div>
      </div>

      <p className="text-sm font-medium mb-2">{t('sjt.question')}</p>
      <p className="text-xs text-muted-foreground mb-4">{t('sjt.instruction')}</p>

      <div className="space-y-2 mb-4">
        {opts.map((o) => (
          <button
            key={o.l}
            onClick={() => handleSelect(o.l)}
            className={cn(
              'w-full p-3 rounded-lg border text-xs text-left transition-all duration-200',
              'hover:scale-[1.02] active:scale-[0.98]',
              selected === o.l
                ? o.correct
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
                  : 'border-amber-500 bg-amber-500/10 shadow-md'
                : 'border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn(
                'w-6 h-6 rounded text-[11px] font-medium flex items-center justify-center transition-colors',
                selected === o.l
                  ? o.correct
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}>
                {o.l}
              </span>
              <span className={cn(
                'font-medium',
                selected === o.l && (o.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400')
              )}>
                {o.t}
              </span>
            </div>
          </button>
        ))}
      </div>

      {isAnswered && selected && (
        <div className={cn(
          'p-3 rounded-lg border mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
          opts.find(o => o.l === selected)?.correct
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-amber-500/10 border-amber-500/20'
        )}>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className={cn(
              'w-4 h-4',
              opts.find(o => o.l === selected)?.correct ? 'text-emerald-500' : 'text-amber-500'
            )} />
            <span className={cn(
              'font-medium',
              opts.find(o => o.l === selected)?.correct
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-700 dark:text-amber-400'
            )}>
              {opts.find(o => o.l === selected)?.correct
                ? t('sjt.correct')
                : t('sjt.incorrect')}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/50">
        <Clock className="w-3.5 h-3.5" />
        <span>{t('sjt.avgTime')}</span>
      </div>
    </div>
  );
}

function InteractiveMCQCard() {
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const t = useTranslations('landing.assessments');

  const opts = [
    { text: t('mcq.optCommunication'), correct: false },
    { text: t('mcq.optLeadership'), correct: true },
    { text: t('mcq.optAdaptability'), correct: false },
  ];

  const handleSelect = (index: number) => {
    setSelected(index);
    setIsAnswered(true);
  };

  const handleReset = () => {
    setSelected(null);
    setIsAnswered(false);
  };

  return (
    <div className={cn(
      'h-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-card border-2 transition-all duration-300',
      isAnswered
        ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
        : 'border-border/50 hover:border-border hover:shadow-lg'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn('px-2.5 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1.5', typeColors.mcq)}>
          <CheckSquare className="w-3.5 h-3.5" />{t('mcq.label')}
        </div>
        <div className="flex items-center gap-2">
          {isAnswered && (
            <button
              onClick={handleReset}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              aria-label={t('reset')}
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <span className="text-sm font-medium text-muted-foreground">5%</span>
        </div>
      </div>

      <p className="text-sm font-medium mb-2">{t('mcq.question')}</p>
      <p className="text-xs text-muted-foreground mb-4">{t('mcq.instruction')}</p>

      <div className="space-y-2 mb-4">
        {opts.map((o, i) => (
          <button
            key={o.text}
            onClick={() => handleSelect(i)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg text-xs text-left transition-all duration-200',
              'hover:scale-[1.02] active:scale-[0.98]',
              selected === i
                ? o.correct
                  ? 'bg-emerald-500/10 shadow-md'
                  : 'bg-blue-500/10 shadow-md'
                : 'hover:bg-blue-50 dark:hover:bg-blue-950/30'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
              selected === i
                ? o.correct
                  ? 'border-emerald-500'
                  : 'border-blue-500'
                : 'border-muted'
            )}>
              {selected === i && (
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full animate-in zoom-in duration-200',
                  o.correct ? 'bg-emerald-500' : 'bg-blue-500'
                )} />
              )}
            </div>
            <span className={cn(
              'font-medium',
              selected === i && (o.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400')
            )}>
              {o.text}
            </span>
          </button>
        ))}
      </div>

      {isAnswered && selected !== null && (
        <div className={cn(
          'p-3 rounded-lg border mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
          opts[selected].correct
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-blue-500/10 border-blue-500/20'
        )}>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className={cn(
              'w-4 h-4',
              opts[selected].correct ? 'text-emerald-500' : 'text-blue-500'
            )} />
            <span className={cn(
              'font-medium',
              opts[selected].correct
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-blue-700 dark:text-blue-400'
            )}>
              {opts[selected].correct
                ? t('mcq.correct')
                : t('mcq.incorrect')}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/50">
        <Clock className="w-3.5 h-3.5" />
        <span>{t('mcq.avgTime')}</span>
      </div>
    </div>
  );
}
