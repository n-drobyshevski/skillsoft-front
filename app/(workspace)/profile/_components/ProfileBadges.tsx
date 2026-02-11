'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Shield, PenLine, User, BadgeCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/user';

// ============================================
// TYPES
// ============================================

interface ProfileBadgesProps {
  /** User's role in the system */
  role: UserRole;
  /** Whether the user's email is verified */
  isVerified?: boolean;
  /** Explicitly mark as new user (overrides createdAt calculation) */
  isNewUser?: boolean;
  /** Account creation date (used to calculate if user is new) */
  createdAt?: Date;
  /** Additional CSS classes */
  className?: string;
}

// ============================================
// STYLE DEFINITIONS
// ============================================

/**
 * Role badge styles following OverviewHero pattern
 * Colors chosen for semantic meaning:
 * - ADMIN: Amber (elevated access)
 * - EDITOR: Violet (HR professional)
 * - USER: Emerald (standard candidate)
 */
const roleBadgeStyles: Record<UserRole, string> = {
  [UserRole.ADMIN]: cn(
    'bg-amber-100 text-amber-700 border-amber-200',
    'dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
  ),
  [UserRole.EDITOR]: cn(
    'bg-violet-100 text-violet-700 border-violet-200',
    'dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800'
  ),
  [UserRole.USER]: cn(
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
  ),
};

/**
 * Status badge styles
 * - Verified: Blue (trust indicator)
 * - New: Primary (highlight new users)
 */
const statusBadgeStyles = {
  verified: cn(
    'bg-blue-100 text-blue-700 border-blue-200',
    'dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
  ),
  new: cn(
    'bg-primary/10 text-primary border-primary/20',
    'dark:bg-primary/20 dark:border-primary/30'
  ),
};

/**
 * Icons for each role type
 */
const roleIcons: Record<UserRole, React.ElementType> = {
  [UserRole.ADMIN]: Shield,
  [UserRole.EDITOR]: PenLine,
  [UserRole.USER]: User,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user account was created within the last 7 days
 */
function isWithinSevenDays(createdAt: Date): boolean {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return createdAt >= sevenDaysAgo;
}

// ============================================
// COMPONENT
// ============================================

/**
 * ProfileBadges - Role and status badges for ProfileHeroCard
 *
 * Displays user role and optional status indicators:
 * - Role badge (Admin/HR Professional/Candidate) - always shown
 * - Verified badge - when email is verified
 * - New user badge - for accounts < 7 days old
 *
 * Responsive behavior:
 * - Mobile: Icon-only badges to save space
 * - Desktop: Icon + label badges
 *
 * Accessibility:
 * - Icons are decorative (aria-hidden)
 * - Labels visible to screen readers via sr-only on mobile
 */
export function ProfileBadges({
  role,
  isVerified = false,
  isNewUser,
  createdAt,
  className,
}: ProfileBadgesProps) {
  const t = useTranslations('profile.hero.badges');

  // Determine if user is new (explicit prop or calculated from createdAt)
  const showNewBadge = isNewUser ?? (createdAt ? isWithinSevenDays(createdAt) : false);

  const RoleIcon = roleIcons[role];

  // Get role key for i18n (lowercase)
  const roleKey = role.toLowerCase() as 'admin' | 'editor' | 'user';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* Role Badge - Always visible */}
      <Badge
        className={cn(
          roleBadgeStyles[role],
          'text-xs-safe gap-0.5 sm:gap-1'
        )}
      >
        <RoleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">{t(`roles.${roleKey}`)}</span>
      </Badge>

      {/* Verified Badge - Conditional */}
      {isVerified && (
        <Badge
          className={cn(
            statusBadgeStyles.verified,
            'text-xs-safe gap-0.5 sm:gap-1'
          )}
        >
          <BadgeCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{t('verified')}</span>
        </Badge>
      )}

      {/* New User Badge - Conditional */}
      {showNewBadge && (
        <Badge
          className={cn(
            statusBadgeStyles.new,
            'text-xs-safe gap-0.5 sm:gap-1'
          )}
        >
          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{t('new')}</span>
        </Badge>
      )}
    </div>
  );
}

export default ProfileBadges;
