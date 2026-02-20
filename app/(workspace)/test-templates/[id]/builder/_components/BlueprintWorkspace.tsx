"use client";

import React, { Suspense, useState, useEffect, useRef, useCallback, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Beaker, Library, Layers, Plus, Clock, Target, CheckCircle2, XCircle } from "lucide-react";
// Direct imports for desktop (always needed)
import { LibraryPanel } from "./LibraryPanel";
import { WeightedCanvas } from "./WeightedCanvas";
import { SimulatorPanel } from "./simulator";
import { BuilderDndProvider } from "./BuilderDndProvider";
import { useBlueprintWorkspace } from "./BlueprintWorkspaceProvider";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Phase 3.1: Lazy-loaded panels for mobile to reduce initial bundle
// These are only loaded when the tab is first accessed
const LazyLibraryPanel = lazy(() =>
  import(/* webpackChunkName: "builder-library" */ "./LibraryPanel").then(m => ({ default: m.LibraryPanel }))
);
const LazySimulatorPanel = lazy(() =>
  import(/* webpackChunkName: "builder-simulator" */ "./simulator").then(m => ({ default: m.SimulatorPanel }))
);

interface BlueprintWorkspaceProps {
  templateId: string;
}

function LibrarySkeleton() {
  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/10">
      {/* Search Header */}
      <div className="p-3 border-b bg-background/50 space-y-2">
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      {/* Category Groups */}
      <div className="flex-1 p-3 space-y-4 overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2.5 w-6" />
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-l-[3px] border-l-muted-foreground/20"
              >
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulatorSkeleton() {
  return (
    <div className="flex flex-col h-full min-h-0 p-3 sm:p-4 space-y-4">
      {/* Strategy Badge */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </div>
      {/* Persona Selector */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border min-h-[72px]"
          >
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      {/* Run CTA */}
      <Skeleton className="h-11 w-full rounded-xl" />
      {/* Score Display */}
      <div className="p-4 rounded-xl border space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Helper component to render a static loading state while hydration completes
function DesktopSkeleton() {
  return (
    <div className="flex h-full w-full gap-px overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Library Panel */}
      <div className="w-[20%] min-w-[200px] border-r bg-muted/10 overflow-hidden">
        <LibrarySkeleton />
      </div>
      {/* Resize Handle */}
      <div className="w-1 bg-border/50 flex items-center justify-center">
        <div className="w-1 h-8 rounded-full bg-muted-foreground/20" />
      </div>
      {/* Canvas Panel */}
      <div className="w-[50%] min-w-[300px] bg-background overflow-hidden">
        <CanvasSkeleton />
      </div>
      {/* Resize Handle */}
      <div className="w-1 bg-border/50 flex items-center justify-center">
        <div className="w-1 h-8 rounded-full bg-muted-foreground/20" />
      </div>
      {/* Simulator Panel */}
      <div className="w-[30%] min-w-[250px] border-l bg-muted/10 overflow-hidden">
        <SimulatorSkeleton />
      </div>
    </div>
  );
}

function CanvasSkeleton() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/50 shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
      {/* Competency Cards */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-4 shrink-0" />
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopLayout() {
  // Defer ResizablePanelGroup render until after hydration to avoid ID mismatch
  // react-resizable-panels generates dynamic IDs that differ between SSR and client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show skeleton during SSR and initial hydration
  if (!isMounted) {
    return <DesktopSkeleton />;
  }

  return (
    <BuilderDndProvider>
      <div className="flex h-full w-full overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full rounded-xl border bg-background shadow-sm"
          // autoSaveId persists panel sizes in localStorage
          autoSaveId="blueprint-workspace-panels"
          id="blueprint-workspace-layout"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            collapsible
            className="border-r bg-muted/10 overflow-hidden"
            id="panel-library"
            order={1}
          >
            <Suspense fallback={<LibrarySkeleton />}>
              <LibraryPanel />
            </Suspense>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border/80" />

          <ResizablePanel
            defaultSize={50}
            minSize={30}
            className="bg-background overflow-hidden"
            id="panel-canvas"
            order={2}
          >
            <WeightedCanvas />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border/80" />

          <ResizablePanel
            defaultSize={30}
            minSize={20}
            collapsible
            className="border-l bg-muted/10 overflow-hidden"
            id="panel-simulator"
            order={3}
          >
            <Suspense fallback={<SimulatorSkeleton />}>
              <SimulatorPanel />
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </BuilderDndProvider>
  );
}

// Tab order for swipe navigation (mobile optimized: 2 main tabs + center action)
// Library removed from tabs - accessed via bottom sheet only
const TABS = ["canvas", "simulate"] as const;
type TabType = typeof TABS[number];

function MobileLayout() {
  const t = useTranslations('builder.workspace');
  // We use standard state instead of Tabs to prevent unmounting components
  // This preserves the Canvas state (pan/zoom/nodes) when switching views
  const [activeTab, setActiveTab] = useState<TabType>("canvas");
  // Phase 2.4: Track slide direction for animations
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const slideKeyRef = useRef(0); // Force re-render to trigger animation

  // Phase 3.1: Track visited tabs for lazy hydration
  // Only load panel code when tab is first visited
  // Note: Library is now sheet-only, not a tab
  const [visitedTabs, setVisitedTabs] = useState<Set<TabType>>(() => new Set(["canvas"]));

  // Phase 3.5: Network-aware prefetching
  const { shouldPrefetch, isSlowConnection } = useNetworkStatus();

  // Phase 4.1: Bottom sheet library modal
  const [isLibrarySheetOpen, setIsLibrarySheetOpen] = useState(false);

  // Phase 2.5: Preserve scroll positions per tab
  // Note: Library removed - now sheet-only access
  const scrollPositionsRef = useRef<Record<TabType, number>>({
    canvas: 0,
    simulate: 0,
  });
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const simulateScrollRef = useRef<HTMLDivElement>(null);

  // Get the scroll ref for a tab
  const getScrollRef = useCallback((tab: TabType) => {
    switch (tab) {
      case "canvas": return canvasScrollRef;
      case "simulate": return simulateScrollRef;
    }
  }, []);

  // Wrapper to set tab with direction tracking and scroll preservation
  const switchTab = useCallback((newTab: TabType) => {
    // Save current scroll position before switching
    const currentScrollRef = getScrollRef(activeTab);
    if (currentScrollRef.current) {
      scrollPositionsRef.current[activeTab] = currentScrollRef.current.scrollTop;
    }

    const currentIndex = TABS.indexOf(activeTab);
    const newIndex = TABS.indexOf(newTab);
    if (newIndex > currentIndex) {
      setSlideDirection("left"); // Content slides in from right (navigating forward)
    } else if (newIndex < currentIndex) {
      setSlideDirection("right"); // Content slides in from left (navigating back)
    }
    slideKeyRef.current += 1;
    setActiveTab(newTab);

    // Phase 3.1: Mark tab as visited to trigger lazy load
    if (!visitedTabs.has(newTab)) {
      setVisitedTabs(prev => new Set([...prev, newTab]));
    }

    // Restore scroll position after render
    requestAnimationFrame(() => {
      const newScrollRef = getScrollRef(newTab);
      if (newScrollRef.current) {
        newScrollRef.current.scrollTop = scrollPositionsRef.current[newTab];
      }
    });
  }, [activeTab, getScrollRef, visitedTabs]);

  // Access state and actions from context (Phase 2.3: save status moved to canvas header)
  const { addCompetency, simulationResult, state } = useBlueprintWorkspace();

  // Phase 3.5: Prefetch adjacent tabs on good network connections
  // This preloads the lazy chunks when user is on a fast connection
  // Note: Library prefetched for sheet, Simulator prefetched for tab
  React.useEffect(() => {
    if (!shouldPrefetch || isSlowConnection) return;

    // Wait a bit after initial render to avoid competing with critical resources
    const timer = setTimeout(() => {
      // Prefetch library for bottom sheet (always available)
      import(/* webpackChunkName: "builder-library" */ "./LibraryPanel");

      // Prefetch simulator tab if not yet visited
      if (!visitedTabs.has("simulate")) {
        import(/* webpackChunkName: "builder-simulator" */ "./simulator");
      }
    }, 2000); // Wait 2s after render

    return () => clearTimeout(timer);
  }, [shouldPrefetch, isSlowConnection, visitedTabs]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Viewport Content Area - swipe navigation removed to avoid conflicts with canvas interactions */}
      <div className="flex-1 overflow-hidden relative w-full">
        {/* Note: Library View removed - now accessed via bottom sheet only */}

        {/* Canvas View - Always rendered with content-visibility + CSS containment */}
        <div
          ref={canvasScrollRef}
          key={`canvas-${slideKeyRef.current}`}
          className={cn(
            "absolute inset-0 bg-background z-0 overflow-hidden",
            activeTab === "canvas" ? "flex flex-col z-20" : "invisible",
            activeTab === "canvas" && slideDirection === "right" && "animate-slide-in-right",
            activeTab === "canvas" && slideDirection === "left" && "animate-slide-in-left"
          )}
          style={{
            contentVisibility: activeTab === "canvas" ? "visible" : "auto",
            containIntrinsicSize: "0 500px",
            // MOB-3: CSS containment on inactive panels to isolate layout/paint
            contain: activeTab === "canvas" ? undefined : "layout style paint",
          }}
        >
          <WeightedCanvas />
        </div>

        {/* Simulator View - Phase 3.1: Lazy loaded, only mounts when first visited */}
        {/* Phase 4.2: Pass variant="mobile" for flattened collapsible sections */}
        {visitedTabs.has("simulate") && (
          <div
            ref={simulateScrollRef}
            key={`simulate-${slideKeyRef.current}`}
            className={cn(
              "absolute inset-0 bg-background z-10 overflow-hidden",
              activeTab === "simulate" ? "flex flex-col" : "hidden",
              activeTab === "simulate" && slideDirection === "right" && "animate-slide-in-right",
              activeTab === "simulate" && slideDirection === "left" && "animate-slide-in-left"
            )}
            style={{
              // MOB-3: CSS containment on inactive panels to isolate layout/paint
              contain: activeTab === "simulate" ? undefined : "layout style paint",
            }}
          >
            <Suspense fallback={<SimulatorSkeleton />}>
              <LazySimulatorPanel variant="mobile" />
            </Suspense>
          </div>
        )}

        {/* Phase 4.4: Quick sim floating card - shows last simulation on canvas */}
        {activeTab === "canvas" && simulationResult && (
          <div
            className={cn(
              "absolute bottom-4 right-4 z-30",
              "w-48 p-3 rounded-xl border bg-background/95 backdrop-blur-sm shadow-lg",
              "animate-in fade-in slide-in-from-bottom-2 duration-300"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{t('lastSim')}</span>
              {simulationResult.simulatedScore !== undefined && (
                simulationResult.simulatedScore >= (state.passingScore ?? 70) ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-1.5 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Target className="h-3 w-3" />
                </div>
                <span className="text-sm font-bold">
                  {simulationResult.simulatedScore ?? '--'}%
                </span>
              </div>
              <div className="text-center p-1.5 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                </div>
                <span className="text-sm font-bold">
                  {simulationResult.estimatedDurationMinutes}m
                </span>
              </div>
            </div>
            <button
              onClick={() => switchTab("simulate")}
              className={cn(
                "w-full mt-2 py-1.5 text-xs font-medium text-primary",
                "hover:underline active:opacity-70"
              )}
            >
              {t('viewDetails')} →
            </button>
          </div>
        )}

        {/* Note: FAB removed - Add action now integrated into bottom navigation center */}
      </div>

      {/* Phase 4.1: Bottom Sheet Library Modal - overlays canvas */}
      <Sheet open={isLibrarySheetOpen} onOpenChange={setIsLibrarySheetOpen}>
        <SheetContent
          side="bottom"
          className="h-[75dvh] flex flex-col p-0"
          showCloseButton={false}
        >
          {/* Drag handle for swipe affordance */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>
          <SheetHeader className="px-4 pb-2 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              {t('competencyLibrary')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={<LibrarySkeleton />}>
              <LazyLibraryPanel
                onAdd={(competency) => {
                  // Add competency and close sheet
                  addCompetency(competency);
                  setIsLibrarySheetOpen(false);
                }}
              />
            </Suspense>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation Bar - Optimized: 2 tabs + center action (YouTube/TikTok pattern) */}
      <div className="shrink-0 border-t bg-background/80 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        {/* Navigation with Material Design 3 patterns - Center action for Add */}
        <nav
          role="navigation"
          aria-label={t('builderNavigation')}
          className="grid grid-cols-3 h-16 items-center"
        >
          {/* Canvas Tab */}
          <button
            role="tab"
            aria-selected={activeTab === "canvas"}
            aria-controls="panel-canvas"
            onClick={() => switchTab("canvas")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full w-full",
              "transition-all duration-200 ease-out",
              "active:scale-95 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
              activeTab === "canvas"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center h-8 px-4 rounded-full transition-all duration-200",
                activeTab === "canvas" && "bg-primary/10"
              )}
            >
              <Layers className="h-5 w-5" strokeWidth={activeTab === "canvas" ? 2.5 : 2} />
            </div>
            <span className="text-xs font-medium tracking-tight">{t('canvas')}</span>
          </button>

          {/* Center Action - Add (opens Library Sheet) */}
          <button
            onClick={() => setIsLibrarySheetOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full w-full",
              "transition-all duration-200 ease-out",
              "active:scale-95 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
              "text-primary"
            )}
            aria-label={t('addCompetencyFromLibrary')}
          >
            <div
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full",
                "bg-primary text-primary-foreground shadow-md",
                "transition-all duration-200",
                "active:scale-95 hover:bg-primary/90"
              )}
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-medium tracking-tight">{t('add')}</span>
          </button>

          {/* Simulate Tab */}
          <button
            role="tab"
            aria-selected={activeTab === "simulate"}
            aria-controls="panel-simulator"
            onClick={() => switchTab("simulate")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full w-full",
              "transition-all duration-200 ease-out",
              "active:scale-95 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
              activeTab === "simulate"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center h-8 px-4 rounded-full transition-all duration-200",
                activeTab === "simulate" && "bg-primary/10"
              )}
            >
              <Beaker className="h-5 w-5" strokeWidth={activeTab === "simulate" ? 2.5 : 2} />
            </div>
            <span className="text-xs font-medium tracking-tight">{t('simulate')}</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export function BlueprintWorkspace({ templateId: _templateId }: BlueprintWorkspaceProps) {
  // Conditionally mount only the active layout to avoid 2x memory cost on mobile.
  // During SSR, render skeletons with CSS hiding to prevent layout shift.
  const [isClient, setIsClient] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    setIsLargeScreen(mql.matches);
    setIsClient(true);
    const handler = (e: MediaQueryListEvent) => setIsLargeScreen(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  if (!isClient) {
    // SSR: skeletons with CSS hiding for zero layout shift
    return (
      <div className="flex flex-col h-full overflow-hidden bg-muted/30" data-template-id={_templateId}>
        <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden p-2 lg:p-3">
          <DesktopSkeleton />
        </div>
        <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden">
          <CanvasSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/30" data-template-id={_templateId}>
      {isLargeScreen ? (
        <div className="flex flex-1 min-h-0 overflow-hidden p-2 lg:p-3">
          <DesktopLayout />
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <MobileLayout />
        </div>
      )}
    </div>
  );
}