'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ 
  title, 
  description, 
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 mobile-container ${className}`}>
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