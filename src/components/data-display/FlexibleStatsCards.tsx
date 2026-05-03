"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  TrendingUp,
  Users,
  UsersRound,
  BookOpen,
  ClipboardList,
  Target,
  HelpCircle,
  Layers,
  CheckCircle2,
  Star,
  Award,
  Zap,
  BarChart3,
  UserCheck,
  Shield,
  Clock,
  LucideProps
} from "lucide-react";
import MobileStatsCard from "./MobileStatsCard";
import { HelpTooltip } from "@/components/ui/help-tooltip";

const TYPE_TO_NAMESPACE: Record<string, string> = {
  "dashboard": "dashboard",
  "competencies": "competency",
  "behavioral-indicators": "indicator",
  "assessment-questions": "question",
  "users": "users",
};

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
  averageTimeLimitSeconds?: number;
  hardQuestions?: number;
}

// Users stats interface
interface UsersStats extends BaseEntityStats {
  byRole?: {
    admin: number;
    editor: number;
    user: number;
  };
  recentlyActive?: number;
}

// Dashboard stats (for backward compatibility)
interface DashboardStats {
  totalCompetencies: number;
  totalBehavioralIndicators: number;
  totalAssessmentQuestions: number;
  totalTestTemplates?: number;
  activeTestTemplates?: number;
  competenciesByCategory?: Record<string, number>;
  competenciesByLevel?: Record<string, number>;
  averageIndicatorsPerCompetency?: number;
}

type EntityStatsData = 
  | { type: "dashboard"; stats: DashboardStats }
  | { type: "competencies"; stats: CompetencyStats }
  | { type: "behavioral-indicators"; stats: BehavioralIndicatorStats }
  | { type: "assessment-questions"; stats: AssessmentQuestionStats }
  | { type: "users"; stats: UsersStats };

// Card configuration interface for type safety
interface CardConfig {
  key: string;
  title: string;
  mobileTitle: string;
  value: number | string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  href?: string;
  trend?: {
    value: string;
    label: string;
    isPositive: boolean;
  };
  description: string;
  tooltip?: string;
}

interface FlexibleStatsCardsProps {
  data: EntityStatsData;
  loading?: boolean;
  onCardClick?: (cardKey: string) => void;
}

export default function FlexibleStatsCards({ data, loading = false, onCardClick }: FlexibleStatsCardsProps) {
  const isMobile = useIsMobile();
  const t = useTranslations(`${TYPE_TO_NAMESPACE[data.type]}.statsCards`);

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
  const getCardConfigs = (): CardConfig[] => {
    switch (data.type) {
      case "dashboard":
        return [
          {
            key: "competencies",
            title: t("competencies"),
            mobileTitle: t("competenciesMobile"),
            value: data.stats.totalCompetencies,
            icon: Target,
            href: "/hr/competencies",
            trend: undefined,
            description: data.stats.competenciesByCategory
              ? t("competenciesDescCategories", { count: Object.keys(data.stats.competenciesByCategory).length })
              : t("competenciesDescDefault")
          },
          {
            key: "indicators",
            title: t("indicators"),
            mobileTitle: t("indicatorsMobile"),
            value: data.stats.totalBehavioralIndicators,
            icon: Layers,
            href: "/hr/behavioral-indicators",
            trend: undefined,
            description: data.stats.averageIndicatorsPerCompetency
              ? t("indicatorsDescAvg", { value: data.stats.averageIndicatorsPerCompetency.toFixed(1) })
              : t("indicatorsDescDefault")
          },
          {
            key: "questions",
            title: t("questions"),
            mobileTitle: t("questionsMobile"),
            value: data.stats.totalAssessmentQuestions,
            icon: ClipboardList,
            href: "/hr/assessment-questions",
            trend: undefined,
            description: t("questionsDesc")
          },
          {
            key: "templates",
            title: t("templates"),
            mobileTitle: t("templatesMobile"),
            value: data.stats.totalTestTemplates ?? 0,
            icon: Activity,
            href: "/test-templates",
            trend: undefined,
            description: data.stats.activeTestTemplates !== undefined
              ? t("templatesDescActive", { count: data.stats.activeTestTemplates })
              : t("templatesDescDefault")
          }
        ];

      case "competencies":
        return [
          {
            key: "total",
            title: t("total"),
            mobileTitle: t("totalMobile"),
            value: data.stats.total,
            icon: Layers,
            trend: data.stats.trend,
            description: t("totalDesc"),
            tooltip: t("totalTooltip")
          },
          {
            key: "with-assessments",
            title: t("withIndicators"),
            mobileTitle: t("withIndicatorsMobile"),
            value: data.stats.withAssessments || 0,
            icon: CheckCircle2,
            description: t("withIndicatorsDesc"),
            tooltip: t("withIndicatorsTooltip")
          },
          {
            key: "average-weight",
            title: t("avgWeight"),
            mobileTitle: t("avgWeightMobile"),
            value: data.stats.averageWeight != null && data.stats.averageWeight > 0 ? data.stats.averageWeight.toFixed(1) : "—",
            icon: BarChart3,
            description: t("avgWeightDesc"),
            tooltip: t("avgWeightTooltip")
          },
          {
            key: "advanced",
            title: t("advanced"),
            mobileTitle: t("advancedMobile"),
            value: (data.stats.byLevel?.advanced || 0) + (data.stats.byLevel?.expert || 0),
            icon: TrendingUp,
            description: t("advancedDesc"),
            tooltip: t("advancedTooltip")
          }
        ];

      case "behavioral-indicators":
        return [
          {
            key: "total",
            title: t("total"),
            mobileTitle: t("totalMobile"),
            value: data.stats.total,
            icon: Target,
            trend: data.stats.trend,
            description: t("totalDesc"),
            tooltip: t("totalTooltip")
          },
          {
            key: "with-questions",
            title: t("withQuestions"),
            mobileTitle: t("withQuestionsMobile"),
            value: data.stats.withQuestions || 0,
            icon: HelpCircle,
            description: t("withQuestionsDesc"),
            tooltip: t("withQuestionsTooltip")
          },
          {
            key: "measurable",
            title: t("measurable"),
            mobileTitle: t("measurableMobile"),
            value: data.stats.measurable || 0,
            icon: Star,
            description: t("measurableDesc"),
            tooltip: t("measurableTooltip")
          },
          {
            key: "complexity",
            title: t("complexity"),
            mobileTitle: t("complexityMobile"),
            value: data.stats.averageComplexity != null && data.stats.averageComplexity > 0 ? data.stats.averageComplexity.toFixed(1) : "—",
            icon: Activity,
            description: t("complexityDesc"),
            tooltip: t("complexityTooltip")
          }
        ];

      case "assessment-questions":
        return [
          {
            key: "total",
            title: t("total"),
            mobileTitle: t("totalMobile"),
            value: data.stats.total,
            icon: HelpCircle,
            trend: data.stats.trend,
            description: t("totalDesc"),
            tooltip: t("totalTooltip")
          },
          {
            key: "with-indicators",
            title: t("withIndicators"),
            mobileTitle: t("withIndicatorsMobile"),
            value: data.stats.withIndicators || 0,
            icon: Target,
            description: t("withIndicatorsDesc"),
            tooltip: t("withIndicatorsTooltip")
          },
          {
            key: "avg-time-limit",
            title: t("avgTimeLimit"),
            mobileTitle: t("avgTimeLimitMobile"),
            value: data.stats.averageTimeLimitSeconds != null && data.stats.averageTimeLimitSeconds > 0 ? `${data.stats.averageTimeLimitSeconds.toFixed(1)}s` : "—",
            icon: Clock,
            description: t("avgTimeLimitDesc"),
            tooltip: t("avgTimeLimitTooltip")
          },
          {
            key: "hard-questions",
            title: t("hardQuestions"),
            mobileTitle: t("hardQuestionsMobile"),
            value: data.stats.hardQuestions || 0,
            icon: Zap,
            description: t("hardQuestionsDesc"),
            tooltip: t("hardQuestionsTooltip")
          }
        ];

      case "users":
        return [
          {
            key: "total",
            title: t("total"),
            mobileTitle: t("totalMobile"),
            value: data.stats.total,
            icon: UsersRound,
            trend: data.stats.trend,
            description: t("totalDesc")
          },
          {
            key: "active",
            title: t("active"),
            mobileTitle: t("activeMobile"),
            value: data.stats.active || 0,
            icon: UserCheck,
            description: t("activeDesc")
          },
          {
            key: "admins",
            title: t("admins"),
            mobileTitle: t("adminsMobile"),
            value: data.stats.byRole?.admin || 0,
            icon: Shield,
            description: t("adminsDesc")
          },
          {
            key: "recently-active",
            title: t("recentlyActive"),
            mobileTitle: t("recentlyActiveMobile"),
            value: data.stats.recentlyActive || 0,
            icon: Clock,
            description: t("recentlyActiveDesc")
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
            <CardDescription className="text-xs sm:text-sm font-medium inline-flex items-center">
              {config.title}
              {config.tooltip && (
                <HelpTooltip
                  content={config.tooltip}
                  variant="info"
                  size="sm"
                  side="top"
                  maxWidth={260}
                />
              )}
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
                  {config.trend.label}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}