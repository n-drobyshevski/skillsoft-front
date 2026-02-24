'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Settings } from 'lucide-react';
import { ProfileBadges } from './ProfileBadges';
import type { ProfileUserInfo } from '@/types/profile';
import { UserRole } from '@/types/user';

// ============================================
// TYPES
// ============================================

export interface IdentitySectionProps {
  userInfo: ProfileUserInfo;
  role: UserRole;
  isVerified: boolean;
}

// ============================================
// HELPERS
// ============================================

function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim();
  const last = lastName.trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (last) return last.slice(0, 2).toUpperCase();
  return 'U';
}

// ============================================
// COMPONENT
// ============================================

/**
 * IdentitySection — Linear/Notion-style profile identity header.
 *
 * Replaces the Apple Health-inspired ProfileHeroCard with a flat,
 * text-focused layout: avatar + name/email/badges + action buttons.
 *
 * Layout: flex row — avatar (shrink-0) | info (flex-1) | actions (shrink-0)
 * Outer flex uses items-start so actions stay aligned with the name row.
 *
 * Accessibility:
 * - Section aria-label sourced from profile.accessibility namespace
 * - Action buttons have aria-label on the icon-only Settings button
 * - All images have descriptive alt text
 * - Touch targets >= 44px on mobile, relaxed on sm+
 */
export function IdentitySection({ userInfo, role, isVerified }: IdentitySectionProps) {
  const t = useTranslations('profile.hero');
  const tAccessibility = useTranslations('profile.accessibility');
  const fullName = `${userInfo.firstName} ${userInfo.lastName}`.trim() || t('defaultUser');
  const initials = getInitials(userInfo.firstName, userInfo.lastName);

  return (
    <section
      className="py-6"
      role="region"
      aria-label={tAccessibility('heroSection')}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar className="size-14 sm:size-16 ring-1 ring-border">
            {userInfo.avatarUrl ? (
              <Image
                src={userInfo.avatarUrl}
                alt={fullName}
                width={64}
                height={64}
                className="aspect-square h-full w-full rounded-full object-cover"
                priority
              />
            ) : (
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary text-sm sm:text-base font-semibold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        {/* Info column */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate">
            {fullName}
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            {userInfo.email}
          </p>
          <ProfileBadges
            role={role}
            isVerified={isVerified}
            createdAt={userInfo.createdAt}
            className="mt-1.5"
          />
        </div>

        {/* Action buttons */}
        <div className="shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 gap-1.5 touch-manipulation active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 transition-all duration-150"
            asChild
          >
            <Link href="/profile/edit">
              <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{t('editProfile')}</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 touch-manipulation active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 transition-all duration-150"
            aria-label={t('settings')}
            asChild
          >
            <Link href="/settings">
              <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SKELETON
// ============================================

/**
 * IdentitySectionSkeleton — Loading placeholder for IdentitySection.
 *
 * Mirrors the exact layout structure of IdentitySection so the page
 * does not shift when content loads into the Suspense boundary.
 */
export function IdentitySectionSkeleton() {
  return (
    <section className="py-6" aria-hidden="true">
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <div className="shrink-0">
          <Skeleton className="size-14 sm:size-16 rounded-full" />
        </div>

        {/* Info column skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name */}
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
          {/* Email */}
          <Skeleton className="h-4 w-48" />
          {/* Badge pills */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>

        {/* Action button skeletons */}
        <div className="shrink-0 flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </section>
  );
}
