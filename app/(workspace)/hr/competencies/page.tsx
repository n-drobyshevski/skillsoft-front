import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Competency,
} from "@/types/domain";
import {
  Plus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Competencies - SkillSoft",
  description: "Manage and track competency definitions and assessments. Create, edit, and organize competencies for your organization.",
  openGraph: {
    title: "Competencies - SkillSoft",
    description: "Manage and track competency definitions and assessments.",
  },
};
import { competenciesApi } from "@/services/api";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import PageHeader from "@/components/common/PageHeader";
import CompetenciesTable from "./_components/CompetenciesTable";
import TableSkeleton from "@/components/data-display/TableSkeleton";

async function getCompetenciesData() {
  try {
    const competencies = await competenciesApi.getAllCompetencies();
    if (!Array.isArray(competencies)) {
      return { competencies: [], error: "Invalid data format from server." };
    }
    return { competencies, error: null };
  } catch (error) {
    console.error("Failed to fetch competencies:", error);
    return { competencies: [], error: "Failed to load competencies." };
  }
}

// Main component
export default async function CompetenciesPage() {
  const { competencies, error } = await getCompetenciesData();

  const handleStatsCardClick = (cardType: string) => {
    // Handle stats card clicks for navigation or filtering
    // This function will need to be moved to a client component if it needs to be interactive.
    // For now, it's a placeholder on the server.
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader 
        title="Competencies"
        description="Manage and track competency definitions and assessments"
      >
        <div className="flex items-center gap-2">
          <Link href="/hr/competencies/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Competency
            </Button>
          </Link>
        </div>
      </PageHeader> 
      
      {/* Stats Cards */}
      <FlexibleStatsCards
        data={{
          type: "competencies",
          stats: {
            total: competencies.length,
            withAssessments: competencies.filter(c => c.behavioralIndicators && c.behavioralIndicators.length > 0).length,
            averageWeight: competencies.length > 0 ? Math.round(Math.random() * 30 + 20) : 0,
            byLevel: {
              advanced: competencies.filter(c => c.level === "ADVANCED").length,
              expert: competencies.filter(c => c.level === "EXPERT").length
            },
            trend: {
              value: "+12%",
              label: "from last month",
              isPositive: true
            }
          }
        }}
        loading={!competencies} // Show loading skeleton if data is not yet available
        // onCardClick={handleStatsCardClick} // This would need to be in a client component
      />

      <Suspense fallback={<TableSkeleton />}>
        <CompetenciesTable competencies={competencies} />
      </Suspense>
    </div>
  );
}
