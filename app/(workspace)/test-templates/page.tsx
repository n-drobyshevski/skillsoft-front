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
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="relative">
          {/* Decorative background circle */}
          <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-muted/40 to-muted/10 blur-2xl" />
          <div className="relative rounded-2xl bg-muted/30 p-6 backdrop-blur-sm border border-border/50">
            <ListFilter className="h-12 w-12 text-muted-foreground/60 mx-auto" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">Нет доступных шаблонов</h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
          В данный момент нет активных шаблонов тестов. Пожалуйста, проверьте позже или
          обратитесь к администратору.
        </p>
        {canCreate && (
          <Button asChild className="mt-6 shadow-sm hover:shadow-md transition-all" size="lg">
            <Link href="/test-templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Создать первый шаблон
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
    <div className="flex flex-1 flex-col gap-4 p-3 pt-4 sm:p-4 sm:pt-6 md:gap-6 md:p-6">
      {/* Static header - part of static shell */}
      <PageHeader
        title="Шаблоны тестов"
        description="Выберите шаблон для оценки ваших компетенций. Каждый тест помогает определить ваш уровень владения определёнными навыками."
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link href="/test-templates/history" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto min-h-10 sm:min-h-0 gap-2 hover:bg-accent/50 transition-colors"
            >
              <History className="h-4 w-4" />
              <span>Мои результаты</span>
            </Button>
          </Link>
          {canCreate && (
            <Link href="/test-templates/new" className="w-full sm:w-auto">
              <Button
                size="sm"
                className="w-full sm:w-auto min-h-10 sm:min-h-0 gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Новый шаблон</span>
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
