'use client';

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTemplateSummary } from "@/app/interfaces/domain-interfaces";
import { Clock, Target, ArrowRight, BookOpen, CheckCircle2, Pencil } from "lucide-react";

interface TestTemplatesGridProps {
  templates: TestTemplateSummary[];
  canEdit?: boolean;
}

export default function TestTemplatesGrid({ templates, canEdit = false }: TestTemplatesGridProps) {
  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TestTemplateCard key={template.id} template={template} canEdit={canEdit} />
      ))}
    </div>
  );
}

interface TestTemplateCardProps {
  template: TestTemplateSummary;
  canEdit?: boolean;
}

function TestTemplateCard({ template, canEdit = false }: TestTemplateCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight line-clamp-2">
            {template.name}
          </CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            {canEdit && (
              <Link href={`/test-templates/${template.id}/edit`}>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Редактировать">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
            <Badge variant="secondary">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Активен
            </Badge>
          </div>
        </div>
        {template.description && (
          <CardDescription className="line-clamp-2 mt-1">
            {template.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{formatDuration(template.timeLimitMinutes)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4 shrink-0" />
            <span>{template.passingScore}% для сдачи</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>{template.competencyCount} компетенций</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Link href={`/test-templates/${template.id}`} className="w-full">
          <Button className="w-full group">
            Подробнее
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
