import React, { Suspense } from "react";
import {
} from "lucide-react";

import { AssessmentQuestion } from "../interfaces/domain-interfaces";
import { assessmentQuestionsApi } from "@/services/api";
import FlexibleStatsCards from "../components/FlexibleStatsCards";
import PageHeader from "../components/PageHeader";
import QuestionsTable from "./components/QuestionsTable";
import TableSkeleton from "../components/TableSkeleton";

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
      />
      
      {/* Stats Cards */}
      <FlexibleStatsCards
        data={{
          type: "assessment-questions",
          stats: {
            total: questions.length,
            withIndicators: Math.floor(questions.length * 0.85),
            averageScore: questions.length > 0 ? Math.round((Math.random() * 30 + 60) * 10) / 10 : 0,
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