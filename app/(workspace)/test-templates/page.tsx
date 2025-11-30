import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { testTemplatesApi } from "@/services/api";
import { canCreateContent } from "@/services/roleApi";
import PageHeader from "@/components/PageHeader";
import TestTemplatesGrid from "./components/TestTemplatesGrid";
import TestTemplatesGridSkeleton from "./components/TestTemplatesGridSkeleton";
import { ListFilter, History, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Шаблоны тестов - SkillSoft",
  description: "Выберите шаблон для оценки ваших компетенций. Каждый тест помогает определить ваш уровень владения определёнными навыками.",
  openGraph: {
    title: "Шаблоны тестов - SkillSoft",
    description: "Выберите шаблон для оценки ваших компетенций.",
  },
};

async function getActiveTemplates() {
  try {
    const templates = await testTemplatesApi.getActiveTemplates();
    if (!Array.isArray(templates)) {
      return { templates: [], error: "Invalid data format from server." };
    }
    return { templates, error: null };
  } catch (error: unknown) {
    // Check for authentication error
    const apiError = error as { status?: number; message?: string };
    if (apiError?.status === 403 || apiError?.status === 401) {
      return { templates: [], error: "auth_required" };
    }
    // eslint-disable-next-line no-console
    console.error("Failed to fetch test templates:", error);
    return { templates: [], error: "Failed to load available tests." };
  }
}

export default async function TestsPage() {
  // Check authentication first
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const [{ templates, error }, canCreate] = await Promise.all([
    getActiveTemplates(),
    canCreateContent(),
  ]);

  // If we got an auth error even after Clerk check, redirect
  if (error === "auth_required") {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title="Шаблоны тестов"
        description="Выберите шаблон для оценки ваших компетенций. Каждый тест помогает определить ваш уровень владения определёнными навыками."
      >
        <div className="flex items-center gap-2">
          <Link href="/test-templates/history">
            <Button variant="outline" size="sm">
              <History className="mr-2 h-4 w-4" />
              Мои результаты
            </Button>
          </Link>
          {canCreate && (
            <Link href="/test-templates/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Новый шаблон
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">{error}</p>
          <p className="text-xs mt-1 opacity-80">
            Попробуйте обновить страницу или обратитесь к администратору.
          </p>
        </div>
      )}

      {!error && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <ListFilter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Нет доступных шаблонов</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            В данный момент нет активных шаблонов тестов. Пожалуйста, проверьте позже или
            обратитесь к администратору.
          </p>
        </div>
      )}

      <Suspense fallback={<TestTemplatesGridSkeleton />}>
        <TestTemplatesGrid templates={templates} canEdit={canCreate} />
      </Suspense>
    </div>
  );
}
