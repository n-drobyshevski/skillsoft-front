"use client";

import React, { Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Beaker, Library, Layers } from "lucide-react";
import { LibraryPanel } from "./LibraryPanel";
import { WeightedCanvas } from "./WeightedCanvas";
import { SimulatorPanel } from "./SimulatorPanel";

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

function DesktopLayout() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full rounded-xl border bg-background shadow-sm"
      >
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          collapsible
          className="border-r bg-muted/10"
        >
          <Suspense fallback={<LibrarySkeleton />}>
            <LibraryPanel />
          </Suspense>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border/80" />

        <ResizablePanel defaultSize={50} minSize={30} className="bg-background">
          <WeightedCanvas />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border/80" />

        <ResizablePanel
          defaultSize={30}
          minSize={20}
          collapsible
          className="border-l bg-muted/10"
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
  const [activeTab, setActiveTab] = useState<string>("canvas");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col flex-1"
    >
      <div className="flex-1 overflow-hidden">
        <TabsContent
          value="library"
          className="h-full m-0 data-[state=active]:flex flex-col"
        >
          <Suspense fallback={<LibrarySkeleton />}>
            <LibraryPanel />
          </Suspense>
        </TabsContent>

        <TabsContent
          value="canvas"
          className="h-full m-0 data-[state=active]:flex flex-col"
        >
          <WeightedCanvas />
        </TabsContent>

        <TabsContent
          value="simulate"
          className="h-full m-0 data-[state=active]:flex flex-col"
        >
          <Suspense fallback={<SimulatorSkeleton />}>
            <SimulatorPanel />
          </Suspense>
        </TabsContent>
      </div>

      <TabsList className="w-full h-16 rounded-none border-t bg-background justify-around gap-0 p-0 pb-safe">
        <TabsTrigger
          value="library"
          className="flex-1 h-full flex-col gap-1.5 rounded-none data-[state=active]:bg-muted/50 active:scale-95 transition-transform"
        >
          <Library className="h-6 w-6" />
          <span className="text-xs font-medium">Library</span>
        </TabsTrigger>
        <TabsTrigger
          value="canvas"
          className="flex-1 h-full flex-col gap-1.5 rounded-none data-[state=active]:bg-muted/50 active:scale-95 transition-transform"
        >
          <Layers className="h-6 w-6" />
          <span className="text-xs font-medium">Canvas</span>
        </TabsTrigger>
        <TabsTrigger
          value="simulate"
          className="flex-1 h-full flex-col gap-1.5 rounded-none data-[state=active]:bg-muted/50 active:scale-95 transition-transform"
        >
          <Beaker className="h-6 w-6" />
          <span className="text-xs font-medium">Simulate</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function BlueprintWorkspace({ templateId: _templateId }: BlueprintWorkspaceProps) {
  return (
    <div
      className="flex flex-col bg-muted/30"
      style={{ height: "calc(100vh - 7rem)", maxHeight: "calc(100vh - 7rem)" }}
      data-template-id={_templateId}
    >
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden p-2 lg:p-3">
        <DesktopLayout />
      </div>

      <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden">
        <MobileLayout />
      </div>
    </div>
  );
}
