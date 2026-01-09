'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { SharePermission } from '@/types/domain';
import { PermissionSelect } from '../../_components/sharing/PermissionSelect';
import { UserShareList } from '../../_components/sharing/UserShareList';
import { useShareWithUser } from '@/hooks/queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PeopleSectionProps {
  templateId: string;
  isOwner: boolean;
  canManage: boolean;
  isMobile: boolean;
}

const shareUserSchema = z.object({
  email: z.string().email('Valid email required'),
  permission: z.nativeEnum(SharePermission),
});

type ShareUserFormValues = z.infer<typeof shareUserSchema>;

/**
 * PeopleSection - User and team sharing management
 *
 * Features:
 * - Invitation form to add users by email
 * - Permission level selection (View/Edit/Manage)
 * - List of current shares with edit/revoke options
 * - Responsive layout for mobile/desktop
 */
export function PeopleSection({
  templateId,
  isOwner,
  canManage,
  isMobile,
}: PeopleSectionProps) {
  const shareWithUser = useShareWithUser();
  const canEdit = isOwner || canManage;

  const form = useForm<ShareUserFormValues>({
    resolver: zodResolver(shareUserSchema),
    defaultValues: {
      email: '',
      permission: SharePermission.VIEW,
    },
  });

  const handleShareWithUser = async (values: ShareUserFormValues) => {
    try {
      await shareWithUser.mutateAsync({
        templateId,
        request: {
          email: values.email,
          permission: values.permission,
        },
      });
      toast.success(`Shared with ${values.email}`);
      form.reset();
    } catch {
      toast.error('Failed to share with user');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">People with access</CardTitle>
        <CardDescription>
          Share this template with specific users or teams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invitation Form */}
        {canEdit && (
          <div className={cn(
            'rounded-lg border bg-muted/30',
            isMobile ? 'p-3' : 'p-4'
          )}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleShareWithUser)}
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
                          placeholder="Enter email address"
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
                    {!isMobile && 'Add'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Shares List */}
        <UserShareList
          templateId={templateId}
          canManage={canEdit}
          isMobile={isMobile}
        />
      </CardContent>
    </Card>
  );
}
