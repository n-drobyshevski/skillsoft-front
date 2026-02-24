'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedProgress } from '@/components/ui/animated-progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Building2, Calendar, Settings, Pencil, ClipboardCheck, TrendingUp, Target } from 'lucide-react';
import { ProfileBadges } from './ProfileBadges';
import { ScoreSparkline } from './ScoreSparkline';
import { cn } from '@/lib/utils';
import type { ProfileUserInfo, AssessmentSummary } from '@/types/profile';
import { UserRole } from '@/types/user';

interface UnifiedHeroBentoProps {
  userInfo: ProfileUserInfo;
  role: UserRole;
  isVerified: boolean;
  summary: AssessmentSummary;
}

/**
 * @deprecated Replaced by IdentitySection + PropertiesSection in the
 * Linear/Notion profile redesign. Kept for reference only.
 *
 * Unified Hero Bento - Apple Health-inspired profile card
 *
 * Merges ProfileHeroCard + QuickStatsGrid into a single bento card:
 * - Mobile: identity row + 3-column stat cells + progress bar
 * - Desktop: 4-column grid (identity + 3 stat cells) + progress bar
 */
export function UnifiedHeroBento({
  userInfo,
  role = UserRole.USER,
  isVerified = false,
  summary,
}: UnifiedHeroBentoProps) {
  const t = useTranslations('profile.hero');
  const tStats = useTranslations('profile.stats');
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
    <Card className="rounded-2xl overflow-hidden" role="region" aria-label={tStats('regionLabel')}>
      <CardContent className="p-0">
        {/* Desktop layout: 4-column grid */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_160px_160px_160px]">
          {/* Identity cell */}
          <div className="p-5 flex items-center gap-4 border-r border-border">
            <IdentityBlock
              userInfo={userInfo}
              fullName={fullName}
              initials={initials}
              memberSince={memberSince}
              role={role}
              isVerified={isVerified}
            />
          </div>

          {/* Desktop stat cells */}
          <BentoStatCell
            icon={<ClipboardCheck className="h-4 w-4" />}
            value={summary.totalCompleted}
            label={tStats('testsCompletedShort')}
            gradient="blue"
            delay={0}
            className="border-r border-border"
          />
          <BentoStatCell
            icon={<TrendingUp className="h-4 w-4" />}
            value={summary.averageScore}
            suffix="%"
            label={tStats('averageScoreShort')}
            gradient="emerald"
            delay={200}
            sparklineData={summary.recentScores}
            className="border-r border-border"
          />
          <BentoStatCell
            icon={<Target className="h-4 w-4" />}
            value={summary.passRate}
            suffix="%"
            label={tStats('passRateShort')}
            gradient="amber"
            delay={400}
          />
        </div>

        {/* Mobile layout: stacked */}
        <div className="lg:hidden">
          {/* Identity row */}
          <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <IdentityBlock
              userInfo={userInfo}
              fullName={fullName}
              initials={initials}
              memberSince={memberSince}
              role={role}
              isVerified={isVerified}
            />
          </div>

          {/* Mobile stat cells: 3-column grid */}
          <div className="grid grid-cols-3 gap-2 px-3 sm:px-4 pb-3 sm:pb-4">
            <BentoStatCell
              icon={<ClipboardCheck className="h-3.5 w-3.5" />}
              value={summary.totalCompleted}
              label={tStats('testsCompletedShort')}
              gradient="blue"
              delay={0}
              compact
            />
            <BentoStatCell
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              value={summary.averageScore}
              suffix="%"
              label={tStats('averageScoreShort')}
              gradient="emerald"
              delay={200}
              compact
            />
            <BentoStatCell
              icon={<Target className="h-3.5 w-3.5" />}
              value={summary.passRate}
              suffix="%"
              label={tStats('passRateShort')}
              gradient="amber"
              delay={400}
              compact
            />
          </div>
        </div>

        {/* Profile completeness bar - full width */}
        <div className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 pt-2 border-t border-border">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">{tStats('profile')}</span>
            <span className="font-medium tabular-nums">
              <AnimatedCounter value={summary.profileCompleteness} suffix="%" delay={600} />
            </span>
          </div>
          <AnimatedProgress
            value={summary.profileCompleteness}
            className="h-1.5"
            animationDelay={700}
            animationDuration={800}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// IDENTITY BLOCK (shared between mobile/desktop)
// ============================================

function IdentityBlock({
  userInfo,
  fullName,
  initials,
  memberSince,
  role,
  isVerified,
}: {
  userInfo: ProfileUserInfo;
  fullName: string;
  initials: string;
  memberSince: string;
  role: UserRole;
  isVerified: boolean;
}) {
  const t = useTranslations('profile.hero');

  return (
    <>
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        <Avatar className="size-12 sm:size-14 lg:size-16 ring-1 ring-border">
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
            <AvatarFallback className="text-sm sm:text-base lg:text-lg font-semibold bg-linear-to-br from-primary/20 to-primary/5 text-primary">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border-2 border-background"
          aria-label={t('onlineStatus')}
        />
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight truncate">
            {fullName}
          </h1>
          {/* Action buttons - always visible */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 gap-1.5 px-2 sm:px-3 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 transition-all duration-200 hover:border-primary/30 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
              asChild
            >
              <Link href="/profile/edit">
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('editProfile')}</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 transition-all duration-200 hover:bg-muted active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
              aria-label={t('settings')}
              asChild
            >
              <Link href="/settings">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 hover:rotate-90" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Badges */}
        <ProfileBadges
          role={role}
          isVerified={isVerified}
          createdAt={userInfo.createdAt}
          className="mt-1"
        />

        {/* Meta info */}
        <div className="flex items-center gap-2 mt-1.5 text-xs-safe text-muted-foreground">
          {userInfo.organizationName ? (
            <>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-none">{userInfo.organizationName}</span>
              </span>
              <span className="text-border hidden sm:inline" aria-hidden="true">·</span>
            </>
          ) : null}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{memberSince}</span>
          </span>
        </div>
      </div>
    </>
  );
}

// ============================================
// BENTO STAT CELL
// ============================================

function BentoStatCell({
  icon,
  value,
  suffix,
  label,
  gradient,
  delay = 0,
  sparklineData,
  compact = false,
  className,
}: {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  gradient: 'blue' | 'emerald' | 'amber';
  delay?: number;
  sparklineData?: number[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact
          ? 'p-2.5 sm:p-3 rounded-2xl gap-0.5'
          : 'p-4 gap-1',
        `stat-gradient-${gradient}`,
        className
      )}
    >
      <span className="text-muted-foreground" aria-hidden="true">{icon}</span>
      <span
        className={cn(
          'font-bold tabular-nums tracking-tight',
          compact ? 'text-xl sm:text-2xl' : 'text-2xl lg:text-3xl'
        )}
      >
        <AnimatedCounter value={value} suffix={suffix} delay={delay} duration={1000} />
      </span>
      <span className={cn('text-muted-foreground', compact ? 'text-xs-safe' : 'text-xs')}>
        {label}
      </span>
      {sparklineData && sparklineData.length >= 2 && (
        <ScoreSparkline scores={sparklineData} height={20} width={56} className="mt-1 hidden lg:block" />
      )}
    </div>
  );
}

// ============================================
// SKELETON
// ============================================

export function UnifiedHeroBentoSkeleton() {
  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {/* Identity row */}
        <div className="p-3 sm:p-4 lg:p-5 flex items-center gap-3 sm:gap-4">
          <Skeleton className="size-12 sm:size-14 lg:size-16 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
              <div className="flex gap-1">
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-36" />
          </div>
        </div>

        {/* Stat cells */}
        <div className="grid grid-cols-3 gap-2 px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted/30">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-7 w-14 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 pt-2 border-t border-border">
          <div className="flex justify-between mb-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
