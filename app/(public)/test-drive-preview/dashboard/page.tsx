'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Gauge,
  Shield,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Brain,
} from 'lucide-react';
import { MockQuestionCard } from '@/components/test-drive-preview/MockQuestionCard';
import { QualityGrade } from '@/components/test-drive-preview/QualityGrade';
import {
  mockQuestion,
  mockPsychometrics,
  mockMapping,
  mockScoring,
  getScoreColor,
  computeQualityGrade,
} from '@/components/test-drive-preview/mock-data';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─── Derived constants ────────────────────────────────────────────────────────

const qualityGrade = computeQualityGrade(mockPsychometrics);

const compositeScore = Math.round(
  (mockPsychometrics.cronbachAlpha * 0.6 + mockPsychometrics.discriminationIndex * 0.4) * 100,
);

// ─── Quality check items ──────────────────────────────────────────────────────

type CheckStatus = 'ok' | 'warn' | 'error';

interface QualityCheckItem {
  label: string;
  detail: string;
  status: CheckStatus;
}

const QUALITY_CHECKS: QualityCheckItem[] = [
  {
    label: 'Discrimination Index',
    detail: `${mockPsychometrics.discriminationIndex} (Excellent)`,
    status: 'ok',
  },
  {
    label: 'Reliability α',
    detail: `${mockPsychometrics.cronbachAlpha} (Good)`,
    status: 'ok',
  },
  {
    label: 'Difficulty',
    detail: 'Intermediate (Balanced)',
    status: 'ok',
  },
  {
    label: 'Time Limit',
    detail: `${mockPsychometrics.timeLimit}s (Appropriate)`,
    status: 'ok',
  },
  {
    label: 'SEM',
    detail: `${mockPsychometrics.sem} (Monitor)`,
    status: 'warn',
  },
];

// ─── Option score bar data ─────────────────────────────────────────────────────

interface OptionBar {
  id: string;
  label: string;
  score: number;
  isCorrect: boolean;
  widthPercent: number;
}

const OPTION_BARS: OptionBar[] = mockQuestion.answerOptions.map((opt) => ({
  id: opt.id,
  label: `Option ${opt.id.toUpperCase()}`,
  score: opt.score,
  isCorrect: opt.correct,
  widthPercent: mockScoring.maxScore > 0 ? (opt.score / mockScoring.maxScore) * 100 : 0,
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: CheckStatus }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'mt-0.5 h-2 w-2 shrink-0 rounded-full',
        status === 'ok' && 'bg-emerald-500',
        status === 'warn' && 'bg-amber-400',
        status === 'error' && 'bg-red-500',
      )}
    />
  );
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'warn') {
    return (
      <AlertTriangle
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400"
        aria-hidden="true"
      />
    );
  }
  return (
    <CheckCircle2
      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
      aria-hidden="true"
    />
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className="py-8 px-6 bg-neutral-950 min-h-[calc(100vh-3.5rem)]">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
          Direction 5: Insights Dashboard
        </h1>
        <p className="text-sm text-neutral-400">
          Full analytics cockpit — every psychometric signal at a glance
        </p>
      </div>

      {/* ── Bento grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Widget 1 — Quality Score Ring ──────────────────────────────────── */}
        <Card className="shadow-lg hover:shadow-xl border-neutral-800 bg-neutral-900/50 transition-shadow duration-200 col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Overall Quality
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 pb-6">
            <QualityGrade
              grade={qualityGrade.grade}
              color={qualityGrade.color}
              label={qualityGrade.label}
              size="lg"
            />
            <div className="flex flex-col items-center gap-1">
              <span className="text-base font-semibold text-white">
                {qualityGrade.label}
              </span>
              <span className="text-xs text-neutral-400 tabular-nums">
                Composite score: {compositeScore}/100
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Widget 2 — Quality Checks ───────────────────────────────────────── */}
        <Card className="shadow-lg hover:shadow-xl border-neutral-800 bg-neutral-900/50 transition-shadow duration-200 col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Quality Checks
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <ul className="space-y-2.5" aria-label="Quality check results">
              {QUALITY_CHECKS.map((check) => (
                <li key={check.label} className="flex items-start gap-2.5">
                  <StatusDot status={check.status} />
                  <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 min-w-0">
                    <span className="text-xs font-medium text-white truncate">
                      {check.label}
                    </span>
                    <span
                      className={cn(
                        'text-xs tabular-nums shrink-0',
                        check.status === 'ok' && 'text-emerald-400',
                        check.status === 'warn' && 'text-amber-400',
                        check.status === 'error' && 'text-red-400',
                      )}
                    >
                      {check.detail}
                    </span>
                  </div>
                  <StatusIcon status={check.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Widget 3 — Option Scores ────────────────────────────────────────── */}
        <Card className="shadow-lg hover:shadow-xl border-neutral-800 bg-neutral-900/50 transition-shadow duration-200 col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Option Scores
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="space-y-3" role="list" aria-label="Scoring per option">
              {OPTION_BARS.map((bar) => {
                const colorClasses = getScoreColor(bar.score, mockScoring.maxScore);
                // Extract just bg class from the composite string for the bar fill
                const bgClass = colorClasses.split(' ').find((c) => c.startsWith('bg-')) ?? 'bg-neutral-500';

                return (
                  <div key={bar.id} role="listitem" className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-white">
                        {bar.label}
                        {bar.isCorrect && (
                          <Badge
                            variant="outline"
                            className="rounded-sm px-1 py-0 text-[10px] font-semibold border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                          >
                            Correct
                          </Badge>
                        )}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-semibold tabular-nums rounded px-1.5 py-0.5 border',
                          colorClasses,
                        )}
                      >
                        {bar.score} pts
                      </span>
                    </div>
                    {/* Bar track */}
                    <div
                      className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden"
                      role="presentation"
                    >
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', bgClass)}
                        style={{ width: `${bar.widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Widget 4 — Question Preview (wide) ─────────────────────────────── */}
        <Card className="shadow-lg hover:shadow-xl border-neutral-800 bg-neutral-900/50 transition-shadow duration-200 col-span-1 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Question Preview
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <MockQuestionCard
              question={mockQuestion}
              highlightCorrect={true}
              selectedOption={selectedOption}
              onSelect={setSelectedOption}
              compact={true}
            />
          </CardContent>
        </Card>

        {/* Widget 5 — Competency Mapping ───────────────────────────────────── */}
        <Card className="shadow-lg hover:shadow-xl border-neutral-800 bg-neutral-900/50 transition-shadow duration-200 col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Competency Mapping
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-5 space-y-4">
            {/* Hierarchy breadcrumb */}
            <div
              className="flex flex-wrap items-center gap-1.5 text-xs"
              aria-label="Competency hierarchy"
            >
              <Badge
                variant="outline"
                className="rounded-md px-2 py-0.5 font-semibold border-neutral-400/30 bg-neutral-800/50 text-white"
              >
                {mockMapping.competencyName}
              </Badge>
              <span className="text-neutral-400/50" aria-hidden="true">›</span>
              <span className="text-neutral-400 text-[11px] leading-snug flex-1 min-w-0">
                {mockMapping.indicatorTitle}
              </span>
              <span className="text-neutral-400/50 w-full" aria-hidden="true">›</span>
              <span className="text-neutral-400 text-[11px]">Question</span>
            </div>

            {/* Standard codes */}
            <div className="space-y-2" aria-label="Standard classification codes">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Standard Codes
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-neutral-400">O*NET</span>
                  <span className="font-mono text-xs text-white">{mockMapping.onetCode}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-neutral-400">ESCO</span>
                  <span className="font-mono text-xs text-white">S4.3.1</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-neutral-400">Big Five</span>
                  <span className="flex items-center gap-1.5 text-xs text-white">
                    <span
                      className="h-2 w-2 rounded-full bg-violet-500 shrink-0"
                      aria-hidden="true"
                    />
                    {mockMapping.bigFiveCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Weight indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  Weight
                </span>
                <span className="text-xs font-bold tabular-nums text-white">
                  {mockMapping.weight}
                </span>
              </div>
              <div
                className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden"
                role="presentation"
                aria-label={`Competency weight: ${mockMapping.weight}`}
              >
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-500"
                  style={{ width: `${mockMapping.weight * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget 6 — Aggregate Metrics (full width) ──────────────────────── */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-400 mb-3">
            Key Metrics
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Discrimination Index"
              value={mockPsychometrics.discriminationIndex}
              icon={TrendingUp}
              variant="success"
              description="Item-total correlation — how well this question separates high from low performers"
            />
            <StatsCard
              title="Difficulty Index"
              value={mockPsychometrics.difficultyIndex}
              icon={Gauge}
              variant="info"
              description="Proportion of correct responses — 0.45 indicates balanced intermediate difficulty"
            />
            <StatsCard
              title="Reliability"
              value={mockPsychometrics.cronbachAlpha}
              icon={Shield}
              variant="success"
              description="Cronbach's alpha internal consistency coefficient"
            />
            <StatsCard
              title="Time Limit"
              value={`${mockPsychometrics.timeLimit}s`}
              icon={Clock}
              variant="default"
              description="Allocated response time — appropriate for intermediate cognitive complexity"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
