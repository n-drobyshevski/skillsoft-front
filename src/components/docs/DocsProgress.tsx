"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DocsProgressProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DocsProgress Component
 *
 * A reading progress indicator that shows how far the user has scrolled
 * through the documentation page.
 *
 * @example
 * ```tsx
 * <DocsProgress />
 * ```
 */
export function DocsProgress({ className }: DocsProgressProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Calculate the maximum scrollable distance
      const maxScroll = documentHeight - windowHeight;

      if (maxScroll <= 0) {
        setProgress(100);
        return;
      }

      // Calculate progress as percentage
      const currentProgress = (scrollTop / maxScroll) * 100;
      setProgress(Math.min(100, Math.max(0, currentProgress)));
    };

    // Initial calculation
    calculateProgress();

    // Add scroll listener with throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateProgress);
    };
  }, []);

  return (
    <div
      className={cn("docs-progress", className)}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="docs-progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
