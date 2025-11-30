import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { canCreateContent } from "@/services/roleApi";
import { competenciesApi, testTemplatesApi } from "@/services/api";
import EditTestForm from "./_components/EditTestForm";

interface EditTestPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestPage({ params }: EditTestPageProps) {
  const { id } = await params;
  
  // Check authentication and authorization
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const canEdit = await canCreateContent();
  
  if (!canEdit) {
    redirect(`/test-templates/${id}`);
  }

  // Fetch template and competencies in parallel
  const [template, allCompetencies] = await Promise.all([
    testTemplatesApi.getTemplateById(id),
    competenciesApi.getAllCompetencies(),
  ]);

  if (!template) {
    notFound();
  }

  // Prepare competencies for the form
  const competencies = Array.isArray(allCompetencies)
    ? allCompetencies
        .filter(c => c.isActive)
        .map(c => ({ id: c.id, name: c.name, category: c.category }))
    : [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <EditTestForm template={template} competencies={competencies} />
    </div>
  );
}
