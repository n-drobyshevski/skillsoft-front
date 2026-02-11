'use client';

import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { useTranslations } from 'next-intl';

export function NewTestPageHeader() {
  const t = useTranslations('template');

  return (
    <PageHeader
      title={t('testCreation')}
      description={t('createDescription')}
    />
  );
}
