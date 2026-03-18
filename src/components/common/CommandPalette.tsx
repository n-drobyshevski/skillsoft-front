'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
} from '@/components/ui/command';
import { FileText, BookOpen, SearchX, Clock } from 'lucide-react';
import { useActiveLens, useUserRole } from '@/hooks/useLens';
import { usePaletteSearch } from '@/hooks/use-palette-search';
import { useRecentItems } from '@/hooks/use-recent-items';
import { PaletteItem } from '@/components/common/command-palette/PaletteItem';
import { SearchSkeleton } from '@/components/common/command-palette/SearchSkeleton';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const router = useRouter();
  const { userId } = useAuth();
  const activeLens = useActiveLens();
  const userRole = useUserRole();
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const { recentItems, addRecent } = useRecentItems();

  const {
    navigationResults,
    quickActionResults,
    templateResults,
    competencyResults,
    isSearching,
    isEmpty,
  } = usePaletteSearch(query, activeLens, userId, userRole, open);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setQuery('');
  };

  const navigate = useCallback(
    (path: string, label: string) => {
      addRecent(path, label);
      router.push(path);
      setOpen(false);
      setQuery('');
    },
    [router, addRecent],
  );

  const hasQuery = query.length > 0;
  const hasRemoteResults =
    templateResults.length > 0 || competencyResults.length > 0;
  const showRecent = !hasQuery && recentItems.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={tNav('commandPalette.title')}
      description={tNav('commandPalette.description')}
      shouldFilter={false}
    >
      <CommandInput
        placeholder={tNav('commandPalette.placeholder')}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[400px]">
        {/* Empty state */}
        {isEmpty && (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <SearchX className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {tNav('commandPalette.noResultsFor', { query })}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {tNav('commandPalette.tryDifferentSearch')}
              </p>
            </div>
          </CommandEmpty>
        )}

        {/* Recent items (only when no query) */}
        {showRecent && (
          <CommandGroup heading={tNav('commandPalette.recentItems')}>
            {recentItems.map((item) => (
              <PaletteItem
                key={`recent-${item.path}`}
                icon={Clock}
                label={item.label}
                onSelect={() => navigate(item.path, item.label)}
                value={`recent-${item.label}`}
              />
            ))}
          </CommandGroup>
        )}

        {/* Navigation (always visible, fuzzy-filtered when query present) */}
        {navigationResults.length > 0 && (
          <CommandGroup heading={tNav('commandPalette.navigation')}>
            {navigationResults.map((entry) => (
              <PaletteItem
                key={entry.id}
                icon={entry.icon}
                label={tNav(entry.labelKey)}
                shortcut={entry.shortcut}
                onSelect={() => navigate(entry.path, tNav(entry.labelKey))}
                value={tNav(entry.labelKey)}
              />
            ))}
          </CommandGroup>
        )}

        {/* Quick actions */}
        {quickActionResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={tNav('quickActions')}>
              {quickActionResults.map((action) => (
                <PaletteItem
                  key={action.id}
                  icon={action.icon}
                  label={tNav(action.labelKey)}
                  onSelect={() => navigate(action.path, tNav(action.labelKey))}
                  value={tNav(action.labelKey)}
                />
              ))}
            </CommandGroup>
          </>
        )}

        {/* Search results: templates */}
        {templateResults.length > 0 && (
          <CommandGroup heading={tNav('commandPalette.templates')}>
            {templateResults.map((template) => (
              <PaletteItem
                key={template.id}
                icon={FileText}
                label={template.name}
                description={template.description}
                onSelect={() =>
                  navigate(`/test-templates/${template.id}`, template.name)
                }
                value={`template-${template.name}`}
              />
            ))}
          </CommandGroup>
        )}

        {/* Search results: competencies */}
        {competencyResults.length > 0 && (
          <CommandGroup heading={tNav('competencies')}>
            {competencyResults.map((competency) => (
              <PaletteItem
                key={competency.id}
                icon={BookOpen}
                label={competency.name}
                description={competency.description}
                onSelect={() =>
                  navigate(
                    `/hr/competencies/${competency.id}`,
                    competency.name,
                  )
                }
                value={`competency-${competency.name}`}
              />
            ))}
          </CommandGroup>
        )}

        {/* Loading skeleton for remote search */}
        {hasQuery && isSearching && !hasRemoteResults && <SearchSkeleton />}
      </CommandList>

      {/* Footer with keyboard hints */}
      <div
        className="border-t border-border/50 px-4 py-2 text-[11px] text-muted-foreground/60 flex items-center justify-between"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border border-border/40 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70">
              <span className="text-xs">↑↓</span>
            </kbd>
            <span>{tNav('commandPalette.arrowNavigation')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border border-border/40 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70">
              <span className="text-xs">Enter</span>
            </kbd>
            <span>{tCommon('confirm')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">Esc</span>
          </kbd>
          <span>{tCommon('close')}</span>
        </div>
      </div>
    </CommandDialog>
  );
}
