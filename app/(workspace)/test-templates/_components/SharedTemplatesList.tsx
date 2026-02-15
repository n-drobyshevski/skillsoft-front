/* eslint-disable security/detect-object-injection -- Safe: accessing typed Record with enum keys */
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileText, Play, Calendar, Eye, Edit, Settings2, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SharedTemplateItem,
  SharePermission,
  getPermissionDisplayText,
} from '@/types/domain';
import { TemplateInfoCard } from '@/components/catalog/TemplateInfoCard';
import { useFormattedDates } from '@/hooks/useFormattedDates';

const permissionConfig: Record<
  SharePermission,
  { icon: typeof Eye; color: string; bgColor: string }
> = {
  [SharePermission.VIEW]: {
    icon: Eye,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950/50',
  },
  [SharePermission.EDIT]: {
    icon: Edit,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950/50',
  },
  [SharePermission.MANAGE]: {
    icon: Settings2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950/50',
  },
};

interface SharedTemplatesListProps {
  items: SharedTemplateItem[];
  total: number;
}

/**
 * SharedTemplatesList - Renders shared templates using TemplateInfoCard.
 *
 * Port of SharedTemplatesGrid rendering logic, using the shared
 * TemplateInfoCard with sharing metadata in the metadata slot.
 */
export function SharedTemplatesList({ items, total }: SharedTemplatesListProps) {
  const t = useTranslations('shared');

  if (items.length === 0) {
    return <SharedEmptyState />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('resultsCount', { count: total })}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <SharedTemplateCard key={item.template.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SharedEmptyState() {
  const t = useTranslations('shared');

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg bg-muted/20">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Share2 className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-medium mb-2">{t('emptyState.title')}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {t('emptyState.description')}
      </p>
    </div>
  );
}

function SharedTemplateCard({ item }: { item: SharedTemplateItem }) {
  const t = useTranslations('shared');
  const { formatRelativeTime, formatFutureRelativeTime } = useFormattedDates();
  const { template, permission, sharedBy, sharedAt, expiresAt } = item;
  const permConfig = permissionConfig[permission];
  const PermIcon = permConfig.icon;

  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  const initials = sharedBy.name
    ? sharedBy.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const metadataSlot = (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn('shrink-0 gap-1', permConfig.bgColor)}
          >
            <PermIcon className={cn('h-3 w-3', permConfig.color)} />
            <span className={cn('text-xs', permConfig.color)}>
              {getPermissionDisplayText(permission)}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {t(`permission.${permission.toLowerCase()}`)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const actionsSlot = (
    <>
      {/* Shared by attribution */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <Avatar className="h-6 w-6">
          <AvatarImage src={sharedBy.avatarUrl} alt={sharedBy.name} />
          <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{sharedBy.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(sharedAt)}
          </p>
        </div>
      </div>

      {/* Expiry warning */}
      {expiresAt && !isExpired && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <Calendar className="h-3 w-3" />
          Expires {formatFutureRelativeTime(expiresAt)}
        </div>
      )}
      {isExpired && (
        <Badge variant="destructive" className="text-xs">
          Access Expired
        </Badge>
      )}

      {/* Action buttons */}
      {!isExpired && (
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            variant="default"
            size="sm"
            className="flex-1 gap-1.5 min-h-[36px]"
          >
            <Link href={`/test-templates/${template.id}`}>
              <FileText className="h-4 w-4" />
              {t('viewTemplate')}
            </Link>
          </Button>
          {template.isActive && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 min-h-[36px]"
            >
              <Link href={`/test-templates/${template.id}/take`}>
                <Play className="h-4 w-4" />
                {t('takeTest')}
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );

  return (
    <TemplateInfoCard
      template={template}
      metadata={metadataSlot}
      actions={actionsSlot}
      className={cn(isExpired && 'opacity-60')}
    />
  );
}
