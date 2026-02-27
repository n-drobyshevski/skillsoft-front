"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ManagedTeam,
  ManagedTeamMember,
  TeamMemberRole,
  getTeamMemberInitials,
} from "@/types/team";
import { useFormattedDates } from "@/hooks/useFormattedDates";
import {
  Search,
  MoreHorizontal,
  Crown,
  UserPlus,
  UserMinus,
  ExternalLink,
  Mail,
  Calendar,
  Users,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import AddMemberDialog from "./AddMemberDialog";
import ConfirmActionDialog from "./ConfirmActionDialog";
import { removeTeamMemberAction, promoteToLeaderAction } from "../actions";

interface TeamMembersTabProps {
  team: ManagedTeam;
}

function MemberRoleBadge({ role, isLeader }: { role: TeamMemberRole; isLeader: boolean }) {
  const t = useTranslations('teams.detail.members');

  if (isLeader) {
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 gap-1">
        <Crown className="h-3 w-3" aria-hidden="true" />
        {t('role.leader')}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Shield className="h-3 w-3" aria-hidden="true" />
      {t('role.member')}
    </Badge>
  );
}

function EmptyMembersState({ onAddClick }: { onAddClick?: () => void }) {
  const t = useTranslations('teams.detail.members');

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 animate-in fade-in-0 zoom-in-95 duration-300">
          <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold max-w-[280px] mb-2 animate-in fade-in-0 duration-300 delay-75">{t('empty.title')}</h3>
        <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed mb-4 animate-in fade-in-0 duration-300 delay-100">
          {t('empty.description')}
        </p>
        <Button variant="default" size="sm" className="min-h-[44px] touch-manipulation animate-in fade-in-0 duration-300 delay-150" onClick={onAddClick}>
          <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('empty.action')}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TeamMembersTab({ team }: TeamMembersTabProps) {
  const t = useTranslations('teams.detail.members');
  const tConfirm = useTranslations('teams.detail.confirmations');
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{ open: boolean; member: ManagedTeamMember | null }>({
    open: false,
    member: null,
  });
  const [isPending, startTransition] = useTransition();

  // Sort members: leader first, then alphabetically
  const sortedMembers = [...team.members].sort((a, b) => {
    const aIsLeader = a.userId === team.leader?.id;
    const bIsLeader = b.userId === team.leader?.id;
    if (aIsLeader && !bIsLeader) return -1;
    if (!aIsLeader && bIsLeader) return 1;
    return a.fullName.localeCompare(b.fullName);
  });

  // Filter by search
  const filteredMembers = sortedMembers.filter(member =>
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveMember = async () => {
    if (!confirmRemove.member) return;

    const result = await removeTeamMemberAction(team.id, confirmRemove.member.userId);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handlePromoteToLeader = (member: ManagedTeamMember) => {
    startTransition(async () => {
      const result = await promoteToLeaderAction(team.id, member.userId);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const existingMemberIds = team.members.map(m => m.userId);

  if (team.members.length === 0) {
    return (
      <>
        <EmptyMembersState onAddClick={() => setIsAddDialogOpen(true)} />
        <AddMemberDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          teamId={team.id}
          existingMemberIds={existingMemberIds}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation" onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('actions.addMember')}
        </Button>
      </div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2" role="list" aria-label="Team members">
          {filteredMembers.map((member) => {
            const isLeader = member.userId === team.leader?.id;
            return (
              <MemberCardWithActions
                key={member.userId}
                member={member}
                isLeader={isLeader}
                teamId={team.id}
                onRemove={() => setConfirmRemove({ open: true, member })}
                onPromote={() => handlePromoteToLeader(member)}
                isPending={isPending}
              />
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
            <p className="text-muted-foreground">
              {t('search.noResults', { query: searchQuery })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Member Count Footer */}
      <div className="text-sm text-muted-foreground text-center pt-2">
        {t('count', {
          showing: filteredMembers.length,
          total: team.members.length
        })}
      </div>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        teamId={team.id}
        existingMemberIds={existingMemberIds}
      />

      {/* Remove Member Confirmation */}
      <ConfirmActionDialog
        open={confirmRemove.open}
        onOpenChange={(open) => setConfirmRemove({ open, member: open ? confirmRemove.member : null })}
        title={tConfirm('removeMember.title')}
        description={tConfirm('removeMember.description', { name: confirmRemove.member?.fullName || '' })}
        confirmLabel={tConfirm('removeMember.confirm')}
        cancelLabel={tConfirm('removeMember.cancel')}
        variant="destructive"
        onConfirm={handleRemoveMember}
      />
    </div>
  );
}

// Member card with integrated action handlers
function MemberCardWithActions({
  member,
  isLeader,
  teamId,
  onRemove,
  onPromote,
  isPending,
}: {
  member: ManagedTeamMember;
  isLeader: boolean;
  teamId: string;
  onRemove: () => void;
  onPromote: () => void;
  isPending: boolean;
}) {
  const t = useTranslations('teams.detail.members');
  const { formatDate } = useFormattedDates();

  const initials = getTeamMemberInitials(member);

  return (
    <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200" role="listitem">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              {member.imageUrl && <AvatarImage src={member.imageUrl} alt={member.fullName} />}
              <AvatarFallback className={isLeader
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-muted text-muted-foreground"
              }>
                {initials}
              </AvatarFallback>
            </Avatar>
            {isLeader && (
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                <Crown className="h-3 w-3 text-white" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{member.fullName}</h3>
              <MemberRoleBadge role={member.role} isLeader={isLeader} />
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{member.email}</span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{t('joinedAt', { date: formatDate(member.joinedAt) })}</span>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">{t('actions.menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${member.userId}`}>
                  <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('actions.viewProfile')}
                </Link>
              </DropdownMenuItem>

              {!isLeader && (
                <DropdownMenuItem onClick={onPromote}>
                  <Crown className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('actions.makeLeader')}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive" onClick={onRemove}>
                <UserMinus className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('actions.remove')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
