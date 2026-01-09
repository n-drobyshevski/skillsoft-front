import { notFound } from 'next/navigation';
import { testTemplatesApi } from '@/services/api';
import { isReservedTestTemplateSegment } from '@/lib/routing-constants';
import { AccessPageContent } from './_components/AccessPageContent';

interface AccessPageProps {
  params: Promise<{ id: string }>;
}

async function getTemplateData(id: string) {
  // Reject reserved route segments to prevent routing conflicts
  if (isReservedTestTemplateSegment(id)) {
    return { template: null, error: 'Invalid route segment' };
  }

  try {
    const template = await testTemplatesApi.getTemplateById(id);
    if (!template) {
      return { template: null, error: 'Template not found' };
    }
    return { template, error: null };
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return { template: null, error: 'Failed to load template' };
  }
}

/**
 * Access Page
 *
 * Full-page access management for test templates:
 * - Visibility settings (Private/Public/Link)
 * - User and team sharing with permission levels
 * - Share link generation and management
 */
export default async function AccessPage({ params }: AccessPageProps) {
  const { id } = await params;
  const { template, error } = await getTemplateData(id);

  if (!template || error) {
    notFound();
  }

  // TODO: Get actual user ownership/permission from auth context
  // For now, assume owner if they can see the page
  const isOwner = true;
  const canManage = true;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Access</h1>
        <p className="text-muted-foreground">
          Manage who can view and use this template
        </p>
      </div>

      <AccessPageContent
        templateId={template.id}
        templateName={template.name}
        isOwner={isOwner}
        canManage={canManage}
      />
    </div>
  );
}
