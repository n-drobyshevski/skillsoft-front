import React, { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { canCreateContent } from "@/services/roleApi";
import { competenciesApi } from "@/services/api";
import NewTestForm from "./_components/NewTestForm";
import { NewTestPageHeader } from "./_components/NewTestPageHeader";
import Loading from "./loading";

/**
 * Async data-fetching component for the new test form.
 * Handles auth checks and competency loading.
 */
async function NewTestFormData() {
  // Check authentication and authorization
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const canCreate = await canCreateContent();

  if (!canCreate) {
    redirect("/test-templates");
  }

  // Fetch competencies for the form (including standardCodes for Big Five mapping)
  let competencies: Array<{
    id: string;
    name: string;
    category: string;
    standardCodes?: { bigFiveRef?: { trait?: string } };
  }> = [];

  try {
    const allCompetencies = await competenciesApi.getAllCompetencies();
    if (Array.isArray(allCompetencies)) {
      competencies = allCompetencies
        .filter(c => c.isActive)
        .map(c => ({
          id: c.id,
          name: c.name,
          category: c.category,
          standardCodes: c.standardCodes,
        }));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch competencies:", error);
  }

  return <NewTestForm competencies={competencies} />;
}

export default async function NewTestPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <NewTestPageHeader />

      <Suspense fallback={<Loading />}>
        <NewTestFormData />
      </Suspense>
    </div>
  );
}
