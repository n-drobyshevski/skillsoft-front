'use client';

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

interface Crumb {
  name: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  crumbs?: Crumb[];
}

export default function PageHeader({ 
  title, 
  description, 
  children,
  className = "",
  crumbs,
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 mobile-container ${className}`}>
      {crumbs && (
        <div className="overflow-hidden">
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap">
              {crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem className="text-sm">
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="hover:text-foreground transition-colors max-w-[120px] sm:max-w-none truncate">
                          {crumb.name}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="max-w-[120px] sm:max-w-none truncate">
                        {crumb.name}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < crumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground sm:text-base max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {children}
        </div>
      )}
    </div>
  );
}