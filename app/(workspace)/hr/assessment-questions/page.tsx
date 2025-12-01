import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Plus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Assessment Questions - SkillSoft",
  description: "Create and manage assessment questions for competency evaluation. Design questions to measure behavioral indicators effectively.",
  openGraph: {
    title: "Assessment Questions - SkillSoft",
    description: "Create and manage assessment questions for competency evaluation.",
  },
};

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

	return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader 
        title="Assessment Questions"
        description="Create and manage assessment questions for competency evaluation"
      >
        <div className="flex items-center gap-2">
          <Link href="/assessment-questions/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Question
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