'use client';

import { useTranslations } from 'next-intl';
import { Share2 } from 'lucide-react';

/**
 * SharedPageHeader - Header section for the shared templates page
 *
 * Features:
 * - Page title with icon
 * - Description text
 * - Responsive layout
 */
export function SharedPageHeader() {
  const t = useTranslations('shared');

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
          <Share2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {t('title')}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground ml-10">
        {t('description')}
      </p>
    </div>
  );
}
