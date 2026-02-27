"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ManagedTeam,
  TeamStatus,
  getTeamStatusBadgeVariant,
  getTeamStatusKey,
} from "@/types/team";
import { useFormattedDates } from "@/hooks/useFormattedDates";
import {
  Users,
  Edit,
  Calendar,
  Crown,
  CheckCircle,
  FileEdit,
  Archive,
  Play,
  UserPlus,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import AddMemberDialog from "./AddMemberDialog";
import ConfirmActionDialog from "./ConfirmActionDialog";
import { activateTeamAction, archiveTeamAction } from "../actions";

interface TeamHeroSectionProps {
  team: ManagedTeam;
  statusLabel: string;
}

function getTeamInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function StatusBadge({ status, label }: { status: TeamStatus; label: string }) {
  const variant = getTeamStatusBadgeVariant(status);

  const config = {
    success: {
      icon: CheckCircle,
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    default: {
      icon: FileEdit,
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500 animate-pulse",
    },
    secondary: {
      icon: Archive,
      bg: "bg-gray-100 dark:bg-gray-900/30",
      text: "text-gray-700 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-800",
      dot: "bg-gray-500",
    },
  };

  const styles = config[variant];

  return (
    <Badge
      variant="outline"
      className={`${styles.bg} ${styles.text} ${styles.border} gap-1.5 px-2.5 py-1 font-medium`}
    >
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
      {label}
    </Badge>
  );
}

export default function TeamHeroSection({ team, statusLabel }: TeamHeroSectionProps) {
  const t = useTranslations('teams.detail');
  const tConfirm = useTranslations('teams.detail.confirmations');
  const { formatDate, formatRelativeTime } = useFormattedDates();

  const [isPending, startTransition] = useTransition();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmActivate, setConfirmActivate] = useState(false);

  const initials = getTeamInitials(team.name);
  const statusKey = getTeamStatusKey(team.status);
  const existingMemberIds = team.members.map(m => m.userId);

  const handleActivate = async () => {
    const result = await activateTeamAction(team.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleArchive = async () => {
    const result = await archiveTeamAction(team.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="relative" role="region" aria-label="Team overview">
      {/* Subtle Background */}
      <div className="absolute inset-0 h-32 sm:h-40 lg:h-48 bg-muted/30 dark:bg-muted/10" />

      {/* Header Content */}
      <div className="relative px-4 pt-6 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] w-full">
          {/* Profile Card */}
          <Card className="shadow-sm bg-card/95 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center sm:items-start gap-3">
                  <div className="relative">
                    <Avatar className="relative h-16 w-16 sm:h-20 sm:w-20 border-2 border-background shadow-sm">
                      <AvatarFallback className="text-lg sm:text-xl font-bold bg-muted text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {/* Team Status Indicator */}
                    {team.status === TeamStatus.ACTIVE && (
                      <div className="absolute bottom-1 right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-[3px] border-background bg-emerald-500 shadow-sm" />
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  {/* Name and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                      {team.name}
                    </h1>
                    <StatusBadge status={team.status} label={statusLabel} />
                  </div>

                  {/* Description */}
                  {team.description && (
                    <p className="text-muted-foreground mt-2 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        {t('memberCount', { count: team.memberCount })}
                      </span>
                    </span>
                    {team.leader && (
                      <span className="flex items-center gap-1.5">
                        <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" aria-hidden="true" />
                        <span>{team.leader.fullName}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{t('created', { date: formatDate(team.createdAt) })}</span>
                    </span>
                  </div>

                  {/* Quick Stats Row (visible on larger screens) */}
                  <div className="hidden lg:flex items-center gap-6 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-lg font-bold tabular-nums">{team.memberCount}</p>
                        <p className="text-xs text-muted-foreground">{t('stats.members')}</p>
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {team.leader?.fullName || t('noLeader')}
                        </p>
                        <p className="text-xs text-muted-foreground">{t('stats.leader')}</p>
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{formatRelativeTime(team.createdAt)}</p>
                        <p className="text-xs text-muted-foreground">{t('stats.age')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col gap-2 justify-center">
                  <Button variant="default" size="sm" asChild className="shadow-xs min-h-[44px] sm:min-h-0 touch-manipulation">
                    <Link href={`/admin/teams/${team.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">{t('actions.edit')}</span>
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isPending} className="min-h-[44px] sm:min-h-0 touch-manipulation">
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin sm:mr-2" aria-hidden="true" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                        )}
                        <span className="hidden sm:inline">{t('actions.more')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setIsAddMemberOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t('actions.addMembers')}
                      </DropdownMenuItem>

                      {team.status === TeamStatus.DRAFT && (
                        <DropdownMenuItem
                          className="text-emerald-600 dark:text-emerald-400"
                          onClick={() => setConfirmActivate(true)}
                        >
                          <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                          {t('actions.activate')}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      {team.status !== TeamStatus.ARCHIVED && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setConfirmArchive(true)}
                        >
                          <Archive className="h-4 w-4 mr-2" aria-hidden="true" />
                          {t('actions.archive')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        teamId={team.id}
        existingMemberIds={existingMemberIds}
      />

      {/* Activate Confirmation Dialog */}
      <ConfirmActionDialog
        open={confirmActivate}
        onOpenChange={setConfirmActivate}
        title={tConfirm('activate.title')}
        description={tConfirm('activate.description', { name: team.name })}
        confirmLabel={tConfirm('activate.confirm')}
        cancelLabel={tConfirm('activate.cancel')}
        variant="default"
        onConfirm={handleActivate}
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmActionDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title={tConfirm('archive.title')}
        description={tConfirm('archive.description', { name: team.name })}
        confirmLabel={tConfirm('archive.confirm')}
        cancelLabel={tConfirm('archive.cancel')}
        variant="destructive"
        onConfirm={handleArchive}
      />
    </div>
  );
}
