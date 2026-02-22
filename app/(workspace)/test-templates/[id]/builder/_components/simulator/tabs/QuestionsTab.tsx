'use client';

/**
 * QuestionsTab
 *
 * Merged tab combining TimelineTabOptimized + AnalyticsTabOptimized:
 * - Collapsible adaptive difficulty curve (line chart)
 * - Virtualized question list (react-window)
 * - Difficulty balance bar chart (collapsed by default)
 * - Competency distribution pie chart (collapsed by default)
 *
 * SelectionReasonsBadges is intentionally omitted — each question card
 * already surfaces its selection reason badge inline.
 */

import React, {
  useMemo,
  memo,
  useDeferredValue,
  useState,
  useEffect,
  useCallback,
  CSSProperties,
  ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import { List } from 'react-window';
import { Badge } from '@/components/ui/badge';
import {
  LineChart as LineChartIcon,
  BarChart3,
  PieChartIcon,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CircleX,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  SimulationResult,
  Difficulty,
  difficultyColors,
  difficultyLevelMap,
  selectionReasonLabels,
} from '../types';

// ============================================
// TYPES
// ============================================

interface QuestionsTabProps {
  result: SimulationResult;
  /** Maximum height for the virtualized list */
  maxListHeight?: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface AdaptiveCurveChartProps {
  data: Array<{
    index: number;
    label: string;
    difficulty: Difficulty;
    difficultyValue: number;
    text: string;
  }>;
  isLoaded: boolean;
}

interface QuestionCardProps {
  question: SimulationResult['sampleQuestions'][number];
  index: number;
}

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

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface CompetencyPieChartProps {
  data: ChartData[];
  isLoaded: boolean;
}

interface DifficultyBarChartProps {
  data: ChartData[];
  isLoaded: boolean;
}

interface ChartLegendProps {
  data: ChartData[];
  colors?: string[];
}

// ============================================
// CONSTANTS
// ============================================

const CHART_COLORS = ['#6366f1', '#22c55e', '#f97316', '#0ea5e9', '#8b5cf6', '#f59e0b'];

const ITEM_HEIGHT = 136; // Height of each question card in px
const MAX_VISIBLE_ITEMS = 5;

// ============================================
// COLLAPSIBLE SECTION
// ============================================

const CollapsibleSection = memo(function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div className="rounded-xl border bg-muted/30 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
});

// ============================================
// ADAPTIVE CURVE CHART
// ============================================

const AdaptiveCurveChart = memo(function AdaptiveCurveChart({
  data,
  isLoaded,
}: AdaptiveCurveChartProps) {
  const t = useTranslations('builder.simulator');

  if (!isLoaded) {
    return (
      <div className="h-[200px] sm:h-[240px] flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-lg w-full h-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        {t('timeline.runToViewPath')}
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
              const datum = payload[0].payload as {
                label: string;
                difficulty: Difficulty;
                text: string;
              };
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
// QUESTION CARD
// ============================================

const QuestionCard = memo(function QuestionCard({ question, index }: QuestionCardProps) {
  const t = useTranslations('builder.simulator');
  const isCorrect = question.simulatedCorrect;

  return (
    <div className="pr-2 h-full">
      <div className="flex items-start gap-3 p-3 rounded-xl border bg-background/80 h-[128px]">
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
          <p className="text-sm font-medium line-clamp-1">{question.text}</p>
          {typeof isCorrect === 'boolean' && (
            <div className="flex items-center gap-1.5">
              {isCorrect ? (
                <CircleCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              ) : (
                <CircleX className="h-3.5 w-3.5 text-destructive shrink-0" />
              )}
              <span className={`text-xs truncate ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                {question.simulatedAnswer || (isCorrect ? t('timeline.correct') : t('timeline.incorrect'))}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground line-clamp-1">{question.indicatorTitle}</p>
        </div>
      </div>
    </div>
  );
});

// ============================================
// ROW RENDERER FOR VIRTUAL LIST
// ============================================

const createRowRenderer = (questions: SimulationResult['sampleQuestions']) => {
  return function RowRenderer(props: RowComponentProps): ReactElement {
    const { index, style, ariaAttributes } = props;
    const question = questions[index];

    return (
      <div style={style} {...ariaAttributes}>
        {question ? (
          <QuestionCard question={question} index={index} />
        ) : (
          <div className="h-[128px]" />
        )}
      </div>
    );
  };
};

// ============================================
// DIFFICULTY BAR CHART
// ============================================

const DifficultyBarChart = memo(function DifficultyBarChart({
  data,
  isLoaded,
}: DifficultyBarChartProps) {
  const t = useTranslations('builder.simulator');

  if (!isLoaded) {
    return (
      <div className="h-[180px] sm:h-[220px] flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-lg w-full h-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        {t('analytics.noDifficultyData')}
      </p>
    );
  }

  return (
    <div className="h-[180px] sm:h-[220px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, left: 0, right: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <RechartTooltip contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={300}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={difficultyColors[entry.name as Difficulty] || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// ============================================
// COMPETENCY PIE CHART
// ============================================

const CompetencyPieChart = memo(function CompetencyPieChart({
  data,
  isLoaded,
}: CompetencyPieChartProps) {
  const t = useTranslations('builder.simulator');

  if (!isLoaded) {
    return (
      <div className="h-[180px] sm:h-[220px] flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-full w-32 h-32" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        {t('analytics.noCompetencies')}
      </p>
    );
  }

  return (
    <div className="h-[180px] sm:h-[220px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius="75%"
            innerRadius="40%"
            animationDuration={300}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <RechartTooltip contentStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

// ============================================
// CHART LEGEND
// ============================================

const ChartLegend = memo(function ChartLegend({
  data,
  colors = CHART_COLORS,
}: ChartLegendProps) {
  if (data.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
      {data.map((entry, index) => (
        <span
          key={entry.name}
          className="inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-background"
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <span className="truncate max-w-[120px]">{entry.name}</span>
        </span>
      ))}
    </div>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const QuestionsTab = memo(function QuestionsTab({
  result,
  maxListHeight = 600,
}: QuestionsTabProps) {
  const t = useTranslations('builder.simulator');
  const [isLoaded, setIsLoaded] = useState(false);

  // Lazy load all charts after initial render to avoid blocking paint
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsLoaded(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // ---- Adaptive curve data ----
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

  // ---- Competency pie data ----
  const rawCompetencyData = useMemo<ChartData[]>(() => {
    if (result.distributionByCompetency?.length) {
      return result.distributionByCompetency.map((entry) => ({
        name: entry.competencyName,
        value: entry.questionCount,
      }));
    }

    if (!result.composition) return [];

    return Object.entries(result.composition).map(([name, value]) => ({ name, value }));
  }, [result.distributionByCompetency, result.composition]);

  const competencyData = useDeferredValue(rawCompetencyData);

  // ---- Difficulty bar data ----
  const rawDifficultyData = useMemo<ChartData[]>(() => {
    const distribution = result.distributionByDifficulty || result.difficultyDistribution;

    if (!distribution) return [];

    return Object.entries(distribution).map(([difficulty, value]) => ({
      name: difficulty,
      value,
    }));
  }, [result.distributionByDifficulty, result.difficultyDistribution]);

  const difficultyData = useDeferredValue(rawDifficultyData);

  // ---- Virtualized list setup ----
  const questions = result.sampleQuestions || [];
  const itemCount = questions.length;
  const shouldVirtualize = itemCount > MAX_VISIBLE_ITEMS;
  const listHeight = shouldVirtualize
    ? Math.min(maxListHeight, MAX_VISIBLE_ITEMS * ITEM_HEIGHT)
    : itemCount * ITEM_HEIGHT;

  const RowRenderer = useMemo(() => createRowRenderer(questions), [questions]);

  if (itemCount === 0) {
    return <p className="text-xs text-muted-foreground">{t('timeline.noSampleQuestions')}</p>;
  }

  return (
    <div className="space-y-3">
      {/* 1. Adaptive Difficulty Curve */}
      <CollapsibleSection
        title={t('timeline.adaptiveCurve')}
        icon={<LineChartIcon className="h-4 w-4 text-muted-foreground" />}
        defaultOpen={true}
      >
        <AdaptiveCurveChart data={deferredChartData} isLoaded={isLoaded} />
      </CollapsibleSection>

      {/* 2. Virtualized Question List */}
      <CollapsibleSection
        title={t('timeline.questionsCount', { count: itemCount })}
        icon={<ListOrdered className="h-4 w-4 text-muted-foreground" />}
        defaultOpen={true}
      >
        {shouldVirtualize && (
          <div className="flex justify-end px-1 mb-1">
            <span className="text-[10px] text-muted-foreground">
              {t('timeline.scrollToSeeAll')}
            </span>
          </div>
        )}

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
              <QuestionCard key={question.id || index} question={question} index={index} />
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* 3. Difficulty Balance Bar Chart */}
      <CollapsibleSection
        title={t('analytics.difficultyBalance')}
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        defaultOpen={false}
      >
        <DifficultyBarChart data={difficultyData} isLoaded={isLoaded} />
      </CollapsibleSection>

      {/* 4. Competency Distribution Pie Chart */}
      <CollapsibleSection
        title={t('analytics.coverageByCompetency')}
        icon={<PieChartIcon className="h-4 w-4 text-muted-foreground" />}
        defaultOpen={false}
      >
        <CompetencyPieChart data={competencyData} isLoaded={isLoaded} />
        <ChartLegend data={competencyData} />
      </CollapsibleSection>
    </div>
  );
});

export default QuestionsTab;
