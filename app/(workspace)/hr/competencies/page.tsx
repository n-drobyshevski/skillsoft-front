import React, { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCompetenciesCached } from "@/services/api.cache";
import { getEntityStatsCached } from "@/services/api.cache.stats";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import PageHeader from "@/components/common/PageHeader";
import CompetenciesTable from "./_components/CompetenciesTable";
import TableSkeleton from "@/components/data-display/TableSkeleton";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.competencies");
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

async function getCompetenciesData() {
  try {
    const [competencies, entityStats] = await Promise.all([
      getCompetenciesCached().catch(() => null),
      getEntityStatsCached(),
    ]);
    if (!Array.isArray(competencies)) {
      return { competencies: [], entityStats };
    }
    return { competencies, entityStats };
  } catch (error) {
    console.error("Failed to fetch competencies:", error);
    return { competencies: [], entityStats: null };
  }
}

// Main component
export default async function CompetenciesPage() {
  const { competencies, entityStats } = await getCompetenciesData();
  const t = await getTranslations("competency");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title={t("title")}
        description={t("pageDescription")}
      >
        <Button variant="outline" asChild>
          <Link href="/hr/competencies/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("create")}
          </Link>
        </Button>
      </PageHeader> 
      
      {/* Stats Cards */}
      <FlexibleStatsCards
        data={{
          type: "competencies",
          stats: {
            total: entityStats?.competencies.total ?? competencies.length,
            withAssessments: entityStats?.competencies.withIndicators ?? competencies.filter(c => c.behavioralIndicators && c.behavioralIndicators.length > 0).length,
            averageWeight: entityStats?.competencies.averageIndicatorWeight ?? 0,
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
