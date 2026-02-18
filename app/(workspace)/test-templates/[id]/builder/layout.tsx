import React from "react";
import { notFound } from "next/navigation";
import {
  getCachedTemplate,
  getCachedActiveCompetencies,
} from "@/lib/cached-data";
import { BlueprintWorkspaceProvider } from "./_components/BlueprintWorkspaceProvider";
import { fromBackendStrategy } from "./strategy-mapping";


interface BuilderLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Builder Layout - Server Component
 *
 * R19-1: Split data loading for streaming. Template is awaited eagerly for the
 * 404 check and canvas state. Competencies are started in parallel but passed
 * as a Promise to stream via React 19 use() inside a Suspense boundary.
 * This lets the canvas render ~150-300ms earlier while the library panel
 * shows a skeleton until competencies resolve.
 *
 * Uses cached data functions for request deduplication - if the overview
 * page already fetched competencies, this won't make a duplicate request.
 */
export default async function BuilderLayout({ children, params }: BuilderLayoutProps) {
  const { id } = await params;

  // Start both fetches in parallel, but only await template for 404 check
  const templatePromise = getCachedTemplate(id);
  const competenciesPromise = getCachedActiveCompetencies();

  const template = await templatePromise;

  if (!template) {
    notFound();
  }

  // Transform template to initial blueprint state.
  // Competency names/categories use placeholder values here; they'll be
  // enriched once competenciesPromise resolves via CompetencyResolver.
  const initialState = {
    templateId: template.id,
    templateName: template.name,
    strategy: fromBackendStrategy(template.goal || "OVERVIEW"),
    competencies: (template.competencyIds || []).map((compId) => ({
      id: compId,
      name: "Unknown",
      category: "UNKNOWN",
      questionCount: 3,
      weight: 1.0,
      difficulty: "INTERMEDIATE" as const,
    })),
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
      libraryCompetencies={[]}
      competenciesPromise={competenciesPromise}
      templateId={template.id}
      templateName={template.name}
      isReadOnly={template.isActive}
    >
      {children}
    </BlueprintWorkspaceProvider>
  );
}
