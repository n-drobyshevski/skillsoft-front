'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Settings, Pencil } from 'lucide-react';
import { ProfileBadges } from './ProfileBadges';
import type { ProfileUserInfo } from '@/types/profile';
import { UserRole } from '@/types/user';

interface ProfileHeroCardProps {
  userInfo: ProfileUserInfo;
  /** User's role in the system (defaults to USER) */
  role?: UserRole;
  /** Whether the user's email is verified */
  isVerified?: boolean;
}

/**
 * Profile Hero Card - Compact Mobile-First Design
 *
 * A clean, minimal hero card optimized for mobile:
 * - Single responsive layout that works across all breakpoints
 * - Compact avatar with status indicator
 * - Essential info only (name, email, org)
 * - Quick action buttons
 */
export function ProfileHeroCard({
  userInfo,
  role = UserRole.USER,
  isVerified = false,
}: ProfileHeroCardProps) {
  const t = useTranslations('profile.hero');
  const format = useFormatter();

  const fullName = `${userInfo.firstName} ${userInfo.lastName}`.trim() || t('defaultUser');
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = format.relativeTime(userInfo.createdAt);

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/10">
      {/* Gradient accent bar */}
      <div className="absolute top-0 inset-x-0 h-0.5 sm:h-1 bg-linear-to-r from-primary via-primary/70 to-primary/30" />

      <CardContent className="p-3 sm:p-5 pt-3.5 sm:pt-6">
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Avatar with status */}
          <div className="relative shrink-0 group">
            <Avatar className="h-10 w-10 sm:h-16 sm:w-16 ring-2 ring-primary/10 ring-offset-1 sm:ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/30 group-hover:scale-105">
              {userInfo.avatarUrl ? (
                <Image
                  src={userInfo.avatarUrl}
                  alt={fullName}
                  width={64}
                  height={64}
                  className="aspect-square h-full w-full object-cover rounded-full"
                  priority
                />
              ) : (
                <AvatarFallback className="text-sm sm:text-lg font-semibold bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            {/* Online indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 sm:bottom-0.5 sm:right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border-2 border-background"
              aria-label={t('onlineStatus')}
            />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            {/* Name row with action button */}
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-sm sm:text-lg font-semibold tracking-tight truncate">
                {fullName}
              </h1>
              
              {/* Desktop only: Action buttons (hidden on mobile, shown in action bar instead) */}
              <div className="hidden md:flex items-center gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 gap-1.5 px-2 sm:px-3 transition-all duration-200 hover:border-primary/30 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                  asChild
                >
                  <Link href="/profile/edit">
                    <Pencil className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-12" />
                    <span className="hidden sm:inline">{t('editProfile')}</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 transition-all duration-200 hover:bg-muted active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                  aria-label={t('settings')}
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 hover:rotate-90" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Role & Status Badges */}
            <ProfileBadges
              role={role}
              isVerified={isVerified}
              createdAt={userInfo.createdAt}
              className="mt-1 sm:mt-1.5"
            />

            {/* Meta Info - Single line on mobile */}
            <div className="flex items-center gap-2 mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-muted-foreground">
              {userInfo.organizationName ? (
                <>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate max-w-[100px] sm:max-w-none">{userInfo.organizationName}</span>
                  </span>
                  <span className="text-border hidden sm:inline">•</span>
                </>
              ) : null}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{memberSince}</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
