"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { StatsCard } from "@/components/ui/stats-card";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Layers,
  Target,
  Star,
  Award,
  Activity,
  HelpCircle,
  Zap
} from "lucide-react";

// Base entity stats interface
interface BaseStats {
  total: number;
  active?: number;
  inactive?: number;
  average?: number;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
}

// Competency-specific stats
interface CompetencyStats extends BaseStats {
  byLevel?: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  byCategory?: {
    technical: number;
    behavioral: number;
    leadership: number;
  };
  averageWeight?: number;
  withAssessments?: number;
}

// Behavioral Indicator-specific stats
interface BehavioralIndicatorStats extends BaseStats {
  byCompetency?: number;
  byLevel?: {
    observable: number;
    measurable: number;
    actionable: number;
  };
  withQuestions?: number;
  averageComplexity?: number;
}

// Assessment Question-specific stats
interface AssessmentQuestionStats extends BaseStats {
  byType?: {
    multipleChoice: number;
    essay: number;
    practical: number;
    scenario: number;
  };
  byDifficulty?: {
    easy: number;
    medium: number;
    hard: number;
  };
  withIndicators?: number;
  averageScore?: number;
}

type EntityStats = CompetencyStats | BehavioralIndicatorStats | AssessmentQuestionStats;

interface EntityStatsCardsProps {
  type: "competencies" | "behavioral-indicators" | "assessment-questions";
  data: EntityStats;
  loading?: boolean;
  onCardClick?: (cardType: string) => void;
  showTrends?: boolean;
  compact?: boolean;
}

export function EntityStatsCards({
  type,
  data,
  loading = false,
  onCardClick,
  showTrends = true,
  compact = false,
}: EntityStatsCardsProps) {
  const isMobile = useIsMobile();
  const size = compact ? "sm" : isMobile ? "sm" : "md";

  const getCompetencyCards = (stats: CompetencyStats) => [
    {
      key: "total",
      title: "Total Competencies",
      value: stats.total,
      icon: Layers,
      description: "Active competencies in system",
      trend: stats.trend,
      variant: "default" as const,
    },
    {
      key: "average-weight",
      title: "Average Weight",
      value: stats.averageWeight ? `${stats.averageWeight.toFixed(1)}%` : "N/A",
      icon: BarChart3,
      description: "Mean competency weight",
      variant: "info" as const,
    },
    {
      key: "with-assessments",
      title: "With Assessments",
      value: stats.withAssessments || 0,
      icon: CheckCircle2,
      description: "Competencies with active assessments",
      variant: "success" as const,
    },
    {
      key: "by-level",
      title: "Advanced Level",
      value: stats.byLevel?.advanced || 0,
      icon: TrendingUp,
      description: "Advanced & expert competencies",
      variant: "warning" as const,
    },
  ];

  const getBehavioralIndicatorCards = (stats: BehavioralIndicatorStats) => [
    {
      key: "total",
      title: "Total Indicators",
      value: stats.total,
      icon: Target,
      description: "Behavioral indicators defined",
      trend: stats.trend,
      variant: "default" as const,
    },
    {
      key: "with-questions",
      title: "With Questions",
      value: stats.withQuestions || 0,
      icon: HelpCircle,
      description: "Indicators with assessment questions",
      variant: "success" as const,
    },
    {
      key: "average-complexity",
      title: "Avg Complexity",
      value: stats.averageComplexity ? stats.averageComplexity.toFixed(1) : "N/A",
      icon: Activity,
      description: "Mean indicator complexity score",
      variant: "info" as const,
    },
    {
      key: "measurable",
      title: "Measurable",
      value: stats.byLevel?.measurable || 0,
      icon: Star,
      description: "Quantifiable indicators",
      variant: "warning" as const,
    },
  ];

  const getAssessmentQuestionCards = (stats: AssessmentQuestionStats) => [
    {
      key: "total",
      title: "Total Questions",
      value: stats.total,
      icon: HelpCircle,
      description: "Assessment questions available",
      trend: stats.trend,
      variant: "default" as const,
    },
    {
      key: "with-indicators",
      title: "With Indicators",
      value: stats.withIndicators || 0,
      icon: Target,
      description: "Questions linked to indicators",
      variant: "success" as const,
    },
    {
      key: "average-score",
      title: "Average Score",
      value: stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : "N/A",
      icon: Award,
      description: "Mean question performance",
      variant: "info" as const,
    },
    {
      key: "difficulty-hard",
      title: "Hard Questions",
      value: stats.byDifficulty?.hard || 0,
      icon: Zap,
      description: "High difficulty questions",
      variant: "destructive" as const,
    },
  ];

  const getCards = () => {
    switch (type) {
      case "competencies":
        return getCompetencyCards(data as CompetencyStats);
      case "behavioral-indicators":
        return getBehavioralIndicatorCards(data as BehavioralIndicatorStats);
      case "assessment-questions":
        return getAssessmentQuestionCards(data as AssessmentQuestionStats);
      default:
        return [];
    }
  };

  const cards = getCards();

  // Mobile optimization: show only 2 most important cards
  const displayCards = isMobile && !compact ? cards.slice(0, 2) : cards;

  return (
    <div className={cn(
      "grid gap-3 md:gap-4",
      isMobile && !compact
        ? "grid-cols-2"
        : compact
        ? "grid-cols-2 sm:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    )}>
      {displayCards.map((card) => (
        <StatsCard
          key={card.key}
          title={card.title}
          value={card.value}
          icon={card.icon}
          description={card.description}
          trend={showTrends ? card.trend : undefined}
          variant={card.variant}
          size={size}
          loading={loading}
          onClick={onCardClick ? () => onCardClick(card.key) : undefined}
        />
      ))}
    </div>
  );
}

export default EntityStatsCards;