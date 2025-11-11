'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { EntityDetailHeader } from "../../../components/EntityDetailHeader";
import { deleteIndicator } from "@/app/actions";
import { approvalStatusToColor, levelToColor, formatProficiencyLevel } from "../../../components/entity-utils";
import { useBreadcrumbContext } from '@/src/context/BreadcrumbContext';
import type { BehavioralIndicator } from "../../../interfaces/domain-interfaces";

interface IndicatorDetailClientProps {
  indicator: BehavioralIndicator;
  children: React.ReactNode;
}

export default function IndicatorDetailClient({ indicator, children }: IndicatorDetailClientProps) {
  const router = useRouter();
  const { setBreadcrumbTitle, clearBreadcrumb } = useBreadcrumbContext();

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
      toast.success('Behavioral indicator deleted successfully');
      router.push('/behavioral-indicators');
    } catch (error) {
      toast.error('Failed to delete indicator. Please try again.');
      throw error;
    }
  };

  const badges = [
    { 
      label: formatProficiencyLevel(indicator.observabilityLevel), 
      variant: 'outline' as const, 
      className: levelToColor(indicator.observabilityLevel) 
    },
    { label: indicator.isActive ? "Active" : "Inactive", variant: indicator.isActive ? 'default' as const : 'secondary' as const },
    { 
      label: indicator.approvalStatus.replace("_", " "), 
      variant: 'outline' as const, 
      className: approvalStatusToColor(indicator.approvalStatus) 
    },
    { label: `Weight: ${indicator.weight}`, variant: 'outline' as const },
    { label: indicator.measurementType.replace("_", " "), variant: 'secondary' as const },
  ];

  return (
    <>
      <EntityDetailHeader
        title={indicator.title}
        badges={badges}
        backHref="/behavioral-indicators"
        editHref={`/behavioral-indicators/${indicator.id}/edit`}
        onDelete={handleDelete}
        deleteConfig={{
          title: 'Delete Behavioral Indicator',
          description: 'This action cannot be undone. This will permanently delete the behavioral indicator and all associated data.',
          entityName: indicator.title,
        }}
      />
      {children}
    </>
  );
}