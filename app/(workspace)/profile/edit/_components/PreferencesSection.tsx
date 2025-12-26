'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Bell, Globe, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { updatePreferencesAction } from '../_actions/profile-actions';
import type { ProfileUserInfo } from '@/types/profile';

interface PreferencesSectionProps {
  userInfo: ProfileUserInfo;
}

interface UserPreferences {
  language: 'ru' | 'en';
  emailNotifications: boolean;
  assessmentReminders: boolean;
}

/**
 * Preferences Section - User settings
 *
 * Features:
 * - Language selection (Russian/English)
 * - Email notifications toggle
 * - Assessment reminders toggle
 * - Auto-save on change
 */
export function PreferencesSection({ userInfo }: PreferencesSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get initial preferences from user metadata
  const initialPrefs: UserPreferences = {
    language: 'ru',
    emailNotifications: true,
    assessmentReminders: true,
  };

  const [preferences, setPreferences] = useState<UserPreferences>(initialPrefs);

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean | string) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    setMessage(null);

    startTransition(async () => {
      const result = await updatePreferencesAction(userInfo.clerkId, newPrefs);

      if (result.success) {
        setMessage({ type: 'success', text: 'Настройки сохранены' });
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.message });
        // Revert on error
        setPreferences(preferences);
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5  rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0">
            <Settings className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">Настройки</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Управляйте уведомлениями и языком
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6 overflow-hidden">
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

        {/* Language Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <Label htmlFor="language" className="text-xs sm:text-sm font-medium">
                Язык интерфейса
              </Label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Выберите язык отображения
              </p>
            </div>
          </div>
          <Select
            value={preferences.language}
            onValueChange={(value) => handlePreferenceChange('language', value)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full sm:w-[180px] min-h-[44px]" id="language">
              <SelectValue placeholder="Выберите язык" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru" className="min-h-[44px]">Русский</SelectItem>
              <SelectItem value="en" className="min-h-[44px]">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-border" />

        {/* Email Notifications - Pure shadcn/ui Switch pattern */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 min-h-[44px] py-1 overflow-hidden">
          <Label
            htmlFor="emailNotifications"
            className="flex items-center gap-2 sm:gap-3 min-w-0 w-full cursor-pointer overflow-hidden"
          >
            <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="text-xs sm:text-sm font-medium block truncate">
                Email-уведомления
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 block">
                Получать уведомления о результатах тестов
              </span>
            </div>
          </Label>
          <div className="flex items-center gap-2 shrink-0">
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Switch
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Assessment Reminders - Pure shadcn/ui Switch pattern */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 min-h-[44px] py-1 overflow-hidden">
          <Label
            htmlFor="assessmentReminders"
            className="flex items-center gap-2 sm:gap-3 min-w-0 w-full  cursor-pointer overflow-hidden"
          >
            <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="text-xs sm:text-sm font-medium block truncate">
                Напоминания об оценках
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 block">
                Получать напоминания о назначенных оценках
              </span>
            </div>
          </Label>
          <div className="flex items-center gap-2 shrink-0">
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Switch
              id="assessmentReminders"
              checked={preferences.assessmentReminders}
              onCheckedChange={(checked) => handlePreferenceChange('assessmentReminders', checked)}
              disabled={isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
