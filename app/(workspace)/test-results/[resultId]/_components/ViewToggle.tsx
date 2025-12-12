"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  defaultView?: 'compact' | 'detailed';
  onViewChange?: (view: 'compact' | 'detailed') => void;
}

/**
 * ViewToggle Component
 *
 * Allows users to switch between compact and detailed views
 * Persists preference in localStorage
 */
export function ViewToggle({ defaultView = 'compact', onViewChange }: ViewToggleProps) {
  const [view, setView] = useState<'compact' | 'detailed'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('test-results-view') as 'compact' | 'detailed') || defaultView;
    }
    return defaultView;
  });

  const handleToggle = () => {
    const newView = view === 'compact' ? 'detailed' : 'compact';
    setView(newView);

    if (typeof window !== 'undefined') {
      localStorage.setItem('test-results-view', newView);
    }

    if (onViewChange) {
      onViewChange(newView);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">View:</span>
      <div className="flex items-center gap-1 rounded-md border p-1 bg-muted/30">
        <Button
          variant={view === 'compact' ? 'default' : 'ghost'}
          size="sm"
          onClick={handleToggle}
          disabled={view === 'compact'}
          className={cn(
            "h-7 text-xs gap-1.5",
            view === 'compact' && "pointer-events-none"
          )}
        >
          <Minimize2 className="h-3.5 w-3.5" />
          Compact
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">Recommended</Badge>
        </Button>
        <Button
          variant={view === 'detailed' ? 'default' : 'ghost'}
          size="sm"
          onClick={handleToggle}
          disabled={view === 'detailed'}
          className={cn(
            "h-7 text-xs gap-1.5",
            view === 'detailed' && "pointer-events-none"
          )}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Detailed
        </Button>
      </div>
    </div>
  );
}

/**
 * Hook for managing view preference
 */
export function useViewPreference(defaultView: 'compact' | 'detailed' = 'compact') {
  const [view, setView] = useState<'compact' | 'detailed'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('test-results-view') as 'compact' | 'detailed') || defaultView;
    }
    return defaultView;
  });

  const toggleView = (newView?: 'compact' | 'detailed') => {
    const nextView = newView || (view === 'compact' ? 'detailed' : 'compact');
    setView(nextView);

    if (typeof window !== 'undefined') {
      localStorage.setItem('test-results-view', nextView);
    }
  };

  return { view, toggleView };
}
