'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { IndicatorForm } from '../_components/IndicatorForm';
import CompetencySelector from '../_components/CompetencySelector';
import IndicatorPreview from '../_components/IndicatorPreview';
import PageHeader from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { competenciesApi } from '@/services/api';
import {
  type BehavioralIndicator,
  IndicatorMeasurementType,
  ObservabilityLevel,
  ApprovalStatus,
  ContextScope,
} from '@/types/domain';
import { type IndicatorFormValues } from '@/lib/schemas';

const PREVIEW_INDICATOR_ID = 'preview-id';

function CompetencyContextChip({ competencyId }: { competencyId: string }) {
  const t = useTranslations('forms');
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    competenciesApi
      .getCompetencyById(competencyId)
      .then((competency) => {
        if (!cancelled) setName(competency?.name ?? null);
      })
      .catch(() => {
        if (!cancelled) setName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [competencyId]);

  if (!name) return null;
  return (
    <Badge variant="secondary" className="text-xs">
      {t('indicator.context.forCompetency', { name })}
    </Badge>
  );
}

function NewIndicatorPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const competencyId = searchParams.get('competencyId');
  const t = useTranslations('forms');

  const [previewIndicator, setPreviewIndicator] = useState<BehavioralIndicator | null>(null);

  const handleCompetencySelected = (selectedCompetencyId: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('competencyId', selectedCompetencyId);
    router.replace(newUrl.pathname + newUrl.search);
  };

  const handleUpdatePreview = (data: IndicatorFormValues) => {
    if (!competencyId) return;
    setPreviewIndicator({
      id: PREVIEW_INDICATOR_ID,
      title: data.title || t('newIndicator.title'),
      description: data.description || '',
      observabilityLevel: (data.observabilityLevel as ObservabilityLevel) ?? ObservabilityLevel.DIRECTLY_OBSERVABLE,
      measurementType: (data.measurementType as IndicatorMeasurementType) ?? IndicatorMeasurementType.QUALITY,
      weight: data.weight ?? 0.1,
      examples: data.examples,
      counterExamples: data.counterExamples,
      contextScope: (data.contextScope as ContextScope) ?? ContextScope.UNIVERSAL,
      isActive: true,
      approvalStatus: ApprovalStatus.DRAFT,
      orderIndex: 1,
      competencyId,
    });
  };

  if (!competencyId) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader
          className="pl-0! py-4"
          title={t('newIndicator.title')}
          description={t('newIndicator.selectCompetencyDescription')}
        />
        <div className="mt-4">
          <CompetencySelector onCompetencySelected={handleCompetencySelected} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        className="pl-0! py-4"
        title={t('newIndicator.title')}
      >
        <CompetencyContextChip competencyId={competencyId} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-2">
          <IndicatorForm
            competencyId={competencyId}
            onUpdatePreview={handleUpdatePreview}
          />
        </div>
        <div className="hidden lg:block">
          {previewIndicator && <IndicatorPreview indicator={previewIndicator} />}
        </div>
      </div>
    </div>
  );
}

export default function NewIndicatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewIndicatorPageContent />
    </Suspense>
  );
}
