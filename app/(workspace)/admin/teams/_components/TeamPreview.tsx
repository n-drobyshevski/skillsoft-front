'use client';

import { useTranslations } from 'next-intl';
import { Users, Crown, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SelectedMember {
  id: string;
  fullName: string;
  email?: string;
  imageUrl?: string;
}

interface TeamPreviewData {
  name?: string;
  description?: string;
  memberIds?: string[];
  leaderId?: string | null;
  activateImmediately?: boolean;
  selectedMembers?: SelectedMember[];
}

interface TeamPreviewProps {
  data: TeamPreviewData;
  className?: string;
}

function getMemberInitials(member: SelectedMember): string {
  if (member.fullName) {
    const parts = member.fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return member.fullName.substring(0, 2).toUpperCase();
  }
  if (member.email) {
    return member.email.substring(0, 2).toUpperCase();
  }
  return '??';
}

export function TeamPreview({ data, className }: TeamPreviewProps) {
  const t = useTranslations('teams.form.preview');
  const tStatus = useTranslations('teams.status');

  const hasName = data.name && data.name.trim().length > 0;
  const hasDescription = data.description && data.description.trim().length > 0;
  const memberCount = data.selectedMembers?.length || 0;
  const leader = data.leaderId
    ? data.selectedMembers?.find((m) => m.id === data.leaderId)
    : null;

  return (
    <Card className={cn('sticky top-4', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
          <Badge
            variant="default"
            className={cn(
              'text-xs',
              data.activateImmediately
                ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600'
                : ''
            )}
          >
            {data.activateImmediately ? tStatus('active') : tStatus('draft')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Name */}
        <div className="space-y-1">
          <h3 className={cn('text-lg font-semibold', !hasName && 'text-muted-foreground italic')}>
            {hasName ? data.name : t('noName')}
          </h3>
          <p
            className={cn(
              'text-sm',
              hasDescription ? 'text-muted-foreground' : 'text-muted-foreground/60 italic'
            )}
          >
            {hasDescription ? data.description : t('noDescription')}
          </p>
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {/* Members */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('memberCount', { count: memberCount })}</p>
            </div>
          </div>

          {/* Leader */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                leader
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Crown className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              {leader ? (
                <p className="text-xs font-medium truncate">{leader.fullName}</p>
              ) : (
                <p className="text-xs text-muted-foreground">—</p>
              )}
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {data.activateImmediately ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span>{t('willBeCreatedAs')} <span className="font-medium text-green-600">{tStatus('active')}</span></span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5" />
              <span>{t('willBeCreatedAs')} <span className="font-medium">{tStatus('draft')}</span></span>
            </>
          )}
        </div>

        {/* Members Preview */}
        {memberCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('memberCount', { count: memberCount })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.selectedMembers?.slice(0, 8).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-1.5 py-1 px-2 rounded-full bg-muted/60"
                  >
                    <Avatar className="h-5 w-5">
                      {member.imageUrl && <AvatarImage src={member.imageUrl} alt={member.fullName} />}
                      <AvatarFallback className="text-[10px]">{getMemberInitials(member)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium truncate max-w-[100px]">
                      {member.fullName.split(' ')[0]}
                    </span>
                    {member.id === data.leaderId && (
                      <Crown className="h-3 w-3 text-amber-500 shrink-0" />
                    )}
                  </div>
                ))}
                {memberCount > 8 && (
                  <div className="flex items-center justify-center h-7 px-2 rounded-full bg-muted text-xs text-muted-foreground">
                    +{memberCount - 8}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
