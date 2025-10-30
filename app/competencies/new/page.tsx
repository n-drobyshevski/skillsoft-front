import { CompetencyForm } from '../components/CompetencyForm';
import PageHeader from '../../components/PageHeader';

export default function NewCompetencyPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Create New Competency"
        crumbs={[{ href: '/competencies', name: 'Competencies' }, { name: 'New' }]}
      />
      <div className="mt-8">
        <CompetencyForm />
      </div>
    </div>
  );
}
