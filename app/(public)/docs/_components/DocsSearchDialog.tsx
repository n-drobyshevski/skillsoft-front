"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileTextIcon } from "lucide-react";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { docsNavigation } from "@/lib/docs/navigation";

interface DocsSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Documentation search dialog component.
 *
 * Lazy-loaded to reduce initial bundle size.
 * Contains the full CommandDialog with search functionality.
 */
export function DocsSearchDialog({ open, onOpenChange }: DocsSearchDialogProps) {
  const router = useRouter();

  // Handle navigation
  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [router, onOpenChange]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
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
  );
}
