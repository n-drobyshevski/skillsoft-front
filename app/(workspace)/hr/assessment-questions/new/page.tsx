'use client';

import { useState, useCallback } from 'react';
import { QuestionForm } from '../components/QuestionForm';
import QuestionPreview from '../components/QuestionPreview';
import IndicatorSelector from '../components/IndicatorSelector';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { AssessmentQuestion } from '@/interfaces/domain-interfaces';
import { QuestionType, DifficultyLevel } from '@/enums/domain_enums';

// Constants
const PREVIEW_QUESTION_ID = 'preview-id';

type QuestionFormData = {
  questionText: string;
  questionType: string;
  difficultyLevel: string;
  isActive: boolean;
  answerOptions?: Array<{
    text?: string;
    label?: string;
    value?: number;
    score?: number;
    correct?: boolean;
  }>;
  maxScore?: number;
  timeLimit?: number;
  tags?: string[];
  explanation?: string;
};

function NewQuestionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const competencyIdParam = searchParams.get('competencyId');
  const behavioralIndicatorIdParam = searchParams.get('behavioralIndicatorId');
  const indicatorIdParam = searchParams.get('indicatorId'); // Alternative parameter name
  
  // Use behavioralIndicatorId first, then fall back to indicatorId
  const finalIndicatorId = behavioralIndicatorIdParam || indicatorIdParam;
  
  // Derive state directly from URL parameters
  const selectedCompetencyId = competencyIdParam;
  const selectedIndicatorId = finalIndicatorId;
  const showSelector = !competencyIdParam || !finalIndicatorId;

  // State for tabbed interface and preview
  const [activeTab, setActiveTab] = useState('details');
  const [previewQuestion, setPreviewQuestion] = useState<AssessmentQuestion | null>(null);

  const handleIndicatorSelected = (competencyId: string, indicatorId: string) => {
    // Update URL with selected IDs for proper navigation
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('competencyId', competencyId);
    newUrl.searchParams.set('behavioralIndicatorId', indicatorId);
    router.replace(newUrl.pathname + newUrl.search);
  };

  const handleUpdatePreview = useCallback((data: QuestionFormData) => {
    if (!selectedCompetencyId || !selectedIndicatorId) return;
    
    // Create a preview question object for the preview component
    const preview: AssessmentQuestion = {
      id: PREVIEW_QUESTION_ID,
      behavioralIndicatorId: selectedIndicatorId,
      questionText: data.questionText || 'New Assessment Question',
      questionType: data.questionType as QuestionType,
      answerOptions: data.answerOptions || [],
      scoringRubric: 'Standard scoring rubric will be applied.',
      timeLimit: data.timeLimit,
      difficultyLevel: data.difficultyLevel as DifficultyLevel,
      isActive: data.isActive,
      orderIndex: 1,
    };
    setPreviewQuestion(preview);
  }, [selectedCompetencyId, selectedIndicatorId]);

  // Create a default preview question for empty form
  const getDisplayQuestion = () => {
    if (previewQuestion) return previewQuestion;
    
    if (!selectedCompetencyId || !selectedIndicatorId) return null;
    
    // Default question for empty form
    return {
      id: PREVIEW_QUESTION_ID,
      behavioralIndicatorId: selectedIndicatorId,
      questionText: 'New Assessment Question',
      questionType: QuestionType.LIKERT_SCALE,
      answerOptions: [],
      scoringRubric: 'Standard scoring rubric will be applied.',
      difficultyLevel: DifficultyLevel.FOUNDATIONAL,
      isActive: true,
      orderIndex: 1,
    } as AssessmentQuestion;
  };

  if (showSelector) {
    return (
      <div className="container mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Create New Assessment Question"
          description="First, select the behavioral indicator for your question"
          
        />
        <div className="mt-6 sm:mt-8">
          <IndicatorSelector 
            preselectedIndicatorId={finalIndicatorId || undefined}
            onIndicatorSelected={handleIndicatorSelected}
          />
        </div>
      </div>
    );
  }

  // At this point, we have both IDs from URL parameters
  if (!selectedCompetencyId || !selectedIndicatorId) {
    return <div>Error: Missing required parameters</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        className="pl-0! py-4"
        title="Create New Assessment Question"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            <div className="lg:col-span-2">
              <QuestionForm 
                competencyId={selectedCompetencyId} 
                behavioralIndicatorId={selectedIndicatorId}
                onUpdatePreview={handleUpdatePreview}
              />
            </div>
            <div className="hidden lg:block">
              {(previewQuestion || getDisplayQuestion()) && (
                <QuestionPreview question={previewQuestion || getDisplayQuestion()!} />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function NewQuestionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewQuestionPageContent />
        </Suspense>
    )
}
