'use client';

import { behavioralIndicatorsApi } from "@/services/api";
import { IndicatorForm } from "../../components/IndicatorForm";
import { notFound, useParams } from "next/navigation";
import IndicatorPreview from "../../components/IndicatorPreview";
import { BehavioralIndicator } from "@/app/interfaces/domain-interfaces";
import { useEffect, useState } from "react";
import { EditIndicatorPageSkeleton } from "../../components/EditIndicatorPageSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndicatorQuestionsManager } from "../../components/IndicatorQuestionsManager";
import PageHeader from "@/app/components/PageHeader";
import { indicatorSchema } from "../../validation";
import { z } from 'zod';

type IndicatorFormValues = z.infer<typeof indicatorSchema>;

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

  const handleUpdatePreview = (data: IndicatorFormValues) => {
    if (previewIndicator) {
      setPreviewIndicator({ ...previewIndicator, ...data });
    }
  };

  if (!indicator) {
    return <EditIndicatorPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4">
          <PageHeader
            className="py-4 border-0"
            title={`Edit Behavioral Indicator`}
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="details" className="space-y-6">
          <div className="flex items-center space-x-1 rounded-lg bg-muted p-1">
            <TabsList className="bg-transparent">
              <TabsTrigger value="details" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Details
              </TabsTrigger>
              <TabsTrigger value="questions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Questions
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="space-y-0">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3">
                <IndicatorForm indicator={indicator} onUpdatePreview={handleUpdatePreview} />
              </div>
              <div className="xl:col-span-2">
                <div className="sticky top-6">
                  {previewIndicator && <IndicatorPreview indicator={previewIndicator} />}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-0">
            <IndicatorQuestionsManager indicator={indicator} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
