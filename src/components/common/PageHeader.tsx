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
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl break-words">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground sm:text-base max-w-4xl break-words leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}