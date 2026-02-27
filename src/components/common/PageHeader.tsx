import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** 'document' uses semibold, 'dashboard' uses bold. Default: 'document' */
  variant?: 'document' | 'dashboard';
}

export default function PageHeader({
  title,
  description,
  children,
  className = "",
  variant = "document",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <h2 className={cn(
            "text-xl tracking-tight sm:text-2xl md:text-3xl break-words",
            variant === 'dashboard' ? 'font-bold' : 'font-semibold'
          )}>
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