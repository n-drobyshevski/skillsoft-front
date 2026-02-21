'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VisibilitySelector } from '../../_components/sharing/VisibilitySelector';
import { useTemplateVisibility } from '@/hooks/queries';

interface VisibilitySectionProps {
  templateId: string;
  isOwner: boolean;
  canManage: boolean;
  templateStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  onVisibilityChange?: () => void;
}

/**
 * VisibilitySection - Card wrapper for visibility settings
 *
 * Displays the VisibilitySelector with template visibility options:
 * - Private: Only owner and explicitly shared users
 * - Public: Any authenticated user
 * - Link: Anyone with a valid share link
 */
export function VisibilitySection({
  templateId,
  isOwner,
  canManage,
  templateStatus,
  onVisibilityChange,
}: VisibilitySectionProps) {
  const t = useTranslations('template.access.visibility');
  const { data: visibility, isLoading } = useTemplateVisibility(templateId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : visibility ? (
          <VisibilitySelector
            templateId={templateId}
            currentVisibility={visibility.visibility}
            activeLinksCount={visibility.activeLinksCount}
            isOwner={isOwner}
            canManage={canManage}
            templateStatus={templateStatus}
            onVisibilityChange={onVisibilityChange}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
