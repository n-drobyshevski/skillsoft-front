'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Share2, User, Users, Link2, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TemplateVisibility,
  SharePermission,
} from '@/types/domain';
import { VisibilitySelector } from './VisibilitySelector';
import { UserShareList } from './UserShareList';
import { ShareLinkManager } from './ShareLinkManager';
import { PermissionSelect } from './PermissionSelect';
import {
  useTemplateVisibility,
  useShareWithUser,
  useShareWithTeam,
} from '@/hooks/queries';
import { toast } from 'sonner';

interface ShareDialogProps {
  templateId: string;
  templateName: string;
  isOwner?: boolean;
  canManage?: boolean;
  trigger?: React.ReactNode;
}

const shareUserSchema = z.object({
  email: z.string().email('Valid email required'),
  permission: z.nativeEnum(SharePermission),
});

const shareTeamSchema = z.object({
  teamId: z.string().uuid('Valid team ID required'),
  permission: z.nativeEnum(SharePermission),
});

type ShareUserFormValues = z.infer<typeof shareUserSchema>;

/**
 * ShareDialog - Main dialog for managing template sharing
 *
 * Features:
 * - Visibility settings section
 * - Tabs for Users/Teams and Links
 * - Add user/team form with permission selection
 * - Share link management
 */
export function ShareDialog({
  templateId,
  templateName,
  isOwner = false,
  canManage = false,
  trigger,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'people' | 'links'>('people');

  const { data: visibility, isLoading: visibilityLoading } =
    useTemplateVisibility(templateId);

  const shareWithUser = useShareWithUser();

  const userForm = useForm<ShareUserFormValues>({
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
      userForm.reset();
    } catch (error) {
      toast.error('Failed to share with user');
      console.error('Share user error:', error);
    }
  };

  const canEdit = isOwner || canManage;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share &quot;{templateName}&quot;
          </DialogTitle>
          <DialogDescription>
            Control who can access and use this template
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Visibility Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Visibility</h3>
            {visibilityLoading ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : visibility ? (
              <VisibilitySelector
                templateId={templateId}
                currentVisibility={visibility.visibility}
                activeLinksCount={visibility.activeLinksCount}
                isOwner={isOwner}
                canManage={canManage}
              />
            ) : null}
          </div>

          <Separator />

          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'people' | 'links')}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="people" className="gap-1.5">
                <Users className="h-4 w-4" />
                People
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-1.5">
                <Link2 className="h-4 w-4" />
                Links
              </TabsTrigger>
            </TabsList>

            {/* People Tab */}
            <TabsContent value="people" className="space-y-4 mt-4">
              {/* Add User Form */}
              {canEdit && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <Form {...userForm}>
                    <form
                      onSubmit={userForm.handleSubmit(handleShareWithUser)}
                      className="flex gap-2"
                    >
                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Enter email address"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="permission"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <PermissionSelect
                                value={field.value}
                                onChange={field.onChange}
                                size="sm"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={shareWithUser.isPending}
                        className="gap-1.5 shrink-0"
                      >
                        {shareWithUser.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Add
                      </Button>
                    </form>
                  </Form>
                </div>
              )}

              {/* Shares List */}
              <UserShareList templateId={templateId} canManage={canEdit} />
            </TabsContent>

            {/* Links Tab */}
            <TabsContent value="links" className="mt-4">
              <ShareLinkManager templateId={templateId} canManage={canEdit} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ShareButtonProps {
  templateId: string;
  templateName: string;
  isOwner?: boolean;
  canManage?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

/**
 * ShareButton - Convenience wrapper for ShareDialog with a button trigger
 */
export function ShareButton({
  templateId,
  templateName,
  isOwner = false,
  canManage = false,
  variant = 'outline',
  size = 'sm',
  className,
}: ShareButtonProps) {
  return (
    <ShareDialog
      templateId={templateId}
      templateName={templateName}
      isOwner={isOwner}
      canManage={canManage}
      trigger={
        <Button variant={variant} size={size} className={cn('gap-1.5', className)}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      }
    />
  );
}
