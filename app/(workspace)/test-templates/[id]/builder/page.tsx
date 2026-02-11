import React from "react";
import { getTranslations } from "next-intl/server";
import { testTemplatesApi } from "@/services/api";
import { isReservedTestTemplateSegment } from "@/lib/routing-constants";
import { BlueprintWorkspace } from "./_components/BlueprintWorkspace";

interface BlueprintBuilderPageProps {
  params: Promise<{ id: string }>;
}

/**
 * BlueprintBuilder Page - Immersive IDE Layout
 * 
 * Route: /test-templates/[id]/builder
 * 
 * This page provides a full-screen, resizable IDE-like experience
 * for HR professionals to build assessment blueprints. Features:
 * - Resizable 3-panel layout (Library | Canvas | Simulator)
 * - Collapsible panels for "Focus Mode"
 * - Mobile-responsive tabs view
 * - Optimistic UI with drag-and-drop
 */
export default async function BlueprintBuilderPage({
  params,
}: BlueprintBuilderPageProps) {
  const { id } = await params;

  return <BlueprintWorkspace templateId={id} />;
}

/**
 * Metadata for the builder page with i18n support
 */
export async function generateMetadata({
  params,
}: BlueprintBuilderPageProps) {
  const { id } = await params;
  const t = await getTranslations("template.metadata");

  // Reject reserved route segments
  if (isReservedTestTemplateSegment(id)) {
    return {
      title: t("invalidRoute"),
      description: t("invalidRouteDescription"),
    };
  }

  const template = await testTemplatesApi.getTemplateById(id);

  return {
    title: template
      ? t("builder", { name: template.name })
      : t("testTemplate"),
    description: t("builderDescription"),
  };
}
