'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EntityDetailHeader } from '../../../components/EntityDetailHeader';
import { deleteCompetency } from '@/app/actions';
import { levelToColor, approvalStatusToColor } from '../../../utils';
import type { Competency } from '../../../interfaces/domain-interfaces';

interface CompetencyDetailClientProps {
  competency: Competency;
  children: React.ReactNode;
}

export default function CompetencyDetailClient({ competency, children }: CompetencyDetailClientProps) {
  const router = useRouter();

  const handleDeleteCompetency = async () => {
    try {
      await deleteCompetency(competency.id);
      toast.success('Competency deleted successfully');
      router.push('/competencies');
    } catch (error) {
      // Handle specific 404 case
      if (error instanceof Error && error.message.includes('404')) {
        toast.error('Competency not found. It may have already been deleted.');
        router.push('/competencies');
      } else {
        toast.error('Failed to delete competency. Please try again.');
      }
      throw error; // Re-throw to let the component handle the error state
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