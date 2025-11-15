"use client";

import React, { useState } from "react";
import EntityStatsCards from "@/components/EntityStatsCards";
import { useEntityStats } from "@/hooks/use-entity-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Eye, 
  EyeOff, 
  BarChart3, 
  Target, 
  HelpCircle,
  Layers
} from "lucide-react";

export default function StatsDemo() {
  const [activeTab, setActiveTab] = useState("competencies");
  const [showTrends, setShowTrends] = useState(true);
  const [compact, setCompact] = useState(false);

  // Constants
  const LOADING_TEXT = "Loading...";
  const UPDATING_TEXT = "Updating...";
  const ACTIVE_TEXT = "Active";
  const LIVE_DATA_TEXT = "Live Data";

  // Stats hooks for all entity types
  const competencyStats = useEntityStats("competencies");
  const indicatorStats = useEntityStats("behavioral-indicators");
  const questionStats = useEntityStats("assessment-questions");

  const handleCardClick = (entityType: string, cardType: string) => {
    // In a real app, this would navigate or filter data
    // Example: router.push(`/${entityType}?filter=${cardType}`)
    // For demo purposes, we'll just track the interaction
    return `${entityType}:${cardType}`;
  };

  const refreshAll = () => {
    competencyStats.refresh();
    indicatorStats.refresh();
    questionStats.refresh();
  };

  return (
    <div className="container mx-auto py-8 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Stats Cards Demo
          </h1>
          <p className="text-muted-foreground">
            Unified stats card system for all entity types
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrends(!showTrends)}
            className="gap-2"
          >
            {showTrends ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showTrends ? "Hide" : "Show"} Trends
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompact(!compact)}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {compact ? "Expanded" : "Compact"}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Competencies
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {competencyStats.stats?.total || 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {competencyStats.loading ? LOADING_TEXT : ACTIVE_TEXT}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Indicators
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicatorStats.stats?.total || 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {indicatorStats.loading ? LOADING_TEXT : ACTIVE_TEXT}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questionStats.stats?.total || 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {questionStats.loading ? LOADING_TEXT : ACTIVE_TEXT}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats by Entity Type */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="competencies" className="gap-2">
            <Layers className="h-4 w-4" />
            Competencies
          </TabsTrigger>
          <TabsTrigger value="indicators" className="gap-2">
            <Target className="h-4 w-4" />
            Indicators
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competencies" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Competency Analytics</h2>
            <Badge variant="outline">
              {competencyStats.loading ? UPDATING_TEXT : LIVE_DATA_TEXT}
            </Badge>
          </div>
          <EntityStatsCards
            type="competencies"
            data={competencyStats.stats || { total: 0 }}
            loading={competencyStats.loading}
            onCardClick={(cardType) => handleCardClick("competencies", cardType)}
            showTrends={showTrends}
            compact={compact}
          />
          {competencyStats.error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <CardContent className="pt-6">
                <p className="text-red-600 dark:text-red-400">
                  Error loading competency stats: {competencyStats.error}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Behavioral Indicator Analytics</h2>
            <Badge variant="outline">
              {indicatorStats.loading ? UPDATING_TEXT : LIVE_DATA_TEXT}
            </Badge>
          </div>
          <EntityStatsCards
            type="behavioral-indicators"
            data={indicatorStats.stats || { total: 0 }}
            loading={indicatorStats.loading}
            onCardClick={(cardType) => handleCardClick("behavioral-indicators", cardType)}
            showTrends={showTrends}
            compact={compact}
          />
          {indicatorStats.error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <CardContent className="pt-6">
                <p className="text-red-600 dark:text-red-400">
                  Error loading indicator stats: {indicatorStats.error}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Assessment Question Analytics</h2>
            <Badge variant="outline">
              {questionStats.loading ? UPDATING_TEXT : LIVE_DATA_TEXT}
            </Badge>
          </div>
          <EntityStatsCards
            type="assessment-questions"
            data={questionStats.stats || { total: 0 }}
            loading={questionStats.loading}
            onCardClick={(cardType) => handleCardClick("assessment-questions", cardType)}
            showTrends={showTrends}
            compact={compact}
          />
          {questionStats.error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <CardContent className="pt-6">
                <p className="text-red-600 dark:text-red-400">
                  Error loading question stats: {questionStats.error}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">✨ Responsive Design</h4>
              <p className="text-xs text-muted-foreground">
                Adapts to mobile (2 cards) and desktop (4 cards) layouts
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">🎯 Entity-Specific Metrics</h4>
              <p className="text-xs text-muted-foreground">
                Custom stats for competencies, indicators, and questions
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">📊 Trend Indicators</h4>
              <p className="text-xs text-muted-foreground">
                Optional trend badges with positive/negative indicators
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">⚡ Loading States</h4>
              <p className="text-xs text-muted-foreground">
                Skeleton loading animations during data fetch
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">🎨 Multiple Variants</h4>
              <p className="text-xs text-muted-foreground">
                Success, warning, info, and destructive color schemes
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">🔄 Interactive Cards</h4>
              <p className="text-xs text-muted-foreground">
                Click handlers for navigation and filtering
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}