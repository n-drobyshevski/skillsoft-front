import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { testTemplatesApi, competenciesApi } from "@/services/api";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageHeader from "@/components/common/PageHeader";
import CompetencyLibrary from "./_components/CompetencyLibrary";
import BlueprintEditor from "./_components/BlueprintEditor";
import SimulationPanel from "./_components/SimulationPanel";
import { BlueprintState, HealthStatus } from "./actions";
import { ArrowLeft, FileEdit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BlueprintCanvasPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Loading skeleton for the competency library panel
 */
function CompetencyLibrarySkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for the simulation panel
 */
function SimulationPanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2 mt-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

/**
 * Fetches template and competency data for the blueprint canvas
 */
async function getBlueprintData(id: string) {
  try {
    const [template, allCompetencies] = await Promise.all([
      testTemplatesApi.getTemplateById(id),
      competenciesApi.getAllCompetencies(),
    ]);

    if (!template) {
      return { template: null, competencies: [], error: "Template not found" };
    }

    const activeCompetencies = Array.isArray(allCompetencies) 
      ? allCompetencies.filter(c => c.isActive)
      : [];

    return { template, competencies: activeCompetencies, error: null };
  } catch (error) {
    console.error("Failed to fetch blueprint data:", error);
    return { template: null, competencies: [], error: "Failed to load data" };
  }
}

/**
 * Transform template to BlueprintState for editor
 */
function templateToBlueprintState(
  template: NonNullable<Awaited<ReturnType<typeof testTemplatesApi.getTemplateById>>>,
  competencies: { id: string; name: string; category: string }[]
): BlueprintState {
  // Map competencies from template to BlueprintCompetency format
  const blueprintCompetencies = (template.competencyIds || []).map(id => {
    const comp = competencies.find(c => c.id === id);
    return {
      id,
      name: comp?.name || 'Unknown',
      category: comp?.category || 'UNKNOWN',
      questionCount: 3, // Default, will be updated from inventory
      weight: 1.0,
      difficulty: 'INTERMEDIATE' as const,
    };
  });

  // Map goal to strategy
  const strategyMap: Record<string, BlueprintState['strategy']> = {
    'OVERVIEW': 'UNIVERSAL_BASELINE',
    'JOB_FIT': 'TARGETED_FIT',
    'TEAM_FIT': 'DYNAMIC_GAP_ANALYSIS',
  };

  return {
    templateId: template.id,
    templateName: template.name,
    strategy: strategyMap[template.goal] || 'UNIVERSAL_BASELINE',
    competencies: blueprintCompetencies,
    adaptivity: {
      mode: 'LINEAR',
      allowBacktracking: template.allowBackNavigation,
    },
    timeLimitMinutes: template.timeLimitMinutes,
    passingScore: template.passingScore,
    includeBigFive: template.blueprint?.include_big_five as boolean || true,
    onetSocCode: template.blueprint?.onet_soc_code as string,
    teamId: template.blueprint?.team_id as string,
  };
}

/**
 * Blueprint Canvas Page - RSC with 3-column layout
 * 
 * Layout: 250px (Library) | 1fr (Editor) | 300px (Simulation)
 */
export default async function BlueprintCanvasPage({ params }: BlueprintCanvasPageProps) {
  const { id } = await params;
  const { template, competencies, error } = await getBlueprintData(id);

  if (!template || error) {
    notFound();
  }

  const initialState = templateToBlueprintState(template, competencies.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
  })));

  // Prepare competency library data with placeholder health status
  // Real health will be fetched client-side via the action
  const libraryCompetencies = competencies.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
    description: c.description,
    questionCount: c.behavioralIndicators?.reduce(
      (sum, bi) => sum + (bi.isActive ? 1 : 0), 
      0
    ) || 0,
    health: 'HEALTHY' as HealthStatus, // Default, updated via client
  }));

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href={`/test-templates/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <FileEdit className="h-5 w-5" />
              Blueprint Canvas
            </h1>
            <p className="text-sm text-muted-foreground">{template.name}</p>
          </div>
        </div>
      </div>

      {/* 3-Column Resizable Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel: Competency Library */}
          <ResizablePanel 
            defaultSize={20} 
            minSize={15} 
            maxSize={30}
            className="border-r"
          >
            <Suspense fallback={<CompetencyLibrarySkeleton />}>
              <CompetencyLibrary 
                competencies={libraryCompetencies}
                selectedIds={initialState.competencies.map(c => c.id)}
              />
            </Suspense>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Panel: Blueprint Editor */}
          <ResizablePanel defaultSize={55} minSize={40}>
            <ScrollArea className="h-full">
              <BlueprintEditor 
                initialState={initialState}
                availableCompetencies={libraryCompetencies}
              />
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel: Simulation */}
          <ResizablePanel 
            defaultSize={25} 
            minSize={20} 
            maxSize={35}
            className="border-l"
          >
            <Suspense fallback={<SimulationPanelSkeleton />}>
              <SimulationPanel 
                templateId={id}
                initialState={initialState}
              />
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
