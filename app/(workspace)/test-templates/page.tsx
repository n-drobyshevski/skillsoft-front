import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { testTemplatesApi } from "@/services/api";
import { canCreateContent } from "@/services/roleApi";
import PageHeader from "@/components/common/PageHeader";
import TestTemplatesGrid from "./_components/TestTemplatesGrid";
import TestTemplatesGridSkeleton from "./_components/TestTemplatesGridSkeleton";
import ErrorDisplay from "./_components/ErrorDisplay";
import { ListFilter, History, Plus } from "lucide-react";
import { isApiError, getUserFriendlyMessage, ErrorCategory } from "@/types/errors";

export const metadata: Metadata = {
  title: "Шаблоны тестов - SkillSoft",
  description: "Выберите шаблон для оценки ваших компетенций. Каждый тест помогает определить ваш уровень владения определёнными навыками.",
  openGraph: {
    title: "Шаблоны тестов - SkillSoft",
    description: "Выберите шаблон для оценки ваших компетенций.",
  },
};

interface FetchResult {
  templates: Awaited<ReturnType<typeof testTemplatesApi.getActiveTemplates>>;
  error: string | null;
  errorCategory?: ErrorCategory;
  isRetryable?: boolean;
}

async function getActiveTemplates(): Promise<FetchResult> {
  try {
    const templates = await testTemplatesApi.getActiveTemplates();

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

// Async component for templates grid - streams after static shell
async function TemplatesContent({ canCreate }: { canCreate: boolean }) {
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
  
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted/50 p-4">
          <ListFilter className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-medium mt-4 mb-1">Нет доступных шаблонов</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Шаблоны тестов пока не добавлены. Проверьте позже или обратитесь к администратору.
        </p>
        {canCreate && (
          <Button asChild className="mt-4" size="sm">
            <Link href="/test-templates/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Создать шаблон
            </Link>
          </Button>
        )}
      </div>
    );
  }
  
  return <TestTemplatesGrid templates={templates} canEdit={canCreate} />;
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
      <PageHeader
        title="Шаблоны тестов"
        description="Выберите шаблон для оценки компетенций"
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/test-templates/history" className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto h-9 gap-1.5"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Мои результаты</span>
              <span className="sm:hidden">Результаты</span>
            </Button>
          </Link>
          {canCreate && (
            <Link href="/test-templates/new" className="flex-1 sm:flex-none">
              <Button
                size="sm"
                className="w-full sm:w-auto h-9 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Новый шаблон</span>
                <span className="sm:hidden">Создать</span>
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      {/* Dynamic content - streams after static shell */}
      <Suspense fallback={<TestTemplatesGridSkeleton />}>
        <TemplatesContent canCreate={canCreate} />
      </Suspense>
    </div>
  );
}
