'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EntityDetailHeader } from '@/components/common/EntityDetailHeader';
import { deleteCompetency } from '@/app/actions';
import { levelToColor, approvalStatusToColor } from '@/lib/ui-utils';
import type { Competency } from '@/types/domain';
import { useTranslations } from 'next-intl';

interface CompetencyDetailClientProps {
  competency: Competency;
  children: React.ReactNode;
}

export default function CompetencyDetailClient({ competency, children }: CompetencyDetailClientProps) {
  const router = useRouter();
  const t = useTranslations('competency');

  const handleDeleteCompetency = async () => {
    try {
      const result = await deleteCompetency(competency.id);
      if (result && result.success) {
        toast.success(t('deletedSuccess'));
        // Force refresh to ensure cache is cleared, then navigate
        router.refresh();
        // Use replace instead of push to avoid back navigation to deleted page
        router.replace('/hr/competencies');
      }
    } catch (error) {
      // Handle specific 404 case
      if (error instanceof Error && error.message.includes('404')) {
        toast.error(t('notFoundDeleted'));
        router.replace('/hr/competencies');
      } else {
        toast.error(t('deleteFailed'));
      }
    }
  };

  const badges = [
    { label: competency.category, variant: 'secondary' as const },
    { label: competency.approvalStatus.replace("_", " "), variant: 'outline' as const, className: approvalStatusToColor(competency.approvalStatus) },
    { label: competency.isActive ? t('active') : t('inactive'), variant: competency.isActive ? 'default' as const : 'secondary' as const },
    { label: `v${competency.version}`, variant: 'outline' as const },
  ];

  return (
    <>
      <EntityDetailHeader
        title={competency.name}
        badges={badges}
        backHref="/hr/competencies"
        editHref={`/hr/competencies/${competency.id}/edit`}
        onDelete={handleDeleteCompetency}
        deleteConfig={{
          title: t('deleteConfirmTitle'),
          description: t('deleteConfirmDescription'),
          entityName: competency.name,
        }}
      />
      {children}
    </>
  );
}