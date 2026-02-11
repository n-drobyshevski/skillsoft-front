'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileFlaggedItemLayout } from './MobileFlaggedItemLayout';
import { ItemStatisticsDetail, FlaggedItemSummary } from '@/types/psychometrics';

interface MobileFlaggedItemLayoutWrapperProps {
  item: ItemStatisticsDetail;
  similarItems: FlaggedItemSummary[];
  children: React.ReactNode;
}

/**
 * MobileFlaggedItemLayoutWrapper
 *
 * Client component that conditionally renders either:
 * - Mobile-optimized layout (MobileFlaggedItemLayout) on mobile devices
 * - Original desktop layout (children) on desktop
 *
 * This allows the page.tsx to remain a Server Component while
 * enabling responsive layout switching on the client.
 */
export function MobileFlaggedItemLayoutWrapper({
  item,
  similarItems,
  children,
}: MobileFlaggedItemLayoutWrapperProps) {
  const isMobile = useIsMobile();

  // On mobile, render the mobile-optimized layout
  if (isMobile) {
    return <MobileFlaggedItemLayout item={item} similarItems={similarItems} />;
  }

  // On desktop, render the original layout passed as children
  return <>{children}</>;
}

export default MobileFlaggedItemLayoutWrapper;
