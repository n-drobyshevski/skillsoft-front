import React from "react";
import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/common/PageHeader";
import TableSkeleton from "@/components/data-display/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for users page
 * Provides instant visual feedback during route loading
 */
export default async function Loading() {
  const t = await getTranslations('users');

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title={t('page.title')}
        description={t('page.description')}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] w-full" />
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
}
