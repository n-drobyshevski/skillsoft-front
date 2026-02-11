"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ManagedTeamSummary,
  TeamStatus,
  getTeamStatusKey,
  getTeamStatusBadgeVariant,
} from "@/types/team";
import { useFormattedDates } from "@/hooks/useFormattedDates";
import {
  Users,
  Calendar,
  ExternalLink,
  Crown,
  CheckCircle,
  FileEdit,
  Archive,
  Play,
  UserPlus,
} from "lucide-react";

interface TeamDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: ManagedTeamSummary;
}

export default function TeamDrawer({ open, onOpenChange, team }: TeamDrawerProps) {
  const t = useTranslations('teams');
  const { formatDate, formatRelativeTime } = useFormattedDates();

  const getStatusStyles = (status: TeamStatus) => {
    const variant = getTeamStatusBadgeVariant(status);
    switch (variant) {
      case 'success':
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case 'secondary':
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  const getStatusIcon = (status: TeamStatus) => {
    switch (status) {
      case TeamStatus.DRAFT:
        return <FileEdit className="h-3.5 w-3.5" />;
      case TeamStatus.ACTIVE:
        return <CheckCircle className="h-3.5 w-3.5" />;
      case TeamStatus.ARCHIVED:
        return <Archive className="h-3.5 w-3.5" />;
      default:
        return <FileEdit className="h-3.5 w-3.5" />;
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-background shadow-md">
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary text-xl font-bold">
                {getTeamInitials(team.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <SheetTitle className="text-xl">{team.name}</SheetTitle>
              <Badge className={`${getStatusStyles(team.status)} gap-1.5`}>
                {getStatusIcon(team.status)}
                {t(`status.${statusKey}`)}
              </Badge>
            </div>
          </div>
          {team.description && (
            <SheetDescription className="text-left pt-2">
              {team.description}
            </SheetDescription>
          )}
        </SheetHeader>

        <Separator className="my-4" />

        {/* Team Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t('drawer.details')}
          </h4>

          <div className="grid gap-3">
            {/* Members Count */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{t('drawer.members')}</span>
              </div>
              <span className="font-semibold">{team.memberCount}</span>
            </div>

            {/* Leader */}
            {team.leader && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span>{t('drawer.leader')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {team.leader.imageUrl && (
                      <AvatarImage src={team.leader.imageUrl} alt={team.leader.fullName} />
                    )}
                    <AvatarFallback className="text-xs">
                      {team.leader.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{team.leader.fullName}</span>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{t('drawer.created')}</span>
              </div>
              <span className="text-sm">{formatDate(team.createdAt)}</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t('drawer.actions')}
          </h4>

          <div className="grid gap-2">
            <Link href={`/admin/teams/${team.id}`} className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ExternalLink className="h-4 w-4" />
                {t('drawer.viewDetails')}
              </Button>
            </Link>

            <Link href={`/admin/teams/${team.id}/edit`} className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileEdit className="h-4 w-4" />
                {t('drawer.editTeam')}
              </Button>
            </Link>

            <Button variant="outline" className="w-full justify-start gap-2">
              <UserPlus className="h-4 w-4" />
              {t('drawer.addMembers')}
            </Button>

            {team.status === TeamStatus.DRAFT && (
              <Button className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Play className="h-4 w-4" />
                {t('drawer.activate')}
              </Button>
            )}

            {team.status !== TeamStatus.ARCHIVED && (
              <Button variant="destructive" className="w-full justify-start gap-2">
                <Archive className="h-4 w-4" />
                {t('drawer.archive')}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
