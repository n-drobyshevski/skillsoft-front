"use client";

import { useState, useTransition, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, UserPlus, Check, X } from "lucide-react";
import { usersApi } from "@/services/api";
import type { User } from "@/types/user";
import type { ManagedTeamMember } from "@/types/team";
import { addTeamMembersAction } from "../actions";
import { toast } from "sonner";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  existingMemberIds: string[];
}

function getUserInitials(user: User): string {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }
  return '??';
}

export default function AddMemberDialog({
  open,
  onOpenChange,
  teamId,
  existingMemberIds,
}: AddMemberDialogProps) {
  const t = useTranslations('teams.detail.addMembers');
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setUsers([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const result = await usersApi.searchUsers(query);
      setUsers(result || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Failed to search users:', error);
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleAddMembers = () => {
    if (selectedUserIds.size === 0) return;

    startTransition(async () => {
      const result = await addTeamMembersAction(teamId, Array.from(selectedUserIds));

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        // Reset state
        setSelectedUserIds(new Set());
        setSearchQuery("");
        setUsers([]);
        setHasSearched(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset on close
    setSelectedUserIds(new Set());
    setSearchQuery("");
    setUsers([]);
    setHasSearched(false);
  };

  const isExistingMember = (userId: string) => existingMemberIds.includes(userId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Selected Count */}
        {selectedUserIds.size > 0 && (
          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary">
              {t('selected', { count: selectedUserIds.size })}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUserIds(new Set())}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Users List */}
        <ScrollArea className="h-[280px] -mx-6 px-6">
          {hasSearched && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">{t('noUsers')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const isSelected = selectedUserIds.has(user.id);
                const isMember = isExistingMember(user.id);

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                      ${isMember
                        ? 'opacity-50 cursor-not-allowed bg-muted/30'
                        : isSelected
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    onClick={() => !isMember && toggleUser(user.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isMember}
                      onCheckedChange={() => !isMember && toggleUser(user.id)}
                    />

                    <Avatar className="h-10 w-10">
                      {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.firstName || ''} />}
                      <AvatarFallback className="text-sm">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>

                    {isMember && (
                      <Badge variant="outline" className="shrink-0">
                        <Check className="h-3 w-3 mr-1" />
                        {t('alreadyMember')}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleAddMembers}
            disabled={selectedUserIds.size === 0 || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('adding')}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('add')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
