/**
 * Settings Page Loading State
 *
 * Shown during route transitions to the settings page.
 */

import { SettingsSkeleton } from './_components/SettingsSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className="container max-w-2xl py-6 px-4 sm:px-6">
      <div className="space-y-1 mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <SettingsSkeleton />
    </div>
  );
}
