'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TestTemplateSummary, SharedTemplateItem } from '@/types/domain';
import { TemplatesGridWrapper } from './TemplatesPageContent';
import { SharedTemplatesList } from './SharedTemplatesList';

type CatalogSource = 'available' | 'shared';

interface CatalogTabsProps {
  templates: TestTemplateSummary[];
  sharedItems: SharedTemplateItem[];
  sharedTotal: number;
}

/**
 * CatalogTabs - URL-driven tabs for the personal lens Test Catalog page.
 *
 * Renders two tabs:
 * - "All Available" — existing TestTemplatesGrid
 * - "Shared with Me" — SharedTemplatesList with sharing metadata
 *
 * URL state: `?source=shared` activates the shared tab.
 * Uses optimistic updates with `useTransition` following TemplateFilters pattern.
 */
export function CatalogTabs({ templates, sharedItems, sharedTotal }: CatalogTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('template');

  // Determine active tab from URL
  const urlSource = searchParams.get('source');
  const activeTab: CatalogSource = urlSource === 'shared' ? 'shared' : 'available';

  const handleTabChange = (value: string) => {
    const newTab = value as CatalogSource;

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newTab === 'shared') {
        params.set('source', 'shared');
      } else {
        params.delete('source');
      }
      // Preserve other params (like goal filters)
      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, {
        scroll: false,
      });
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="inline-flex h-11 sm:h-10 p-1 bg-muted/50 rounded-lg gap-1 mb-4">
        <TabsTrigger
          value="available"
          disabled={isPending}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-1.5',
            'min-h-[40px] sm:min-h-[36px]',
            'data-[state=active]:bg-background data-[state=active]:shadow-sm',
            'text-xs sm:text-sm font-medium transition-all whitespace-nowrap rounded-md',
            isPending && 'opacity-70'
          )}
        >
          {t('catalog.tabs.available')}
          <Badge
            variant="secondary"
            className={cn(
              'min-w-5 sm:min-w-6 h-5 justify-center text-[11px] sm:text-xs px-1 sm:px-1.5 rounded-sm',
              activeTab === 'available' && 'bg-primary text-primary-foreground'
            )}
          >
            {templates.length}
          </Badge>
        </TabsTrigger>

        <TabsTrigger
          value="shared"
          disabled={isPending}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-1.5',
            'min-h-[40px] sm:min-h-[36px]',
            'data-[state=active]:bg-background data-[state=active]:shadow-sm',
            'text-xs sm:text-sm font-medium transition-all whitespace-nowrap rounded-md',
            isPending && 'opacity-70'
          )}
        >
          {t('catalog.tabs.shared')}
          {sharedTotal > 0 && (
            <Badge
              variant="secondary"
              className={cn(
                'min-w-5 sm:min-w-6 h-5 justify-center text-[11px] sm:text-xs px-1 sm:px-1.5 rounded-sm',
                activeTab === 'shared' && 'bg-primary text-primary-foreground'
              )}
            >
              {sharedTotal}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="available" className="mt-0">
        <TemplatesGridWrapper templates={templates} canEdit={false} />
      </TabsContent>

      <TabsContent value="shared" className="mt-0">
        <SharedTemplatesList items={sharedItems} total={sharedTotal} />
      </TabsContent>
    </Tabs>
  );
}
