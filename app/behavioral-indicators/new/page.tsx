'use client';

import { IndicatorForm } from '../components/IndicatorForm';
import { PageHeader } from '@/app/components/PageHeader';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NewIndicatorPageContent() {
  const searchParams = useSearchParams();
  const competencyId = searchParams.get('competencyId');

  if (!competencyId) {
    return (
      <div className="container mx-auto py-8">
        <PageHeader
          title="Error"
          crumbs={[{ href: '/competencies', name: 'Competencies' }, { name: 'New Indicator' }]}
        />
        <div className="mt-8">
          <p>Competency ID is missing. Please go back to a competency and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Create New Behavioral Indicator"
        crumbs={[
          { href: '/competencies', name: 'Competencies' },
          { href: `/competencies/${competencyId}`, name: 'Competency' },
          { name: 'New Indicator' },
        ]}
      />
      <div className="mt-8">
        <IndicatorForm competencyId={competencyId} />
      </div>
    </div>
  );
}

export default function NewIndicatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewIndicatorPageContent />
    </Suspense>
  );
}
