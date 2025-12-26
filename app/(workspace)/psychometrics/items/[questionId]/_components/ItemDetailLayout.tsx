'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ItemStatisticsDetail, DiscriminationFlag, DifficultyFlag, ItemValidityStatus } from '@/types/psychometrics';
import { MobileItemHeader } from './MobileItemHeader';
import { MobileActionSheet, MobileActionBar } from './MobileActionSheet';

interface ItemDetailLayoutProps {
  /** Item data */
  item: ItemStatisticsDetail;
  /** Page content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * ItemDetailLayout - Responsive layout wrapper for item detail page
 *
 * Handles:
 * - Mobile header (sticky compact version)
 * - Desktop hero (full version via children)
 * - Mobile action bar (fixed bottom)
 * - Mobile action sheet (bottom drawer)
 * - Proper padding for mobile action bar
 *
 * Usage in page.tsx:
 * ```tsx
 * <ItemDetailLayout item={item}>
 *   {/* Desktop hero - hidden on mobile *\/}
 *   <div className="hidden md:block">
 *     <DesktopHero {...} />
 *   </div>
 *   {/* Rest of content *\/}
 *   <ContentSections />
 * </ItemDetailLayout>
 * ```
 */
export function ItemDetailLayout({
  item,
  children,
  className,
}: ItemDetailLayoutProps) {
  const isMobile = useIsMobile();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // Check if item has issues
  const hasIssues =
    item.discriminationFlag !== DiscriminationFlag.NONE ||
    item.difficultyFlag !== DifficultyFlag.NONE ||
    item.validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW ||
    item.validityStatus === ItemValidityStatus.RETIRED;

  return (
    <div
      className={cn(
        'flex flex-1 flex-col',
        // Mobile-first padding
        'gap-4 p-4',
        // Tablet+ padding
        'sm:gap-5 sm:p-5',
        // Desktop padding
        'md:gap-6 md:p-6',
        // Top padding - mobile header is sticky, desktop has hero with negative margin
        'pt-0 md:pt-6',
        // Bottom padding - extra space for fixed mobile action bar
        'pb-24 md:pb-6',
        className
      )}
    >
      {/* Mobile Header - Only on mobile */}
      {isMobile && (
        <MobileItemHeader
          status={item.validityStatus}
          competencyName={item.competencyName}
          responseCount={item.responseCount}
          lastCalculatedAt={item.lastCalculatedAt}
          difficultyIndex={item.difficultyIndex}
          discriminationIndex={item.discriminationIndex}
          hasIssues={hasIssues}
          onActionsClick={() => setIsActionSheetOpen(true)}
        />
      )}

      {/* Page Content */}
      {children}

      {/* Mobile Action Bar - Fixed at bottom */}
      <MobileActionBar
        item={item}
        onOpenSheet={() => setIsActionSheetOpen(true)}
      />

      {/* Mobile Action Sheet - Bottom drawer */}
      <MobileActionSheet
        item={item}
        open={isActionSheetOpen}
        onOpenChange={setIsActionSheetOpen}
      />
    </div>
  );
}

/**
 * DesktopHeroWrapper - Wrapper for desktop hero section
 *
 * Hides the desktop hero on mobile since MobileItemHeader handles that.
 */
interface DesktopHeroWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function DesktopHeroWrapper({ children, className }: DesktopHeroWrapperProps) {
  return (
    <div className={cn('hidden md:block', className)}>
      {children}
    </div>
  );
}

/**
 * MobileOnlyWrapper - Wrapper that shows content only on mobile
 */
interface MobileOnlyWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileOnlyWrapper({ children, className }: MobileOnlyWrapperProps) {
  return (
    <div className={cn('md:hidden', className)}>
      {children}
    </div>
  );
}

/**
 * DesktopOnlyWrapper - Wrapper that shows content only on desktop
 */
interface DesktopOnlyWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function DesktopOnlyWrapper({ children, className }: DesktopOnlyWrapperProps) {
  return (
    <div className={cn('hidden md:block', className)}>
      {children}
    </div>
  );
}

export default ItemDetailLayout;
