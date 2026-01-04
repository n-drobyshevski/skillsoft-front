'use client';

/**
 * TimelineTabOptimized
 *
 * Performance-optimized version of TimelineTab with:
 * - Virtualized question list using react-window
 * - Memoized chart component
 * - Deferred chart data updates
 * - Lazy chart rendering
 */

import React, { useMemo, memo, useDeferredValue, useState, useEffect, useCallback, CSSProperties, ReactElement } from 'react';
import { List } from 'react-window';
import { Badge } from '@/components/ui/badge';
import { LineChart as LineChartIcon, ChevronDown, ChevronUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { SimulationResult, Difficulty, difficultyLevelMap, selectionReasonLabels } from '../types';

// ============================================
// TYPES
// ============================================

interface TimelineTabOptimizedProps {
  result: SimulationResult;
  /** Maximum height for the virtualized list */
  maxListHeight?: number;
}

// ============================================
// CONSTANTS
// ============================================

const ITEM_HEIGHT = 120; // Height of each question card
const MAX_VISIBLE_ITEMS = 5;

// ============================================
// MEMOIZED CHART COMPONENT
// ============================================

interface AdaptiveCurveChartProps {
  data: Array<{
    index: number;
    label: string;
    difficulty: Difficulty;
    difficultyValue: number;
    text: string;
  }>;
}

const AdaptiveCurveChart = memo(function AdaptiveCurveChart({ data }: AdaptiveCurveChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        Run a simulation to view the adaptive path
      </p>
    );
  }

  return (
    <div className="h-[200px] sm:h-[240px]">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            allowDecimals={false}
            domain={[1, 4]}
            tickFormatter={(value) => {
              const entry = Object.entries(difficultyLevelMap).find(([, v]) => v === value);
              return entry ? entry[0].charAt(0) + entry[0].toLowerCase().slice(1, 3) : value;
            }}
          />
          <RechartTooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const datum = payload[0].payload as { label: string; difficulty: Difficulty; text: string };
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm text-xs max-w-xs">
                  <div className="font-semibold mb-1">
                    {datum.label} · {datum.difficulty}
                  </div>
                  <div className="text-muted-foreground line-clamp-3">{datum.text}</div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="difficultyValue"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1, stroke: '#6366f1', fill: '#ffffff' }}
            activeDot={{ r: 4 }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

// ============================================
// MEMOIZED QUESTION CARD
// ============================================

interface QuestionCardProps {
  question: SimulationResult['sampleQuestions'][number];
  index: number;
}

const QuestionCard = memo(function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <div className="pr-2 h-full"> {/* Right padding for scroll area */}
      <div className="flex items-start gap-3 p-3 rounded-xl border bg-background/80 h-[112px]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-semibold">
              {question.competencyName}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {question.difficulty}
            </Badge>
            {question.selectionReason && (
              <Badge variant="outline" className="text-[10px]">
                {selectionReasonLabels[question.selectionReason] || question.selectionReason}
              </Badge>
            )}
            <span className="text-[11px] text-muted-foreground ml-auto">
              ~{Math.round(question.estimatedTimeSeconds / 60)}m
            </span>
          </div>
          <p className="text-sm font-medium line-clamp-2">{question.text}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {question.indicatorTitle}
          </p>
          {typeof question.abilityDelta === 'number' && (
            <div className="text-[11px] text-muted-foreground">
              Ability shift: {question.abilityDelta > 0 ? '+' : ''}{question.abilityDelta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ============================================
// ROW RENDERER FOR VIRTUAL LIST
// ============================================

// For react-window v2, rowComponent must handle ariaAttributes
interface RowComponentProps {
  ariaAttributes: {
    'aria-posinset': number;
    'aria-setsize': number;
    role: 'listitem';
  };
  index: number;
  style: CSSProperties;
}

const createRowRenderer = (questions: SimulationResult['sampleQuestions']) => {
  // eslint-disable-next-line react/display-name
  return function RowRenderer(props: RowComponentProps): ReactElement {
    const { index, style, ariaAttributes } = props;
    const question = questions[index];

    // Apply aria attributes for accessibility
    return (
      <div style={style} {...ariaAttributes}>
        {question ? (
          <QuestionCard question={question} index={index} />
        ) : (
          <div className="h-[112px]" />
        )}
      </div>
    );
  };
};

// ============================================
// MAIN COMPONENT
// ============================================

export const TimelineTabOptimized = memo(function TimelineTabOptimized({
  result,
  maxListHeight = 600,
}: TimelineTabOptimizedProps) {
  const [isChartVisible, setIsChartVisible] = useState(true);
  const [isChartLoaded, setIsChartLoaded] = useState(false);

  // Deferred chart data for smoother UI updates
  const rawChartData = useMemo(() => {
    return (result.sampleQuestions || []).map((q, index) => {
      const difficulty = (q.difficulty || 'INTERMEDIATE') as Difficulty;
      return {
        index: index + 1,
        label: `Q${index + 1}`,
        difficulty,
        difficultyValue: difficultyLevelMap[difficulty] ?? 2,
        text: q.text,
      };
    });
  }, [result.sampleQuestions]);

  const deferredChartData = useDeferredValue(rawChartData);

  // Lazy load chart after initial render
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsChartLoaded(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Calculate list height
  const questions = result.sampleQuestions || [];
  const itemCount = questions.length;
  const shouldVirtualize = itemCount > MAX_VISIBLE_ITEMS;
  const listHeight = shouldVirtualize
    ? Math.min(maxListHeight, MAX_VISIBLE_ITEMS * ITEM_HEIGHT)
    : itemCount * ITEM_HEIGHT;

  // Memoized row renderer for react-window
  const RowRenderer = useMemo(
    () => createRowRenderer(questions),
    [questions]
  );

  const toggleChart = useCallback(() => {
    setIsChartVisible((prev) => !prev);
  }, []);

  if (itemCount === 0) {
    return <p className="text-xs text-muted-foreground">No sample questions available.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Collapsible Adaptive Curve Chart */}
      <div className="rounded-xl border bg-muted/30 overflow-hidden">
        <button
          onClick={toggleChart}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Adaptive curve</span>
          </div>
          {isChartVisible ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {isChartVisible && (
          <div className="px-3 pb-3">
            {isChartLoaded ? (
              <AdaptiveCurveChart data={deferredChartData} />
            ) : (
              <div className="h-[200px] sm:h-[240px] flex items-center justify-center">
                <div className="animate-pulse bg-muted rounded-lg w-full h-full" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question Timeline - Virtualized or Regular */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Questions ({itemCount})
          </span>
          {shouldVirtualize && (
            <span className="text-[10px] text-muted-foreground">
              Scroll to see all
            </span>
          )}
        </div>

        {shouldVirtualize ? (
          <List
            rowCount={itemCount}
            rowHeight={ITEM_HEIGHT}
            rowComponent={RowRenderer}
            rowProps={{}}
            style={{ height: listHeight, width: '100%' }}
            className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          />
        ) : (
          <div className="space-y-2">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id || index}
                question={question}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default TimelineTabOptimized;
