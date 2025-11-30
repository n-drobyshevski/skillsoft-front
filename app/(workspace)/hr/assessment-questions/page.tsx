import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Plus } from "lucide-react";
import { AssessmentQuestion } from "@/types/domain";
import { assessmentQuestionsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import PageHeader from "@/components/common/PageHeader";
import QuestionsTable from "./_components/QuestionsTable";
import TableSkeleton from "@/components/data-display/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Assessment Questions - SkillSoft",
  description: "Create and manage assessment questions for competency evaluation. Design questions to measure behavioral indicators effectively.",
  openGraph: {
    title: "Assessment Questions - SkillSoft",
    description: "Create and manage assessment questions for competency evaluation.",
  },
};

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

// Stats cards skeleton for loading state
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

// Async component for stats - streams after initial render
async function QuestionStats() {
  const { questions } = await getQuestionsData();
  
  return (
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
      loading={false}
    />
  );
}

// Async component for table - streams after initial render
async function QuestionsTableWrapper() {
  const { questions } = await getQuestionsData();
  return <QuestionsTable questions={questions} />;
}

// Main component - Static shell rendered immediately
export default function AssessmentQuestionsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      {/* Static content - part of the static shell */}
      <PageHeader 
        title="Assessment Questions"
        description="Create and manage assessment questions for competency evaluation"
      >
        <div className="flex items-center gap-2">
          <Link href="/hr/assessment-questions/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Question
            </Button>
          </Link>
        </div>
      </PageHeader>
      
      {/* Dynamic stats - streams in after static shell */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <QuestionStats />
      </Suspense>

      {/* Dynamic table - streams in after static shell */}
      <Suspense fallback={<TableSkeleton />}>
        <QuestionsTableWrapper />
      </Suspense>
    </div>
  );
}