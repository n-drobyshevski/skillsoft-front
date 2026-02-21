'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useFormattedDates } from '@/hooks/useFormattedDates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Link2,
  Plus,
  Trash2,
  Loader2,
  Clock,
  Eye,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Users,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ShareLink,
  SharePermission,
  getPermissionDisplayText,
} from '@/types/domain';
import { CopyLinkButton, ShareUrlDisplay } from './CopyLinkButton';
import { PermissionSelect, PermissionBadge } from './PermissionSelect';
import {
  useActiveShareLinks,
  useLinkCount,
  useCanCreateLink,
  useCreateShareLink,
  useRevokeShareLink,
  useShareLinkStats,
} from '@/hooks/queries';
import { toast } from 'sonner';
import { addDays } from '@/lib/date-utils';

interface ShareLinkManagerProps {
  templateId: string;
  canManage?: boolean;
  /** Mobile variant for touch-friendly sizing */
  isMobile?: boolean;
}

const createLinkSchema = z.object({
  permission: z.nativeEnum(SharePermission),
  expiresInDays: z.number().min(1).max(365),
  maxUses: z.number().min(0).max(1000).optional(),
  label: z.string().max(100).optional(),
});

type CreateLinkFormValues = z.infer<typeof createLinkSchema>;

/**
 * ShareLinkManager - Create and manage share links
 *
 * Features:
 * - Create new links with expiry and usage limits
 * - List active links with usage stats
 * - Copy link functionality
 * - Revoke links with confirmation
 * - Max 10 active links limit
 */
export function ShareLinkManager({
  templateId,
  canManage = false,
  isMobile = false,
}: ShareLinkManagerProps) {
  const t = useTranslations('template.access.links');
  const tToast = useTranslations('template.access.toast');
  const { formatRelativeTime, formatFutureRelativeTime, formatDateTime } = useFormattedDates();

  const { data: links, isLoading: linksLoading, refetch: refetchLinks } = useActiveShareLinks(templateId);
  const { data: linkCount, refetch: refetchCount } = useLinkCount(templateId);
  const { data: canCreate, refetch: refetchCanCreate } = useCanCreateLink(templateId);

  const createLink = useCreateShareLink();
  const revokeLink = useRevokeShareLink();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const form = useForm<CreateLinkFormValues>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      permission: SharePermission.VIEW,
      expiresInDays: 7,
      maxUses: 0, // 0 = unlimited
      label: '',
    },
  });

  const handleCreateLink = async (values: CreateLinkFormValues) => {
    try {
      const result = await createLink.mutateAsync({
        templateId,
        request: {
          permission: values.permission,
          expiresInDays: values.expiresInDays,
          maxUses: values.maxUses && values.maxUses > 0 ? values.maxUses : undefined,
          label: values.label || undefined,
        },
      });

      toast.success(tToast('linkCreated'));
      refetchLinks();
      refetchCount();
      refetchCanCreate();
      setShowCreateForm(false);
      form.reset();
    } catch (error) {
      toast.error(tToast('linkCreateFailed'));
      console.error('Create link error:', error);
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    setRevoking(linkId);
    try {
      await revokeLink.mutateAsync({ templateId, linkId });
      toast.success(tToast('linkRevoked'));
      refetchLinks();
      refetchCount();
      refetchCanCreate();
    } catch (error) {
      toast.error(tToast('linkRevokeFailed'));
      console.error('Revoke link error:', error);
    } finally {
      setRevoking(null);
    }
  };

  const maxLinks = linkCount?.maxLinks || 10;
  const activeCount = linkCount?.activeCount || 0;
  const remainingLinks = maxLinks - activeCount;

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">{t('subheader')}</h4>
          <p className="text-xs text-muted-foreground">
            {t('usage', { active: activeCount, max: maxLinks })}
          </p>
        </div>
        {canManage && !showCreateForm && (
          <Button
            variant="outline"
            size={isMobile ? 'default' : 'sm'}
            onClick={() => setShowCreateForm(true)}
            disabled={!canCreate}
            className={cn('gap-1.5', isMobile && 'min-h-[44px]')}
          >
            <Plus className="h-4 w-4" />
            {t('createButton')}
          </Button>
        )}
      </div>

      {/* Create Link Form */}
      {showCreateForm && canManage && (
        <div className={cn(
          'rounded-lg border bg-muted/30 space-y-4',
          isMobile ? 'p-3' : 'p-4'
        )}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateLink)}
              className="space-y-4"
            >
              {/* Mobile: single column, Desktop: two columns */}
              <div className={cn('grid gap-4', !isMobile && 'sm:grid-cols-2')}>
                <FormField
                  control={form.control}
                  name="permission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.permissionLabel')}</FormLabel>
                      <FormControl>
                        <PermissionSelect
                          value={field.value}
                          onChange={field.onChange}
                          maxPermission={SharePermission.VIEW}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('form.permissionDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresInDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.expiresLabel')}</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(v) => field.onChange(parseInt(v))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">{t('expiration.day1')}</SelectItem>
                          <SelectItem value="7">{t('expiration.day7')}</SelectItem>
                          <SelectItem value="14">{t('expiration.day14')}</SelectItem>
                          <SelectItem value="30">{t('expiration.day30')}</SelectItem>
                          <SelectItem value="90">{t('expiration.day90')}</SelectItem>
                          <SelectItem value="365">{t('expiration.year1')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t('form.expiresDesc', { date: formatDateTime(addDays(new Date(), field.value)) })}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className={cn('grid gap-4', !isMobile && 'sm:grid-cols-2')}>
                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.maxUsesLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={1000}
                          placeholder={t('form.maxUsesPlaceholder')}
                          className={cn(isMobile && 'h-12 text-base')}
                          {...field}
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : 0
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t('form.maxUsesDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.labelLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.labelPlaceholder')}
                          className={cn(isMobile && 'h-12 text-base')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('form.labelDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className={cn(
                'flex gap-2',
                // Mobile: full width stacked buttons
                isMobile ? 'flex-col' : 'justify-end'
              )}>
                <Button
                  type="button"
                  variant="outline"
                  size={isMobile ? 'default' : 'sm'}
                  className={cn(isMobile && 'min-h-[44px] order-2')}
                  onClick={() => {
                    setShowCreateForm(false);
                    form.reset();
                  }}
                >
                  {t('form.cancelButton')}
                </Button>
                <Button
                  type="submit"
                  size={isMobile ? 'default' : 'sm'}
                  disabled={createLink.isPending}
                  className={cn('gap-1.5', isMobile && 'min-h-[44px] order-1')}
                >
                  {createLink.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  {t('form.submitButton')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Links List */}
      {linksLoading ? (
        <LinkListSkeleton />
      ) : links && links.length > 0 ? (
        <div className="space-y-2">
          {links.map((link) => (
            <LinkListItem
              key={link.id}
              link={link}
              templateId={templateId}
              canManage={canManage}
              isRevoking={revoking === link.id}
              isMobile={isMobile}
              onRevoke={() => handleRevokeLink(link.id)}
              t={t}
              formatFutureRelativeTime={formatFutureRelativeTime}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-muted/20">
          <Link2 className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{t('emptyState.title')}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {t('emptyState.hint')}
          </p>
        </div>
      )}

      {/* Limit Warning */}
      {!canCreate && canManage && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-amber-700 dark:text-amber-400">
            {t('limitWarning')}
          </p>
        </div>
      )}
    </div>
  );
}

interface LinkListItemProps {
  link: ShareLink;
  templateId: string;
  canManage: boolean;
  isRevoking: boolean;
  isMobile?: boolean;
  onRevoke: () => void;
  t: ReturnType<typeof useTranslations<'template.access.links'>>;
  formatFutureRelativeTime: (date: string | Date | null | undefined) => string;
}

function LinkListItem({
  link,
  templateId,
  canManage,
  isRevoking,
  isMobile = false,
  onRevoke,
  t,
  formatFutureRelativeTime,
}: LinkListItemProps) {
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
  const isUsedUp = link.maxUses != null && link.currentUses >= link.maxUses;
  const isInvalid = isExpired || isUsedUp || !!link.revokedAt;
  const [showStats, setShowStats] = useState(false);

  return (
    <div
      className={cn(
        'rounded-lg border space-y-2',
        isMobile ? 'p-3' : 'p-3',
        isInvalid && 'opacity-60'
      )}
    >
      {/* Header Row */}
      <div className="flex items-center gap-2">
        <Link2
          className={cn(
            'h-4 w-4 shrink-0',
            isInvalid ? 'text-muted-foreground' : 'text-blue-500'
          )}
        />
        <span className="text-sm font-medium truncate flex-1">
          {link.label || t('listItem.shareLink')}
        </span>
        <PermissionBadge permission={link.permission} size="sm" />
        {isExpired && (
          <Badge variant="destructive" className="text-xs">
            {t('listItem.expired')}
          </Badge>
        )}
        {isUsedUp && (
          <Badge variant="secondary" className="text-xs">
            {t('listItem.usedUp')}
          </Badge>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {t('listItem.uses', { count: link.currentUses, max: link.maxUses ?? 0 })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {isExpired
            ? t('listItem.expired')
            : t('listItem.expiresIn', { time: formatFutureRelativeTime(link.expiresAt) })}
        </span>
        {link.currentUses > 0 && (
          <button
            type="button"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1 text-primary hover:underline ml-auto"
          >
            <BarChart3 className="h-3 w-3" />
            {showStats ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Expandable Analytics */}
      {showStats && <LinkAnalytics templateId={templateId} linkId={link.id} />}

      {/* Actions Row */}
      {!isInvalid && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ShareUrlDisplay token={link.token} masked={link.tokenMasked} />
          </div>
          {canManage && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size={isMobile ? 'default' : 'sm'}
                  className={cn(
                    'text-muted-foreground hover:text-destructive shrink-0',
                    isMobile && 'min-h-[44px] min-w-[44px]'
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
                  <AlertDialogTitle>{t('revokeDialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('revokeDialog.message')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('form.cancelButton')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRevoke}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {t('revokeDialog.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
}

function LinkAnalytics({ templateId, linkId }: { templateId: string; linkId: string }) {
  const { data: stats, isLoading } = useShareLinkStats(templateId, linkId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2 pt-1">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-4 gap-2 pt-1">
      <div className="rounded bg-muted/50 p-2 text-center">
        <div className="text-sm font-semibold">{stats.totalSessions}</div>
        <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
          <Users className="h-2.5 w-2.5" />
          Sessions
        </div>
      </div>
      <div className="rounded bg-muted/50 p-2 text-center">
        <div className="text-sm font-semibold">{stats.completedResults}</div>
        <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Completed
        </div>
      </div>
      <div className="rounded bg-muted/50 p-2 text-center">
        <div className="text-sm font-semibold">
          {stats.averageScore != null ? `${stats.averageScore.toFixed(0)}%` : '—'}
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
          <BarChart3 className="h-2.5 w-2.5" />
          Avg Score
        </div>
      </div>
      <div className="rounded bg-muted/50 p-2 text-center">
        <div className="text-sm font-semibold">
          {stats.passRate != null ? `${stats.passRate.toFixed(0)}%` : '—'}
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
          <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
          Pass Rate
        </div>
      </div>
    </div>
  );
}

function LinkListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 ml-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
