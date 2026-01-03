'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { History, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/common/PageHeader';

interface TemplatesPageHeaderProps {
  canCreate: boolean;
}

export function TemplatesPageHeader({ canCreate }: TemplatesPageHeaderProps) {
  const t = useTranslations('template');
  const tCommon = useTranslations('common');

  return (
    <PageHeader
      title={t('title')}
      description={t('selectTemplate')}
    >
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Link href="/test-templates/history" className="flex-1 sm:flex-none">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto h-9 gap-1.5"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{t('myResults')}</span>
            <span className="sm:hidden">{t('results')}</span>
          </Button>
        </Link>
        {canCreate && (
          <Link href="/test-templates/new" className="flex-1 sm:flex-none">
            <Button
              size="sm"
              className="w-full sm:w-auto h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('newTemplate')}</span>
              <span className="sm:hidden">{tCommon('create')}</span>
            </Button>
          </Link>
        )}
      </div>
    </PageHeader>
  );
}
