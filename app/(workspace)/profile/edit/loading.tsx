import { Pencil } from 'lucide-react';
import { ProfileEditSkeleton } from './_components/ProfileEditSkeleton';

export default function ProfileEditLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Page Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Pencil className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Редактировать профиль
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Обновите личные данные и настройки
          </p>
        </header>

        {/* Loading Skeleton */}
        <ProfileEditSkeleton />
      </div>
    </div>
  );
}
