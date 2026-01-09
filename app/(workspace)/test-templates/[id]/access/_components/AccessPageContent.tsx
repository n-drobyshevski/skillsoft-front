'use client';

import { useMaxBreakpoint } from '@/hooks/use-breakpoint';
import { VisibilitySection } from './VisibilitySection';
import { PeopleSection } from './PeopleSection';
import { LinksSection } from './LinksSection';

interface AccessPageContentProps {
  templateId: string;
  templateName: string;
  isOwner: boolean;
  canManage: boolean;
}

/**
 * AccessPageContent - Main client wrapper for Access tab
 *
 * Renders all access management sections with responsive layout:
 * - Visibility settings
 * - People (Users/Teams) management
 * - Share links management
 *
 * Adjusts layout and touch targets based on screen size.
 */
export function AccessPageContent({
  templateId,
  templateName,
  isOwner,
  canManage,
}: AccessPageContentProps) {
  // True when viewport is below md breakpoint (< 768px)
  const isMobile = useMaxBreakpoint('md');

  return (
    <div className="space-y-6">
      {/* Visibility Section */}
      <VisibilitySection
        templateId={templateId}
        isOwner={isOwner}
        canManage={canManage}
      />

      {/* People Section */}
      <PeopleSection
        templateId={templateId}
        isOwner={isOwner}
        canManage={canManage}
        isMobile={isMobile}
      />

      {/* Share Links Section */}
      <LinksSection
        templateId={templateId}
        canManage={canManage}
        isMobile={isMobile}
      />
    </div>
  );
}
