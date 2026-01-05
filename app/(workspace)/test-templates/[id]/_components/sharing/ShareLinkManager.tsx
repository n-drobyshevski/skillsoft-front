'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  CheckCircle2,
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
} from '@/hooks/queries';
import { toast } from 'sonner';
import { formatDistanceToNow, format, addDays } from 'date-fns';

interface ShareLinkManagerProps {
  templateId: string;
  canManage?: boolean;
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
}: ShareLinkManagerProps) {
  const { data: links, isLoading: linksLoading } = useActiveShareLinks(templateId);
  const { data: linkCount } = useLinkCount(templateId);
  const { data: canCreate } = useCanCreateLink(templateId);

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

      toast.success('Share link created');
      setShowCreateForm(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to create link');
      console.error('Create link error:', error);
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    setRevoking(linkId);
    try {
      await revokeLink.mutateAsync({ templateId, linkId });
      toast.success('Link revoked');
    } catch (error) {
      toast.error('Failed to revoke link');
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
          <h4 className="text-sm font-medium">Share Links</h4>
          <p className="text-xs text-muted-foreground">
            {activeCount} of {maxLinks} links used
          </p>
        </div>
        {canManage && !showCreateForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            disabled={!canCreate}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create Link
          </Button>
        )}
      </div>

      {/* Create Link Form */}
      {showCreateForm && canManage && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateLink)}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="permission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permission</FormLabel>
                      <FormControl>
                        <PermissionSelect
                          value={field.value}
                          onChange={field.onChange}
                          maxPermission={SharePermission.VIEW}
                        />
                      </FormControl>
                      <FormDescription>
                        What can link users do?
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
                      <FormLabel>Expires In</FormLabel>
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
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Expires {format(addDays(new Date(), field.value), 'PPP')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Uses (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={1000}
                          placeholder="Unlimited"
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
                        0 = unlimited uses
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
                      <FormLabel>Label (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Interview candidates"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Help identify this link
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createLink.isPending}
                  className="gap-1.5"
                >
                  {createLink.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  Create Link
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
              canManage={canManage}
              isRevoking={revoking === link.id}
              onRevoke={() => handleRevokeLink(link.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-muted/20">
          <Link2 className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No active share links</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Create a link to share this template without adding specific users
          </p>
        </div>
      )}

      {/* Limit Warning */}
      {!canCreate && canManage && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-amber-700 dark:text-amber-400">
            Maximum link limit reached. Revoke existing links to create new ones.
          </p>
        </div>
      )}
    </div>
  );
}

interface LinkListItemProps {
  link: ShareLink;
  canManage: boolean;
  isRevoking: boolean;
  onRevoke: () => void;
}

function LinkListItem({
  link,
  canManage,
  isRevoking,
  onRevoke,
}: LinkListItemProps) {
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
  const isUsedUp = link.maxUses != null && link.usageCount >= link.maxUses;
  const isInvalid = isExpired || isUsedUp || !!link.revokedAt;

  return (
    <div
      className={cn(
        'rounded-lg border p-3 space-y-2',
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
          {link.label || 'Share Link'}
        </span>
        <PermissionBadge permission={link.permission} size="sm" />
        {isExpired && (
          <Badge variant="destructive" className="text-xs">
            Expired
          </Badge>
        )}
        {isUsedUp && (
          <Badge variant="secondary" className="text-xs">
            Used Up
          </Badge>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {link.usageCount} {link.maxUses ? `/ ${link.maxUses}` : ''} uses
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {isExpired
            ? 'Expired'
            : `Expires ${formatDistanceToNow(new Date(link.expiresAt), { addSuffix: true })}`}
        </span>
      </div>

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
                  size="sm"
                  className="text-muted-foreground hover:text-destructive shrink-0"
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
                  <AlertDialogTitle>Revoke Share Link</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to revoke this link? Anyone with this
                    link will no longer be able to access the template.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRevoke}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Revoke Link
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
