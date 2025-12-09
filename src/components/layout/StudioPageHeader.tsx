"use client";

import React from "react";
import { useStudioHeader } from "@/context/StudioHeaderContext";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * StudioPageHeader - Dynamic header component for studio pages
 * 
 * This component renders in the layout and reads from StudioHeaderContext.
 * Individual pages use useStudioHeader() or SetStudioHeader to set their header content.
 * 
 * Features:
 * - Responsive design with mobile-first approach
 * - Supports dynamic title, description, and action buttons
 * - Shows skeleton when no title is set (loading state)
 */
export default function StudioPageHeader() {
  const { title, description, actions } = useStudioHeader();

  // Show skeleton if title is not set yet (page still loading/setting header)
  if (!title) {
    return (
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl break-words">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground sm:text-base max-w-4xl break-words leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
