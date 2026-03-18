'use client';

import { useState } from 'react';
import {
  BarChart3,
  Shield,
  Target,
  Brain,
  Gauge,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  Crosshair,
  FileText,
  History,
  Activity,
} from 'lucide-react';
import { MockQuestionCard } from '@/components/test-drive-preview/MockQuestionCard';
import { QualityGrade } from '@/components/test-drive-preview/QualityGrade';
import {
  mockQuestion,
  mockPsychometrics,
  mockMapping,
  mockScoring,
  mockUsage,
  getDifficultyConfig,
  getScoreColor,
  computeQualityGrade,
  getDiscriminationInterpretation,
} from '@/components/test-drive-preview/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------
const difficultyConfig = getDifficultyConfig(mockQuestion.difficultyLevel);
const qualityGrade = computeQualityGrade(mockPsychometrics);
const discriminationInterp = getDiscriminationInterpretation(
  mockPsychometrics.discriminationIndex,
);
const compositeScore = Math.round(
  (mockPsychometrics.cronbachAlpha * 0.6 + mockPsychometrics.discriminationIndex * 0.4) * 100,
);

const hasRedFlag =
  mockPsychometrics.discriminationIndex < 0.3 ||
  mockPsychometrics.cronbachAlpha < 0.7;

// Distractor analysis
const distractorCount = mockQuestion.answerOptions.filter((o) => !o.correct).length;
const partialCreditCount = mockQuestion.answerOptions.filter(
  (o) => !o.correct && o.score > 0,
).length;
const scoringType = partialCreditCount > 0 ? 'Graduated' : 'Binary';

// Precision from SEM
const precisionLabel =
  mockPsychometrics.sem <= 0.1 ? 'High' : mockPsychometrics.sem <= 0.2 ? 'Medium' : 'Low';

// ---------------------------------------------------------------------------
// Analytics panel — single card, divide-y, fits viewport
// ---------------------------------------------------------------------------

function AnalyticsPanel() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 divide-y divide-neutral-800 flex flex-col">
      {/* ── S1: Quality header + question context ─────────────────────────── */}
      <div className="px-4 py-2.5 flex items-center gap-3">
        <QualityGrade
          grade={qualityGrade.grade}
          color={qualityGrade.color}
          label={qualityGrade.label}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          {/* Line 1: Grade + score + question position */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{qualityGrade.label}</span>
            <span className="text-[10px] text-neutral-500 tabular-nums">{compositeScore}/100</span>
            <span className="text-neutral-700 mx-0.5">·</span>
            <Badge
              variant="outline"
              className="text-[9px] rounded px-1.5 py-0 border-neutral-700 bg-neutral-800/60 text-neutral-400"
            >
              {mockQuestion.questionType}
            </Badge>
            <span className="text-[10px] text-neutral-500 tabular-nums">
              Q{mockUsage.position}/{mockUsage.totalQuestions}
            </span>
          </div>
          {/* Line 2: Status */}
          {hasRedFlag ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <AlertTriangle className="size-2.5 shrink-0 text-red-400" aria-hidden="true" />
              <span className="text-[10px] text-red-300">Review discrimination &amp; reliability</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="size-2.5 shrink-0 text-emerald-400" aria-hidden="true" />
              <span className="text-[10px] text-emerald-300/80">All metrics within range</span>
            </div>
          )}
        </div>
      </div>

      {/* ── S2: Metrics 2×2 — Disc, Reliability, Correct Rate, Difficulty ── */}
      <div className="px-4 py-2.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Gauge className="size-3 text-neutral-500" aria-hidden="true" />
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Measurement</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <MetricRow
            label="Discrimination"
            value={mockPsychometrics.discriminationIndex.toFixed(2)}
            sub={discriminationInterp.label}
            color={
              discriminationInterp.status === 'excellent' ? 'emerald'
                : discriminationInterp.status === 'good' ? 'blue'
                : discriminationInterp.status === 'acceptable' ? 'amber'
                : 'red'
            }
          />
          <MetricRow
            label="Reliability α"
            value={mockPsychometrics.cronbachAlpha.toFixed(2)}
            sub={mockPsychometrics.cronbachAlpha >= 0.8 ? 'Excellent' : 'Good'}
            color={mockPsychometrics.cronbachAlpha >= 0.8 ? 'emerald' : 'blue'}
          />
          <MetricRow
            label="Correct Rate"
            value={`${(mockPsychometrics.correctRate * 100).toFixed(0)}%`}
            sub={`${(mockPsychometrics.correctRate * 100).toFixed(0)}% answer correctly`}
            color="blue"
          />
          <MetricRow
            label="Difficulty"
            value={`${(mockPsychometrics.difficultyIndex * 100).toFixed(0)}%`}
            sub={difficultyConfig.label}
            color="blue"
          />
        </div>
      </div>

      {/* ── S3: Scoring 4-col + distractor insight ────────────────────────── */}
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="size-3 text-neutral-500" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Scoring</span>
          </div>
          <span className="text-[9px] text-neutral-500 tabular-nums">
            Max {mockScoring.maxScore}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2" role="img" aria-label="Option score breakdown">
          {mockQuestion.answerOptions.map((opt) => {
            const score = mockScoring.optionScores[opt.id] ?? 0;
            const widthPct = mockScoring.maxScore > 0 ? (score / mockScoring.maxScore) * 100 : 0;
            const colorClasses = getScoreColor(score, mockScoring.maxScore);
            const bgClass = colorClasses.split(' ').find((c) => c.startsWith('bg-')) ?? 'bg-neutral-600';
            const textClass = colorClasses.split(' ').find((c) => c.startsWith('text-')) ?? 'text-neutral-400';

            return (
              <div key={opt.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'flex items-center justify-center size-4.5 rounded text-[9px] font-bold uppercase border',
                      colorClasses,
                    )}
                  >
                    {opt.id}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <span className={cn('text-[11px] font-bold tabular-nums', textClass)}>
                      {Number.isInteger(score) ? score : score.toFixed(1)}
                    </span>
                    {opt.correct && (
                      <CheckCircle2 className="size-2.5 text-emerald-400" aria-hidden="true" />
                    )}
                  </div>
                </div>
                <div className="h-1 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', bgClass)}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {/* Distractor insight */}
        <p className="text-[10px] text-neutral-500 mt-1.5">
          {scoringType} · {distractorCount} distractors
          {partialCreditCount > 0 && <>, {partialCreditCount} earn partial credit</>}
        </p>
      </div>

      {/* ── S4: Competency + coverage + contribution ──────────────────────── */}
      <div className="px-4 py-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Target className="size-3 text-neutral-500" aria-hidden="true" />
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Competency</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-medium text-white">{mockMapping.competencyName}</span>
          <Badge
            variant="outline"
            className="text-[9px] rounded px-1.5 py-0 border-violet-500/40 bg-violet-500/10 text-violet-300"
          >
            <Brain className="size-2 mr-0.5" aria-hidden="true" />
            {mockMapping.bigFiveCategory}
          </Badge>
        </div>
        <p className="text-[10px] text-neutral-400 leading-relaxed mb-1.5">
          {mockMapping.indicatorTitle}
        </p>
        {/* Coverage + contribution + standards — single dense row */}
        <div className="flex items-center gap-2.5 text-[9px] flex-wrap">
          <span className="text-neutral-500">
            <Crosshair className="size-2.5 inline mr-0.5 -mt-px" aria-hidden="true" />
            {mockMapping.questionsInIndicator} of {mockMapping.questionsInCompetency} questions
          </span>
          <span className="text-neutral-500">
            {mockMapping.contributionPct}% of score
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-500">
            O*NET <span className="font-mono text-neutral-400">{mockMapping.onetCode}</span>
          </span>
          <span className="text-neutral-500">
            w<span className="font-semibold text-neutral-400">{mockMapping.weight}</span>
          </span>
        </div>
      </div>

      {/* ── S5: Footer — usage, response time, precision, tags ────────────── */}
      <div className="px-4 py-2 flex items-center gap-2 flex-wrap text-[9px]">
        <InlineStat icon={FileText} label={`${mockUsage.assessmentCount} assessments`} />
        <span className="text-neutral-700">·</span>
        <InlineStat icon={Clock} label={`Avg ${mockPsychometrics.avgResponseTime}s / ${mockPsychometrics.timeLimit}s limit`} />
        <span className="text-neutral-700">·</span>
        <InlineStat icon={Activity} label={`±${mockPsychometrics.sem} SEM (${precisionLabel})`} />
        <span className="text-neutral-700">·</span>
        <InlineStat icon={History} label={mockUsage.lastModified} />
        {/* Tags */}
        <span className="text-neutral-700 mx-0.5">·</span>
        {mockQuestion.metadata.tags.map((tag) => (
          <span
            key={tag}
            className="rounded px-1.5 py-0.5 bg-neutral-800 text-neutral-400 text-[9px]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricRow({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'neutral';
}) {
  const colorMap = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    neutral: 'text-neutral-300',
  };

  return (
    <div>
      <span className="text-[9px] text-neutral-500 block">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={cn('text-sm font-bold tabular-nums leading-tight', colorMap[color])}>
          {value}
        </span>
        <span className="text-[9px] text-neutral-500 truncate">{sub}</span>
      </div>
    </div>
  );
}

function InlineStat({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-0.5 text-neutral-500">
      <Icon className="size-2.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Mobile compact summary
// ---------------------------------------------------------------------------
function CompactSummaryBar() {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-900/50">
      <div className="flex items-center gap-3">
        <QualityGrade
          grade={qualityGrade.grade}
          color={qualityGrade.color}
          label={qualityGrade.label}
          size="sm"
        />
        <div>
          <span className="text-sm font-semibold text-white">{qualityGrade.label}</span>
          <span className="text-xs text-neutral-500 ml-1.5">{compositeScore}/100</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-center">
        <div>
          <span className="text-[10px] text-neutral-500 block">α</span>
          <span className="text-xs font-bold text-white tabular-nums">{mockPsychometrics.cronbachAlpha.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block">D</span>
          <span className="text-xs font-bold text-white tabular-nums">{mockPsychometrics.discriminationIndex.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------
export default function SplitScreenPage() {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-3.5rem)]">
      {/* Left panel — Question */}
      <section
        className="bg-neutral-950 flex flex-col px-6 py-6 lg:border-r border-neutral-800 overflow-y-auto"
        aria-label="Question panel"
      >
        <div className="max-w-xl mx-auto w-full my-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">
            Question Preview
          </p>

          <MockQuestionCard question={mockQuestion} highlightCorrect={true} />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {mockQuestion.metadata.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] rounded-full px-2.5 py-0.5 border-neutral-700 text-neutral-400"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Right panel — Analytics (fits viewport, no scroll) */}
      <section
        className="bg-neutral-900/20 flex flex-col px-5 py-4"
        aria-label="Analytics panel"
      >
        {/* Mobile: toggle */}
        <div className="lg:hidden mb-4 space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between min-h-[44px] border-neutral-700"
            onClick={() => setAnalyticsOpen((prev) => !prev)}
            aria-expanded={analyticsOpen}
            aria-controls="analytics-content"
          >
            <span className="font-medium">
              {analyticsOpen ? 'Hide Analytics' : 'Show Analytics'}
            </span>
            <ChevronDown
              className={cn(
                'size-4 text-neutral-400 transition-transform duration-200',
                analyticsOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </Button>

          {!analyticsOpen && <CompactSummaryBar />}
        </div>

        {/* Desktop: analytics fills available height */}
        <div
          id="analytics-content"
          className={cn(
            'lg:flex lg:flex-col lg:flex-1',
            analyticsOpen ? 'block' : 'hidden lg:flex',
          )}
        >
          <div className="max-w-lg mx-auto w-full lg:my-auto">
            <AnalyticsPanel />
          </div>
        </div>
      </section>
    </div>
  );
}
