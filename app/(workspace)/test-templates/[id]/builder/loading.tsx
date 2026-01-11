import { Skeleton } from '@/components/ui/skeleton';

/**
 * Adaptive loading skeleton for Builder page
 * Matches the exact structure of:
 * - Desktop: 3-panel resizable layout (Library | Canvas | Simulator)
 * - Mobile: 2-tab layout with bottom navigation (Canvas | Simulate)
 *
 * Key design principles:
 * - Matches actual component dimensions and spacing
 * - Responsive breakpoints aligned with actual layout
 * - Proper height ratios for cards and controls
 */

// ============================================
// LIBRARY PANEL SKELETON
// ============================================

function LibraryPanelSkeleton() {
  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/10">
      {/* Search Header */}
      <div className="p-3 border-b bg-background/50 space-y-2">
        <Skeleton className="h-11 w-full rounded-xl" />
        {/* Stats row */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>

      {/* Category Groups */}
      <div className="flex-1 p-3 space-y-4 overflow-hidden">
        {/* Category 1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2.5 w-6" />
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
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
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Category 2 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-2.5 w-6" />
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-l-[3px] border-l-muted-foreground/20"
              >
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-2/5" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CANVAS PANEL SKELETON
// ============================================

function CanvasPanelSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-b bg-background/50 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <Skeleton className="h-4 w-4 shrink-0" />
          <Skeleton className="h-4 w-28 hidden sm:block" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
          {/* Save status indicator */}
          <Skeleton className="h-4 w-16 hidden sm:block" />
          <Skeleton className="h-4 w-4 sm:hidden" />
          {/* Undo/Redo buttons */}
          <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 md:h-8 md:w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 md:h-8 md:w-8 rounded-lg" />
          {/* Test Drive button */}
          <Skeleton className="h-8 sm:h-10 md:h-8 w-8 sm:w-20 rounded-lg" />
        </div>
      </div>

      {/* Competency Cards */}
      <div className="flex-1 p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 overflow-hidden">
        {Array.from({ length: compact ? 3 : 4 }).map((_, i) => (
          <CompetencyCardSkeleton key={i} showWeight={compact} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// COMPETENCY CARD SKELETON
// ============================================

function CompetencyCardSkeleton({ showWeight = false }: { showWeight?: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <Skeleton className="h-5 w-4 shrink-0" />
        {/* Category icon */}
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        {/* Title and meta */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* Weight control - shown expanded on mobile */}
      {showWeight && (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-5 w-10 rounded" />
        </div>
      )}
    </div>
  );
}

// ============================================
// SIMULATOR PANEL SKELETON
// ============================================

function SimulatorPanelSkeleton({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  return (
    <div className="flex flex-col h-full min-h-0 p-3 sm:p-4 space-y-4">
      {/* Strategy Badge */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Persona Selector - 3 column grid */}
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

      {/* Run Simulation CTA */}
      <Skeleton className="h-11 w-full rounded-xl" />

      {/* Divider */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-px flex-1" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-px flex-1" />
      </div>

      {/* Score Display / Results Preview */}
      <div className="p-4 rounded-xl border space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>

      {/* Charts / Analytics section - desktop only */}
      {variant === 'desktop' && (
        <>
          <Skeleton className="h-10 w-full rounded-lg" /> {/* Tabs */}
          <Skeleton className="h-32 w-full rounded-xl" /> {/* Chart */}
        </>
      )}
    </div>
  );
}

// ============================================
// DESKTOP SKELETON
// ============================================

function DesktopSkeleton() {
  return (
    <div className="flex h-full w-full gap-px overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Library Panel - 20% width */}
      <div className="w-[20%] min-w-[200px] border-r bg-muted/10 overflow-hidden">
        <LibraryPanelSkeleton />
      </div>

      {/* Resize Handle */}
      <div className="w-1 bg-border/50 hover:bg-border cursor-col-resize flex items-center justify-center">
        <div className="w-1 h-8 rounded-full bg-muted-foreground/20" />
      </div>

      {/* Canvas Panel - 50% width */}
      <div className="w-[50%] min-w-[300px] bg-background overflow-hidden">
        <CanvasPanelSkeleton />
      </div>

      {/* Resize Handle */}
      <div className="w-1 bg-border/50 hover:bg-border cursor-col-resize flex items-center justify-center">
        <div className="w-1 h-8 rounded-full bg-muted-foreground/20" />
      </div>

      {/* Simulator Panel - 30% width */}
      <div className="w-[30%] min-w-[250px] border-l bg-muted/10 overflow-hidden">
        <SimulatorPanelSkeleton variant="desktop" />
      </div>
    </div>
  );
}

// ============================================
// MOBILE SKELETON
// ============================================

function MobileSkeleton() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Content Area - Canvas View */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CanvasPanelSkeleton compact />
      </div>

      {/* Bottom Navigation Bar - Material Design 3 pattern */}
      <div className="shrink-0 border-t bg-background/80 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <nav className="grid grid-cols-3 h-16 items-center" aria-label="Builder navigation">
          {/* Canvas Tab */}
          <div className="flex flex-col items-center justify-center gap-1 h-full">
            <div className="flex items-center justify-center h-8 px-4 rounded-full bg-primary/10">
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-3 w-10" />
          </div>

          {/* Add Button (Center Action) */}
          <div className="flex flex-col items-center justify-center gap-1 h-full">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20">
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-3 w-6" />
          </div>

          {/* Simulate Tab */}
          <div className="flex flex-col items-center justify-center gap-1 h-full">
            <div className="flex items-center justify-center h-8 px-4 rounded-full">
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        </nav>
      </div>
    </div>
  );
}

// ============================================
// PAGE HEADER SKELETON (Desktop only)
// ============================================

function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between border-b bg-background px-6 py-4">
      <div className="flex items-center gap-6">
        {/* Back button */}
        <Skeleton className="h-9 w-9 rounded-xl" />
        {/* Template info */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export default function BuilderLoading() {
  return (
    <div
      className="flex h-full flex-col bg-muted/30"
      style={{ height: '100dvh' }}
    >
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden lg:block shrink-0">
        <PageHeaderSkeleton />
      </div>

      {/* Desktop Content - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 min-h-0 p-2 lg:p-3 overflow-hidden">
        <DesktopSkeleton />
      </div>

      {/* Mobile Content - Hidden on desktop */}
      <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden">
        <MobileSkeleton />
      </div>
    </div>
  );
}
