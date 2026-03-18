'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  ChevronUp,
  Target,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Shield,
  TrendingUp,
  Gauge,
  Clock,
  BarChart3,
} from 'lucide-react';
import { MockQuestionCard } from '@/components/test-drive-preview/MockQuestionCard';
import { QualityGrade } from '@/components/test-drive-preview/QualityGrade';
import {
  mockQuestion,
  mockPsychometrics,
  mockMapping,
  mockScoring,
  getDifficultyConfig,
  getDiscriminationInterpretation,
  getScoreColor,
  computeQualityGrade,
} from '@/components/test-drive-preview/mock-data';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ─── Derived constants ────────────────────────────────────────────────────────

const difficultyConfig = getDifficultyConfig(mockQuestion.difficultyLevel);
const discriminationInterp = getDiscriminationInterpretation(
  mockPsychometrics.discriminationIndex,
);
const qualityGrade = computeQualityGrade(mockPsychometrics);
const correctOption = mockQuestion.answerOptions.find((o) => o.correct);

// Red flag detection
const hasRedFlag =
  mockPsychometrics.discriminationIndex < 0.3 ||
  mockPsychometrics.cronbachAlpha < 0.7;

// ─── Page component ───────────────────────────────────────────────────────────

export default function InlineAnnotationsPage() {
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 bg-neutral-950 min-h-[calc(100vh-3.5rem)]">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
          Direction 1: Inline Annotations
        </h1>
        <p className="text-sm text-neutral-400">
          Insights woven directly into the question card — zero context
          switching
        </p>
      </div>

      {/* ── Top bar: quality + key signals ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Left: question number + difficulty + competency */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
            Q1
          </span>
          <Badge
            variant="outline"
            className={cn(
              'rounded-md px-2 py-0.5 text-xs font-medium',
              difficultyConfig.color,
              difficultyConfig.bgColor,
              difficultyConfig.borderColor,
            )}
          >
            {difficultyConfig.label}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-md px-2 py-0.5 text-xs font-medium border-neutral-700 bg-neutral-800/60 text-neutral-300"
          >
            <Target className="size-3 mr-1 opacity-70" aria-hidden="true" />
            {mockMapping.competencyName}
          </Badge>
        </div>

        {/* Right: quality grade ring — instant signal */}
        <QualityGrade
          grade={qualityGrade.grade}
          color={qualityGrade.color}
          label={qualityGrade.label}
          size="sm"
        />
      </div>

      {/* ── Red flag / all-clear banner ───────────────────────────────────────── */}
      {hasRedFlag ? (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 mb-4"
        >
          <AlertTriangle className="size-4 shrink-0 text-red-400" aria-hidden="true" />
          <p className="text-xs text-red-300 leading-relaxed">
            Review needed — discrimination or reliability below threshold
          </p>
        </div>
      ) : (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 mb-4"
        >
          <Shield className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
          <p className="text-xs text-emerald-300/80">
            All quality metrics within acceptable ranges
          </p>
        </div>
      )}

      {/* ── MockQuestionCard ─────────────────────────────────────────────────── */}
      <MockQuestionCard question={mockQuestion} highlightCorrect={true} />

      {/* ── Explanation callout ───────────────────────────────────────────────── */}
      {correctOption?.explanation && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mt-3 flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
          role="note"
          aria-label="Correct answer explanation"
        >
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-emerald-400"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-emerald-300">
            {correctOption.explanation}
          </p>
        </motion.div>
      )}

      {/* ── Always-visible key metrics strip ──────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <KeyMetricCard
          icon={TrendingUp}
          label="Discrimination"
          value={mockPsychometrics.discriminationIndex.toFixed(2)}
          interpretation={discriminationInterp.label}
          status={discriminationInterp.status}
          progress={mockPsychometrics.discriminationIndex * 100}
        />
        <KeyMetricCard
          icon={Shield}
          label="Reliability α"
          value={mockPsychometrics.cronbachAlpha.toFixed(2)}
          interpretation={mockPsychometrics.cronbachAlpha >= 0.8 ? 'Excellent' : 'Good'}
          status={mockPsychometrics.cronbachAlpha >= 0.8 ? 'excellent' : 'good'}
          progress={mockPsychometrics.cronbachAlpha * 100}
        />
        <KeyMetricCard
          icon={Gauge}
          label="Difficulty"
          value={`${(mockPsychometrics.difficultyIndex * 100).toFixed(0)}%`}
          interpretation={difficultyConfig.label}
          status="neutral"
          progress={mockPsychometrics.difficultyIndex * 100}
        />
      </div>

      {/* ── Expandable deep-dive section ──────────────────────────────────────── */}
      <Collapsible open={deepDiveOpen} onOpenChange={setDeepDiveOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              'mt-3 flex w-full items-center justify-between gap-2',
              'min-h-[44px] rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-2',
              'text-xs font-medium text-neutral-400',
              'hover:bg-neutral-800/60 hover:text-neutral-200',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
            )}
            aria-expanded={deepDiveOpen}
          >
            <span>
              {deepDiveOpen ? 'Hide scoring & mapping details' : 'Scoring & mapping details'}
            </span>
            {deepDiveOpen ? (
              <ChevronUp className="size-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence initial={false}>
            {deepDiveOpen && (
              <motion.div
                key="deep-dive"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="mt-3 space-y-3">
                  {/* Option scores — horizontal bars */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="size-4 text-neutral-400" aria-hidden="true" />
                      <span className="text-sm font-semibold text-white">Option Scores</span>
                      <span className="ml-auto text-xs text-neutral-500 tabular-nums">
                        Max {mockScoring.maxScore} pts
                      </span>
                    </div>
                    <div className="space-y-2">
                      {mockQuestion.answerOptions.map((opt) => {
                        const score = mockScoring.optionScores[opt.id] ?? 0;
                        const widthPct = mockScoring.maxScore > 0 ? (score / mockScoring.maxScore) * 100 : 0;
                        const colorClasses = getScoreColor(score, mockScoring.maxScore);
                        const bgClass = colorClasses.split(' ').find((c) => c.startsWith('bg-')) ?? 'bg-neutral-600';
                        return (
                          <div key={opt.id} className="flex items-center gap-3">
                            <span
                              className={cn(
                                'flex items-center justify-center size-6 rounded text-xs font-bold uppercase shrink-0 border',
                                colorClasses,
                              )}
                            >
                              {opt.id}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                                <div
                                  className={cn('h-full rounded-full transition-all duration-500', bgClass)}
                                  style={{ width: `${widthPct}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-neutral-300 tabular-nums w-8 text-right shrink-0">
                              {Number.isInteger(score) ? score : score.toFixed(1)}
                            </span>
                            {opt.correct && (
                              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Competency mapping — compact row */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="size-4 text-neutral-400" aria-hidden="true" />
                      <span className="text-sm font-semibold text-white">Competency Mapping</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">
                          {mockMapping.competencyName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] rounded-md px-1.5 py-0.5 border-violet-500/40 bg-violet-500/10 text-violet-300"
                        >
                          <Brain className="size-2.5 mr-0.5" aria-hidden="true" />
                          {mockMapping.bigFiveCategory}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {mockMapping.indicatorTitle}
                      </p>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="text-neutral-500">
                          O*NET <span className="font-mono text-neutral-300">{mockMapping.onetCode}</span>
                        </span>
                        <span className="text-neutral-500">
                          Weight <span className="font-semibold text-neutral-300">{mockMapping.weight}</span>
                        </span>
                        <span className="text-neutral-500">
                          Time <span className="text-neutral-300">{mockPsychometrics.timeLimit}s</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ─── Key metric card ──────────────────────────────────────────────────────────

function KeyMetricCard({
  icon: Icon,
  label,
  value,
  interpretation,
  status,
  progress,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  interpretation: string;
  status: 'excellent' | 'good' | 'acceptable' | 'poor' | 'neutral';
  progress: number;
}) {
  const statusColorMap: Record<typeof status, string> = {
    excellent: 'text-emerald-400',
    good: 'text-blue-400',
    acceptable: 'text-amber-400',
    poor: 'text-red-400',
    neutral: 'text-neutral-400',
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-neutral-500 shrink-0" aria-hidden="true" />
        <span className="text-[11px] text-neutral-400 truncate">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('text-lg font-bold tabular-nums', statusColorMap[status])}>
          {value}
        </span>
        <span className="text-[10px] text-neutral-500 truncate">{interpretation}</span>
      </div>
      <Progress value={progress} className="h-1 bg-neutral-800" />
    </div>
  );
}
