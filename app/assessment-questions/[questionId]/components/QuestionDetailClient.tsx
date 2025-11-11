'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EntityDetailHeader } from '../../../components/EntityDetailHeader';
import { deleteAssessmentQuestion } from '@/app/actions';
import { difficultyLevelToColor } from '../../../components/entity-utils';
import { useBreadcrumbContext } from '@/src/context/BreadcrumbContext';
import type { AssessmentQuestion, BehavioralIndicator, Competency } from '../../../interfaces/domain-interfaces';

interface QuestionDetailClientProps {
  question: AssessmentQuestion;
  competency?: Competency | null;
  indicator?: BehavioralIndicator | null;
  children: React.ReactNode;
}

export default function QuestionDetailClient({ question, competency, indicator, children }: QuestionDetailClientProps) {
  const router = useRouter();
  const { setBreadcrumbTitle, clearBreadcrumb } = useBreadcrumbContext();

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
      toast.success('Assessment question deleted successfully');
      router.push('/assessment-questions');
    } catch (error) {
      toast.error('Failed to delete question. Please try again.');
      throw error;
    }
  };

  // Helper function for difficulty level colors
  const getDifficultyColor = (level: string) => {
    return difficultyLevelToColor(level);
  };

  const badges = [
    { label: question.questionType.replace("_", " "), variant: 'secondary' as const },
    { label: question.difficultyLevel, variant: 'outline' as const, className: getDifficultyColor(question.difficultyLevel) },
    { label: question.isActive ? "Active" : "Inactive", variant: question.isActive ? 'default' as const : 'secondary' as const },
    ...(question.timeLimit ? [{ label: `${question.timeLimit}s limit`, variant: 'outline' as const }] : []),
    { label: `Order: ${question.orderIndex}`, variant: 'outline' as const },
  ];

  return (
    <>
      <EntityDetailHeader
        title={question.questionText}
        badges={badges}
        backHref="/assessment-questions"
        editHref={`/assessment-questions/${question.id}/edit`}
        onDelete={handleDeleteQuestion}
        deleteConfig={{
          title: 'Delete Assessment Question',
          description: 'This action cannot be undone. This will permanently delete the assessment question and all associated data.',
          entityName: `Question #${question.orderIndex}`,
        }}
      />
      {children}
    </>
  );
}