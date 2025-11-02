import { CompetencyForm } from '../components/CompetencyForm';
import PageHeader from '../../components/PageHeader';

export default function NewCompetencyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create New Competency"
        crumbs={[{ href: '/competencies', name: 'Competencies' }, { name: 'New' }]}
      />
      <div className="mt-6 sm:mt-8">
        <CompetencyForm />
      </div>
    </div>
  );
}
