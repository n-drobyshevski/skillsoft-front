"use client";

import React, { useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FileText, Send, GitBranch, ChevronRight, Loader2, Play, Eye, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioHeader } from "@/context/StudioHeaderContext";
import { publishTemplate, createNewVersion } from "../actions";
import { ShareDialog } from "./sharing";

export type TemplateStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface TemplateHubHeaderProps {
  templateId: string;
  templateName: string;
  status: TemplateStatus;
}

/**
 * Status badge styling based on template status
 */
function getStatusBadgeVariant(status: TemplateStatus) {
  switch (status) {
    case "DRAFT":
      return "outline";
    case "PUBLISHED":
      return "default";
    case "ARCHIVED":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusColorClasses(status: TemplateStatus) {
  switch (status) {
    case "DRAFT":
      return "border-yellow-500/50 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30";
    case "PUBLISHED":
      return "border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/30";
    case "ARCHIVED":
      return "border-gray-500/50 text-gray-500 bg-gray-100 dark:bg-gray-800/50";
    default:
      return "";
  }
}

/**
 * Client component to set the template hub header via StudioHeaderContext
 * Renders breadcrumb with status badge and action buttons
 */
export function TemplateHubHeader({
  templateId,
  templateName,
  status,
}: TemplateHubHeaderProps) {
  const { setHeader, resetHeader } = useStudioHeader();
  const [isPending, startTransition] = useTransition();

  const handlePublish = useCallback(() => {
    startTransition(async () => {
      await publishTemplate(templateId);
    });
  }, [templateId]);

  const handleNewVersion = useCallback(() => {
    startTransition(async () => {
      await createNewVersion(templateId);
    });
  }, [templateId]);

  useEffect(() => {
    setHeader({
      title: templateName,
      description: undefined,
      actions: (
        <div className="flex items-center gap-3">
          {/* Breadcrumb navigation */}
          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/test-templates"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Шаблоны</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2 font-medium">
                  <span className="max-w-[150px] truncate">{templateName}</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Status Badge */}
          <Badge
            variant={getStatusBadgeVariant(status)}
            className={cn("text-xs font-medium", getStatusColorClasses(status))}
          >
            {status === "DRAFT" ? "Черновик" : status === "PUBLISHED" ? "Опубликован" : "В архиве"}
          </Badge>

          {/* Quick Actions Toolbar */}
          <div className="flex items-center gap-1 border-l border-r px-2 mx-1 border-border/50">
             <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" asChild>
                <Link href={`/test-templates/${templateId}/builder?mode=simulate`}>
                    <Play className="h-3.5 w-3.5" />
                    Simulate
                </Link>
             </Button>
             <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" asChild>
                <Link href={`/test-templates/${templateId}/start?mode=test-drive`}>
                    <Eye className="h-3.5 w-3.5" />
                    Test Drive
                </Link>
             </Button>
             <ShareDialog
                templateId={templateId}
                templateName={templateName}
                isOwner={true}
                canManage={true}
                trigger={
                  <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
                    <Share2 className="h-3.5 w-3.5" />
                    Поделиться
                  </Button>
                }
             />
          </div>

          {/* Action Buttons */}
          {status === "DRAFT" && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Опубликовать
            </Button>
          )}

          {status === "PUBLISHED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleNewVersion}
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GitBranch className="h-4 w-4" />
              )}
              Новая версия
            </Button>
          )}
        </div>
      ),
    });

    return () => {
      resetHeader();
    };
  }, [templateName, status, isPending, handlePublish, handleNewVersion, setHeader, resetHeader]);

  return null;
}
