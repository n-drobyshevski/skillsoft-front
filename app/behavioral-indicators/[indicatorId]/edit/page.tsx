'use client';

import { behavioralIndicatorsApi } from "@/services/api";
import { IndicatorForm } from "../../components/IndicatorForm";
import { notFound, useParams } from "next/navigation";
import IndicatorPreview from "../../components/IndicatorPreview";
import { BehavioralIndicator } from "../../../interfaces/domain-interfaces";
import { useEffect, useState } from "react";
import { EditIndicatorPageSkeleton } from "../../components/EditIndicatorPageSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndicatorQuestionsManager } from "../../components/IndicatorQuestionsManager";
import PageHeader from "../../../components/PageHeader";

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
        <PageHeader
        className="!pl-0 py-4"
            title="Edit Behavioral Indicator"
            
        />
      <Tabs defaultValue="details" className="mt-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            <div className="lg:col-span-2">
              <IndicatorForm indicator={indicator} onUpdatePreview={handleUpdatePreview} />
            </div>
            <div className="hidden lg:block">
              {previewIndicator && <IndicatorPreview indicator={previewIndicator} />}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="questions">
          <IndicatorQuestionsManager indicator={indicator} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
