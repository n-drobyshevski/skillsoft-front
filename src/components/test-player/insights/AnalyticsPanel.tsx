'use client';

import React from 'react';
import Link from 'next/link';
import {
  Brain,
  Gauge,
  BarChart3,
  Target,
  Clock,
  Hash,
  AlertTriangle,
  CheckCircle2,
  Activity,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { QualityGrade } from './QualityGrade';
import { useCurrentQuestionData } from '@/store/test-drive-store';
import {
  computeQualityGrade,
  getDiscriminationInterpretation,
  getScoreColor,
  getDifficultyConfig,
} from '@/lib/test-drive-utils';
import { BigFiveInfo } from '@/types/domain';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricRowProps {
  label: string;
  value: string;
  sub: string;
  color?: string;
  tooltip?: string;
}

function MetricRow({ label, value, sub, color, tooltip }: MetricRowProps) {
  const content = (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] uppercase tracking-wide text-[var(--zen-text-secondary)] leading-none truncate">
        {label}
      </span>
      <span className={cn('text-sm font-bold leading-none', color ?? 'text-[var(--zen-text)]')}>
        {value}
      </span>
      <span className="text-[10px] text-[var(--zen-text-secondary)] leading-none truncate">{sub}</span>
    </div>
  );

  if (!tooltip) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">{content}</div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[240px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

interface InlineStatProps {
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
}

function InlineStat({ icon, label, tooltip }: InlineStatProps) {
  const content = (
    <span className="flex items-center gap-1 text-[10px] text-[var(--zen-text-secondary)]">
      <span className="shrink-0 text-[var(--zen-text-muted)]">{icon}</span>
      {label}
    </span>
  );

  if (!tooltip) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center gap-1 text-[10px] text-[var(--zen-text-secondary)] cursor-help">
          <span className="shrink-0 text-[var(--zen-text-muted)]">{icon}</span>
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[220px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/** Tiny link icon for navigable elements */
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          target="_blank"
          className="inline-flex items-center gap-0.5 text-[var(--zen-warning)] opacity-70 hover:opacity-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="size-2.5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Question type label map ──────────────────────────────────────────────────

const QUESTION_TYPE_LABELS: Record<string, string> = {
  LIKERT: 'Шкала Лайкерта',
  LIKERT_SCALE: 'Шкала Лайкерта',
  SJT: 'СОС',
  SITUATIONAL_JUDGMENT: 'СОС',
  MCQ: 'МВО',
  MULTIPLE_CHOICE: 'МВО',
  SINGLE_CHOICE: 'Один ответ',
  BEHAVIORAL_EXAMPLE: 'Поведенческий пример',
  CAPABILITY_ASSESSMENT: 'Оценка способностей',
  SELF_REFLECTION: 'Саморефлексия',
  PEER_FEEDBACK: 'Обратная связь',
  FREQUENCY_SCALE: 'Шкала частоты',
  OPEN_TEXT: 'Открытый ответ',
};

const QUESTION_TYPE_TOOLTIPS: Record<string, string> = {
  LIKERT: 'Оценка по шкале согласия от 1 до 5/7. Измеряет отношения и установки.',
  LIKERT_SCALE: 'Оценка по шкале согласия от 1 до 5/7. Измеряет отношения и установки.',
  SJT: 'Ситуационный тест — оценка выбора поведения в рабочих ситуациях.',
  SITUATIONAL_JUDGMENT: 'Ситуационный тест — оценка выбора поведения в рабочих ситуациях.',
  MCQ: 'Множественный выбор — один правильный ответ из нескольких вариантов.',
  MULTIPLE_CHOICE: 'Множественный выбор — один правильный ответ из нескольких вариантов.',
  SINGLE_CHOICE: 'Выбор одного варианта из предложенных.',
  BEHAVIORAL_EXAMPLE: 'Описание конкретного примера поведения в формате STAR.',
  OPEN_TEXT: 'Свободный текстовый ответ без ограничений формата.',
  FREQUENCY_SCALE: 'Оценка частоты проявления поведения.',
};

// ─── Option letter helper ─────────────────────────────────────────────────────

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

// ─── Big Five trait label map ─────────────────────────────────────────────────

function bigFiveLabel(trait: string | undefined): string {
  if (!trait) return '';
  const info = BigFiveInfo[trait as keyof typeof BigFiveInfo];
  return info?.displayName ?? trait;
}

// ─── Composite quality score helper ──────────────────────────────────────────

function compositeScore(psychometrics: {
  reliabilityCoefficient?: number;
  discriminationIndex?: number;
}): number {
  const alpha = psychometrics.reliabilityCoefficient ?? 0;
  const disc = psychometrics.discriminationIndex ?? 0;
  return Math.round((alpha * 0.6 + disc * 0.4) * 100);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsPanel({ className }: { className?: string }) {
  const questionData = useCurrentQuestionData();

  // ── Loading state ────────────────────────────────────────────────────────
  if (!questionData) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-xl bg-[var(--zen-bg)] py-10',
          className,
        )}
      >
        <Brain className="size-8 text-[var(--zen-muted)]" />
        <span className="text-xs text-[var(--zen-text-muted)]">Загрузка данных анализа...</span>
      </div>
    );
  }

  const { question, behavioralIndicator, competency, psychometrics, scoring, coverage, usage } =
    questionData;

  // ── Derived values ───────────────────────────────────────────────────────
  const gradeResult = computeQualityGrade({
    reliabilityCoefficient: psychometrics?.reliabilityCoefficient,
    discriminationIndex: psychometrics?.discriminationIndex,
  });

  const score = compositeScore({
    reliabilityCoefficient: psychometrics?.reliabilityCoefficient,
    discriminationIndex: psychometrics?.discriminationIndex,
  });

  const discInterpretation = getDiscriminationInterpretation(psychometrics?.discriminationIndex);
  const diffConfig = getDifficultyConfig(question.difficultyLevel);

  const hasRedFlag =
    (psychometrics?.discriminationIndex !== undefined &&
      psychometrics.discriminationIndex < 0.3) ||
    (psychometrics?.reliabilityCoefficient !== undefined &&
      psychometrics.reliabilityCoefficient < 0.7);

  const maxScore = scoring?.maxScore ?? 1;
  const optionScores = scoring?.optionScores ?? {};
  const answerOptions = question.answerOptions ?? [];

  const partialCount = answerOptions.filter((opt) => {
    const s = opt.id ? (optionScores[opt.id] ?? opt.score ?? 0) : (opt.score ?? 0);
    return s > 0 && s < maxScore;
  }).length;

  const bigFiveTrait = competency?.standardCodes?.bigFiveRef?.trait;
  const onetCode = competency?.standardCodes?.onetRef?.code;
  const tags = (question as { metadata?: { tags?: string[] } }).metadata?.tags ?? [];

  // ── Link paths ─────────────────────────────────────────────────────────
  const competencyHref = competency?.id ? `/hr/competencies/${competency.id}` : null;
  const psychoCompetencyHref = competency?.id ? `/psychometrics/competencies/${competency.id}` : null;
  const indicatorHref = question.behavioralIndicatorId ? `/hr/behavioral-indicators/${question.behavioralIndicatorId}` : null;
  const questionHref = question.id ? `/psychometrics/items/${question.id}` : null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'rounded-xl bg-[var(--zen-bg)] border border-[var(--zen-border)] divide-y divide-[var(--zen-border)] overflow-hidden',
        className,
      )}
    >
      {/* ── Section 1: Quality header ─────────────────────────────────────── */}
      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <QualityGrade
                  grade={gradeResult.grade}
                  color={gradeResult.color}
                  label={gradeResult.label}
                  size="sm"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-[260px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
            >
              <p className="font-semibold mb-1">Составная оценка качества</p>
              <p>Рассчитывается как взвешенное среднее: надёжность α × 60% + дискриминативность × 40%. Оценка {score}/100 соответствует грейду {gradeResult.grade}.</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className={cn('text-2xl font-black leading-none', gradeResult.color)}>
                {score}
              </span>
              <span className="text-[10px] text-[var(--zen-text-secondary)] leading-none">/ 100</span>
            </div>
            <span className="text-[10px] text-[var(--zen-text-muted)] leading-none">Составная оценка</span>
          </div>

          {/* Question type + position + links */}
          <div className="ml-auto flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="h-4 px-1.5 text-[10px] border-[var(--zen-muted)] text-[var(--zen-text-secondary)] bg-[var(--zen-card)] cursor-help"
                  >
                    {QUESTION_TYPE_LABELS[question.questionType] ?? question.questionType}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="max-w-[240px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
                >
                  {QUESTION_TYPE_TOOLTIPS[question.questionType] ?? 'Тип вопроса определяет формат ответа и метод скоринга.'}
                </TooltipContent>
              </Tooltip>
              {questionHref && (
                <NavLink href={questionHref} label="Открыть психометрику вопроса" />
              )}
            </div>
            {usage?.position !== undefined && usage?.totalQuestions !== undefined && (
              <span className="text-[10px] text-[var(--zen-text-muted)]">
                {usage.position}&nbsp;/&nbsp;{usage.totalQuestions}
              </span>
            )}
          </div>
        </div>

        {/* Flag or all-clear */}
        {hasRedFlag ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 rounded-md bg-[var(--zen-danger-subtle)] border border-[var(--zen-danger-border)] px-2 py-1 cursor-help">
                <AlertTriangle className="size-3 shrink-0 text-[var(--zen-danger)]" />
                <span className="text-[10px] text-[var(--zen-danger)] leading-snug">
                  {psychometrics?.discriminationIndex !== undefined &&
                  psychometrics.discriminationIndex < 0.3
                    ? 'Низкая дискриминативность — вопрос не различает уровни знания'
                    : 'Низкая надёжность — коэффициент α ниже порога 0.7'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-[280px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
            >
              <p className="font-semibold text-[var(--zen-danger)] mb-1">Требуется проверка</p>
              {psychometrics?.discriminationIndex !== undefined && psychometrics.discriminationIndex < 0.3 && (
                <p>Индекс дискриминативности {psychometrics.discriminationIndex.toFixed(2)} ниже минимального порога 0.30. Вопрос одинаково сложен для сильных и слабых кандидатов. Рекомендуется переформулировать или заменить.</p>
              )}
              {psychometrics?.reliabilityCoefficient !== undefined && psychometrics.reliabilityCoefficient < 0.7 && (
                <p>Коэффициент надёжности α = {psychometrics.reliabilityCoefficient.toFixed(2)} ниже приемлемого порога 0.70. Шкала недостаточно согласована.</p>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-1.5 rounded-md bg-[var(--zen-success-subtle)] border border-[var(--zen-success-border)] px-2 py-1">
            <CheckCircle2 className="size-3 shrink-0 text-[var(--zen-success)]" />
            <span className="text-[10px] text-[var(--zen-success)] leading-snug">
              Психометрические параметры в норме
            </span>
          </div>
        )}
      </div>

      {/* ── Section 2: Measurement ────────────────────────────────────────── */}
      <div className="px-3 py-2.5 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Gauge className="size-3 text-[var(--zen-text-muted)]" />
          <span className="text-[10px] uppercase tracking-widest text-[var(--zen-text-muted)] font-semibold">
            Измерение
          </span>
          {psychoCompetencyHref && (
            <NavLink href={psychoCompetencyHref} label="Открыть психометрику компетенции" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <MetricRow
            label="Дискриминативность"
            value={
              psychometrics?.discriminationIndex !== undefined
                ? psychometrics.discriminationIndex.toFixed(2)
                : '—'
            }
            sub={discInterpretation.label}
            color={
              discInterpretation.status === 'excellent'
                ? 'text-[var(--zen-success)]'
                : discInterpretation.status === 'good'
                  ? 'text-[var(--zen-info)]'
                  : discInterpretation.status === 'acceptable'
                    ? 'text-[var(--zen-warning)]'
                    : discInterpretation.status === 'poor'
                      ? 'text-[var(--zen-danger)]'
                      : 'text-[var(--zen-text-secondary)]'
            }
            tooltip="Корреляция ответа на вопрос с общим баллом. Показывает, насколько хорошо вопрос различает сильных и слабых кандидатов. ≥0.40 — отлично, ≥0.30 — хорошо, ≥0.20 — приемлемо, <0.20 — требует пересмотра."
          />
          <MetricRow
            label="Надёжность α"
            value={
              psychometrics?.reliabilityCoefficient !== undefined
                ? psychometrics.reliabilityCoefficient.toFixed(2)
                : '—'
            }
            sub={
              psychometrics?.reliabilityCoefficient !== undefined
                ? psychometrics.reliabilityCoefficient >= 0.9
                  ? 'Отличная'
                  : psychometrics.reliabilityCoefficient >= 0.7
                    ? 'Хорошая'
                    : 'Требует проверки'
                : 'Не рассчитана'
            }
            color={
              psychometrics?.reliabilityCoefficient === undefined
                ? 'text-[var(--zen-text-secondary)]'
                : psychometrics.reliabilityCoefficient >= 0.9
                  ? 'text-[var(--zen-success)]'
                  : psychometrics.reliabilityCoefficient >= 0.7
                    ? 'text-[var(--zen-info)]'
                    : 'text-[var(--zen-danger)]'
            }
            tooltip="Коэффициент Кронбаха α — мера внутренней согласованности шкалы. ≥0.90 — отлично для индивидуальных решений, ≥0.70 — приемлемо для групповых сравнений, <0.70 — шкала нестабильна."
          />
          <MetricRow
            label="Доля верных"
            value={
              psychometrics?.correctRate !== undefined
                ? `${Math.round(psychometrics.correctRate)}%`
                : '—'
            }
            sub={
              psychometrics?.correctRate !== undefined
                ? psychometrics.correctRate >= 80
                  ? 'Слишком легко'
                  : psychometrics.correctRate >= 40
                    ? 'Оптимальный уровень'
                    : 'Высокая сложность'
                : 'Нет данных'
            }
            color={
              psychometrics?.correctRate === undefined
                ? 'text-[var(--zen-text-secondary)]'
                : psychometrics.correctRate >= 80 || psychometrics.correctRate < 20
                  ? 'text-[var(--zen-warning)]'
                  : 'text-[var(--zen-info)]'
            }
            tooltip="Процент респондентов, выбравших верный ответ. Оптимальный диапазон 40–80%. Ниже 20% — вопрос слишком сложен, выше 80% — слишком прост и не даёт полезной информации."
          />
          <MetricRow
            label="Сложность"
            value={diffConfig.label}
            sub={
              psychometrics?.difficultyIndex !== undefined
                ? `Индекс: ${psychometrics.difficultyIndex.toFixed(2)}`
                : 'Индекс не задан'
            }
            color={diffConfig.color}
            tooltip="Уровень сложности определяет целевую аудиторию вопроса. Индекс сложности (0–1) показывает долю правильных ответов: чем ниже, тем сложнее."
          />
        </div>
      </div>

      {/* ── Section 3: Scoring ────────────────────────────────────────────── */}
      <div className="px-3 py-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="size-3 text-[var(--zen-text-muted)]" />
            <span className="text-[10px] uppercase tracking-widest text-[var(--zen-text-muted)] font-semibold">
              Скоринг
            </span>
          </div>
          <span className="text-[10px] text-[var(--zen-text-muted)]">
            Макс.&nbsp;
            <span className="text-[var(--zen-text-secondary)] font-semibold">{maxScore}</span>&nbsp;балл.
          </span>
        </div>

        {answerOptions.length > 0 ? (
          <>
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${Math.min(answerOptions.length, 4)}, minmax(0, 1fr))`,
              }}
            >
              {answerOptions.slice(0, 8).map((opt, i) => {
                const optScore =
                  opt.id !== undefined
                    ? (optionScores[opt.id] ?? opt.score ?? 0)
                    : (opt.score ?? 0);
                const colorClasses = getScoreColor(optScore, maxScore);
                const heightPct = maxScore > 0 ? (optScore / maxScore) * 100 : 0;
                const optText = opt.text ?? opt.label ?? `Вариант ${optionLetter(i)}`;

                return (
                  <Tooltip key={opt.id ?? i}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-0.5 cursor-help">
                        <span
                          className={cn(
                            'size-4 rounded text-[10px] font-bold flex items-center justify-center border',
                            colorClasses,
                          )}
                        >
                          {optionLetter(i)}
                        </span>
                        <span className="text-[10px] font-semibold text-[var(--zen-text-secondary)] leading-none">
                          {optScore}
                        </span>
                        <div className="w-full h-1 rounded-full bg-[var(--zen-track)] overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', colorClasses.split(' ')[1])}
                            style={{ width: `${heightPct}%` }}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-[260px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
                    >
                      <p className="font-semibold mb-0.5">{optionLetter(i)}: {optScore} из {maxScore} балл.</p>
                      <p className="text-[var(--zen-text-secondary)]">{optText}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-[var(--zen-text-muted)] leading-snug cursor-help">
                  {scoring?.scoringMethod === 'PARTIAL' || partialCount > 0
                    ? `Градуированный · ${answerOptions.length} дистрактор${answerOptions.length !== 1 ? 'ов' : ''}, ${partialCount} дают частичный балл`
                    : `Дихотомический · ${answerOptions.length} вариант${answerOptions.length !== 1 ? 'ов' : ''} ответа`}
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-[260px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
              >
                {partialCount > 0
                  ? 'Градуированный скоринг: неправильные ответы могут давать частичные баллы, что повышает чувствительность оценки.'
                  : 'Дихотомический скоринг: только один ответ получает максимальный балл, остальные — ноль.'}
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <span className="text-[10px] text-[var(--zen-muted)]">Варианты ответов не заданы</span>
        )}
      </div>

      {/* ── Section 4: Competency ─────────────────────────────────────────── */}
      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Target className="size-3 text-[var(--zen-text-muted)]" />
          <span className="text-[10px] uppercase tracking-widest text-[var(--zen-text-muted)] font-semibold">
            Компетенция
          </span>
          {competencyHref && (
            <NavLink href={competencyHref} label="Открыть карточку компетенции" />
          )}
        </div>

        {/* Competency name + Big Five badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[var(--zen-text)] leading-snug">
            {competency?.name ?? '—'}
          </span>
          {bigFiveTrait && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="shrink-0 h-4 px-1.5 text-[10px] border-purple-700/60 text-purple-400 bg-purple-950/40 cursor-help"
                >
                  {bigFiveLabel(bigFiveTrait)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="max-w-[220px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
              >
                Фактор Большой Пятёрки: {bigFiveLabel(bigFiveTrait)}. Определяет, к какой личностной характеристике относится данная компетенция.
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Behavioral indicator title */}
        {behavioralIndicator?.title && (
          <span className="text-[10px] text-[var(--zen-text-muted)] leading-snug italic flex items-center gap-1">
            {behavioralIndicator.title}
            {indicatorHref && (
              <NavLink href={indicatorHref} label="Открыть индикатор поведения" />
            )}
          </span>
        )}

        {/* Coverage row */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
          {coverage?.questionsInIndicator !== undefined &&
            coverage?.questionsInCompetency !== undefined && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[10px] text-[var(--zen-text-muted)] cursor-help">
                    <span className="text-[var(--zen-text-secondary)] font-semibold">
                      {coverage.questionsInIndicator}
                    </span>
                    &nbsp;из&nbsp;
                    <span className="text-[var(--zen-text-secondary)] font-semibold">
                      {coverage.questionsInCompetency}
                    </span>
                    &nbsp;вопросов
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[240px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
                >
                  Этот вопрос — один из {coverage.questionsInIndicator} вопросов для данного индикатора. Всего в компетенции {coverage.questionsInCompetency} вопросов. Удаление может снизить надёжность измерения.
                </TooltipContent>
              </Tooltip>
            )}
          {coverage?.contributionPct !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-[var(--zen-text-muted)] cursor-help">
                  Вклад&nbsp;
                  <span className="text-[var(--zen-warning)] font-semibold">
                    {Math.round(coverage.contributionPct)}%
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[220px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
              >
                Этот вопрос вносит {Math.round(coverage.contributionPct)}% в итоговую оценку компетенции. Вес зависит от количества вопросов и настроек индикатора.
              </TooltipContent>
            </Tooltip>
          )}
          {onetCode && (
            <span className="text-[10px] text-[var(--zen-text-muted)]">
              O*NET&nbsp;
              <span className="text-[var(--zen-text-secondary)] font-mono">{onetCode}</span>
            </span>
          )}
          {behavioralIndicator?.weight !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-[var(--zen-text-muted)] cursor-help">
                  Вес&nbsp;
                  <span className="text-[var(--zen-text-secondary)] font-semibold">
                    {behavioralIndicator.weight.toFixed(2)}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[220px] bg-[var(--zen-card)] border-[var(--zen-muted)] text-[var(--zen-text)] text-xs leading-relaxed"
              >
                Вес индикатора в расчёте итоговой оценки компетенции. Чем выше вес, тем больше влияние этого индикатора на результат.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ── Section 5: Footer ─────────────────────────────────────────────── */}
      <div className="px-3 py-2 flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {usage?.assessmentCount !== undefined && (
            <InlineStat
              icon={<Activity className="size-2.5" />}
              label={`${usage.assessmentCount} оценок`}
              tooltip="Количество завершённых оценок, в которых использовался этот вопрос."
            />
          )}
          {psychometrics?.avgResponseTime !== undefined && (
            <InlineStat
              icon={<Clock className="size-2.5" />}
              label={`${Math.round(psychometrics.avgResponseTime)}с / ${psychometrics.timeLimit ?? question.timeLimit ?? '—'}с`}
              tooltip={`Среднее время ответа ${Math.round(psychometrics.avgResponseTime)}с из ${psychometrics.timeLimit ?? question.timeLimit ?? '—'}с лимита. Если среднее время близко к лимиту, кандидаты могут спешить.`}
            />
          )}
          {psychometrics?.sem !== undefined && (
            <InlineStat
              icon={<Gauge className="size-2.5" />}
              label={`SEM ±${psychometrics.sem.toFixed(2)}`}
              tooltip={`Стандартная ошибка измерения: ±${psychometrics.sem.toFixed(2)}. Чем ниже SEM, тем точнее оценка. ≤0.10 — высокая точность, 0.10–0.20 — средняя, >0.20 — низкая.`}
            />
          )}
          {usage?.lastModified && (
            <InlineStat
              icon={<CalendarDays className="size-2.5" />}
              label={usage.lastModified}
              tooltip="Дата последнего изменения вопроса."
            />
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-0.5 text-[10px] text-[var(--zen-text-secondary)] bg-[var(--zen-card)] border border-[var(--zen-border)] rounded px-1.5 py-0.5 leading-none"
              >
                <Hash className="size-2 shrink-0" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
