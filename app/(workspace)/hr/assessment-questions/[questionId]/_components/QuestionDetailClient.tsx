'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { EntityDetailHeader } from '@/components/common/EntityDetailHeader';
import { deleteAssessmentQuestion } from '@/app/actions';
import { difficultyLevelToColor } from '@/components/common/entity-utils';
import { useBreadcrumbContext } from '@/context/BreadcrumbContext';
import type { AssessmentQuestion, BehavioralIndicator, Competency } from '@/types/domain';

interface QuestionDetailClientProps {
  question: AssessmentQuestion;
  competency?: Competency | null;
  indicator?: BehavioralIndicator | null;
  children: React.ReactNode;
}

export default function QuestionDetailClient({ question, competency, indicator, children }: QuestionDetailClientProps) {
  const router = useRouter();
  const { setBreadcrumbTitle, clearBreadcrumb } = useBreadcrumbContext();
  const t = useTranslations('question.detail');
  const tQuestionType = useTranslations('enums.questionType');
  const tDifficulty = useTranslations('enums.difficultyLevel');

  // Set custom breadcrumb title for this question
  useEffect(() => {
    // Truncate long question text for breadcrumb
    const truncatedTitle = question.questionText.length > 50
      ? question.questionText.substring(0, 50) + "..."
      : question.questionText;

    setBreadcrumbTitle(question.id, truncatedTitle);

    // Cleanup when component unmounts
    return () => {
      clearBreadcrumb(question.id);
    };
  }, [question.id, question.questionText, setBreadcrumbTitle, clearBreadcrumb]);

  const handleDeleteQuestion = async () => {
    try {
      await deleteAssessmentQuestion(question.id, competency?.id, indicator?.id);
      toast.success(t('deleteSuccess'));
      router.push('/assessment-questions');
    } catch (error) {
      toast.error(t('deleteFailed'));
      throw error;
    }
  };

  // Helper function for difficulty level colors
  const getDifficultyColor = (level: string) => {
    return difficultyLevelToColor(level);
  };

  const questionTypeLabel = tQuestionType.has(question.questionType)
    ? tQuestionType(question.questionType)
    : question.questionType.replace("_", " ");
  const difficultyLabel = tDifficulty.has(question.difficultyLevel)
    ? tDifficulty(question.difficultyLevel)
    : question.difficultyLevel;

  const badges = [
    { label: questionTypeLabel, variant: 'secondary' as const },
    { label: difficultyLabel, variant: 'outline' as const, className: getDifficultyColor(question.difficultyLevel) },
    { label: question.isActive ? t('active') : t('inactive'), variant: question.isActive ? 'default' as const : 'secondary' as const },
    ...(question.timeLimit ? [{ label: t('timeLimitBadge', { seconds: question.timeLimit }), variant: 'outline' as const }] : []),
  ];

  return (
    <>
      <EntityDetailHeader
        title={question.questionText}
        badges={badges}
        backHref="/hr/assessment-questions"
        editHref={`/hr/assessment-questions/${question.id}/edit`}
        onDelete={handleDeleteQuestion}
        deleteConfig={{
          title: t('deleteTitle'),
          description: t('deleteDescription'),
          entityName: question.questionText,
        }}
      />
      {children}
    </>
  );
}
