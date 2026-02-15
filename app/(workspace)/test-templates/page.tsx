import React, { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getActiveTemplatesCached } from "@/services/api.cache.templates";
import { canCreateContent } from "@/services/roleApi";
import { templateSharingApi } from "@/services/api";
import TestTemplatesGridSkeleton from "./_components/TestTemplatesGridSkeleton";
import ErrorDisplay from "./_components/ErrorDisplay";
import { TemplatesPageHeader } from "./_components/TemplatesPageHeader";
import { TemplatesGridWrapper } from "./_components/TemplatesPageContent";
import { CatalogTabs } from "./_components/CatalogTabs";
import { isApiError, getUserFriendlyMessage, ErrorCategory } from "@/types/errors";
import type { SharedTemplatesResponse } from "@/types/domain";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.testTemplates");
  const siteName = "SkillSoft";

  return {
    title: `${t("title")} - ${siteName}`,
    description: t("description"),
    openGraph: {
      title: `${t("title")} - ${siteName}`,
      description: t("description"),
    },
  };
}

interface FetchResult {
  templates: Awaited<ReturnType<typeof getActiveTemplatesCached>>;
  error: string | null;
  errorCategory?: ErrorCategory;
  isRetryable?: boolean;
}

async function getActiveTemplates(): Promise<FetchResult> {
  try {
    const templates = await getActiveTemplatesCached();

    if (!Array.isArray(templates)) {
      return {
        templates: [],
        error: "Получены некорректные данные от сервера.",
        errorCategory: ErrorCategory.SERVER,
        isRetryable: true,
      };
    }

    return { templates, error: null };
  } catch (err) {
    // Handle ApiError with rich metadata
    if (isApiError(err)) {
      return {
        templates: [],
        error: err.message || getUserFriendlyMessage(err.category),
        errorCategory: err.category,
        isRetryable: err.isRetryable,
      };
    }

    // Handle generic errors
    const errorMessage = err instanceof Error
      ? err.message
      : "Произошла непредвиденная ошибка при загрузке шаблонов.";

    return {
      templates: [],
      error: errorMessage,
      errorCategory: ErrorCategory.UNKNOWN,
      isRetryable: true,
    };
  }
}

/**
 * Safely fetch shared templates, returning empty result on failure.
 */
async function getSharedTemplatesSafe(): Promise<SharedTemplatesResponse> {
  try {
    return await templateSharingApi.getSharedWithMe();
  } catch {
    return { items: [], total: 0 };
  }
}

// Editor/Admin: existing studio view (unchanged)
async function StudioContent() {
  const { templates, error, errorCategory, isRetryable } = await getActiveTemplates();

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        category={errorCategory}
        isRetryable={isRetryable}
      />
    );
  }

  return <TemplatesGridWrapper templates={templates} canEdit />;
}

// Personal lens: catalog with tabs (Available + Shared)
async function CatalogContent() {
  const [templatesResult, sharedResult] = await Promise.all([
    getActiveTemplates(),
    getSharedTemplatesSafe(),
  ]);

  if (templatesResult.error) {
    return (
      <ErrorDisplay
        message={templatesResult.error}
        category={templatesResult.errorCategory}
        isRetryable={templatesResult.isRetryable}
      />
    );
  }

  return (
    <CatalogTabs
      templates={templatesResult.templates}
      sharedItems={sharedResult.items}
      sharedTotal={sharedResult.total}
    />
  );
}

// Main component - Auth check then static shell with streaming content
export default async function TestsPage() {
  // Check authentication first (required before rendering)
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const canCreate = await canCreateContent();

  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 md:p-6">
      {/* Static header - part of static shell */}
      <TemplatesPageHeader canCreate={canCreate} />

      {/* Dynamic content - streams after static shell */}
      <Suspense fallback={<TestTemplatesGridSkeleton />}>
        {canCreate ? <StudioContent /> : <CatalogContent />}
      </Suspense>
    </div>
  );
}
