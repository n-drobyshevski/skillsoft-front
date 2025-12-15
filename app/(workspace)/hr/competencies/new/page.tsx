'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompetencyForm } from '../_components/CompetencyForm';
import PageHeader from '@/components/common/PageHeader';
import { Competency } from '@/types/domain';
import { CompetencyCategory, ApprovalStatus, StandardCodesDto } from '@/types/domain';
import CompetencyPreview from '../_components/CompetencyPreview';

// Constants
const PREVIEW_COMPETENCY_ID = 'preview-id';

type CompetencyFormData = {
  name: string;
  category: string;
  isActive: boolean;
  approvalStatus: string;
  description?: string;
  standardCodes?: StandardCodesDto;
};

export default function NewCompetencyPage() {
  const router = useRouter();
  const [previewCompetency, setPreviewCompetency] = useState<Competency | null>(null);

  const handleUpdatePreview = (data: CompetencyFormData) => {
    // Create a preview competency object for the preview component
    const preview: Competency = {
      id: PREVIEW_COMPETENCY_ID,
      name: data.name || 'New Competency',
      description: data.description || 'No description provided',
      category: data.category as CompetencyCategory,
      isActive: data.isActive,
      approvalStatus: data.approvalStatus as ApprovalStatus,
      standardCodes: data.standardCodes,
      behavioralIndicators: [],
      version: 1,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setPreviewCompetency(preview);
  };

  const handleCompetencyCreated = (competency: Competency) => {
    // Redirect to the competency details page
    router.push(`/hr/competencies/${competency.id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        className="pl-0! py-4"
        title="Create New Competency"
      />
      
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
    </div>
  );
}
