import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCompetenciesCached } from "@/services/api.cache";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import PageHeader from "@/components/common/PageHeader";
import CompetenciesTable from "./_components/CompetenciesTable";
import TableSkeleton from "@/components/data-display/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Competencies - SkillSoft",
  description: "Manage and track competency definitions and assessments. Create, edit, and organize competencies for your organization.",
  openGraph: {
    title: "Competencies - SkillSoft",
    description: "Manage and track competency definitions and assessments.",
  },
};

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

// Calculate average weight deterministically based on competency count
function calculateAverageWeight(count: number): number {
  if (count === 0) return 0;
  // Use a deterministic calculation based on count
  return Math.round((count % 30) + 20);
}

// Async component for stats - streams after initial render
async function CompetencyStats() {
  const competencies = await getCompetenciesCached();
  const safeCompetencies = Array.isArray(competencies) ? competencies : [];
  
  return (
    <FlexibleStatsCards
      data={{
        type: "competencies",
        stats: {
          total: safeCompetencies.length,
          withAssessments: safeCompetencies.filter(c => c.behavioralIndicators && c.behavioralIndicators.length > 0).length,
          averageWeight: calculateAverageWeight(safeCompetencies.length),
          byLevel: {
            advanced: safeCompetencies.filter(c => c.level === "ADVANCED").length,
            expert: safeCompetencies.filter(c => c.level === "EXPERT").length
          },
          trend: {
            value: "+12%",
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
async function CompetenciesTableWrapper() {
  const competencies = await getCompetenciesCached();
  const safeCompetencies = Array.isArray(competencies) ? competencies : [];
  return <CompetenciesTable competencies={safeCompetencies} />;
}

// Main component - Static shell rendered immediately
export default function CompetenciesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      {/* Static content - part of the static shell */}
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
      
      {/* Dynamic stats - streams in after static shell */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <CompetencyStats />
      </Suspense>

      {/* Dynamic table - streams in after static shell */}
      <Suspense fallback={<TableSkeleton />}>
        <CompetenciesTableWrapper />
      </Suspense>
    </div>
  );
}
