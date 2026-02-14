import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, Mail } from 'lucide-react';
import { formatRelativeTime } from '@/lib/date-utils';
import type { ProfileUserInfo } from '@/types/profile';

interface ProfileHeaderProps {
  userInfo: ProfileUserInfo;
}

/**
 * Profile Header - Server Component
 *
 * Displays user avatar, name, email, and membership info.
 * Static content from Clerk - no loading state needed.
 */
export function ProfileHeader({ userInfo }: ProfileHeaderProps) {
  const fullName = `${userInfo.firstName} ${userInfo.lastName}`.trim() || 'User';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = formatRelativeTime(userInfo.createdAt, 'ru');

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/10 shadow-lg shrink-0">
            <AvatarImage src={userInfo.avatarUrl || undefined} alt={fullName} />
            <AvatarFallback className="text-xl sm:text-2xl font-semibold bg-primary/5 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">{fullName}</h2>
              {userInfo.organizationName && (
                <Badge variant="secondary" className="mt-1.5">
                  <Building2 className="h-3 w-3 mr-1" />
                  {userInfo.organizationName}
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground justify-center sm:justify-start">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[200px]">{userInfo.email}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Участник {memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
