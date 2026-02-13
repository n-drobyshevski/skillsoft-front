'use client';

import { useTransition, useEffect, useState, useRef, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  User as UserIcon,
  Save,
  Loader2,
  RotateCcw,
  Info,
  X,
} from 'lucide-react';
import { updateProfileAction } from '../_actions/profile-actions';
import type { ProfileUserInfo } from '@/types/profile';
import { useScreenReader } from '@/components/common/ScreenReaderAnnounce';

// ============================================
// VALIDATION SCHEMA
// ============================================

const profileEditSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Имя обязательно')
    .max(50, 'Имя не должно превышать 50 символов'),
  lastName: z
    .string()
    .min(1, 'Фамилия обязательна')
    .max(50, 'Фамилия не должна превышать 50 символов'),
  organization: z
    .string()
    .max(100, 'Название организации не должно превышать 100 символов')
    .optional()
    .or(z.literal('')),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

// Error class for invalid inputs
const ERROR_BORDER_CLASS = 'border-destructive';

// Storage key prefix for draft
const STORAGE_KEY_PREFIX = 'profile-edit-draft';

// ============================================
// DEBOUNCE UTILITY
// ============================================

/**
 * Custom hook for debouncing a value.
 * Returns the debounced value after the specified delay.
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// FORM AUTOSAVE HOOK
// ============================================

interface UseFormAutosaveReturn {
  hasDraft: boolean;
  clearDraft: () => void;
  discardDraft: () => void;
  dismissDraftBanner: () => void;
  showDraftBanner: boolean;
}

/**
 * Loads draft from localStorage if it exists and differs from defaults.
 * Returns the draft data and whether a draft was found.
 */
function loadDraftFromStorage(
  fullStorageKey: string,
  defaultValues: ProfileEditFormData
): { draft: ProfileEditFormData | null; hasDraft: boolean } {
  try {
    const storedDraft = localStorage.getItem(fullStorageKey);
    if (storedDraft) {
      const parsed = JSON.parse(storedDraft) as ProfileEditFormData;
      const isDifferent =
        parsed.firstName !== defaultValues.firstName ||
        parsed.lastName !== defaultValues.lastName ||
        parsed.organization !== defaultValues.organization;

      if (isDifferent) {
        return { draft: parsed, hasDraft: true };
      }
      // Draft is same as defaults, clear it
      localStorage.removeItem(fullStorageKey);
    }
  } catch {
    // Invalid JSON in storage, remove it
    localStorage.removeItem(fullStorageKey);
  }
  return { draft: null, hasDraft: false };
}

/**
 * Custom hook for auto-saving form drafts to localStorage.
 *
 * Features:
 * - Auto-saves form data on every change (debounced 500ms)
 * - Restores draft on component mount if exists
 * - Clears draft on successful submission
 * - Shows indicator when draft is restored
 * - Allows user to discard draft
 */
function useFormAutosave(
  form: UseFormReturn<ProfileEditFormData>,
  storageKey: string,
  userId: string,
  defaultValues: ProfileEditFormData
): UseFormAutosaveReturn {
  // Build the full storage key with user ID
  const fullStorageKey = `${storageKey}-${userId}`;

  // Initialize state from localStorage synchronously to avoid flicker
  const [draftState] = useState(() => loadDraftFromStorage(fullStorageKey, defaultValues));
  const [hasDraft, setHasDraft] = useState(draftState.hasDraft);
  const [showDraftBanner, setShowDraftBanner] = useState(draftState.hasDraft);
  const isInitializedRef = useRef(false);

  // Watch all form values for changes
  const values = useWatch({ control: form.control });

  // Debounce the values for saving
  const debouncedValues = useDebouncedValue(
    JSON.stringify(values),
    500
  );

  // Load draft on mount (one-time initialization)
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (draftState.draft) {
      form.reset(draftState.draft, { keepDefaultValues: true });
    }
  }, [draftState.draft, form]);

  // Save draft when debounced values change and form is dirty
  useEffect(() => {
    if (!isInitializedRef.current || !form.formState.isDirty) return;

    try {
      localStorage.setItem(fullStorageKey, debouncedValues);
    } catch {
      // localStorage might be full or unavailable - silently fail
    }
  }, [debouncedValues, form.formState.isDirty, fullStorageKey]);

  // Clear draft from storage
  const clearDraft = () => {
    localStorage.removeItem(fullStorageKey);
    setHasDraft(false);
    setShowDraftBanner(false);
  };

  // Discard draft and reset form to original values
  const discardDraft = () => {
    clearDraft();
    form.reset(defaultValues);
  };

  // Dismiss the draft banner without discarding
  const dismissDraftBanner = () => {
    setShowDraftBanner(false);
  };

  return { hasDraft, clearDraft, discardDraft, dismissDraftBanner, showDraftBanner };
}

// ============================================
// UNSAVED CHANGES HOOK
// ============================================

interface UseUnsavedChangesWarningReturn {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
  handleCancelClick: () => void;
}

/**
 * Custom hook to warn users about unsaved changes when navigating away.
 * Handles both browser navigation (beforeunload) and in-app link clicks.
 */
function useUnsavedChangesWarning(
  isDirty: boolean,
  router: ReturnType<typeof useRouter>,
  clearDraft: () => void
): UseUnsavedChangesWarningReturn {
  const [showDialog, setShowDialog] = useState(false);

  // Handle browser beforeunload event (refresh, close tab, browser back)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Confirm navigation - clear draft and navigate to profile
  const confirmNavigation = () => {
    setShowDialog(false);
    clearDraft();
    router.push('/profile');
  };

  // Cancel navigation - close dialog
  const cancelNavigation = () => {
    setShowDialog(false);
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    if (isDirty) {
      setShowDialog(true);
    } else {
      router.push('/profile');
    }
  };

  return {
    showDialog,
    setShowDialog,
    confirmNavigation,
    cancelNavigation,
    handleCancelClick,
  };
}

// ============================================
// COMPONENT
// ============================================

interface AccountInfoSectionProps {
  userInfo: ProfileUserInfo;
}

/**
 * Account Info Section - Editable personal information
 *
 * Features:
 * - Avatar display (not editable - managed by Clerk)
 * - First/Last name fields with validation
 * - Email (read-only)
 * - Organization field
 * - Save/Cancel actions
 * - Auto-save draft to localStorage
 * - Draft restoration on page reload
 * - Unsaved changes warning dialog when navigating away
 */
export function AccountInfoSection({ userInfo }: AccountInfoSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('profile.edit');
  const tCommon = useTranslations('common');
  const { announce } = useScreenReader();

  // Optimistic state for immediate UI feedback during form submission
  // When the user saves, we update the display immediately while the server action runs
  // If the action fails, useOptimistic automatically reverts to the original state
  const [optimisticUserInfo, setOptimisticUserInfo] = useOptimistic(
    userInfo,
    (state, newData: Partial<ProfileUserInfo>) => ({
      ...state,
      ...newData,
    })
  );

  // Default form values from user info
  const defaultValues: ProfileEditFormData = {
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    organization: userInfo.organizationName || '',
  };

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues,
  });

  const { register, handleSubmit, formState: { errors, isDirty } } = form;

  // Announce form errors to screen readers
  useEffect(() => {
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      const message = errorCount === 1
        ? t('messages.formHasError')
        : t('messages.formHasErrors', { count: errorCount });
      announce(message, 'assertive');
    }
  }, [errors, announce, t]);

  // Auto-save hook
  const {
    hasDraft,
    clearDraft,
    discardDraft,
    dismissDraftBanner,
    showDraftBanner
  } = useFormAutosave(form, STORAGE_KEY_PREFIX, userInfo.clerkId, defaultValues);

  // Unsaved changes warning hook
  const {
    showDialog,
    confirmNavigation,
    cancelNavigation,
    handleCancelClick,
  } = useUnsavedChangesWarning(isDirty, router, clearDraft);

  const onSubmit = async (data: ProfileEditFormData) => {
    const toastId = toast.loading(tCommon('saving'));

    startTransition(async () => {
      // Optimistically update the UI immediately for instant feedback
      // The avatar initials and any other displays will update right away
      setOptimisticUserInfo({
        firstName: data.firstName,
        lastName: data.lastName,
        organizationName: data.organization || null,
      });

      const result = await updateProfileAction(userInfo.clerkId, data);

      if (result.success) {
        // Clear draft on successful save
        clearDraft();
        toast.success(t('messages.saveSuccess'), { id: toastId });
        router.push('/profile');
        router.refresh();
      } else {
        // Note: useOptimistic automatically reverts the state when used with startTransition
        // The optimisticUserInfo will revert to the original userInfo on failure
        toast.error(t('messages.saveError'), {
          id: toastId,
          description: result.message,
        });
      }
    });
  };

  const handleDiscardDraft = () => {
    discardDraft();
    toast.info(t('messages.draftDiscarded'));
  };

  // Use optimistic state for display values - this updates immediately on submit
  // and automatically reverts if the server action fails
  const initials = `${optimisticUserInfo.firstName.charAt(0)}${optimisticUserInfo.lastName.charAt(0)}`.toUpperCase() || 'U';

  // Suppress unused variable warning - hasDraft is used for conditional logic
  void hasDraft;

  return (
    <>
      <Card>
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
              <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg truncate">{t('account.title')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('account.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-3 sm:px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Draft Restored Banner */}
            {showDraftBanner && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="flex items-center justify-between gap-2 text-blue-700 dark:text-blue-300">
                  <span>{t('messages.draftRestored')}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                    onClick={dismissDraftBanner}
                    aria-label={tCommon('close')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Avatar Section - Uses optimistic values for instant feedback */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-muted">
                {optimisticUserInfo.avatarUrl ? (
                  <Image
                    src={optimisticUserInfo.avatarUrl}
                    alt={`${optimisticUserInfo.firstName} ${optimisticUserInfo.lastName}`}
                    width={64}
                    height={64}
                    className="aspect-square h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-sm text-muted-foreground">
                <p>{t('account.avatarManaged')}</p>
                <p>{t('account.changeInSettings')}</p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('account.firstName')}</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder={t('account.firstNamePlaceholder')}
                  disabled={isPending}
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  className={errors.firstName ? ERROR_BORDER_CLASS : ''}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-xs text-destructive" role="alert">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('account.lastName')}</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder={t('account.lastNamePlaceholder')}
                  disabled={isPending}
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  className={errors.lastName ? ERROR_BORDER_CLASS : ''}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-xs text-destructive" role="alert">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('account.email')}</Label>
              <Input
                id="email"
                value={userInfo.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {t('account.emailReadOnly')}
              </p>
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <Label htmlFor="organization">{t('account.organization')}</Label>
              <Input
                id="organization"
                {...register('organization')}
                placeholder={t('account.organizationPlaceholder')}
                disabled={isPending}
                aria-invalid={!!errors.organization}
                aria-describedby={errors.organization ? 'organization-error' : undefined}
                className={errors.organization ? ERROR_BORDER_CLASS : ''}
              />
              {errors.organization && (
                <p id="organization-error" className="text-xs text-destructive" role="alert">
                  {errors.organization.message}
                </p>
              )}
            </div>

            {/* Submit Buttons - Sticky on mobile for accessibility */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t sticky bottom-0 bg-card pb-2 -mx-3 px-3 sm:relative sm:mx-0 sm:px-0 sm:pb-0">
              {/* Discard Draft Button - Only show when form is dirty */}
              {isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDiscardDraft}
                  disabled={isPending}
                  className="w-full sm:w-auto min-h-[44px] text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('messages.discardChanges')}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelClick}
                disabled={isPending}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {t('actions.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !isDirty}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('actions.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('actions.save')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={showDialog} onOpenChange={cancelNavigation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.unsavedChanges')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.unsavedChangesDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>
              {t('messages.keepEditing')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmNavigation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('messages.discardChanges')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
