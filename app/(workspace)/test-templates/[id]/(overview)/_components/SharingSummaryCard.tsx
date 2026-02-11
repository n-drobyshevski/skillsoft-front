'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Share2, Users, Link2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useTemplateVisibility,
  useActiveShareLinks,
} from '@/hooks/queries';
import {
  TemplateVisibility,
  getVisibilityDescription,
} from '@/types/domain';
import { ResponsiveShareModal } from '../../_components/sharing/ResponsiveShareModal';
import { VisibilityBadge } from '../../_components/sharing/VisibilitySelector';

interface SharingSummaryCardProps {
  templateId: string;
  templateName: string;
  isOwner: boolean;
  canManage: boolean;
}

/**
 * SharingSummaryCard - Quick overview of template sharing status
 *
 * Displays:
 * - Current visibility status with badge
 * - Count of people shared with
 * - Count of active share links
 * - Quick copy link action (when visibility is LINK)
 * - Link to full access management page
 *
 * @example
 * ```tsx
 * <SharingSummaryCard
 *   templateId="123"
 *   templateName="My Assessment"
 *   isOwner={true}
 *   canManage={true}
 * />
 * ```
 */
export function SharingSummaryCard({
  templateId,
  templateName,
  isOwner,
  canManage,
}: SharingSummaryCardProps) {
  const t = useTranslations('template.hub.overview.sharingCard');
  const tOverview = useTranslations('template.hub.overview');
  const { data: visibilityInfo, isLoading: isVisibilityLoading } =
    useTemplateVisibility(templateId);
  const { data: activeLinks } = useActiveShareLinks(templateId);

  const handleCopyLink = React.useCallback(async () => {
    if (!activeLinks || activeLinks.length === 0) {
      toast.error(t('noLinksAvailable'));
      return;
    }

    const firstLink = activeLinks[0];
    const linkUrl = firstLink.fullUrl;

    if (!linkUrl) {
      toast.error(t('linkNotAvailable'));
      return;
    }

    try {
      await navigator.clipboard.writeText(linkUrl);
      toast.success(t('linkCopied'));
    } catch (error) {
      toast.error(t('copyFailed'));
      console.error('Copy link error:', error);
    }
  }, [activeLinks, t]);

  // Loading state
  if (isVisibilityLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4" />
            {tOverview('sharing')}
          </CardTitle>
          <CardAction>
            <Skeleton className="h-8 w-16" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-36" />
        </CardFooter>
      </Card>
    );
  }

  const visibility = visibilityInfo?.visibility ?? TemplateVisibility.PRIVATE;
  const sharesCount = visibilityInfo?.activeSharesCount ?? 0;
  const linksCount = visibilityInfo?.activeLinksCount ?? 0;
  const showCopyLink =
    visibility === TemplateVisibility.LINK && linksCount > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="h-4 w-4" />
          {tOverview('sharing')}
        </CardTitle>
        <CardAction>
          <ResponsiveShareModal
            templateId={templateId}
            templateName={templateName}
            isOwner={isOwner}
            canManage={canManage}
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5">
                <Share2 className="h-4 w-4" />
                {t('share')}
              </Button>
            }
          />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Visibility badge and description */}
        <div className="space-y-1.5">
          <VisibilityBadge visibility={visibility} />
          <p className="text-sm text-muted-foreground">
            {getVisibilityDescription(visibility)}
          </p>
        </div>

        {/* Stats badges */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 flex-1',
              'bg-muted/30'
            )}
          >
            <div className="p-2 rounded-md bg-background">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-none">{sharesCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('peopleShared', { count: sharesCount })}
              </p>
            </div>
          </div>

          <div
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 flex-1',
              'bg-muted/30'
            )}
          >
            <div className="p-2 rounded-md bg-background">
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-none">{linksCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('linksActive', { count: linksCount })}
              </p>
            </div>
          </div>
        </div>

        {/* Copy link button */}
        {showCopyLink && (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto gap-1.5"
            onClick={handleCopyLink}
          >
            <Copy className="h-4 w-4" />
            {t('copyLink')}
          </Button>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href={`/test-templates/${templateId}/access`}
          className={cn(
            'inline-flex items-center gap-1 text-sm text-primary',
            'hover:underline hover:underline-offset-4'
          )}
        >
          {t('manageAccess')}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
