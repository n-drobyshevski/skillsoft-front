'use client';

import { useState } from 'react';
import { CompetencyForm } from '../components/CompetencyForm';
import { CompetencyIndicatorsManager } from '../components/CompetencyIndicatorsManager';
import PageHeader from '../../components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Competency } from '../../interfaces/domain-interfaces';
import { CompetencyCategory, ProficiencyLevel, ApprovalStatus } from '../../enums/domain_enums';
import CompetencyPreview from '../components/CompetencyPreview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

// Constants
const PREVIEW_COMPETENCY_ID = 'preview-id';

type CompetencyFormData = {
  name: string;
  category: string;
  level: string;
  isActive: boolean;
  approvalStatus: string;
  description?: string;
};

export default function NewCompetencyPage() {
  const [activeTab, setActiveTab] = useState('details');
  const [createdCompetency, setCreatedCompetency] = useState<Competency | null>(null);
  const [previewCompetency, setPreviewCompetency] = useState<Competency | null>(null);

  const handleUpdatePreview = (data: CompetencyFormData) => {
    // Create a preview competency object for the preview component
    const preview: Competency = {
      id: PREVIEW_COMPETENCY_ID,
      name: data.name || 'New Competency',
      description: data.description || 'No description provided',
      category: data.category as CompetencyCategory,
      level: data.level as ProficiencyLevel,
      isActive: data.isActive,
      approvalStatus: data.approvalStatus as ApprovalStatus,
      behavioralIndicators: [],
      version: 1,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setPreviewCompetency(preview);
  };

  const handleCompetencyCreated = (competency: Competency) => {
    setCreatedCompetency(competency);
    setActiveTab('indicators'); // Switch to indicators tab after creation
  };

  // Create a default preview competency for empty form
  const getDisplayCompetency = () => {
    if (createdCompetency) return createdCompetency;
    if (previewCompetency) return previewCompetency;
    
    // Default competency for empty form
    return {
      id: PREVIEW_COMPETENCY_ID,
      name: 'New Competency',
      description: 'Preview of indicator management functionality',
      category: CompetencyCategory.LEADERSHIP,
      level: ProficiencyLevel.NOVICE,
      isActive: true,
      approvalStatus: ApprovalStatus.DRAFT,
      behavioralIndicators: [],
      version: 1,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    } as Competency;
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        className="pl-0! py-4"
        title="Create New Competency"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="indicators">
            Behavioral Indicators
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            <div className="lg:col-span-2">
              <CompetencyForm 
                onUpdatePreview={handleUpdatePreview}
                onCompetencyCreated={handleCompetencyCreated}
              />
            </div>
            <div className="hidden lg:block">
              {previewCompetency && <CompetencyPreview competency={previewCompetency} />}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="indicators">
          {createdCompetency ? (
            <div className="space-y-4">
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Info className="h-5 w-5" />
                    Competency Created Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Your competency &quot;{createdCompetency.name}&quot; has been created. 
                    You can now manage its behavioral indicators below.
                  </p>
                </CardContent>
              </Card>
              
              <CompetencyIndicatorsManager competency={createdCompetency} />
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <Info className="h-5 w-5" />
                    Preview Mode - Exploring Indicators
                  </CardTitle>
                  <CardDescription className="text-amber-600 dark:text-amber-400">
                    You can browse and explore available indicators. Full management becomes available after saving your competency.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                    Currently previewing: &quot;{getDisplayCompetency().name}&quot;
                  </p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                    Save your competency in the Details tab to enable indicator attachment/detachment.
                  </p>
                </CardContent>
              </Card>
              
              <CompetencyIndicatorsManager competency={getDisplayCompetency()} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
