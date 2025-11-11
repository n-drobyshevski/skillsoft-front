import React from 'react';

interface EntityDetailLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function EntityDetailLayout({ children, className = '' }: EntityDetailLayoutProps) {
  return (
    <div className={`container mx-auto p-6 max-w-7xl ${className}`}>
      {children}
    </div>
  );
}