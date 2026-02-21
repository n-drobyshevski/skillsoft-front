'use client';

import { useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useMaxBreakpoint } from '@/hooks/use-breakpoint';
import { useTemplateVisibility } from '@/hooks/queries';
import { TemplateVisibility } from '@/types/domain';
import { VisibilitySection } from './VisibilitySection';
import { PeopleSection } from './PeopleSection';
import { LinksSection } from './LinksSection';

interface AccessPageContentProps {
  templateId: string;
  templateName: string;
  isOwner: boolean;
  canManage: boolean;
}

const sectionAnimation = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export function AccessPageContent({
  templateId,
  templateName,
  isOwner,
  canManage,
}: AccessPageContentProps) {
  const isMobile = useMaxBreakpoint('md');
  const { data: visibility, refetch: refetchVisibility } = useTemplateVisibility(templateId);

  const currentVisibility = visibility?.visibility ?? TemplateVisibility.PRIVATE;
  const templateStatus = visibility?.templateStatus ?? 'DRAFT';

  const handleVisibilityChange = useCallback(() => {
    refetchVisibility();
  }, [refetchVisibility]);

  const showLinksSection = currentVisibility === TemplateVisibility.LINK;
  const showPublicNote = currentVisibility === TemplateVisibility.PUBLIC;

  return (
    <div className="space-y-6">
      <VisibilitySection
        templateId={templateId}
        isOwner={isOwner}
        canManage={canManage}
        templateStatus={templateStatus}
        onVisibilityChange={handleVisibilityChange}
      />

      <PeopleSection
        templateId={templateId}
        isOwner={isOwner}
        canManage={canManage}
        isMobile={isMobile}
        showPublicNote={showPublicNote}
      />

      <AnimatePresence>
        {showLinksSection && (
          <motion.div key="links-section" {...sectionAnimation}>
            <LinksSection
              templateId={templateId}
              canManage={canManage}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
