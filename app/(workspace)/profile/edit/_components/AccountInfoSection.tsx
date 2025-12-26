'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User as UserIcon,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { updateProfileAction } from '../_actions/profile-actions';
import type { ProfileUserInfo } from '@/types/profile';

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
 */
export function AccountInfoSection({ userInfo }: AccountInfoSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      organization: userInfo.organizationName || '',
    },
  });

  const onSubmit = async (data: ProfileEditFormData) => {
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfileAction(userInfo.clerkId, data);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Redirect after short delay
        setTimeout(() => {
          router.push('/profile');
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    });
  };

  const initials = `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`.toUpperCase() || 'U';

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
            <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">Личная информация</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Обновите ваши персональные данные
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Message Alert */}
          {message && (
            <Alert
              variant={message.type === 'error' ? 'destructive' : 'default'}
              className={message.type === 'success' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : ''}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : ''}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-muted">
              {userInfo.avatarUrl ? (
                <Image
                  src={userInfo.avatarUrl}
                  alt={`${userInfo.firstName} ${userInfo.lastName}`}
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
              <p>Аватар управляется через Clerk.</p>
              <p>Изменить можно в настройках аккаунта.</p>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Введите имя"
                disabled={isPending}
                aria-invalid={!!errors.firstName}
                className={errors.firstName ? ERROR_BORDER_CLASS : ''}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Введите фамилию"
                disabled={isPending}
                aria-invalid={!!errors.lastName}
                className={errors.lastName ? ERROR_BORDER_CLASS : ''}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={userInfo.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email нельзя изменить здесь. Обновите через настройки Clerk.
            </p>
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label htmlFor="organization">Организация</Label>
            <Input
              id="organization"
              {...register('organization')}
              placeholder="Название организации (опционально)"
              disabled={isPending}
              className={errors.organization ? ERROR_BORDER_CLASS : ''}
            />
            {errors.organization && (
              <p className="text-xs text-destructive">{errors.organization.message}</p>
            )}
          </div>

          {/* Submit Buttons - Sticky on mobile for accessibility */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t sticky bottom-0 bg-card pb-2 -mx-3 px-3 sm:relative sm:mx-0 sm:px-0 sm:pb-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/profile')}
              disabled={isPending}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isDirty}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
