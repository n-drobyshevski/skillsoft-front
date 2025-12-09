"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Beaker, Library, Layers } from "lucide-react";
import { LibraryPanel } from "./LibraryPanel";
import { WeightedCanvas } from "./WeightedCanvas";
import { SimulatorPanel } from "./SimulatorPanel";
import { cn } from "@/lib/utils";

interface BlueprintWorkspaceProps {
  templateId: string;
}

function LibrarySkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function SimulatorSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-8 w-2/3 rounded-lg" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-3 mt-2">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Helper component to render a static loading state while hydration completes
function DesktopSkeleton() {
  return (
    <div className="flex h-full w-full gap-px overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="w-[20%] border-r bg-muted/10">
        <LibrarySkeleton />
      </div>
      <div className="w-[50%] bg-background">
        {/* Empty canvas area */}
      </div>
      <div className="w-[30%] border-l bg-muted/10">
        <SimulatorSkeleton />
      </div>
    </div>
  );
}

function DesktopLayout() {
  // Fix: Add isMounted check to prevent Hydration Mismatch with ResizablePanels
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <DesktopSkeleton />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full rounded-xl border bg-background shadow-sm"
        // Optional: Provide a stable ID if your version supports it, 
        // but isMounted is the safest fix for the error you saw.
        id="blueprint-workspace-layout" 
      >
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          collapsible
          className="border-r bg-muted/10"
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
          className="bg-background"
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
          className="border-l bg-muted/10"
          id="panel-simulator"
          order={3}
        >
          <Suspense fallback={<SimulatorSkeleton />}>
            <SimulatorPanel />
          </Suspense>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function MobileLayout() {
  // We use standard state instead of Tabs to prevent unmounting components
  // This preserves the Canvas state (pan/zoom/nodes) when switching views
  const [activeTab, setActiveTab] = useState<"library" | "canvas" | "simulate">("canvas");

  return (
    <div className="flex flex-col h-full w-full">
      {/* Viewport Content Area */}
      <div className="flex-1 overflow-hidden relative w-full">
        {/* Library View */}
        <div className={cn("absolute inset-0 bg-background z-10", activeTab === "library" ? "flex flex-col" : "hidden")}>
          <Suspense fallback={<LibrarySkeleton />}>
            <LibraryPanel />
          </Suspense>
        </div>

        {/* Canvas View - Always rendered, hidden via CSS to preserve state */}
        <div className={cn("absolute inset-0 bg-background z-0", activeTab === "canvas" ? "flex flex-col z-20" : "invisible")}>
          <WeightedCanvas />
        </div>

        {/* Simulator View */}
        <div className={cn("absolute inset-0 bg-background z-10", activeTab === "simulate" ? "flex flex-col" : "hidden")}>
          <Suspense fallback={<SimulatorSkeleton />}>
            <SimulatorPanel />
          </Suspense>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="shrink-0 border-t bg-background/80 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-3 h-16 items-center">
          <button
            onClick={() => setActiveTab("library")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition-all duration-200",
              activeTab === "library" 
                ? "text-primary" 
                : "text-muted-foreground hover:bg-muted/20"
            )}
          >
            <div className={cn("p-1 rounded-full", activeTab === "library" && "bg-primary/10")}>
              <Library className="h-6 w-6" strokeWidth={activeTab === "library" ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium tracking-wide">Library</span>
          </button>

          <button
            onClick={() => setActiveTab("canvas")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition-all duration-200",
              activeTab === "canvas" 
                ? "text-primary" 
                : "text-muted-foreground hover:bg-muted/20"
            )}
          >
            <div className={cn("p-1 rounded-full", activeTab === "canvas" && "bg-primary/10")}>
              <Layers className="h-6 w-6" strokeWidth={activeTab === "canvas" ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium tracking-wide">Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab("simulate")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition-all duration-200",
              activeTab === "simulate" 
                ? "text-primary" 
                : "text-muted-foreground hover:bg-muted/20"
            )}
          >
            <div className={cn("p-1 rounded-full", activeTab === "simulate" && "bg-primary/10")}>
              <Beaker className="h-6 w-6" strokeWidth={activeTab === "simulate" ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium tracking-wide">Simulate</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function BlueprintWorkspace({ templateId: _templateId }: BlueprintWorkspaceProps) {
  return (
    <div
      className="flex flex-col bg-muted/30"
      // Use dvh (dynamic viewport height) for better mobile browser support
      style={{ height: "100dvh" }}
      data-template-id={_templateId}
    >
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden p-2 lg:p-3" style={{ height: "calc(100vh - 7rem)" }}>
        <DesktopLayout />
      </div>

      {/* Mobile Layout - Hidden on desktop */}
      <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden h-full">
        <MobileLayout />
      </div>
    </div>
  );
}