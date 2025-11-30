'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EntityDetailHeader } from '@/components/common/EntityDetailHeader';
import { deleteCompetency } from '@/src/app/actions';
import { levelToColor, approvalStatusToColor } from '@/lib/ui-utils';
import type { Competency } from '@/types/domain';

interface CompetencyDetailClientProps {
  competency: Competency;
  children: React.ReactNode;
}

export default function CompetencyDetailClient({ competency, children }: CompetencyDetailClientProps) {
  const router = useRouter();

  const handleDeleteCompetency = async () => {
    try {
      const result = await deleteCompetency(competency.id);
      if (result && result.success) {
        toast.success('Competency deleted successfully');
        // Use replace instead of push to avoid back navigation to deleted page
        router.replace('/competencies');
      }
    } catch (error) {
      // Handle specific 404 case
      if (error instanceof Error && error.message.includes('404')) {
        toast.error('Competency not found. It may have already been deleted.');
        router.replace('/competencies');
      } else {
        toast.error('Failed to delete competency. Please try again.');
      }
    }
  };

  const badges = [
    { label: competency.category, variant: 'secondary' as const },
    { label: competency.level, variant: 'outline' as const, className: levelToColor(competency.level) },
    { label: competency.approvalStatus.replace("_", " "), variant: 'outline' as const, className: approvalStatusToColor(competency.approvalStatus) },
    { label: competency.isActive ? "Active" : "Inactive", variant: competency.isActive ? 'default' as const : 'secondary' as const },
    { label: `v${competency.version}`, variant: 'outline' as const },
  ];

  return (
    <>
      <EntityDetailHeader
        title={competency.name}
        badges={badges}
        backHref="/competencies"
        editHref={`/competencies/${competency.id}/edit`}
        onDelete={handleDeleteCompetency}
        deleteConfig={{
          title: 'Delete Competency',
          description: 'This action cannot be undone. This will permanently delete the competency and all associated data.',
          entityName: competency.name,
        }}
      />
      {children}
    </>
  );
}