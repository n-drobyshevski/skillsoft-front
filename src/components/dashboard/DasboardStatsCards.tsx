"use client";

import React from "react";
import StatsCard from "@/components/data-display/StatsCard";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { DashboardStats } from "@/types/domain";
import { competencyCategoryToIcon } from "@/lib/ui-utils";

export default function DashboardStatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
      <StatsCard
        title="Competencies"
        value={stats.totalCompetencies}
        icon={TrendingUp}
      >
        <span className="hidden sm:inline">+12% from last month</span>
        <span className="sm:hidden">+12%</span>
      </StatsCard>
      <StatsCard
        title="Indicators"
        value={stats.totalBehavioralIndicators}
        icon={BarChart3}
      >
        <span className="hidden sm:inline">~{Math.round(stats.averageIndicatorsPerCompetency)} per competency</span>
        <span className="sm:hidden">~{Math.round(stats.averageIndicatorsPerCompetency)}/comp</span>
      </StatsCard>
      <StatsCard
        title="Questions"
        value={stats.totalAssessmentQuestions}
        icon={CheckCircle2}
      >
        <span className="hidden sm:inline">65% completion rate</span>
        <span className="sm:hidden">65% done</span>
      </StatsCard>
      <StatsCard
        title="Categories"
        value={Object.keys(stats.competenciesByCategory).length}
        icon={Layers}
      >
        <div className="flex items-center -space-x-1.5 sm:-space-x-2">
          {Object.keys(stats.competenciesByCategory)
            .slice(0, 3)
            .map((category) => (
              <div
                key={category}
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-muted flex items-center justify-center ring-2 ring-background"
                title={category.toLowerCase().replace("_", " ")}
              >
                {React.cloneElement(competencyCategoryToIcon(category), {
                  className: "h-2.5 w-2.5 sm:h-3 sm:w-3",
                })}
              </div>
            ))}
          {Object.keys(stats.competenciesByCategory).length > 3 && (
            <div
              className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-muted flex items-center justify-center text-[10px] sm:text-xs font-medium ring-2 ring-background"
              title="More categories"
            >
              +{Object.keys(stats.competenciesByCategory).length - 3}
            </div>
          )}
        </div>
      </StatsCard>
    </div>
  );
}