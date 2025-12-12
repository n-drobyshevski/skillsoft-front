'use client';

import React from "react";
import { TestTemplateSummary } from "@/types/domain";
import TestTemplateCard from "./TestTemplateCard";

interface TestTemplatesGridProps {
  templates: TestTemplateSummary[];
  canEdit?: boolean;
}

export default function TestTemplatesGrid({ templates, canEdit = false }: TestTemplatesGridProps) {
  if (!templates || templates.length === 0) {
    return null;
  }

  // Mark the first active template as recommended (can customize logic)
  const recommendedTemplateId = templates.length > 0 ? templates[0]?.id : null;

  return (
    <div className="grid gap-5 sm:gap-6 md:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {templates.map((template) => (
        <TestTemplateCard
          key={template.id}
          template={template}
          canEdit={canEdit}
          isRecommended={template.id === recommendedTemplateId}
        />
      ))}
    </div>
  );
}
