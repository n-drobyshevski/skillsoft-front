'use client';

import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VisibilitySelector } from '../../_components/sharing/VisibilitySelector';
import { useTemplateVisibility } from '@/hooks/queries';

interface VisibilitySectionProps {
  templateId: string;
  isOwner: boolean;
  canManage: boolean;
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
}: VisibilitySectionProps) {
  const { data: visibility, isLoading } = useTemplateVisibility(templateId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Visibility</CardTitle>
        <CardDescription>
          Control who can discover and access this template
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
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
