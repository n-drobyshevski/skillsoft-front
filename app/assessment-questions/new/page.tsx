'use client';

import { QuestionForm } from '../components/QuestionForm';
import  PageHeader  from '../../../app/components/PageHeader';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NewQuestionPageContent() {
  const searchParams = useSearchParams();
  const competencyId = searchParams.get('competencyId');
  const behavioralIndicatorId = searchParams.get('behavioralIndicatorId');

  if (!competencyId || !behavioralIndicatorId) {
    return (
      <div className="container mx-auto py-8">
        <PageHeader
          title="Error"
          crumbs={[{ href: '/competencies', name: 'Competencies' }, { name: 'New Question' }]}
        />
        <div className="mt-8">
          <p>Competency ID or Behavioral Indicator ID is missing. Please go back and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Create New Assessment Question"
        crumbs={[
          { href: '/competencies', name: 'Competencies' },
          { href: `/competencies/${competencyId}`, name: 'Competency' },
          { href: `/behavioral-indicators/${behavioralIndicatorId}`, name: 'Indicator' },
          { name: 'New Question' },
        ]}
      />
      <div className="mt-8">
        <QuestionForm competencyId={competencyId} behavioralIndicatorId={behavioralIndicatorId} />
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
