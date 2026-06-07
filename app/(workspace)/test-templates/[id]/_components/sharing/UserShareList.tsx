'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Users,
  Trash2,
  Loader2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TemplateShare,
  SharePermission,
  GranteeType,
} from '@/types/domain';
import { PermissionSelect, PermissionBadge } from './PermissionSelect';
import {
  useTemplateShares,
  useUpdateShare,
  useRevokeShare,
} from '@/hooks/queries';
import { toast } from 'sonner';
import { useFormattedDates } from '@/hooks/useFormattedDates';

interface UserShareListProps {
  templateId: string;
  canManage?: boolean;
  /** Mobile variant for touch-friendly sizing */
  isMobile?: boolean;
  /**
   * Controlled shares data. When provided, the list renders this instead of
   * fetching its own copy, and calls `onChanged` after mutations so the owner
   * can refresh. When omitted, the list fetches and refreshes internally.
   */
  shares?: TemplateShare[];
  isLoading?: boolean;
  error?: Error | null;
  /** Called after a successful update/revoke so a controlling parent can refetch. */
  onChanged?: () => void;
}

/**
 * UserShareList - Display and manage user/team shares
 *
 * Features:
 * - List of shared users and teams
 * - Permission editing (inline select)
 * - Revoke with confirmation
 * - Expiry date display
 * - Loading and empty states
 */
export function UserShareList({
  templateId,
  canManage = false,
  isMobile = false,
  shares: controlledShares,
  isLoading: controlledIsLoading,
  error: controlledError,
  onChanged,
}: UserShareListProps) {
  const t = useTranslations('template.access.people');
  const tToast = useTranslations('template.access.toast');
  const isControlled = controlledShares !== undefined;
  const internal = useTemplateShares(templateId, !isControlled);
  const shares = isControlled ? controlledShares : internal.data;
  const isLoading = isControlled ? !!controlledIsLoading : internal.isLoading;
  const error = isControlled ? controlledError ?? null : internal.error;
  const refresh = isControlled ? onChanged : internal.refetch;
  const updateShare = useUpdateShare();
  const revokeShare = useRevokeShare();

  const [revoking, setRevoking] = useState<string | null>(null);

  const handlePermissionChange = async (
    shareId: string,
    permission: SharePermission
  ) => {
    try {
      await updateShare.mutateAsync({
        templateId,
        shareId,
        request: { permission },
      });
      toast.success(tToast('permissionUpdated'));
      refresh?.();
    } catch (error) {
      toast.error(tToast('updateFailed'));
      console.error('Update share error:', error);
    }
  };

  const handleRevoke = async (shareId: string, granteeName: string) => {
    setRevoking(shareId);
    try {
      await revokeShare.mutateAsync({ templateId, shareId });
      toast.success(tToast('accessRemoved', { name: granteeName }));
      refresh?.();
    } catch (error) {
      toast.error(tToast('revokeFailed'));
      console.error('Revoke share error:', error);
    } finally {
      setRevoking(null);
    }
  };

  if (isLoading) {
    return <ShareListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive/50 mb-2" />
        <p className="text-sm text-muted-foreground">{t('list.failedToLoad')}</p>
      </div>
    );
  }

  if (!shares || shares.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          {t('emptyState.title')}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {t('emptyState.hint')}
        </p>
      </div>
    );
  }

  // Separate users and teams
  const userShares = shares.filter((s) => s.granteeType === GranteeType.USER);
  const teamShares = shares.filter((s) => s.granteeType === GranteeType.TEAM);

  return (
    <div className="space-y-4">
      {/* Users Section */}
      {userShares.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('list.usersHeader', { count: userShares.length })}
          </h4>
          <div className="space-y-1">
            {userShares.map((share) => (
              <ShareListItem
                key={share.id}
                share={share}
                canManage={canManage}
                isRevoking={revoking === share.id}
                isMobile={isMobile}
                onPermissionChange={(permission) =>
                  handlePermissionChange(share.id, permission)
                }
                onRevoke={() =>
                  handleRevoke(share.id, share.granteeName || 'User')
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Teams Section */}
      {teamShares.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('list.teamsHeader', { count: teamShares.length })}
          </h4>
          <div className="space-y-1">
            {teamShares.map((share) => (
              <ShareListItem
                key={share.id}
                share={share}
                canManage={canManage}
                isRevoking={revoking === share.id}
                isMobile={isMobile}
                onPermissionChange={(permission) =>
                  handlePermissionChange(share.id, permission)
                }
                onRevoke={() =>
                  handleRevoke(share.id, share.granteeName || 'Team')
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ShareListItemProps {
  share: TemplateShare;
  canManage: boolean;
  isRevoking: boolean;
  isMobile?: boolean;
  onPermissionChange: (permission: SharePermission) => void;
  onRevoke: () => void;
}

function ShareListItem({
  share,
  canManage,
  isRevoking,
  isMobile = false,
  onPermissionChange,
  onRevoke,
}: ShareListItemProps) {
  const t = useTranslations('template.access.people');
  const { formatFutureRelativeTime } = useFormattedDates();
  const isTeam = share.granteeType === GranteeType.TEAM;
  const Icon = isTeam ? Users : User;
  const isExpired = share.expiresAt && new Date(share.expiresAt) < new Date();

  // Get initials for avatar
  const initials = share.granteeName
    ? share.granteeName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : isTeam
    ? 'TM'
    : 'U';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border',
        // Mobile: more padding for touch targets
        isMobile ? 'p-3 min-h-[56px]' : 'p-3',
        'transition-colors hover:bg-muted/50',
        isExpired && 'opacity-60'
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(isMobile ? 'h-10 w-10' : 'h-9 w-9')}>
        <AvatarImage src={share.granteeAvatarUrl} />
        <AvatarFallback
          className={cn(
            isTeam ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name and Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {share.granteeName || (isTeam ? t('list.unknownTeam') : t('list.unknownUser'))}
          </span>
          {isTeam && (
            <Badge variant="outline" className="text-xs shrink-0">
              <Users className="h-3 w-3 mr-1" />
              {t('list.teamBadge')}
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive" className="text-xs shrink-0">
              {t('list.expiredBadge')}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {share.granteeEmail && (
            <span className="truncate">{share.granteeEmail}</span>
          )}
          {share.expiresAt && !isExpired && (
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {t('list.expiresIn', { time: formatFutureRelativeTime(share.expiresAt) })}
            </span>
          )}
        </div>
      </div>

      {/* Permission */}
      <div className="shrink-0">
        {canManage ? (
          <PermissionSelect
            value={share.permission}
            onChange={onPermissionChange}
            size={isMobile ? 'default' : 'sm'}
            disabled={!!isExpired}
          />
        ) : (
          <PermissionBadge permission={share.permission} size={isMobile ? 'default' : 'sm'} />
        )}
      </div>

      {/* Revoke Button */}
      {canManage && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-muted-foreground hover:text-destructive shrink-0',
                // Mobile: minimum 44px touch target
                isMobile ? 'h-11 w-11' : 'h-8 w-8'
              )}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('removeDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('removeDialog.message', { name: share.granteeName || t('list.unknownUser') })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('removeDialog.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onRevoke}
                className="bg-destructive hover:bg-destructive/90"
              >
                {t('removeDialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function ShareListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
