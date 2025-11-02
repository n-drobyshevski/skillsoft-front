'use client';

import { QuestionForm } from '../components/QuestionForm';
import IndicatorSelector from '../components/IndicatorSelector';
import  PageHeader  from '../../../app/components/PageHeader';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

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

  const handleIndicatorSelected = (competencyId: string, indicatorId: string) => {
    // Update URL with selected IDs for proper navigation
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('competencyId', competencyId);
    newUrl.searchParams.set('behavioralIndicatorId', indicatorId);
    router.replace(newUrl.pathname + newUrl.search);
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
    <div className="container mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create New Assessment Question"
        crumbs={[
          { href: '/competencies', name: 'Competencies' },
          { href: `/competencies/${selectedCompetencyId}`, name: 'Competency' },
          { href: `/behavioral-indicators/${selectedIndicatorId}`, name: 'Indicator' },
          { name: 'New Question' },
        ]}
      />
      <div className="mt-6 sm:mt-8">
        <QuestionForm competencyId={selectedCompetencyId} behavioralIndicatorId={selectedIndicatorId} />
      </div>
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
