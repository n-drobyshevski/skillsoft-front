import React from 'react';

interface EntityDetailLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function EntityDetailLayout({ children, className = '' }: EntityDetailLayoutProps) {
  return (
    <div className={`container mx-auto px-4 py-4 sm:px-6 sm:py-5 max-w-6xl ${className}`}>
      {children}
    </div>
  );
}