import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { competenciesApi } from "@/services/api";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import PageHeader from "@/components/common/PageHeader";
import CompetenciesTable from "./_components/CompetenciesTable";
import TableSkeleton from "@/components/data-display/TableSkeleton";

export const metadata: Metadata = {
  title: "Competencies - SkillSoft",
  description: "Manage and track competency definitions and assessments. Create, edit, and organize competencies for your organization.",
  openGraph: {
    title: "Competencies - SkillSoft",
    description: "Manage and track competency definitions and assessments.",
  },
};

async function getCompetenciesData() {
  try {
    const competencies = await competenciesApi.getAllCompetencies();
    if (!Array.isArray(competencies)) {
      return { competencies: [] };
    }
    return { competencies };
  } catch (error) {
    console.error("Failed to fetch competencies:", error);
    return { competencies: [] };
  }
}

// Main component
export default async function CompetenciesPage() {
  const { competencies } = await getCompetenciesData();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader 
        title="Competencies"
        description="Manage and track competency definitions and assessments"
      >
        <Button variant="outline" asChild>
          <Link href="/hr/competencies/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Competency
          </Link>
        </Button>
      </PageHeader> 
      
      {/* Stats Cards */}
      <FlexibleStatsCards
        data={{
          type: "competencies",
          stats: {
            total: competencies.length,
            withAssessments: competencies.filter(c => c.behavioralIndicators && c.behavioralIndicators.length > 0).length,
            averageWeight: competencies.length > 0 ? 35 : 0,
            trend: {
              value: "+12%",
              label: "from last month",
              isPositive: true
            }
          }
        }}
        loading={!competencies}
      />

      <Suspense fallback={<TableSkeleton />}>
        <CompetenciesTable competencies={competencies} />
      </Suspense>
    </div>
  );
}
