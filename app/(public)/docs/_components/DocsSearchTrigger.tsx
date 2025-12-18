"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Lazy load the dialog to reduce initial bundle size
const DocsSearchDialog = lazy(() =>
  import("./DocsSearchDialog").then((mod) => ({ default: mod.DocsSearchDialog }))
);

/**
 * Search trigger button with lazy-loaded dialog.
 *
 * Reduces initial JavaScript bundle size by deferring
 * the CommandDialog component load until the user opens it.
 */
export function DocsSearchTrigger() {
  const [open, setOpen] = useState(false);

  // Register keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground h-9 px-3"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span className="flex-1 text-left text-sm">Поиск...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>

      {open && (
        <Suspense fallback={null}>
          <DocsSearchDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}
