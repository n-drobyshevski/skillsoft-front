'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/common/PageHeader';
import { TeamForm } from '../_components/TeamForm';
import { TeamPreview } from '../_components/TeamPreview';

interface SelectedMember {
  id: string;
  fullName: string;
  email?: string;
  imageUrl?: string;
}

interface PreviewData {
  name?: string;
  description?: string;
  memberIds?: string[];
  leaderId?: string | null;
  activateImmediately?: boolean;
  selectedMembers?: SelectedMember[];
}

export default function NewTeamPage() {
  const t = useTranslations('teams.form');
  const [previewData, setPreviewData] = useState<PreviewData>({
    name: '',
    description: '',
    memberIds: [],
    leaderId: null,
    activateImmediately: false,
    selectedMembers: [],
  });

  const handleUpdatePreview = (data: PreviewData) => {
    setPreviewData(data);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <PageHeader
        className="pl-0! py-4"
        title={t('createTitle')}
        description={t('createDescription')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-4">
        {/* Form Section - takes 2/3 on desktop */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <TeamForm onUpdatePreview={handleUpdatePreview} />
        </div>

        {/* Preview Section - takes 1/3 on desktop, shows first on mobile */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-4">
            <TeamPreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
