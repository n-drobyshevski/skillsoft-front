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
  ClipboardList
} from "lucide-react";
import { DashboardStats } from "@/types/domain";
import MobileStatsCard from "./MobileStatsCard";

interface ResponsiveStatsCardsProps {
  stats: DashboardStats;
}

export default function ResponsiveStatsCards({ stats }: ResponsiveStatsCardsProps) {
  const isMobile = useIsMobile();

  // Constants for repeated strings
  const FROM_LAST_MONTH = "from last month";
  const SINCE_LAST_HOUR = "since last hour";

  if (isMobile) {
    // Mobile layout: Compact cards in 2x2 grid
    return (
      <div className="grid grid-cols-2 gap-2 px-3 sm:gap-3 sm:px-4">
        <MobileStatsCard
          title="Competencies"
          value={stats.totalCompetencies}
          icon={BookOpen}
          trend={{
            value: "+20.1%",
            label: FROM_LAST_MONTH,
            isPositive: true
          }}
          description="Active"
        />
        
        <MobileStatsCard
          title="Indicators"
          value={stats.totalBehavioralIndicators}
          icon={Users}
          trend={{
            value: "+180.1%",
            label: FROM_LAST_MONTH, 
            isPositive: true
          }}
          description="Total"
        />
        
        <MobileStatsCard
          title="Questions"
          value={stats.totalAssessmentQuestions}
          icon={ClipboardList}
          trend={{
            value: "+19%",
            label: FROM_LAST_MONTH,
            isPositive: true
          }}
          description="Tests"
        />
        
        <MobileStatsCard
          title="Active Now"
          value="+573"
          icon={Activity}
          trend={{
            value: "+201",
            label: SINCE_LAST_HOUR,
            isPositive: true
          }}
          description="Live"
        />
      </div>
    );
  }

  // Desktop layout: Original detailed cards
  return (
    <div className="flex flex-wrap gap-3 px-4 lg:px-6 sm:gap-4">
      <Card className="@container/card flex-1 min-w-[280px] max-w-[350px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription className="text-xs sm:text-sm font-medium">
            Total Competencies
          </CardDescription>
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalCompetencies}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950">
              <TrendingUp className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
              <span className="text-xs">+20.1%</span>
            </Badge>
            <span className="text-xs">{FROM_LAST_MONTH}</span>
            <span className="sm:hidden">last month</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="@container/card flex-1 min-w-[280px] max-w-[350px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription className="text-xs sm:text-sm font-medium">
            Behavioral Indicators
          </CardDescription>
          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalBehavioralIndicators}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950">
              <TrendingUp className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
              <span className="text-xs">+180.1%</span>
            </Badge>
            <span className="hidden sm:inline">{FROM_LAST_MONTH}</span>
            <span className="sm:hidden">last month</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="@container/card flex-1 min-w-[280px] max-w-[350px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription className="text-xs sm:text-sm font-medium">
            Assessment Questions
          </CardDescription>
          <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalAssessmentQuestions}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950">
              <TrendingUp className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
              <span className="text-xs">+19%</span>
            </Badge>
            <span className="hidden sm:inline">{FROM_LAST_MONTH}</span>
            <span className="sm:hidden">last month</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="@container/card flex-1 min-w-[280px] max-w-[350px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription className="text-xs sm:text-sm font-medium">
            Active Now
          </CardDescription>
          <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            +573
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950">
              <TrendingUp className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
              <span className="text-xs">+201</span>
            </Badge>
            <span className="hidden sm:inline">{SINCE_LAST_HOUR}</span>
            <span className="sm:hidden">last hour</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}