'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { EntityDetailHeader } from "@/components/common/EntityDetailHeader";
import { deleteIndicator } from "@/app/actions";
import { approvalStatusToColor, observabilityLevelToColor, formatObservabilityLevel } from "@/components/common/entity-utils";
import { useBreadcrumbContext } from '@/context/BreadcrumbContext';
import type { BehavioralIndicator } from "@/types/domain";

interface IndicatorDetailClientProps {
  indicator: BehavioralIndicator;
  children: React.ReactNode;
}

export default function IndicatorDetailClient({ indicator, children }: IndicatorDetailClientProps) {
  const router = useRouter();
  const { setBreadcrumbTitle, clearBreadcrumb } = useBreadcrumbContext();
  const t = useTranslations('indicator.detail');
  const tObservability = useTranslations('enums.observabilityLevel');
  const tApproval = useTranslations('enums.approvalStatus');
  const tMeasurement = useTranslations('enums.measurementType');

  // Set custom breadcrumb title for this indicator
  useEffect(() => {
    setBreadcrumbTitle(indicator.id, indicator.title);

    // Cleanup when component unmounts
    return () => {
      clearBreadcrumb(indicator.id);
    };
  }, [indicator.id, indicator.title, setBreadcrumbTitle, clearBreadcrumb]);

  const handleDelete = async () => {
    try {
      await deleteIndicator(indicator.id, indicator.competencyId);
      toast.success(t('deleteSuccess'));
      router.push('/hr/behavioral-indicators');
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };
      if (apiError.status === 404) {
        // Handle case where the indicator was already deleted
        toast.warning(t('deleteAlready'));
        router.push('/hr/behavioral-indicators');
      } else {
        toast.error(t('deleteFailed'));
        throw error;
      }
    }
  };

  const observabilityLabel = tObservability.has(indicator.observabilityLevel)
    ? tObservability(indicator.observabilityLevel)
    : formatObservabilityLevel(indicator.observabilityLevel);
  const approvalLabel = tApproval.has(indicator.approvalStatus)
    ? tApproval(indicator.approvalStatus)
    : indicator.approvalStatus.replace("_", " ");
  const measurementLabel = tMeasurement.has(indicator.measurementType)
    ? tMeasurement(indicator.measurementType)
    : indicator.measurementType.replace("_", " ");

  const badges = [
    {
      label: observabilityLabel,
      variant: 'outline' as const,
      className: observabilityLevelToColor(indicator.observabilityLevel)
    },
    { label: indicator.isActive ? t('active') : t('inactive'), variant: indicator.isActive ? 'default' as const : 'secondary' as const },
    {
      label: approvalLabel,
      variant: 'outline' as const,
      className: approvalStatusToColor(indicator.approvalStatus)
    },
    { label: t('weightBadge', { value: indicator.weight }), variant: 'outline' as const },
    { label: measurementLabel, variant: 'secondary' as const },
  ];

  return (
    <>
      <EntityDetailHeader
        title={indicator.title}
        badges={badges}
        backHref="/hr/behavioral-indicators"
        editHref={`/hr/behavioral-indicators/${indicator.id}/edit`}
        onDelete={handleDelete}
        deleteConfig={{
          title: t('deleteTitle'),
          description: t('deleteDescription'),
          entityName: indicator.title,
        }}
      />
      {children}
    </>
  );
}