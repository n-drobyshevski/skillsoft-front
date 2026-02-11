'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Users,
  FileText,
  Crown,
  Settings,
  Loader2,
  X,
  Save,
  Check,
  AlertCircle,
  Search,
  UserPlus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { usersApi } from '@/services/api';
import type { User } from '@/types/user';
import type { ManagedTeam, CreateTeamRequest, UpdateTeamRequest } from '@/types/team';
import { createTeamAction, updateTeamAction } from '../[teamId]/actions';

// ============================================
// SCHEMA & TYPES
// ============================================

// Define form values type explicitly for better type inference
export interface TeamFormValues {
  name: string;
  description: string;
  memberIds: string[];
  leaderId: string | null;
  activateImmediately: boolean;
}

function createTeamFormSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    name: z
      .string()
      .min(1, t('teams.form.validation.nameRequired'))
      .min(2, t('teams.form.validation.nameMin'))
      .max(100, t('teams.form.validation.nameMax')),
    description: z
      .string()
      .max(500, t('teams.form.validation.descriptionMax')),
    memberIds: z.array(z.string()),
    leaderId: z.string().nullable(),
    activateImmediately: z.boolean(),
  });
}

// ============================================
// TYPES
// ============================================

interface SelectedMember {
  id: string;
  fullName: string;
  email?: string;
  imageUrl?: string;
}

interface TeamFormProps {
  team?: ManagedTeam;
  onUpdatePreview?: (data: TeamFormValues & { selectedMembers: SelectedMember[] }) => void;
  onSuccess?: (team: ManagedTeam) => void;
}

// ============================================
// HELPERS
// ============================================

function isUser(user: User | SelectedMember): user is User {
  return 'firstName' in user || 'lastName' in user;
}

function getUserInitials(user: User | SelectedMember): string {
  let name: string;

  if (isUser(user)) {
    name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  } else {
    name = user.fullName;
  }

  if (name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const email = user.email;
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }

  return '??';
}

function getUserFullName(user: User): string {
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown';
}

// ============================================
// COMPONENT
// ============================================

export function TeamForm({ team, onUpdatePreview, onSuccess }: TeamFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const isEditMode = !!team;

  // Schema with translations
  const teamSchema = useMemo(() => createTeamFormSchema(t), [t]);

  // Member search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>(() => {
    if (team?.members) {
      return team.members.map((m) => ({
        id: m.userId,
        fullName: m.fullName,
        email: m.email,
        imageUrl: m.imageUrl,
      }));
    }
    return [];
  });

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    mode: 'onChange',
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
      memberIds: team?.members?.map((m) => m.userId) || [],
      leaderId: team?.leader?.id || null,
      activateImmediately: false,
    },
  });

  const { errors, dirtyFields } = form.formState;

  // Field validation state helper
  const getFieldState = useCallback(
    (fieldName: keyof TeamFormValues) => {
      const isDirty = Object.hasOwn(dirtyFields, fieldName) && dirtyFields[fieldName as keyof typeof dirtyFields];
      const hasError = Object.hasOwn(errors, fieldName) && !!errors[fieldName as keyof typeof errors];
      return {
        isDirty,
        hasError,
        isValid: isDirty && !hasError,
      };
    },
    [dirtyFields, errors]
  );

  // Member search handler
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const result = await usersApi.searchUsers(query);
      setSearchResults(result || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Add member to selection
  const addMember = useCallback(
    (user: User) => {
      const newMember: SelectedMember = {
        id: user.id,
        fullName: getUserFullName(user),
        email: user.email,
        imageUrl: user.imageUrl,
      };

      setSelectedMembers((prev) => {
        if (prev.some((m) => m.id === user.id)) return prev;
        return [...prev, newMember];
      });

      const currentMemberIds = form.getValues('memberIds') || [];
      if (!currentMemberIds.includes(user.id)) {
        form.setValue('memberIds', [...currentMemberIds, user.id], { shouldDirty: true });
      }

      // Clear search after adding
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);

      // Update preview
      if (onUpdatePreview) {
        const values = form.getValues();
        onUpdatePreview({ ...values, selectedMembers: [...selectedMembers, newMember] });
      }
    },
    [form, onUpdatePreview, selectedMembers]
  );

  // Remove member from selection
  const removeMember = useCallback(
    (userId: string) => {
      setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));

      const currentMemberIds = form.getValues('memberIds') || [];
      form.setValue(
        'memberIds',
        currentMemberIds.filter((id) => id !== userId),
        { shouldDirty: true }
      );

      // Clear leader if removed
      const currentLeaderId = form.getValues('leaderId');
      if (currentLeaderId === userId) {
        form.setValue('leaderId', null, { shouldDirty: true });
      }

      // Update preview
      if (onUpdatePreview) {
        const values = form.getValues();
        onUpdatePreview({
          ...values,
          selectedMembers: selectedMembers.filter((m) => m.id !== userId),
        });
      }
    },
    [form, onUpdatePreview, selectedMembers]
  );

  // Form submission
  async function onSubmit(data: TeamFormValues) {
    setIsSubmitting(true);

    try {
      if (isEditMode && team) {
        const updateData: UpdateTeamRequest = {
          name: data.name,
          description: data.description || undefined,
        };
        const result = await updateTeamAction(team.id, updateData);

        if (result.success && result.data) {
          toast.success(t('teams.form.success.updated'));
          if (onSuccess) {
            onSuccess(result.data);
          } else {
            router.push(`/admin/teams/${team.id}`);
          }
        } else {
          toast.error(result.message || t('teams.form.errors.updateFailed'));
        }
      } else {
        const createData: CreateTeamRequest = {
          name: data.name,
          description: data.description || undefined,
          memberIds: data.memberIds?.length ? data.memberIds : undefined,
          leaderId: data.leaderId || undefined,
          activateImmediately: data.activateImmediately,
        };
        const result = await createTeamAction(createData);

        if (result.success && result.data) {
          toast.success(t('teams.form.success.created'));
          if (onSuccess) {
            onSuccess(result.data);
          }
          // Note: createTeamAction redirects on success
        } else {
          toast.error(result.message || t('teams.form.errors.createFailed'));
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(t('teams.form.errors.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Update preview on blur
  const handlePreviewUpdate = () => {
    if (onUpdatePreview) {
      onUpdatePreview({ ...form.getValues(), selectedMembers });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">
                  {t('teams.form.sections.basicInfo')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('teams.form.sections.basicInfoDescription')}
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  const fieldState = getFieldState('name');
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        {t('teams.form.fields.name')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={t('teams.form.fields.namePlaceholder')}
                            className={cn(
                              'h-11 sm:h-10 pr-8 touch-manipulation',
                              fieldState.isValid && 'border-green-500 focus-visible:ring-green-500',
                              fieldState.hasError && 'border-destructive focus-visible:ring-destructive'
                            )}
                            {...field}
                            onBlur={() => {
                              field.onBlur();
                              handlePreviewUpdate();
                            }}
                          />
                          {fieldState.isDirty && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {fieldState.isValid ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : fieldState.hasError ? (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        {t('teams.form.fields.nameDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  const charCount = field.value?.length || 0;
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t('teams.form.fields.description')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('teams.form.fields.descriptionPlaceholder')}
                          className="min-h-24 resize-none touch-manipulation"
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            handlePreviewUpdate();
                          }}
                        />
                      </FormControl>
                      <div className="flex items-center justify-between">
                        <FormDescription className="text-xs">
                          {t('teams.form.fields.descriptionDescription')}
                        </FormDescription>
                        <span className={cn('text-xs', charCount > 450 ? 'text-amber-600' : 'text-muted-foreground')}>
                          {charCount}/500
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>

          {/* Members Section (only for new teams) */}
          {!isEditMode && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold">
                    {t('teams.form.sections.members')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('teams.form.sections.membersDescription')}
                  </p>
                </div>
                {selectedMembers.length > 0 && (
                  <Badge variant="secondary" className="shrink-0">
                    {t('teams.form.memberSearch.selected', { count: selectedMembers.length })}
                  </Badge>
                )}
              </div>
              <div className="p-4 sm:p-5 space-y-4">
                {/* Member Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('teams.form.memberSearch.placeholder')}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 h-11 sm:h-10"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Search hint */}
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    {t('teams.form.memberSearch.minChars')}
                  </p>
                )}

                {/* Search Results */}
                {hasSearched && searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">{t('teams.form.memberSearch.noResults')}</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {searchResults.map((user) => {
                        const isSelected = selectedMembers.some((m) => m.id === user.id);
                        return (
                          <div
                            key={user.id}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                              isSelected
                                ? 'opacity-50 cursor-not-allowed bg-muted/30'
                                : 'hover:bg-muted/50'
                            )}
                            onClick={() => !isSelected && addMember(user)}
                          >
                            <Avatar className="h-9 w-9">
                              {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.firstName || ''} />}
                              <AvatarFallback className="text-xs">{getUserInitials(user)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{getUserFullName(user)}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                            {isSelected ? (
                              <Badge variant="outline" className="shrink-0 text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                {t('teams.form.memberSearch.alreadySelected')}
                              </Badge>
                            ) : (
                              <Button size="sm" variant="ghost" className="shrink-0 h-8">
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t('teams.form.fields.members')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((member) => (
                        <Badge
                          key={member.id}
                          variant="secondary"
                          className="flex items-center gap-2 py-1.5 pl-1.5 pr-2"
                        >
                          <Avatar className="h-5 w-5">
                            {member.imageUrl && <AvatarImage src={member.imageUrl} alt={member.fullName} />}
                            <AvatarFallback className="text-[10px]">{getUserInitials(member)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{member.fullName}</span>
                          <button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leader Section (only for new teams with members) */}
          {!isEditMode && selectedMembers.length > 0 && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold">
                    {t('teams.form.sections.leader')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('teams.form.sections.leaderDescription')}
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <FormField
                  control={form.control}
                  name="leaderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t('teams.form.fields.leader')}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value === 'none' ? null : value);
                          handlePreviewUpdate();
                        }}
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                            <SelectValue placeholder={t('teams.form.leaderSelect.placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">{t('teams.form.leaderSelect.noLeader')}</span>
                          </SelectItem>
                          {selectedMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  {member.imageUrl && <AvatarImage src={member.imageUrl} alt={member.fullName} />}
                                  <AvatarFallback className="text-[10px]">{getUserInitials(member)}</AvatarFallback>
                                </Avatar>
                                <span>{member.fullName}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        {t('teams.form.fields.leaderDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Settings Section (only for new teams) */}
          {!isEditMode && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold">
                    {t('teams.form.sections.settings')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('teams.form.sections.settingsDescription')}
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <FormField
                  control={form.control}
                  name="activateImmediately"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4 gap-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          {t('teams.form.fields.activateImmediately')}
                        </FormLabel>
                        <FormDescription className="text-xs">
                          {t('teams.form.fields.activateImmediatelyDescription')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="touch-manipulation"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="h-11 sm:h-10 min-h-11"
            >
              <X className="h-4 w-4 mr-2" />
              {t('teams.form.actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 sm:h-10 min-h-11"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? t('teams.form.actions.saving') : t('teams.form.actions.creating')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? t('teams.form.actions.save') : t('teams.form.actions.create')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
