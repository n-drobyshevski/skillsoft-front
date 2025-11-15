"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  TrendingUp,
  Users,
  BookOpen,
  ClipboardList,
  Target,
  HelpCircle,
  Layers,
  CheckCircle2,
  Star,
  Award,
  Zap,
  BarChart3
} from "lucide-react";
import MobileStatsCard from "./MobileStatsCard";

// Base stats interface that all entity stats extend
interface BaseEntityStats {
  total: number;
  active?: number;
  inactive?: number;
  trend?: {
    value: string;
    label: string;
    isPositive: boolean;
  };
}

// Entity-specific stats interfaces
interface CompetencyStats extends BaseEntityStats {
  withAssessments?: number;
  averageWeight?: number;
  byLevel?: {
    advanced: number;
    expert: number;
  };
}

interface BehavioralIndicatorStats extends BaseEntityStats {
  withQuestions?: number;
  averageComplexity?: number;
  measurable?: number;
}

interface AssessmentQuestionStats extends BaseEntityStats {
  withIndicators?: number;
  averageScore?: number;
  hardQuestions?: number;
}

// Dashboard stats (for backward compatibility)
interface DashboardStats {
  totalCompetencies: number;
  totalBehavioralIndicators: number;
  totalAssessmentQuestions: number;
  competenciesByCategory?: Record<string, number>;
  competenciesByLevel?: Record<string, number>;
  averageIndicatorsPerCompetency?: number;
}

type EntityStatsData = 
  | { type: "dashboard"; stats: DashboardStats }
  | { type: "competencies"; stats: CompetencyStats }
  | { type: "behavioral-indicators"; stats: BehavioralIndicatorStats }
  | { type: "assessment-questions"; stats: AssessmentQuestionStats };

interface FlexibleStatsCardsProps {
  data: EntityStatsData;
  loading?: boolean;
  onCardClick?: (cardKey: string) => void;
}

export default function FlexibleStatsCards({ data, loading = false, onCardClick }: FlexibleStatsCardsProps) {
  const isMobile = useIsMobile();

  // Constants for repeated strings
  const FROM_LAST_MONTH = "from last month";
  const SINCE_LAST_HOUR = "since last hour";

  if (loading) {
    if (isMobile) {
      return (
        <div className="grid grid-cols-2 gap-2 px-3 sm:gap-3 sm:px-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse min-h-[110px]">
              <CardHeader className="pb-2 p-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-3 pr-4 lg:pr-6 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card flex-1 min-w-[280px] max-w-[350px] animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get card configuration based on entity type
  const getCardConfigs = () => {
    switch (data.type) {
      case "dashboard":
        return [
          {
            key: "competencies",
            title: "Competencies",
            mobileTitle: "Competencies",
            value: data.stats.totalCompetencies,
            icon: BookOpen,
            trend: { value: "+20.1%", label: FROM_LAST_MONTH, isPositive: true },
            description: "Active"
          },
          {
            key: "indicators",
            title: "Behavioral Indicators",
            mobileTitle: "Indicators",
            value: data.stats.totalBehavioralIndicators,
            icon: Users,
            trend: { value: "+180.1%", label: FROM_LAST_MONTH, isPositive: true },
            description: "Total"
          },
          {
            key: "questions",
            title: "Assessment Questions",
            mobileTitle: "Questions",
            value: data.stats.totalAssessmentQuestions,
            icon: ClipboardList,
            trend: { value: "+19%", label: FROM_LAST_MONTH, isPositive: true },
            description: "Tests"
          },
          {
            key: "active",
            title: "Active Now",
            mobileTitle: "Active Now",
            value: "+573",
            icon: Activity,
            trend: { value: "+201", label: SINCE_LAST_HOUR, isPositive: true },
            description: "Live"
          }
        ];

      case "competencies":
        return [
          {
            key: "total",
            title: "Total Competencies",
            mobileTitle: "Total",
            value: data.stats.total,
            icon: Layers,
            trend: data.stats.trend,
            description: "Active competencies"
          },
          {
            key: "with-assessments",
            title: "With Assessments",
            mobileTitle: "Assessed",
            value: data.stats.withAssessments || 0,
            icon: CheckCircle2,
            trend: { value: "+12%", label: FROM_LAST_MONTH, isPositive: true },
            description: "Have assessments"
          },
          {
            key: "average-weight",
            title: "Average Weight",
            mobileTitle: "Avg Weight",
            value: data.stats.averageWeight ? `${data.stats.averageWeight.toFixed(1)}%` : "N/A",
            icon: BarChart3,
            trend: { value: "+2.3%", label: FROM_LAST_MONTH, isPositive: true },
            description: "Mean weight"
          },
          {
            key: "advanced",
            title: "Advanced Level",
            mobileTitle: "Advanced",
            value: (data.stats.byLevel?.advanced || 0) + (data.stats.byLevel?.expert || 0),
            icon: TrendingUp,
            trend: { value: "+8%", label: FROM_LAST_MONTH, isPositive: true },
            description: "High proficiency"
          }
        ];

      case "behavioral-indicators":
        return [
          {
            key: "total",
            title: "Total Indicators",
            mobileTitle: "Total",
            value: data.stats.total,
            icon: Target,
            trend: data.stats.trend,
            description: "Defined indicators"
          },
          {
            key: "with-questions",
            title: "With Questions",
            mobileTitle: "Assessed",
            value: data.stats.withQuestions || 0,
            icon: HelpCircle,
            trend: { value: "+15%", label: FROM_LAST_MONTH, isPositive: true },
            description: "Have questions"
          },
          {
            key: "measurable",
            title: "Measurable",
            mobileTitle: "Measurable",
            value: data.stats.measurable || 0,
            icon: Star,
            trend: { value: "+5%", label: FROM_LAST_MONTH, isPositive: true },
            description: "Quantifiable"
          },
          {
            key: "complexity",
            title: "Avg Complexity",
            mobileTitle: "Complexity",
            value: data.stats.averageComplexity ? data.stats.averageComplexity.toFixed(1) : "N/A",
            icon: Activity,
            trend: { value: "+0.2", label: FROM_LAST_MONTH, isPositive: true },
            description: "Mean complexity"
          }
        ];

      case "assessment-questions":
        return [
          {
            key: "total",
            title: "Total Questions",
            mobileTitle: "Total",
            value: data.stats.total,
            icon: HelpCircle,
            trend: data.stats.trend,
            description: "All questions"
          },
          {
            key: "with-indicators",
            title: "With Indicators",
            mobileTitle: "Linked",
            value: data.stats.withIndicators || 0,
            icon: Target,
            trend: { value: "+25%", label: FROM_LAST_MONTH, isPositive: true },
            description: "Indicator-linked"
          },
          {
            key: "average-score",
            title: "Average Score",
            mobileTitle: "Avg Score",
            value: data.stats.averageScore ? `${data.stats.averageScore.toFixed(1)}%` : "N/A",
            icon: Award,
            trend: { value: "+3.5%", label: FROM_LAST_MONTH, isPositive: true },
            description: "Performance"
          },
          {
            key: "hard-questions",
            title: "Hard Questions",
            mobileTitle: "Hard",
            value: data.stats.hardQuestions || 0,
            icon: Zap,
            trend: { value: "+7", label: FROM_LAST_MONTH, isPositive: false },
            description: "High difficulty"
          }
        ];

      default:
        return [];
    }
  };

  const cardConfigs = getCardConfigs();

  if (isMobile) {
    // Mobile layout: Compact cards in 2x2 grid
    return (
      <div className="grid grid-cols-2 gap-2 px-3 sm:gap-3 sm:px-4">
        {cardConfigs.map((config) => (
          <div 
            key={config.key}
            className={onCardClick ? "cursor-pointer" : ""}
            onClick={onCardClick ? () => onCardClick(config.key) : undefined}
          >
            <MobileStatsCard
              title={config.mobileTitle}
              value={config.value}
              icon={config.icon}
              trend={config.trend}
              description={config.description}
            />
          </div>
        ))}
      </div>
    );
  }

  // Desktop layout: Detailed cards
  return (
    <div className="flex flex-wrap gap-3 sm:gap-4">
      {cardConfigs.map((config) => (
        <Card 
          key={config.key}
          className={`@container/card flex-1 min-w-[280px] ${
            onCardClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
          }`}
          onClick={onCardClick ? () => onCardClick(config.key) : undefined}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs sm:text-sm font-medium">
              {config.title}
            </CardDescription>
            <config.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {config.value}
            </CardTitle>
            {config.trend && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Badge 
                  variant="outline" 
                  className={`${
                    config.trend.isPositive 
                      ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950"
                      : "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950"
                  }`}
                >
                  <TrendingUp className={`mr-1 h-2 w-2 sm:h-3 sm:w-3 ${
                    config.trend.isPositive ? '' : 'rotate-180'
                  }`} />
                  <span className="text-xs">{config.trend.value}</span>
                </Badge>
                <span className="hidden sm:inline">{config.trend.label}</span>
                <span className="sm:hidden">
                  {config.trend.label.includes('hour') ? 'last hour' : 'last month'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}