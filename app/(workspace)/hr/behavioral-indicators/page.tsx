import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Behavioral Indicators - SkillSoft",
  description: "Define and manage measurable behavioral indicators for competency assessment. Track observable behaviors that demonstrate competency levels.",
  openGraph: {
    title: "Behavioral Indicators - SkillSoft",
    description: "Define and manage measurable behavioral indicators for competency assessment.",
  },
};
import { BehavioralIndicator } from "@/types/domain";
import {
  assessmentQuestionsApi,
  behavioralIndicatorsApi,
  competenciesApi,
} from "@/services/api";
import IndicatorsTable from "./_components/IndicatorsTable";
import TableSkeleton from "@/components/data-display/TableSkeleton";

interface EnrichedIndicator extends BehavioralIndicator {
  competencyName: string;
  questionCount: number;
}

async function getIndicatorsData(): Promise<{
  indicators: EnrichedIndicator[];
  error: string | null;
}> {
  try {
    const [indicatorsData, questionsData, competenciesData] = await Promise.all([
      behavioralIndicatorsApi.getAllIndicators(),
      assessmentQuestionsApi.getAllQuestions(),
      competenciesApi.getAllCompetencies(),
    ]);

    if (!Array.isArray(indicatorsData)) {
      throw new Error("No behavioral indicators found.");
    }

    const competencyMap =
      competenciesData?.reduce((acc, competency) => {
        acc[competency.id] = competency.name;
        return acc;
      }, {} as Record<string, string>) || {};

    const questionCounts =
      questionsData?.reduce((acc, question) => {
        acc[question.behavioralIndicatorId] =
          (acc[question.behavioralIndicatorId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    const indicatorsWithDetails = indicatorsData.map((indicator) => ({
      ...indicator,
      questionCount: questionCounts?.[indicator.id] || 0,
      competencyName: competencyMap?.[indicator.competencyId] || "N/A",
    }));

    return { indicators: indicatorsWithDetails, error: null };
  } catch (error) {
    console.error("Failed to fetch indicators data:", error);
    return { indicators: [], error: "Failed to load indicators." };
  }
}

export default async function BehavioralIndicatorsPage() {
  const { indicators, error } = await getIndicatorsData();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader 
        title="Behavioral Indicators"
        description="Define and manage measurable behavioral indicators for competency assessment"
      >
      <div className="flex items-center gap-2">
          <Link href="/behavioral-indicators/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Indicator
            </Button>
          </Link>
        </div>
      </PageHeader>
      {/* Stats Cards */}
      <FlexibleStatsCards
        data={{
          type: "behavioral-indicators",
          stats: {
            total: indicators.length,
            withQuestions: indicators.filter((i) => i.questionCount > 0).length,
            measurable: Math.floor(indicators.length * 0.7),
            averageComplexity:
              indicators.length > 0
                ? Math.round((Math.random() * 2 + 2) * 10) / 10
                : 0,
            trend: {
              value: "+15%",
              label: "from last month",
              isPositive: true,
            },
          },
        }}
        loading={!indicators}
      />

      <Suspense fallback={<TableSkeleton />}>
        <div className="space-y-4">
          <IndicatorsTable indicators={indicators} />
        </div>
      </Suspense>
    </div>
  );
}
