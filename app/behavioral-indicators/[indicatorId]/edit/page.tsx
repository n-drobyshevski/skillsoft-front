'use client';

import { behavioralIndicatorsApi } from "@/services/api";
import { IndicatorForm } from "../../components/IndicatorForm";
import { notFound, useParams } from "next/navigation";
import IndicatorPreview from "../../components/IndicatorPreview";
import { BehavioralIndicator } from "../../../interfaces/domain-interfaces";
import { useEffect, useState } from "react";
import { EditIndicatorPageSkeleton } from "../../components/EditIndicatorPageSkeleton";

export default function EditIndicatorPage() {
  const params = useParams();
  const indicatorId = params.indicatorId as string;

  const [indicator, setIndicator] = useState<BehavioralIndicator | null>(null);
  const [previewIndicator, setPreviewIndicator] = useState<BehavioralIndicator | null>(null);

  useEffect(() => {
    async function fetchIndicator() {
      const fetchedIndicator = await behavioralIndicatorsApi.getIndicatorById(indicatorId);
      if (!fetchedIndicator) {
        notFound();
      }
      setIndicator(fetchedIndicator);
      setPreviewIndicator(fetchedIndicator);
    }
    if (indicatorId) {
      fetchIndicator();
    }
  }, [indicatorId]);

  const handleUpdatePreview = (data: Partial<BehavioralIndicator>) => {
    if (previewIndicator) {
      setPreviewIndicator({ ...previewIndicator, ...data });
    }
  };

  if (!indicator) {
    return <EditIndicatorPageSkeleton />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <IndicatorForm indicator={indicator} onUpdatePreview={handleUpdatePreview} />
        </div>
        <div className="hidden lg:block">
          {previewIndicator && <IndicatorPreview indicator={previewIndicator} />}
        </div>
      </div>
    </div>
  );
}
