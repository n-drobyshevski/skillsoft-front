/**
 * Loading UI for Skill Mapper Route
 * 
 * This file provides automatic loading UI while the page is loading.
 * Next.js uses this as a Suspense fallback for the route segment.
 */

import { Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkillMapperLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header Skeleton */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Search className="h-6 w-6" />
              Skill Mapper
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Client-side fuzzy search across ESCO and O*NET skill databases
            </p>
          </div>
          
          {/* Stats Skeleton */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
      
      {/* Main Content - Loading State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium">Loading Skill Database</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Processing ESCO and O*NET data...
          </p>
        </div>
      </div>
      
      {/* Footer Skeleton */}
      <div className="border-t bg-muted/30 px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            <strong>Tips:</strong> Use filters to narrow results • Click a skill for details
          </span>
          <div className="flex items-center gap-2">
            <span>Zero-latency search</span>
            <span>•</span>
            <span>No network calls</span>
            <span>•</span>
            <span>Powered by fuse.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}
