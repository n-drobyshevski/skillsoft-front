'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Pencil, Settings } from 'lucide-react';

/**
 * MobileProfileActionBar - Sticky bottom action bar for mobile devices
 *
 * Design principles:
 * - Fixed to bottom with safe area support (iOS notch)
 * - Glassmorphism backdrop for modern appearance
 * - Only visible on mobile (hidden on md+ breakpoints)
 * - Entry animation for polish
 * - Touch-friendly 44px minimum tap targets
 *
 * Based on ActionFooter pattern from test-player components
 */
export function MobileProfileActionBar() {
  const t = useTranslations('profile.hero');

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 md:hidden animate-in slide-in-from-bottom-4 fade-in-0 duration-300 delay-150 fill-mode-both"
      role="toolbar"
      aria-label={t('mobileActions')}
    >
      {/* Glassmorphism container */}
      <div className="bg-background/80 backdrop-blur-lg border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Actions container with safe area padding */}
        <div className="flex items-center justify-center gap-3 px-4 py-3 pb-safe">
          {/* Edit Profile - Primary action */}
          <Button
            variant="default"
            size="lg"
            className="flex-1 min-h-[44px] gap-2 font-medium"
            asChild
          >
            <Link href="/profile/edit">
              <Pencil className="h-4 w-4" />
              {t('editProfile')}
            </Link>
          </Button>

          {/* Settings - Secondary action */}
          <Button
            variant="outline"
            size="lg"
            className="flex-1 min-h-[44px] gap-2 font-medium"
            asChild
          >
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              {t('settings')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MobileProfileActionBar;
