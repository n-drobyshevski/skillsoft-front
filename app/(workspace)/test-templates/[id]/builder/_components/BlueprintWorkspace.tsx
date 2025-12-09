'use client';

import React, { useState, Suspense, createContext, useContext } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PanelLeftOpen,
  PanelRightOpen,
  PanelLeftClose,
  PanelRightClose,
  Beaker,
  Library,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlueprintWorkspace } from './BlueprintWorkspaceProvider';
import { LibraryPanel } from './LibraryPanel';
import { Canvas } from './Canvas';
import { SimulatorPanel } from './SimulatorPanel';

interface BlueprintWorkspaceProps {
  templateId: string;
}

// ============================================
// PANEL STATE CONTEXT
// ============================================

interface PanelStateContextType {
  isLibraryOpen: boolean;
  isSimulatorOpen: boolean;
  setLibraryOpen: (open: boolean) => void;
  setSimulatorOpen: (open: boolean) => void;
}

const PanelStateContext = createContext<PanelStateContextType | null>(null);

function usePanelState() {
  const context = useContext(PanelStateContext);
  if (!context) throw new Error('usePanelState must be used within PanelStateProvider');
  return context;
}

// ============================================
// SKELETONS
// ============================================

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

// ============================================
// COMPACT HEADER
// ============================================


// ============================================
// SIDE PANEL (Push layout - shrinks canvas)
// ============================================

interface SidePanelProps {
  side: 'left' | 'right';
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

function SidePanel({
  side,
  isOpen,
  onClose,
  title,
  icon,
  children,
  width = 'w-[320px]',
}: SidePanelProps) {
  return (
    <div
      className={cn(
        'group/panel relative flex flex-col bg-background h-full shrink-0',
        'transition-all duration-300 ease-out',
        side === 'left' ? 'border-r' : 'border-l',
        isOpen ? width : 'w-0 border-0 overflow-hidden'
      )}
    >
      {/* Edge Close Button - Vertically Centered on panel edge */}
      {isOpen && (
        <button
          onClick={onClose}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-20',
            'flex items-center justify-center',
            'h-14 w-5',
            'bg-muted/90 hover:bg-primary/10 border border-border/60',
            'text-muted-foreground hover:text-primary',
            'transition-all duration-200',
            'opacity-60 hover:opacity-100',
            side === 'left' 
              ? 'right-0 translate-x-full rounded-r-md border-l-0' 
              : 'left-0 -translate-x-full rounded-l-md border-r-0'
          )}
          aria-label={`Close ${title}`}
        >
          {side === 'left' ? (
            <PanelLeftClose className="h-3.5 w-3.5" />
          ) : (
            <PanelRightClose className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      {/* Panel Content Wrapper - clips during animation */}
      <div className={cn(
        'flex flex-col h-full min-h-0 overflow-hidden',
        side === 'left' ? 'min-w-[320px]' : 'min-w-[360px]',
        'transition-opacity duration-200 delay-75',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Panel Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 shrink-0">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>

        {/* Panel Content - let child handle scrolling */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================
// DESKTOP LAYOUT - PUSH PANELS (canvas shrinks)
// ============================================

function DesktopLayout() {
  const { isLibraryOpen, isSimulatorOpen, setLibraryOpen, setSimulatorOpen } = usePanelState();

  return (
    <div className="group flex h-full w-full overflow-hidden">
      {/* Library Panel (Left) - Push layout with animation */}
      <SidePanel
        side="left"
        isOpen={isLibraryOpen}
        onClose={() => setLibraryOpen(false)}
        title="Competency Library"
        icon={<Library className="h-4 w-4 text-primary" />}
      >
        <Suspense fallback={<LibrarySkeleton />}>
          <LibraryPanel />
        </Suspense>
      </SidePanel>

      {/* Main Canvas Area */}
      <div className="relative flex-1 min-w-0 min-h-0 h-full p-2 lg:p-3 transition-all duration-300">
        <div className="relative h-full rounded-xl border bg-background shadow-sm overflow-hidden flex flex-col">
          {/* Left Floating Trigger - shows when library is closed */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLibraryOpen(true)}
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 z-10',
              'h-16 w-6 flex-col gap-1 rounded-l-none border-l-0',
              'bg-background/95 backdrop-blur-sm shadow-md',
              'hover:bg-muted hover:w-8 hover:shadow-lg',
              'transition-all duration-200 ease-out',
              isLibraryOpen ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100 translate-x-0'
            )}
            aria-label="Open Library"
          >
            <PanelLeftOpen className="h-3.5 w-3.5" />
            <span
              className="text-[12px] font-medium text-muted-foreground"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Library
            </span>
          </Button>

          {/* Right Floating Trigger - shows when simulator is closed */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSimulatorOpen(true)}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 z-10',
              'h-16 w-6 flex-col gap-1 rounded-r-none border-r-0',
              'bg-background/95 backdrop-blur-sm shadow-md',
              'hover:bg-muted hover:w-8 hover:shadow-lg',
              'transition-all duration-200 ease-out',
              isSimulatorOpen ? 'opacity-0 translate-x-full pointer-events-none' : 'opacity-100 translate-x-0'
            )}
            aria-label="Open Simulator"
          >
            <PanelRightOpen className="h-3.5 w-3.5" />
            <span
              className="text-[12px] font-medium text-muted-foreground"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Simulate
            </span>
          </Button>

          {/* Main Canvas */}
          <Canvas />
        </div>
      </div>

      {/* Simulator Panel (Right) - Push layout */}
      <SidePanel
        side="right"
        isOpen={isSimulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        title="Test Simulator"
        icon={<Beaker className="h-4 w-4 text-primary" />}
        width="w-[360px]"
      >
        <Suspense fallback={<SimulatorSkeleton />}>
          <SimulatorPanel />
        </Suspense>
      </SidePanel>
    </div>
  );
}

// ============================================
// MOBILE LAYOUT
// ============================================

function MobileLayout() {
  const [activeTab, setActiveTab] = useState<string>('canvas');
  const { addCompetency } = useBlueprintWorkspace();

  // When adding from library, switch back to canvas
  const handleAddFromLibrary = (competency: Parameters<typeof addCompetency>[0]) => {
    addCompetency(competency);
    setActiveTab('canvas');
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col flex-1"
    >
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <TabsContent value="canvas" className="h-full m-0 data-[state=active]:flex flex-col">
          <Canvas />
        </TabsContent>

        <TabsContent value="library" className="h-full m-0 data-[state=active]:flex flex-col">
          <LibraryPanel onAdd={handleAddFromLibrary} />
        </TabsContent>

        <TabsContent value="simulate" className="h-full m-0 data-[state=active]:flex flex-col">
          <SimulatorPanel />
        </TabsContent>
      </div>

      {/* Bottom Tab Bar */}
      <TabsList className="w-full h-14 rounded-none border-t bg-background justify-around gap-0 p-0">
        <TabsTrigger
          value="canvas"
          className="flex-1 h-full flex-col gap-1 rounded-none data-[state=active]:bg-muted/50"
        >
          <Layers className="h-5 w-5" />
          <span className="text-[10px]">Canvas</span>
        </TabsTrigger>
        <TabsTrigger
          value="library"
          className="flex-1 h-full flex-col gap-1 rounded-none data-[state=active]:bg-muted/50"
        >
          <Library className="h-5 w-5" />
          <span className="text-[10px]">Library</span>
        </TabsTrigger>
        <TabsTrigger
          value="simulate"
          className="flex-1 h-full flex-col gap-1 rounded-none data-[state=active]:bg-muted/50"
        >
          <Beaker className="h-5 w-5" />
          <span className="text-[10px]">Simulate</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function BlueprintWorkspace({ templateId: _templateId }: BlueprintWorkspaceProps) {
  const [isLibraryOpen, setLibraryOpen] = useState(false);
  const [isSimulatorOpen, setSimulatorOpen] = useState(false);

  return (
    <PanelStateContext.Provider
      value={{
        isLibraryOpen,
        isSimulatorOpen,
        setLibraryOpen,
        setSimulatorOpen,
      }}
    >
      {/* 
        Builder uses fixed viewport height to enable panel scrolling.
        calc(100vh - 7rem) accounts for site header (3.5rem) + template header (3.5rem).
        This is scoped to builder only - other pages use default scroll behavior.
      */}
      <div 
        className="flex flex-col bg-muted/30"
        style={{ height: 'calc(100vh - 7rem)', maxHeight: 'calc(100vh - 7rem)' }}
        data-template-id={_templateId}
      >
        {/* Desktop View */}
        <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
          <DesktopLayout />
        </div>

        {/* Mobile/Tablet View */}
        <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden">
          <MobileLayout />
        </div>
      </div>
    </PanelStateContext.Provider>
  );
}
