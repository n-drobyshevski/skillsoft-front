"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ManagedTeamSummary,
  TeamStatus,
  getTeamStatusKey,
  getTeamStatusBadgeVariant,
} from "@/types/team";
import { useFormattedDates } from "@/hooks/useFormattedDates";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Users,
  Calendar,
  Crown,
  CheckCircle,
  FileEdit,
  Archive,
  Play,
  Layers,
  FileText,
  Pencil,
  ChevronRight,
} from "lucide-react";

interface TeamDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: ManagedTeamSummary;
}

export default function TeamDrawer({ open, onOpenChange, team }: TeamDrawerProps) {
  const t = useTranslations('teams');
  const tCommon = useTranslations('common');
  const { formatDate } = useFormattedDates();
  const isMobile = useIsMobile();

  const getStatusIcon = (status: TeamStatus) => {
    switch (status) {
      case TeamStatus.ACTIVE:
        return <CheckCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
      case TeamStatus.ARCHIVED:
        return <Archive className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
      default:
        return <FileEdit className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
    }
  };

  const getTeamInitials = (name: string): string => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const statusKey = getTeamStatusKey(team.status);
  const statusVariant = getTeamStatusBadgeVariant(team.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={`${
          isMobile
            ? "w-full max-w-full sm:max-w-full"
            : "sm:max-w-lg"
        } p-0 flex flex-col gap-0 border-l border-border/50`}
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header */}
        <div className={`${isMobile ? "px-4 py-3" : "px-5 py-4"} border-b border-border/40`}>
          <div className="flex items-start gap-3 pr-8">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {getTeamInitials(team.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <SheetTitle className="text-base font-semibold leading-tight line-clamp-2 text-foreground">
                {team.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {t('drawer.overview')}
              </SheetDescription>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            <Badge
              variant={statusVariant === 'success' ? 'default' : 'secondary'}
              className="h-5 text-[11px] px-1.5 font-medium gap-1"
            >
              {getStatusIcon(team.status)}
              {t(`status.${statusKey}`)}
            </Badge>
            <Badge
              variant="outline"
              className="h-5 text-[11px] px-1.5 font-medium tabular-nums"
            >
              <Users className="h-3 w-3 mr-0.5" aria-hidden="true" />
              {team.memberCount}
            </Badge>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? "px-4 py-4" : "px-5 py-5"} space-y-5`}>
            {/* Description Section */}
            {team.description && (
              <section className="space-y-2" role="region" aria-label={t('drawer.description')}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <h3 className="text-xs font-medium uppercase tracking-wide">{t('drawer.description')}</h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 pl-5">
                  {team.description}
                </p>
              </section>
            )}

            {/* Details Section */}
            <section className="space-y-2" role="region" aria-label={t('drawer.details')}>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                <h3 className="text-xs font-medium uppercase tracking-wide">{t('drawer.details')}</h3>
              </div>
              <dl className="space-y-1 pl-5">
                {/* Leader */}
                {team.leader && (
                  <div className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                      {t('drawer.leader')}
                    </dt>
                    <dd className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        {team.leader.imageUrl && (
                          <AvatarImage src={team.leader.imageUrl} alt={team.leader.fullName} />
                        )}
                        <AvatarFallback className="text-[9px]">
                          {team.leader.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{team.leader.fullName}</span>
                    </dd>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {t('drawer.created')}
                  </dt>
                  <dd className="text-sm tabular-nums">{formatDate(team.createdAt)}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className={`${isMobile ? "px-4 py-3" : "px-5 py-4"} border-t border-border/40 bg-muted/20`}>
          <div className="flex items-center gap-2">
            {/* Status action (left side) */}
            {team.status === TeamStatus.DRAFT && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-3 sm:px-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 touch-manipulation"
              >
                <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {t('drawer.activate')}
              </Button>
            )}
            {team.status === TeamStatus.ACTIVE && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-3 sm:px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 touch-manipulation"
              >
                <Archive className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {t('drawer.archive')}
              </Button>
            )}
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-3 sm:px-2.5 text-xs text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <Link href={`/admin/teams/${team.id}`}>
                <ChevronRight className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {tCommon('viewDetails')}
              </Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              asChild
              className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-4 sm:px-3 text-xs touch-manipulation"
            >
              <Link href={`/admin/teams/${team.id}/edit`}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {tCommon('edit')}
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
