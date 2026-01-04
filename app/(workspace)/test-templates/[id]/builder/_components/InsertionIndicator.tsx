"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InsertionIndicatorProps {
  className?: string;
}

/**
 * Visual indicator showing where a dragged item will be inserted.
 * Renders as an animated line with glowing effect.
 */
export const InsertionIndicator = React.memo(function InsertionIndicator({
  className,
}: InsertionIndicatorProps) {
  return (
    <div
      className={cn(
        "relative h-1 w-full my-1",
        "animate-in fade-in zoom-in-95 duration-150",
        className
      )}
      role="presentation"
      aria-hidden="true"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm" />

      {/* Main line */}
      <div className="absolute inset-0 rounded-full bg-primary" />

      {/* End caps (dots) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rounded-full bg-primary shadow-sm" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 rounded-full bg-primary shadow-sm" />
    </div>
  );
});
