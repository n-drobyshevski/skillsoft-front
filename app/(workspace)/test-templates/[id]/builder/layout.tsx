import React from "react";
import { notFound } from "next/navigation";
import { getBuilderDataCached } from "@/lib/cached-data";
import { BlueprintWorkspaceProvider } from "./_components/BlueprintWorkspaceProvider";
import { fromBackendStrategy } from "./strategy-mapping";


interface BuilderLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Builder Layout - Server Component
 *
 * This layout fetches data server-side and provides it to the client
 * workspace via context. The layout is designed to be immersive,
 * optionally hiding the global sidebar for a full-screen experience.
 *
 * Uses cached data functions for request deduplication - if the overview
 * page already fetched competencies, this won't make a duplicate request.
 */
export default async function BuilderLayout({ children, params }: BuilderLayoutProps) {
  const { id } = await params;
  const { template, competencies, error } = await getBuilderDataCached(id);

  if (!template || error) {
    notFound();
  }

  // Prepare library competencies with inventory data
  const libraryCompetencies = competencies.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    description: c.description || "",
    questionCount:
      c.behavioralIndicators?.reduce(
        (sum, bi) => sum + (bi.isActive ? 1 : 0),
        0
      ) || 0,
    health: "HEALTHY" as const, // Updated client-side via inventory heatmap
  }));

  // Transform template to initial blueprint state
  const initialState = {
    templateId: template.id,
    templateName: template.name,
    strategy: fromBackendStrategy(template.goal || "OVERVIEW"),
    competencies: (template.competencyIds || []).map((id) => {
      const comp = competencies.find((c) => c.id === id);
      return {
        id,
        name: comp?.name || "Unknown",
        category: comp?.category || "UNKNOWN",
        questionCount: 3,
        weight: 1.0,
        difficulty: "INTERMEDIATE" as const,
      };
    }),
    adaptivity: {
      mode: "LINEAR" as const,
      allowBacktracking: template.allowBackNavigation,
    },
    timeLimitMinutes: template.timeLimitMinutes,
    passingScore: template.passingScore,
    includeBigFive: (template.blueprint?.include_big_five as boolean) || true,
    onetSocCode: template.blueprint?.onet_soc_code as string | undefined,
    teamId: template.blueprint?.team_id as string | undefined,
  };

  return (
    <BlueprintWorkspaceProvider
      initialState={initialState}
      libraryCompetencies={libraryCompetencies}
      templateId={template.id}
      templateName={template.name}
      isReadOnly={template.isActive}
    >
      {children}
    </BlueprintWorkspaceProvider>
  );
}
