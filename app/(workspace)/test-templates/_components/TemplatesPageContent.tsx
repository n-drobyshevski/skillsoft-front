'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListFilter, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import TestTemplatesGrid from './TestTemplatesGrid';
import type { TestTemplateSummary } from '@/types/domain';

interface TemplatesEmptyStateProps {
  canCreate: boolean;
}

export function TemplatesEmptyState({ canCreate }: TemplatesEmptyStateProps) {
  const t = useTranslations('template');

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-4">
        <ListFilter className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-medium mt-4 mb-1">{t('noTemplatesAvailable')}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {t('noTemplatesDescription')}
      </p>
      {canCreate && (
        <Button asChild className="mt-4" size="sm">
          <Link href="/test-templates/new">
            <Plus className="mr-1.5 h-4 w-4" />
            {t('create')}
          </Link>
        </Button>
      )}
    </div>
  );
}

interface TemplatesGridWrapperProps {
  templates: TestTemplateSummary[];
  canEdit: boolean;
}

export function TemplatesGridWrapper({ templates, canEdit }: TemplatesGridWrapperProps) {
  if (templates.length === 0) {
    return <TemplatesEmptyState canCreate={canEdit} />;
  }

  return <TestTemplatesGrid templates={templates} canEdit={canEdit} />;
}
