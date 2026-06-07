'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2, Mail, Users, Building2, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { SharePermission, GranteeType } from '@/types/domain';
import type { User } from '@/types/user';
import type { Team } from '@/types/domain';
import { PermissionSelect } from '../../_components/sharing/PermissionSelect';
import { UserShareList } from '../../_components/sharing/UserShareList';
import { UserPicker } from '../../_components/sharing/UserPicker';
import { TeamPicker } from '../../_components/sharing/TeamPicker';
import { useShareWithUser, useShareWithTeam, useTemplateShares } from '@/hooks/queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PeopleSectionProps {
  templateId: string;
  isOwner: boolean;
  canManage: boolean;
  isMobile: boolean;
  showPublicNote?: boolean;
}

type ShareUserFormValues = {
  email: string;
  permission: SharePermission;
};

type ShareMode = 'email' | 'user' | 'team';

/**
 * PeopleSection - User and team sharing management
 *
 * Features:
 * - Tab-based selection: invite by email, search existing users, or pick a team
 * - UserPicker / TeamPicker integration for searching grantees
 * - Permission level selection (View/Edit/Manage)
 * - List of current shares (users + teams) with edit/revoke options
 * - Responsive layout for mobile/desktop
 */
export function PeopleSection({
  templateId,
  isOwner,
  canManage,
  isMobile,
  showPublicNote = false,
}: PeopleSectionProps) {
  const t = useTranslations('template.access.people');
  const tToast = useTranslations('template.access.toast');
  const shareWithUser = useShareWithUser();
  const shareWithTeam = useShareWithTeam();
  const {
    data: shares,
    isLoading: sharesLoading,
    error: sharesError,
    refetch: refetchShares,
  } = useTemplateShares(templateId);
  const canEdit = isOwner || canManage;

  // Grantee selection state
  const [shareMode, setShareMode] = useState<ShareMode>('email');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermission, setUserPermission] = useState<SharePermission>(SharePermission.VIEW);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamPermission, setTeamPermission] = useState<SharePermission>(SharePermission.VIEW);

  // Emails already shared with (to exclude from the user picker)
  const excludedEmails = useMemo(() => {
    if (!shares) return [];
    return shares
      .filter((share) => share.granteeEmail)
      .map((share) => share.granteeEmail as string);
  }, [shares]);

  // Teams already granted access (to exclude from the team picker)
  const excludedTeamIds = useMemo(() => {
    if (!shares) return [];
    return shares
      .filter((share) => share.granteeType === GranteeType.TEAM)
      .map((share) => share.granteeId);
  }, [shares]);

  const shareUserSchema = z.object({
    email: z.string().email(t('form.validation.invalidEmail')),
    permission: z.nativeEnum(SharePermission),
  });

  const form = useForm<ShareUserFormValues>({
    resolver: zodResolver(shareUserSchema),
    defaultValues: {
      email: '',
      permission: SharePermission.VIEW,
    },
  });

  // Share by email invitation
  const handleShareByEmail = async (values: ShareUserFormValues) => {
    try {
      await shareWithUser.mutateAsync({
        templateId,
        request: {
          email: values.email,
          permission: values.permission,
        },
      });
      toast.success(tToast('sharedWith', { email: values.email }));
      form.reset();
      refetchShares();
    } catch {
      toast.error(tToast('shareFailed'));
    }
  };

  // Share with a selected system user
  const handleShareWithSelectedUser = async () => {
    if (!selectedUser) return;

    try {
      await shareWithUser.mutateAsync({
        templateId,
        request: {
          userId: selectedUser.id,
          permission: userPermission,
        },
      });
      const displayName = selectedUser.firstName && selectedUser.lastName
        ? `${selectedUser.firstName} ${selectedUser.lastName}`
        : selectedUser.email || selectedUser.username || 'User';
      toast.success(tToast('sharedWith', { email: displayName }));
      setSelectedUser(null);
      setUserPermission(SharePermission.VIEW);
      refetchShares();
    } catch {
      toast.error(tToast('shareFailed'));
    }
  };

  // Share with a selected team (all active members inherit access)
  const handleShareWithSelectedTeam = async () => {
    if (!selectedTeam) return;

    try {
      await shareWithTeam.mutateAsync({
        templateId,
        request: {
          teamId: selectedTeam.id,
          permission: teamPermission,
        },
      });
      toast.success(tToast('sharedWithTeam', { name: selectedTeam.name }));
      setSelectedTeam(null);
      setTeamPermission(SharePermission.VIEW);
      refetchShares();
    } catch {
      toast.error(tToast('shareTeamFailed'));
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const getSelectedUserDisplay = () => {
    if (!selectedUser) return '';
    if (selectedUser.firstName && selectedUser.lastName) {
      return `${selectedUser.firstName} ${selectedUser.lastName}`;
    }
    return selectedUser.email || selectedUser.username || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPublicNote && (
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-3 text-sm">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-blue-700 dark:text-blue-300 text-xs">
              {t('publicNote')}
            </p>
          </div>
        )}
        {/* Invitation form with grantee tabs */}
        {canEdit && (
          <div className={cn(
            'rounded-lg border bg-muted/30',
            isMobile ? 'p-3' : 'p-4'
          )}>
            <Tabs value={shareMode} onValueChange={(v) => setShareMode(v as ShareMode)}>
              <TabsList className={cn('grid w-full grid-cols-3 mb-4', isMobile && 'h-11')}>
                <TabsTrigger value="email" className={cn('gap-1.5', isMobile ? 'text-xs px-1' : 'text-sm')}>
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t('form.tabs.email')}</span>
                </TabsTrigger>
                <TabsTrigger value="user" className={cn('gap-1.5', isMobile ? 'text-xs px-1' : 'text-sm')}>
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t('form.tabs.systemUser')}</span>
                </TabsTrigger>
                <TabsTrigger value="team" className={cn('gap-1.5', isMobile ? 'text-xs px-1' : 'text-sm')}>
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t('form.tabs.team')}</span>
                </TabsTrigger>
              </TabsList>

              {/* Email Tab */}
              <TabsContent value="email" className="mt-0">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleShareByEmail)}
                    className={cn(
                      'gap-2',
                      isMobile ? 'flex flex-col space-y-2' : 'flex flex-row'
                    )}
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder={t('form.emailPlaceholder')}
                              type="email"
                              className={cn(isMobile && 'text-base h-12')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className={cn('flex gap-2', isMobile && 'w-full')}>
                      <FormField
                        control={form.control}
                        name="permission"
                        render={({ field }) => (
                          <FormItem className={cn(isMobile && 'flex-1')}>
                            <FormControl>
                              <PermissionSelect
                                value={field.value}
                                onChange={field.onChange}
                                size={isMobile ? 'default' : 'sm'}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        size={isMobile ? 'default' : 'sm'}
                        disabled={shareWithUser.isPending}
                        className={cn(
                          'gap-1.5 shrink-0',
                          isMobile && 'min-h-[44px] min-w-[44px]'
                        )}
                      >
                        {shareWithUser.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        {!isMobile && t('form.addButton')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* System User Tab */}
              <TabsContent value="user" className="mt-0">
                <div className={cn(
                  'gap-2',
                  isMobile ? 'flex flex-col space-y-2' : 'flex flex-row'
                )}>
                  <div className="flex-1">
                    <UserPicker
                      value={getSelectedUserDisplay()}
                      onSelect={handleUserSelect}
                      placeholder={t('form.userPlaceholder')}
                      excludeEmails={excludedEmails}
                      className="w-full"
                    />
                  </div>
                  <div className={cn('flex gap-2', isMobile && 'w-full')}>
                    <div className={cn(isMobile && 'flex-1')}>
                      <PermissionSelect
                        value={userPermission}
                        onChange={setUserPermission}
                        size={isMobile ? 'default' : 'sm'}
                      />
                    </div>
                    <Button
                      type="button"
                      size={isMobile ? 'default' : 'sm'}
                      disabled={!selectedUser || shareWithUser.isPending}
                      onClick={handleShareWithSelectedUser}
                      className={cn(
                        'gap-1.5 shrink-0',
                        isMobile && 'min-h-[44px] min-w-[44px]'
                      )}
                    >
                      {shareWithUser.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {!isMobile && t('form.addButton')}
                    </Button>
                  </div>
                </div>
                {selectedUser && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('form.selectedUser', { name: getSelectedUserDisplay() })}
                  </p>
                )}
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="mt-0">
                <div className={cn(
                  'gap-2',
                  isMobile ? 'flex flex-col space-y-2' : 'flex flex-row'
                )}>
                  <div className="flex-1">
                    <TeamPicker
                      value={selectedTeam?.id}
                      onSelect={setSelectedTeam}
                      excludeTeamIds={excludedTeamIds}
                      size={isMobile ? 'default' : 'sm'}
                      className="w-full"
                    />
                  </div>
                  <div className={cn('flex gap-2', isMobile && 'w-full')}>
                    <div className={cn(isMobile && 'flex-1')}>
                      <PermissionSelect
                        value={teamPermission}
                        onChange={setTeamPermission}
                        size={isMobile ? 'default' : 'sm'}
                      />
                    </div>
                    <Button
                      type="button"
                      size={isMobile ? 'default' : 'sm'}
                      disabled={!selectedTeam || shareWithTeam.isPending}
                      onClick={handleShareWithSelectedTeam}
                      className={cn(
                        'gap-1.5 shrink-0',
                        isMobile && 'min-h-[44px] min-w-[44px]'
                      )}
                    >
                      {shareWithTeam.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {!isMobile && t('form.addButton')}
                    </Button>
                  </div>
                </div>
                {selectedTeam ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('form.selectedTeam', { name: selectedTeam.name })}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('form.teamHint')}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Shares List */}
        <UserShareList
          templateId={templateId}
          canManage={canEdit}
          isMobile={isMobile}
          shares={shares}
          isLoading={sharesLoading}
          error={sharesError}
          onChanged={refetchShares}
        />
      </CardContent>
    </Card>
  );
}
