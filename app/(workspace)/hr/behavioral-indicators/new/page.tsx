'use client';

import { useState } from 'react';
import { IndicatorForm } from '../_components/IndicatorForm';
import { IndicatorQuestionsManager } from '../_components/IndicatorQuestionsManager';
import CompetencySelector from '../_components/CompetencySelector';
import IndicatorPreview from '../_components/IndicatorPreview';
import PageHeader from '@/components/common/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { BehavioralIndicator } from '@/types/domain';
import { IndicatorMeasurementType, ProficiencyLevel, ApprovalStatus } from '@/types/domain';
import { Info } from 'lucide-react';

// Constants
const PREVIEW_INDICATOR_ID = 'preview-id';

type IndicatorFormData = {
  title: string;
  description?: string;
  measurementType: string;
  observabilityLevel: string;
  weight?: number;
  isActive: boolean;
  targetValue?: number;
  assessmentFrequency?: string;
};

function NewIndicatorPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const competencyId = searchParams.get('competencyId');

  const [activeTab, setActiveTab] = useState('details');
  const [previewIndicator, setPreviewIndicator] = useState<BehavioralIndicator | null>(null);

  const handleCompetencySelected = (selectedCompetencyId: string) => {
    // Update URL with selected competency ID for proper navigation
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('competencyId', selectedCompetencyId);
    router.replace(newUrl.pathname + newUrl.search);
  };

  const handleUpdatePreview = (data: IndicatorFormData) => {
    if (!competencyId) return;
    
    // Create a preview indicator object for the preview component
    const preview: BehavioralIndicator = {
      id: PREVIEW_INDICATOR_ID,
      title: data.title || 'New Behavioral Indicator',
      description: data.description || 'No description provided',
      measurementType: data.measurementType as IndicatorMeasurementType,
      observabilityLevel: data.observabilityLevel as ProficiencyLevel,
      weight: data.weight || 1,
      isActive: data.isActive,
      approvalStatus: ApprovalStatus.DRAFT,
      orderIndex: 1,
      competencyId: competencyId,
    };
    setPreviewIndicator(preview);
  };

  // Note: IndicatorForm doesn't currently support onIndicatorCreated callback
  // The questions tab will show preview mode until this is implemented

  // Create a default preview indicator for empty form
  const getDisplayIndicator = () => {
    if (previewIndicator) return previewIndicator;
    
    if (!competencyId) return null;
    
    // Default indicator for empty form
    return {
      id: PREVIEW_INDICATOR_ID,
      title: 'New Behavioral Indicator',
      description: 'Preview of question management functionality',
      measurementType: IndicatorMeasurementType.QUALITY,
      observabilityLevel: ProficiencyLevel.NOVICE,
      weight: 1,
      isActive: true,
      approvalStatus: ApprovalStatus.DRAFT,
      orderIndex: 1,
      competencyId: competencyId,
    } as BehavioralIndicator;
  };

  if (!competencyId) {
    return (
      <div className="container mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Create New Behavioral Indicator"
          description="First, select the competency for your indicator"
        />
        <div className="mt-6 sm:mt-8">
          <CompetencySelector 
            preselectedCompetencyId={competencyId || undefined}
            onCompetencySelected={handleCompetencySelected}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        className="pl-0! py-4"
        title="Create New Behavioral Indicator"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">
            Assessment Questions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
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
        </TabsContent>
        
        <TabsContent value="questions">
          <div className="space-y-4">
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Info className="h-5 w-5" />
                  Preview Mode - Exploring Questions
                </CardTitle>
                <CardDescription className="text-amber-600 dark:text-amber-400">
                  You can browse and explore available questions. Full management becomes available after saving your indicator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                  Currently previewing: &quot;{getDisplayIndicator()?.title}&quot;
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                  Save your indicator in the Details tab to enable question attachment/detachment.
                </p>
              </CardContent>
            </Card>
            
            {getDisplayIndicator() && <IndicatorQuestionsManager indicator={getDisplayIndicator()!} />}
          </div>
        </TabsContent>
      </Tabs>
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
