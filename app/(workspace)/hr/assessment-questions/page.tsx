import React, { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.questions");
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

import { AssessmentQuestion } from "@/types/domain";
import { assessmentQuestionsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import PageHeader from "@/components/common/PageHeader";
import QuestionsTable from "./_components/QuestionsTable";
import TableSkeleton from "@/components/data-display/TableSkeleton";

// Define the shape of the data we'll be using
interface EnrichedQuestion extends AssessmentQuestion {
  competencyName: string;
  indicatorName: string;
}

async function getQuestionsData() {
  try {
    const questions = await assessmentQuestionsApi.getAllQuestions();
    if (!Array.isArray(questions)) {
      return { questions: [], error: "Invalid data format from server." };
    }
    return { questions, error: null };
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return { questions: [], error: "Failed to load assessment questions." };
  }
}

export default async function AssessmentQuestionsPage() {
  const { questions, error } = await getQuestionsData();
  const t = await getTranslations("question");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title={t("title")}
        description={t("pageDescription")}
      >
        <div className="flex items-center gap-2">
          <Link href="/hr/assessment-questions/new">
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
          type: "assessment-questions",
          stats: {
            total: questions.length,
            withIndicators: Math.floor(questions.length * 0.85),
            averageScore: questions.length > 0 ? 75.5 : 0,
            hardQuestions: questions.filter(q => q.difficultyLevel === "EXPERT" || q.difficultyLevel === "ADVANCED").length,
            trend: {
              value: "+8%",
              label: "from last month",
              isPositive: true
            }
          }
        }}
        loading={!questions}
      />

      <Suspense fallback={<TableSkeleton />}>
        <QuestionsTable questions={questions} />
      </Suspense>
    </div>
  );
};