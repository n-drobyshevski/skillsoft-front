'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Users, Link2, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SharePermission } from '@/types/domain';
import { VisibilitySelector } from './VisibilitySelector';
import { UserShareList } from './UserShareList';
import { ShareLinkManager } from './ShareLinkManager';
import { PermissionSelect } from './PermissionSelect';
import {
  useTemplateVisibility,
  useShareWithUser,
} from '@/hooks/queries';
import { toast } from 'sonner';

interface ShareModalContentProps {
  templateId: string;
  templateName: string;
  isOwner?: boolean;
  canManage?: boolean;
  /** Additional className for the content wrapper */
  className?: string;
  /** Variant for mobile vs desktop styling */
  variant?: 'desktop' | 'mobile';
}

const shareUserSchema = z.object({
  email: z.string().email('Valid email required'),
  permission: z.nativeEnum(SharePermission),
});

type ShareUserFormValues = z.infer<typeof shareUserSchema>;

/**
 * ShareModalContent - Extracted content for sharing modal
 *
 * This component contains all the sharing UI logic and can be rendered
 * inside either a Dialog (desktop) or Drawer (mobile).
 *
 * Features:
 * - Visibility settings section
 * - Tabs for Users/Teams and Links
 * - Add user form with permission selection
 * - Share link management
 * - Responsive layout adjustments via variant prop
 */
export function ShareModalContent({
  templateId,
  // templateName reserved for future header display within content
  isOwner = false,
  canManage = false,
  className,
  variant = 'desktop',
}: ShareModalContentProps) {
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
    } catch {
      toast.error('Failed to share with user');
    }
  };

  const canEdit = isOwner || canManage;
  const isMobile = variant === 'mobile';

  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto space-y-4 md:space-y-6',
        // Mobile: more padding, touch-friendly spacing
        isMobile ? 'px-4 pb-4' : 'pr-1',
        className
      )}
    >
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
        <TabsList
          className={cn(
            'grid w-full grid-cols-2',
            // Mobile: larger touch targets
            isMobile && 'h-12'
          )}
        >
          <TabsTrigger
            value="people"
            className={cn(
              'gap-1.5',
              // Mobile: minimum touch target height
              isMobile && 'min-h-[44px]'
            )}
          >
            <Users className="h-4 w-4" />
            People
          </TabsTrigger>
          <TabsTrigger
            value="links"
            className={cn(
              'gap-1.5',
              isMobile && 'min-h-[44px]'
            )}
          >
            <Link2 className="h-4 w-4" />
            Links
          </TabsTrigger>
        </TabsList>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-4 mt-4">
          {/* Add User Form */}
          {canEdit && (
            <div className="rounded-lg border bg-muted/30 p-3 md:p-4">
              <Form {...userForm}>
                <form
                  onSubmit={userForm.handleSubmit(handleShareWithUser)}
                  className={cn(
                    'gap-2',
                    // Mobile: stack vertically, Desktop: horizontal
                    isMobile ? 'flex flex-col space-y-2' : 'flex flex-row'
                  )}
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
                            // Mobile: prevent iOS zoom with 16px font
                            className={cn(isMobile && 'text-base h-12')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div
                    className={cn(
                      'flex gap-2',
                      // Mobile: full width row for controls
                      isMobile && 'w-full'
                    )}
                  >
                    <FormField
                      control={userForm.control}
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
                        // Mobile: minimum touch target
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
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="mt-4">
          <ShareLinkManager
            templateId={templateId}
            canManage={canEdit}
            isMobile={isMobile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
