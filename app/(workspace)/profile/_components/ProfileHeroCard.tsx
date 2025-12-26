import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Settings, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { ProfileUserInfo } from '@/types/profile';

interface ProfileHeroCardProps {
  userInfo: ProfileUserInfo;
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
export function ProfileHeroCard({ userInfo }: ProfileHeroCardProps) {
  const fullName = `${userInfo.firstName} ${userInfo.lastName}`.trim() || 'Пользователь';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = formatDistanceToNow(userInfo.createdAt, {
    addSuffix: false,
    locale: ru,
  });

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient accent bar */}
      <div className="absolute top-0 inset-x-0 h-0.5 sm:h-1 bg-linear-to-r from-primary via-primary/70 to-primary/30" />

      <CardContent className="p-3 sm:p-5 pt-3.5 sm:pt-6">
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Avatar with status */}
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 sm:h-16 sm:w-16 ring-2 ring-primary/10 ring-offset-1 sm:ring-offset-2 ring-offset-background">
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
              aria-label="Онлайн"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            {/* Name row with action button */}
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-sm sm:text-lg font-semibold tracking-tight truncate">
                {fullName}
              </h1>
              
              {/* Mobile: Icon button | Desktop: Full buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="outline" size="sm" className="h-7 sm:h-8 gap-1.5 px-2 sm:px-3" asChild>
                  <Link href="/profile/edit">
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Изменить</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" aria-label="Настройки" asChild>
                  <Link href="/settings">
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Meta Info - Single line on mobile */}
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1.5 text-[11px] sm:text-xs text-muted-foreground">
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
