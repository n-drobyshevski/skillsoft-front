"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const DIRECTION_NAMES: Record<string, string> = {
  "/test-drive-preview/inline-annotations": "Inline Annotations",
  "/test-drive-preview/split-screen": "Split-Screen Command Center",
  "/test-drive-preview/dashboard": "Insights Dashboard",
};

export default function TestDrivePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Match the direction name by checking if the pathname ends with one of the known segments
  const directionName = Object.entries(DIRECTION_NAMES).find(([key]) =>
    pathname.startsWith(key),
  )?.[1];

  const isSubRoute = Boolean(directionName);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Top navigation bar */}
      <header className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-sm supports-[backdrop-filter]:bg-neutral-950/80">
        {/* Left: title */}
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <FlaskConical className="size-4 text-neutral-400" />
          <span>Test Drive Preview</span>
        </div>

        {/* Right: breadcrumb nav */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-400">
          <Link
            href="/test-drive-preview"
            className={cn(
              "flex items-center gap-1.5 hover:text-white transition-colors",
              !isSubRoute && "text-white pointer-events-none",
            )}
          >
            <Home className="size-3.5" />
            <span>All Directions</span>
          </Link>

          {isSubRoute && directionName && (
            <>
              <ChevronRight className="size-3.5 text-neutral-800" />
              <span className="text-white font-medium">{directionName}</span>
            </>
          )}
        </nav>
      </header>

      {/* Page content */}
      <main>
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
