"use client";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { useHeader } from "@/context/HeaderContext";
import { useBreadcrumbs } from "@/lib/breadcrumbs";

export default function Header() {
  const { title, subtitle, entityName } = useHeader();
  const { breadcrumbs } = useBreadcrumbs();
  return (
    <header className="@container/page-header sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 @md/page-header:static @md/page-header:h-auto @md/page-header:border-0 @md/page-header:bg-transparent @md/page-header:px-6 py-3 @md/page-header:py-4 mb-4 w-full">
      {/* Mobile sidebar trigger */}
      <div className="flex @md/page-header:hidden">
        <SidebarTrigger 
          className="h-9 w-9 p-0 touch-target focus-mobile" 
          aria-label="Toggle navigation menu"
        />
      </div>
      
      <div className="flex flex-col w-full min-w-0">
        {breadcrumbs && (
          <Breadcrumb className="hidden @md/page-header:flex mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="flex flex-col @sm/page-header:flex-row @sm/page-header:items-center justify-between gap-3 @sm/page-header:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl @sm/page-header:text-2xl font-bold tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm @sm/page-header:text-base truncate">{subtitle}</p>
            )}
          </div>
          {entityName && (
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                className="h-11 min-w-11 text-xs @sm/page-header:text-sm touch-target focus-mobile"
                aria-label={`Export ${entityName} data`}
              >
                <Download className="mr-1 @sm/page-header:mr-2 h-3 w-3 @sm/page-header:h-4 @sm/page-header:w-4" aria-hidden="true" />
                <span className="hidden @xs/page-header:inline">Export</span>
              </Button>
              <Button 
                size="sm"
                className="h-11 min-w-11 text-xs @sm/page-header:text-sm touch-target focus-mobile"
                aria-label={`Create new ${entityName}`}
              >
                <Plus className="mr-1 @sm/page-header:mr-2 h-3 w-3 @sm/page-header:h-4 @sm/page-header:w-4" aria-hidden="true" />
                <span className="hidden @xs/page-header:inline">New</span>
                <span className="@xs/page-header:hidden">{entityName.charAt(0)}</span>
                <span className="hidden @xs/page-header:inline"> {entityName}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
