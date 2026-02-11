"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { docsNavigation } from "@/lib/docs/navigation";

/**
 * Custom hook to register Cmd+K / Ctrl+K keyboard shortcut for search
 * @param setOpen - State setter to toggle the search dialog
 */
function useSearchShortcut(setOpen: React.Dispatch<React.SetStateAction<boolean>>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);
}

/**
 * Documentation Search Component
 *
 * Features:
 * - Cmd+K / Ctrl+K keyboard shortcut to open
 * - Search through all documentation pages
 * - Quick navigation to any page
 * - Shows section grouping
 */
export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Register keyboard shortcut
  useSearchShortcut(setOpen);

  // Handle navigation
  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <>
      {/* Search Trigger Button */}
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

      {/* Search Dialog */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Поиск по документации"
        description="Найдите нужную страницу документации"
      >
        <CommandInput placeholder="Поиск страниц..." />
        <CommandList>
          <CommandEmpty>Ничего не найдено.</CommandEmpty>

          {docsNavigation.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${section.title} ${item.title}`}
                  onSelect={() => handleSelect(item.href)}
                  className="cursor-pointer"
                >
                  <FileTextIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

/**
 * Standalone search trigger for use in mobile nav or header
 */
export function DocsSearchTrigger() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Register keyboard shortcut
  useSearchShortcut(setOpen);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label="Поиск по документации"
      >
        <SearchIcon className="h-4 w-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Поиск по документации"
        description="Найдите нужную страницу документации"
      >
        <CommandInput placeholder="Поиск страниц..." />
        <CommandList>
          <CommandEmpty>Ничего не найдено.</CommandEmpty>

          {docsNavigation.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${section.title} ${item.title}`}
                  onSelect={() => handleSelect(item.href)}
                  className="cursor-pointer"
                >
                  <FileTextIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
