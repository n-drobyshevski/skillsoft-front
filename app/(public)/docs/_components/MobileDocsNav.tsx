"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { DocsNav } from "./DocsNav";

/**
 * Mobile Documentation Navigation
 *
 * A floating action button (FAB) in the bottom-right corner that opens
 * a sheet containing the full documentation navigation.
 *
 * Visible only on mobile devices (< md breakpoint).
 */
export function MobileDocsNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FAB Button - Only visible on mobile */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 z-50 md:hidden h-14 w-14 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Открыть навигацию"
      >
        <MenuIcon className="h-6 w-6" />
      </Button>

      {/* Navigation Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Навигация по документации</SheetTitle>
            <SheetDescription>
              Выберите раздел документации для просмотра
            </SheetDescription>
          </SheetHeader>
          <DocsNav onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
