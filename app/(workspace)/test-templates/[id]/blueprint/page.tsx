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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CompetencyLibrary from "./_components/CompetencyLibrary";
import BlueprintEditor from "./_components/BlueprintEditor";
import SimulationPanel from "./_components/SimulationPanel";
import { BlueprintState, HealthStatus } from "./actions";
import { ArrowLeft, Sparkles, Layers, Save, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BlueprintCanvasPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Loading skeleton for the competency library panel
 * Modern airy design with generous spacing
 */
function CompetencyLibrarySkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for the simulation panel
 * Clean, spacious skeleton with modern rounded corners
 */
function SimulationPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-9 w-2/3 rounded-lg" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="space-y-3 mt-2">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
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
    <div className="flex h-full flex-col bg-muted/30">
      {/* Modern Airy Header - Professional Design Tool Style */}
      <header className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href={`/test-templates/${id}`}>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/80">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          <Separator orientation="vertical" className="h-8" />
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Blueprint Canvas
              </h1>
              <p className="text-sm text-muted-foreground">{template.name}</p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Draft
          </Badge>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button size="sm" className="gap-2 rounded-xl">
            <Play className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </header>

      {/* 3-Column Resizable Layout with Modern Spacing */}
      <div className="flex-1 overflow-hidden p-3">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl border bg-background shadow-sm">
          {/* Left Panel: Competency Library */}
          <ResizablePanel 
            defaultSize={18} 
            minSize={15} 
            maxSize={25}
          >
            <Suspense fallback={<CompetencyLibrarySkeleton />}>
              <CompetencyLibrary 
                competencies={libraryCompetencies}
                selectedIds={initialState.competencies.map(c => c.id)}
              />
            </Suspense>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-muted/50 data-[panel-group-direction=horizontal]:w-1" />

          {/* Center Panel: Blueprint Editor - Main Canvas */}
          <ResizablePanel defaultSize={54} minSize={40}>
            <ScrollArea className="h-full">
              <BlueprintEditor 
                initialState={initialState}
                availableCompetencies={libraryCompetencies}
              />
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-muted/50 data-[panel-group-direction=horizontal]:w-1" />

          {/* Right Panel: Simulation - Live Preview */}
          <ResizablePanel 
            defaultSize={28} 
            minSize={20} 
            maxSize={35}
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
