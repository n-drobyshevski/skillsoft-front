import { Suspense } from "react";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Skeleton } from "@/components/ui/skeleton";
import { LANDING_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * Content skeleton for initial page load
 */
function ContentSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Public Layout
 *
 * Layout for public routes that don't require authentication.
 * Currently used for documentation pages and anonymous test taking.
 *
 * Provides scoped i18n messages including shared namespaces plus
 * landing, anonymousTest, and assessment-related namespaces.
 *
 * Note: This layout does NOT include sidebar/header since docs have
 * their own navigation. It provides a minimal wrapper for public content.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    LANDING_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<ContentSkeleton />}>
          {children}
        </Suspense>
      </div>
    </NextIntlClientProvider>
  );
}
