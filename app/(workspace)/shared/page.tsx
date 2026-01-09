import { Suspense } from 'react';
import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { templateSharingApi } from '@/services/api';
import { SharedPageHeader } from './_components/SharedPageHeader';
import { SharedTemplatesGrid } from './_components/SharedTemplatesGrid';
import { SharedTemplatesSkeleton } from './_components/SharedTemplatesSkeleton';
import { isApiError, getUserFriendlyMessage, ErrorCategory } from '@/types/errors';
import { AlertCircle, Share2 } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.shared');
  const siteName = 'SkillSoft';

  return {
    title: `${t('title')} - ${siteName}`,
    description: t('description'),
    openGraph: {
      title: `${t('title')} - ${siteName}`,
      description: t('description'),
    },
  };
}

interface FetchResult {
  items: Awaited<ReturnType<typeof templateSharingApi.getSharedWithMe>>['items'];
  total: number;
  error: string | null;
  errorCategory?: ErrorCategory;
  isRetryable?: boolean;
}

async function getSharedTemplates(): Promise<FetchResult> {
  try {
    const response = await templateSharingApi.getSharedWithMe();

    if (!response || !Array.isArray(response.items)) {
      return {
        items: [],
        total: 0,
        error: 'Received invalid data from server.',
        errorCategory: ErrorCategory.SERVER,
        isRetryable: true,
      };
    }

    return { items: response.items, total: response.total, error: null };
  } catch (err) {
    // Handle ApiError with rich metadata
    if (isApiError(err)) {
      return {
        items: [],
        total: 0,
        error: err.message || getUserFriendlyMessage(err.category),
        errorCategory: err.category,
        isRetryable: err.isRetryable,
      };
    }

    // Handle generic errors
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'An unexpected error occurred while loading shared templates.';

    return {
      items: [],
      total: 0,
      error: errorMessage,
      errorCategory: ErrorCategory.UNKNOWN,
      isRetryable: true,
    };
  }
}

// Error display component
function ErrorDisplay({
  message,
  isRetryable,
}: {
  message: string;
  category?: ErrorCategory;
  isRetryable?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-2">Unable to load shared templates</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
        {message}
      </p>
      {isRetryable && (
        <p className="text-xs text-muted-foreground">
          Try refreshing the page to try again.
        </p>
      )}
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg bg-muted/20">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Share2 className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-medium mb-2">No shared templates</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
        Templates shared with you by other users will appear here. Ask a
        colleague to share a template with you to get started.
      </p>
      <p className="text-xs text-muted-foreground/70 text-center max-w-sm">
        Note: This feature requires backend endpoint implementation.
        Shared templates will display once the API is available.
      </p>
    </div>
  );
}

// Async component for shared templates - streams after static shell
async function SharedContent() {
  const { items, total, error, errorCategory, isRetryable } =
    await getSharedTemplates();

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        category={errorCategory}
        isRetryable={isRetryable}
      />
    );
  }

  if (items.length === 0) {
    return <EmptyState />;
  }

  return <SharedTemplatesGrid items={items} total={total} />;
}

// Main component - Auth check then static shell with streaming content
export default async function SharedPage() {
  // Check authentication first (required before rendering)
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 md:p-6">
      {/* Static header - part of static shell */}
      <SharedPageHeader />

      {/* Dynamic content - streams after static shell */}
      <Suspense fallback={<SharedTemplatesSkeleton />}>
        <SharedContent />
      </Suspense>
    </div>
  );
}
