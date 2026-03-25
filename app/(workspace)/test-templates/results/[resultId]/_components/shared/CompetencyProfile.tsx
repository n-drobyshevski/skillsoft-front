'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Target,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Loader2,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getScoreInterpretation, getProficiencyLabel } from '@/lib/scoreInterpretation';
import type { CompetencyScore, IndicatorScore, QuestionScore } from '@/types/domain';
import { testResultsApi } from '@/services/api';

// ============================================================================
// Types
// ============================================================================

interface CompetencyProfileProps {
  competencies: CompetencyScore[];
  resultId: string;
  showPassFail?: boolean;
  passingScore?: number;
  className?: string;
  expandedCompetencyId?: string | null;
}

type PerformanceTier = 'excellent' | 'good' | 'average' | 'developing';

// ============================================================================
// Tier Configuration
// ============================================================================

function getTier(percentage: number, showPassFail: boolean, passingScore = 70): PerformanceTier {
  if (!showPassFail) {
    return percentage >= passingScore ? 'good' : 'developing';
  }
  if (percentage >= passingScore + 20) return 'excellent';
  if (percentage >= passingScore) return 'good';
  if (percentage >= passingScore - 20) return 'average';
  return 'developing';
}

const TIER_CONFIG = {
  excellent: {
    labelKey: 'tier.excellent' as const,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    progress: 'bg-emerald-500',
  },
  good: {
    labelKey: 'tier.good' as const,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    progress: 'bg-blue-500',
  },
  average: {
    labelKey: 'tier.average' as const,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    progress: 'bg-amber-500',
  },
  developing: {
    labelKey: 'tier.developing' as const,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-muted',
    progress: 'bg-muted-foreground',
  },
} as const;

// Rank badge styling
const RANK_BADGE_PASSED = 'bg-primary/10 text-primary';
const RANK_BADGE_DEFAULT = 'bg-muted text-muted-foreground';

/**
 * Get the tier config for neutral (non-pass/fail) mode using the 5-level system.
 * Returns an object matching the shape of TIER_CONFIG entries.
 */
function getNeutralConfig(percentage: number, t: ReturnType<typeof useTranslations<'template.resultsView'>>, proficiencyLabel?: string) {
  const interpretation = getScoreInterpretation(percentage);
  const label = getProficiencyLabel(interpretation.level, (key: string) => t(key), proficiencyLabel);
  return {
    labelKey: `proficiencyLevel.${interpretation.level}` as const,
    label,
    color: interpretation.color,
    bg: interpretation.bgColor,
    border: interpretation.borderColor,
    progress: interpretation.progressColor,
  };
}

// ============================================================================
// CI Tooltip Component (Task 6)
// ============================================================================

interface CiTooltipProps {
  ciLower: number;
  ciUpper: number;
  t: ReturnType<typeof useTranslations<'template.resultsView'>>;
}

function CiTooltip({ ciLower, ciUpper, t }: CiTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex items-center shrink-0" aria-label="Confidence interval">
          <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <span>{t('confidenceInterval', { lower: Math.round(ciLower), upper: Math.round(ciUpper) })}</span>
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================================
// Evidence Sufficiency Warning (Task 7)
// ============================================================================

interface EvidenceWarningProps {
  evidenceNote?: string;
  t: ReturnType<typeof useTranslations<'template.resultsView'>>;
}

function EvidenceWarning({ evidenceNote, t }: EvidenceWarningProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex items-center shrink-0" aria-label={t('insufficientEvidence')}>
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 hover:text-amber-600 transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px]">
        <span>{evidenceNote ?? t('insufficientEvidenceTooltip')}</span>
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================================
// Competency Details Component (Expanded Accordion Content)
// ============================================================================

interface CompetencyDetailsProps {
  competency: CompetencyScore;
  resultId: string;
  showPassFail: boolean;
  passingScore: number;
  t: ReturnType<typeof useTranslations<'template.resultsView'>>;
}

function CompetencyDetails({ competency, resultId, showPassFail, passingScore, t }: CompetencyDetailsProps) {
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  const hasIndicators = competency.indicatorScores && competency.indicatorScores.length > 0;

  // Calculate stats
  const totalQuestions = competency.questionsAnswered ?? 0;
  const scoreRatio = `${Math.round(competency.score)}/${Math.round(competency.maxScore)}`;

  return (
    <div className="space-y-4">
      {/* Quick Stats Row */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg text-xs">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t('score')}:</span>
          <span className="font-semibold">{scoreRatio}</span>
        </div>
        {totalQuestions > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg text-xs">
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{t('questions')}:</span>
            <span className="font-semibold">{totalQuestions}</span>
          </div>
        )}
        {competency.weight && competency.weight !== 1 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg text-xs">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{t('weight')}:</span>
            <span className="font-semibold">&times;{competency.weight}</span>
          </div>
        )}
        {/* Task 6: Confidence interval tooltip in stats row */}
        {competency.ciLower != null && competency.ciUpper != null && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg text-xs">
            <CiTooltip ciLower={competency.ciLower} ciUpper={competency.ciUpper} t={t} />
            <span className="text-muted-foreground tabular-nums">
              {Math.round(competency.ciLower)}% &ndash; {Math.round(competency.ciUpper)}%
            </span>
          </div>
        )}
        {/* Task 7: Insufficient evidence warning in stats row */}
        {competency.insufficientEvidence && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-lg text-xs">
            <EvidenceWarning evidenceNote={competency.evidenceNote} t={t} />
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {t('insufficientEvidence')}
            </span>
          </div>
        )}
      </div>

      {/* Behavioral Indicators */}
      {hasIndicators ? (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('behavioralIndicators', { count: competency.indicatorScores!.length })}
          </div>
          <div className="space-y-1.5">
            {competency.indicatorScores!.map((indicator) => (
              <IndicatorRow
                key={indicator.indicatorId}
                indicator={indicator}
                resultId={resultId}
                showPassFail={showPassFail}
                passingScore={passingScore}
                isExpanded={expandedIndicator === indicator.indicatorId}
                onToggle={() => setExpandedIndicator(
                  expandedIndicator === indicator.indicatorId ? null : indicator.indicatorId
                )}
                t={t}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-3 bg-muted/20 rounded-lg">
          {t('detailedBreakdownNotAvailable')}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Indicator Row Component (with lazy-loaded expandable questions)
// ============================================================================

interface IndicatorRowProps {
  indicator: IndicatorScore;
  resultId: string;
  showPassFail: boolean;
  passingScore: number;
  isExpanded: boolean;
  onToggle: () => void;
  t: ReturnType<typeof useTranslations<'template.resultsView'>>;
}

function IndicatorRow({ indicator, resultId, showPassFail, passingScore, isExpanded, onToggle, t }: IndicatorRowProps) {
  const percentage = Math.round(indicator.percentage);
  const config = showPassFail
    ? TIER_CONFIG[getTier(percentage, showPassFail, passingScore)]
    : getNeutralConfig(percentage, t, indicator.proficiencyLabel);

  // State for lazy-loaded question scores
  const [questionScores, setQuestionScores] = useState<QuestionScore[] | null>(
    indicator.questionScores || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const questionsCount = indicator.questionsAnswered || questionScores?.length || 0;
  const hasQuestions = questionsCount > 0;

  // Lazy-load questions when expanding
  const handleToggle = useCallback(async () => {
    // If already have questions loaded, just toggle
    if (questionScores && questionScores.length > 0) {
      onToggle();
      return;
    }

    // If no questions count, nothing to load
    if (!hasQuestions) {
      return;
    }

    // If we're collapsing, just toggle
    if (isExpanded) {
      onToggle();
      return;
    }

    // Fetch question scores on first expand
    setIsLoading(true);
    setLoadError(null);

    try {
      const scores = await testResultsApi.getIndicatorQuestionScores(
        resultId,
        indicator.indicatorId
      );
      setQuestionScores(scores);
      onToggle();
    } catch (error) {
      console.error('Failed to load question scores:', error);
      setLoadError(t('questionLoadError'));
    } finally {
      setIsLoading(false);
    }
  }, [questionScores, hasQuestions, isExpanded, resultId, indicator.indicatorId, onToggle, t]);

  const displayQuestions = questionScores || indicator.questionScores;
  const hasLoadedQuestions = displayQuestions && displayQuestions.length > 0;

  return (
    <div className={cn(
      'rounded-lg border transition-all',
      isExpanded ? 'bg-muted/30 border-border' : 'border-transparent hover:bg-muted/20'
    )}>
      {/* Indicator Header */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={!hasQuestions || isLoading}
        className={cn(
          'w-full p-2.5 flex items-center gap-2 text-left',
          hasQuestions && !isLoading && 'cursor-pointer',
          (!hasQuestions || isLoading) && 'cursor-default'
        )}
      >
        {/* Progress indicator dot */}
        <div className={cn('w-2 h-2 rounded-full shrink-0', config.progress)} />

        {/* Title */}
        <div className="flex-1 min-w-0 text-sm truncate">
          {indicator.indicatorTitle}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
        )}

        {/* Questions count */}
        {questionsCount > 0 && !isLoading && (
          <span className="text-xs text-muted-foreground shrink-0">
            {questionsCount} {t('questionShort')}
          </span>
        )}

        {/* Progress bar */}
        <div className="w-14 h-1.5 bg-muted/50 rounded-full overflow-hidden shrink-0">
          <div
            className={cn('h-full rounded-full', config.progress)}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Score */}
        <span className={cn('text-sm font-semibold tabular-nums w-10 text-right shrink-0', config.color)}>
          {percentage}%
        </span>

        {/* Expand icon */}
        {hasQuestions && !isLoading && (
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground transition-transform shrink-0',
            isExpanded && 'rotate-180'
          )} />
        )}
      </button>

      {/* Error state */}
      {loadError && (
        <div className="px-2.5 pb-2.5">
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{loadError}</span>
            <button
              type="button"
              onClick={handleToggle}
              className="ml-auto text-xs underline hover:no-underline"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {/* Question Details */}
      {isExpanded && hasLoadedQuestions && (
        <div className="px-2.5 pb-2.5 space-y-1.5">
          <div className="h-px bg-border/50 mb-2" />
          {displayQuestions!.map((question, qIndex) => {
            const qPercentage = question.maxScore > 0
              ? Math.round((question.score / question.maxScore) * 100)
              : 0;
            const isPassed = qPercentage >= passingScore;

            return (
              <div
                key={question.questionId}
                className="flex items-start gap-2 p-2 bg-background/50 rounded-md text-xs"
              >
                {/* Question number & status icon */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-muted-foreground">Q{qIndex + 1}</span>
                  {showPassFail && (
                    isPassed
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      : <XCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>

                {/* Question text */}
                <div className="flex-1 min-w-0 text-muted-foreground line-clamp-2">
                  {question.questionText}
                </div>

                {/* Score & time */}
                <div className="flex items-center gap-2 shrink-0">
                  {question.timeSpentSeconds > 0 && (
                    <div className="flex items-center gap-0.5 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{Math.round(question.timeSpentSeconds)}s</span>
                    </div>
                  )}
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs px-1.5 py-0',
                      isPassed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    )}
                  >
                    {question.score}/{question.maxScore}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Summary Stats Component
// ============================================================================

interface SummaryStatsProps {
  competencies: CompetencyScore[];
  t: ReturnType<typeof useTranslations<'template.resultsView'>>;
}

function SummaryStats({ competencies, t }: SummaryStatsProps) {
  const stats = useMemo(() => {
    if (competencies.length === 0) return { avg: 0, best: 0, bestName: '', growthArea: 0, growthName: '' };

    const sorted = [...competencies].sort((a, b) => b.percentage - a.percentage);
    const avg = Math.round(competencies.reduce((sum, c) => sum + c.percentage, 0) / competencies.length);

    return {
      avg,
      best: Math.round(sorted[0].percentage),
      bestName: sorted[0].competencyName,
      growthArea: Math.round(sorted[sorted.length - 1].percentage),
      growthName: sorted[sorted.length - 1].competencyName,
    };
  }, [competencies]);

  return (
    <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-xl">
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-0.5">{t('stats.average')}</div>
        <div className="text-lg font-bold tabular-nums">{stats.avg}%</div>
      </div>
      <div className="text-center border-x border-border/50">
        <div className="text-xs text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
          <TrendingUp className="h-3 w-3 text-primary" />
          {t('stats.best')}
        </div>
        <div className="text-lg font-bold tabular-nums text-primary">{stats.best}%</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
          <TrendingDown className="h-3 w-3" />
          {t('stats.growth')}
        </div>
        <div className="text-lg font-bold tabular-nums text-muted-foreground">{stats.growthArea}%</div>
      </div>
    </div>
  );
}

// ============================================================================
// Mobile Competency Card
// ============================================================================

interface MobileCompetencyCardProps {
  competency: CompetencyScore;
  resultId: string;
  rank: number;
  showPassFail: boolean;
  passingScore: number;
  isExpanded: boolean;
  onToggle: () => void;
  t: ReturnType<typeof useTranslations<'template.resultsView'>>;
}

function MobileCompetencyCard({ competency, resultId, rank, showPassFail, passingScore, isExpanded, onToggle, t }: MobileCompetencyCardProps) {
  const percentage = Math.round(competency.percentage);
  const tier = getTier(percentage, showPassFail, passingScore);
  // Task 5: Use 5-level system for neutral mode
  const config = showPassFail
    ? TIER_CONFIG[tier]
    : getNeutralConfig(percentage, t, competency.proficiencyLabel);
  const isInsufficientEvidence = competency.insufficientEvidence === true;

  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        isExpanded ? config.border : 'border-border/50',
        isExpanded && config.bg,
        isInsufficientEvidence && 'opacity-60'
      )}
    >
      {/* Main Row - Clickable Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3 text-left"
      >
        <div className="flex items-center gap-3">
          {/* Rank Badge */}
          <span className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
            percentage >= 50 ? RANK_BADGE_PASSED : RANK_BADGE_DEFAULT
          )}>
            {rank}
          </span>

          {/* Name & Category */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate flex items-center gap-1.5">
              {competency.competencyName}
              {/* Task 7: Evidence warning icon */}
              {isInsufficientEvidence && (
                <EvidenceWarning evidenceNote={competency.evidenceNote} t={t} />
              )}
              {/* Task 6: CI tooltip icon */}
              {competency.ciLower != null && competency.ciUpper != null && !isInsufficientEvidence && (
                <CiTooltip ciLower={competency.ciLower} ciUpper={competency.ciUpper} t={t} />
              )}
            </div>
            {competency.competencyCategory && (
              <div className="text-xs text-muted-foreground truncate">{competency.competencyCategory}</div>
            )}
          </div>

          {/* Score Circle */}
          <div className={cn(
            'w-11 h-11 rounded-full flex flex-col items-center justify-center shrink-0',
            config.bg
          )}>
            <span className={cn('text-sm font-bold tabular-nums', config.color)}>
              {percentage}%
            </span>
          </div>

          {/* Expand Button Icon */}
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
              'bg-muted/50',
              isExpanded && 'bg-primary/10 text-primary'
            )}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-180')} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', config.progress)}
              style={{
                width: `${percentage}%`,
                ...(isInsufficientEvidence && {
                  backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 5px)',
                }),
              }}
            />
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 border-t border-border/30">
          <div className="pt-3">
            <CompetencyDetails
              competency={competency}
              resultId={resultId}
              showPassFail={showPassFail}
              passingScore={passingScore}
              t={t}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Desktop Accordion Item
// ============================================================================

interface DesktopCompetencyRowProps {
  competency: CompetencyScore;
  resultId: string;
  rank: number;
  showPassFail: boolean;
  passingScore: number;
  t: ReturnType<typeof useTranslations<'template.resultsView'>>;
}

function DesktopCompetencyRow({ competency, resultId, rank, showPassFail, passingScore, t }: DesktopCompetencyRowProps) {
  const percentage = Math.round(competency.percentage);
  const tier = getTier(percentage, showPassFail, passingScore);
  // Task 5: Use 5-level system for neutral mode
  const config = showPassFail
    ? TIER_CONFIG[tier]
    : getNeutralConfig(percentage, t, competency.proficiencyLabel);
  const tierLabel = showPassFail ? t(TIER_CONFIG[tier].labelKey) : ('label' in config ? config.label : '');
  const isInsufficientEvidence = competency.insufficientEvidence === true;

  return (
    <AccordionItem
      value={competency.competencyId}
      className={cn(
        'border rounded-lg px-4 data-[state=open]:bg-muted/20',
        isInsufficientEvidence && 'opacity-60'
      )}
    >
      <AccordionTrigger className="hover:no-underline py-3 [&>svg]:shrink-0 [&>svg]:ml-2">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Rank */}
          <span className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
            percentage >= 50 ? RANK_BADGE_PASSED : RANK_BADGE_DEFAULT
          )}>
            {rank}
          </span>

          {/* Name & Category */}
          <div className="flex-1 min-w-0 text-left">
            <div className="font-medium truncate flex items-center gap-1.5">
              {competency.competencyName}
              {/* Task 7: Evidence warning icon */}
              {isInsufficientEvidence && (
                <EvidenceWarning evidenceNote={competency.evidenceNote} t={t} />
              )}
              {/* Task 6: CI tooltip */}
              {competency.ciLower != null && competency.ciUpper != null && !isInsufficientEvidence && (
                <CiTooltip ciLower={competency.ciLower} ciUpper={competency.ciUpper} t={t} />
              )}
            </div>
            {competency.competencyCategory && (
              <Badge variant="outline" className="mt-1 text-xs">
                {competency.competencyCategory}
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-32 lg:w-48 h-2 bg-muted/30 rounded-full overflow-hidden shrink-0">
            <div
              className={cn('h-full rounded-full transition-all', config.progress)}
              style={{
                width: `${percentage}%`,
                ...(isInsufficientEvidence && {
                  backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 5px)',
                }),
              }}
            />
          </div>

          {/* Score */}
          <div className={cn(
            'px-3 py-1 rounded-full text-sm font-bold tabular-nums shrink-0',
            config.bg, config.color
          )}>
            {percentage}%
          </div>

          {/* Tier Label - 5-level for neutral, 4-level for pass/fail */}
          <Badge variant="secondary" className={cn('shrink-0', config.bg, config.color)}>
            {tierLabel}
          </Badge>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-4">
        <div className="ml-12 p-4 bg-background/50 rounded-lg border">
          <CompetencyDetails
            competency={competency}
            resultId={resultId}
            showPassFail={showPassFail}
            passingScore={passingScore}
            t={t}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CompetencyProfile({
  competencies,
  resultId,
  showPassFail = false,
  passingScore = 70,
  className,
  expandedCompetencyId,
}: CompetencyProfileProps) {
  const t = useTranslations('template.resultsView');
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined);

  // Sync expandedCompetencyId to desktop accordion and mobile expanded state
  useEffect(() => {
    if (expandedCompetencyId) {
      setAccordionValue(expandedCompetencyId);
      setExpandedMobile(expandedCompetencyId);
    }
  }, [expandedCompetencyId]);

  // Sort by percentage descending
  const sortedCompetencies = useMemo(
    () => [...competencies].sort((a, b) => b.percentage - a.percentage),
    [competencies]
  );

  // Count competencies with insufficient evidence for summary badge
  const insufficientEvidenceCount = useMemo(
    () => competencies.filter(c => c.insufficientEvidence === true).length,
    [competencies]
  );

  // Show only top 5 on mobile initially
  const MOBILE_INITIAL_COUNT = 5;
  const displayedCompetencies = showAll
    ? sortedCompetencies
    : sortedCompetencies.slice(0, MOBILE_INITIAL_COUNT);
  const hasMore = sortedCompetencies.length > MOBILE_INITIAL_COUNT;

  if (competencies.length === 0) {
    return (
      <Card className={cn('rounded-xl shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200', className)}>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t('noCompetencyData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('rounded-xl shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('competencyProfile')}
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground/50 hover:text-muted-foreground transition-colors touch-manipulation"
                    aria-label={`Help: ${t('competencyProfile')}`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px]">
                  {t('tooltips.competencyProfile')}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          {insufficientEvidenceCount > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs gap-1 shrink-0"
            >
              <AlertTriangle className="h-3 w-3" />
              {t('lowConfidenceCount', { count: insufficientEvidenceCount })}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <SummaryStats competencies={competencies} t={t} />

        {/* Mobile View */}
        <div className="sm:hidden space-y-2">
          {displayedCompetencies.map((comp, index) => (
            <MobileCompetencyCard
              key={comp.competencyId}
              competency={comp}
              resultId={resultId}
              rank={index + 1}
              showPassFail={showPassFail}
              passingScore={passingScore}
              isExpanded={expandedMobile === comp.competencyId}
              onToggle={() => setExpandedMobile(
                expandedMobile === comp.competencyId ? null : comp.competencyId
              )}
              t={t}
            />
          ))}

          {/* Show More Button */}
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-3 text-sm font-medium text-primary flex items-center justify-center gap-1 rounded-lg border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
            >
              {showAll ? t('showLess') : t('showMore', { count: sortedCompetencies.length - MOBILE_INITIAL_COUNT })}
              <ChevronDown className={cn('h-4 w-4 transition-transform', showAll && 'rotate-180')} />
            </button>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
          <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue} className="space-y-1">
            {sortedCompetencies.map((comp, index) => (
              <DesktopCompetencyRow
                key={comp.competencyId}
                competency={comp}
                resultId={resultId}
                rank={index + 1}
                showPassFail={showPassFail}
                passingScore={passingScore}
                t={t}
              />
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}

export default CompetencyProfile;
