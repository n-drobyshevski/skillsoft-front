import React, { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.indicators");
  const siteName = "SkillSoft";

  return {
    title: `${t("title")} - ${siteName}`,
    description: t("description"),
    openGraph: {
      title: `${t("title")} - ${siteName}`,
      description: t("description"),
    },
  };
}
import { BehavioralIndicator } from "@/types/domain";
import {
  getIndicatorsCached,
  getQuestionsCached,
  getCompetenciesCached,
} from "@/services/api.cache";
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
      getIndicatorsCached(),
      getQuestionsCached(),
      getCompetenciesCached(),
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
  const t = await getTranslations("indicator");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title={t("title")}
        description={t("pageDescription")}
      >
      <div className="flex items-center gap-2">
          <Link href="/hr/behavioral-indicators/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              {t("create")}
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
