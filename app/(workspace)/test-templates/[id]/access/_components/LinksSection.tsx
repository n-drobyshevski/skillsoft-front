'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShareLinkManager } from '../../_components/sharing/ShareLinkManager';

interface LinksSectionProps {
  templateId: string;
  canManage: boolean;
  isMobile: boolean;
}

/**
 * LinksSection - Share link generation and management
 *
 * Features:
 * - Create new share links with custom expiry and usage limits
 * - View active links with usage statistics
 * - Copy links to clipboard
 * - Revoke individual or all links
 * - Max 10 active links per template
 */
export function LinksSection({
  templateId,
  canManage,
  isMobile,
}: LinksSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Share Links</CardTitle>
        <CardDescription>
          Create shareable links that don&apos;t require adding specific users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ShareLinkManager
          templateId={templateId}
          canManage={canManage}
          isMobile={isMobile}
        />
      </CardContent>
    </Card>
  );
}
