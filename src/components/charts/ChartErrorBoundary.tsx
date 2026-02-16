'use client';

import { Component, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Labels passed to the class-based error boundary from the functional wrapper.
 * This is necessary because class components cannot use hooks (useTranslations).
 */
interface ChartErrorBoundaryLabels {
  title: string;
  retry: string;
}

interface ChartErrorBoundaryInnerProps {
  children: ReactNode;
  labels: ChartErrorBoundaryLabels;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ChartErrorBoundaryInnerState {
  hasError: boolean;
}

/**
 * Inner class component that implements the Error Boundary lifecycle.
 * Receives translated labels via props from the outer functional wrapper.
 */
class ChartErrorBoundaryInner extends Component<
  ChartErrorBoundaryInnerProps,
  ChartErrorBoundaryInnerState
> {
  constructor(props: ChartErrorBoundaryInnerProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChartErrorBoundaryInnerState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const { labels } = this.props;
      return (
        <Card className="border-dashed border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 gap-3 sm:gap-4 text-center">
            <div className="p-3 rounded-full bg-muted/50">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{labels.title}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {labels.retry}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Props for the public ChartErrorBoundary component.
 */
interface ChartErrorBoundaryProps {
  children: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Chart Error Boundary - Reusable error boundary for chart components.
 *
 * Catches rendering errors from child chart components and displays a
 * graceful fallback with a retry button. Uses next-intl for translations.
 *
 * Usage:
 * ```tsx
 * <ChartErrorBoundary>
 *   <LazyCompetencyRadarChart data={data} />
 * </ChartErrorBoundary>
 * ```
 */
export function ChartErrorBoundary({ children, onError }: ChartErrorBoundaryProps) {
  const t = useTranslations('common');

  const labels: ChartErrorBoundaryLabels = {
    title: t('chartRenderError'),
    retry: t('retry'),
  };

  return (
    <ChartErrorBoundaryInner labels={labels} onError={onError}>
      {children}
    </ChartErrorBoundaryInner>
  );
}
