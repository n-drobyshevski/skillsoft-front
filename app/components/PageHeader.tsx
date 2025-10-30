"use client";

import React from "react";

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
  className = ""
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 px-4 lg:px-6 mobile-container ${className}`}>
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