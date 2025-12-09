import React from "react";
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
 * Metadata for the builder page
 */
export async function generateMetadata({
  params,
}: BlueprintBuilderPageProps) {
  const { id } = await params;
  return {
    title: `Blueprint Builder | Template ${id}`,
    description: "Build and configure assessment blueprints",
  };
}
