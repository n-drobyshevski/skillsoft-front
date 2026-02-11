'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface SimulatorErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ============================================
// ERROR FALLBACK COMPONENT
// ============================================

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <AlertTriangle
          className="h-8 w-8 text-red-500 dark:text-red-400"
          aria-hidden="true"
        />
      </div>

      <p className="text-sm font-medium text-foreground mb-1">Simulator Error</p>

      <p className="text-xs text-muted-foreground mb-4 max-w-xs">
        {error?.message || 'An unexpected error occurred while rendering the simulator.'}
      </p>

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="gap-2 focus-visible:ring-red-500/50"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Try Again
      </Button>

      {/* Development-only error details */}
      {process.env.NODE_ENV === 'development' && error?.stack && (
        <details className="mt-4 w-full max-w-md text-left">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            Error details (dev only)
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto max-h-32">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

// ============================================
// ERROR BOUNDARY CLASS COMPONENT
// ============================================

export class SimulatorErrorBoundary extends React.Component<
  SimulatorErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: SimulatorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging/monitoring
    console.error('SimulatorPanel Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);

    // Could send to error monitoring service here
    // e.g., Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default SimulatorErrorBoundary;
