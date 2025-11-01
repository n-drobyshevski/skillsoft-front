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
    <div className={`flex flex-col gap-4 px-4 lg:px-6 mobile-container ${className}`}>
      {crumbs && (
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.name}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < crumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}