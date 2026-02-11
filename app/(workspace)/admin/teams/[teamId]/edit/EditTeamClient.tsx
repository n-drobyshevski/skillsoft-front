'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/common/PageHeader';
import { TeamForm } from '../../_components/TeamForm';
import { TeamPreview } from '../../_components/TeamPreview';
import type { ManagedTeam } from '@/types/team';

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

interface EditTeamClientProps {
  team: ManagedTeam;
}

export function EditTeamClient({ team }: EditTeamClientProps) {
  const router = useRouter();
  const t = useTranslations('teams.form');

  // Initialize preview data from existing team
  const [previewData, setPreviewData] = useState<PreviewData>({
    name: team.name,
    description: team.description || '',
    memberIds: team.members?.map((m) => m.userId) || [],
    leaderId: team.leader?.id || null,
    activateImmediately: team.status === 'ACTIVE',
    selectedMembers: team.members?.map((m) => ({
      id: m.userId,
      fullName: m.fullName,
      email: m.email,
      imageUrl: m.imageUrl,
    })) || [],
  });

  const handleUpdatePreview = (data: PreviewData) => {
    setPreviewData(data);
  };

  const handleSuccess = (updatedTeam: ManagedTeam) => {
    router.push(`/admin/teams/${updatedTeam.id}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <PageHeader
        className="pl-0! py-4"
        title={t('editTitle')}
        description={t('editDescription')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-4">
        {/* Form Section - takes 2/3 on desktop */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <TeamForm
            team={team}
            onUpdatePreview={handleUpdatePreview}
            onSuccess={handleSuccess}
          />
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
