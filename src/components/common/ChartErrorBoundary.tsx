'use client';

import { Component, ReactNode, createContext, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Translation context for class components
interface ErrorTranslations {
  chartError: string;
  chartErrorDescription: string;
  tryAgain: string;
  errorDetails: string;
  sectionError: string;
  sectionErrorDescription: string;
  retry: string;
}

const ErrorTranslationsContext = createContext<ErrorTranslations | null>(null);

interface ChartErrorBoundaryProps {
  children: ReactNode;
  /** Fallback component to render when error occurs */
  fallback?: ReactNode;
  /** Height of the error card - matches chart height */
  height?: string | number;
  /** Callback when reset is requested */
  onReset?: () => void;
  /** Title shown in error state */
  title?: string;
  /** Description shown in error state */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ChartErrorBoundaryInner - Internal class component for error boundary
 */
class ChartErrorBoundaryInner extends Component<
  ChartErrorBoundaryProps & { translations: ErrorTranslations },
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps & { translations: ErrorTranslations }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ChartErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    const { translations } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const height = this.props.height ?? 300;
      const heightStyle = typeof height === 'number' ? `${height}px` : height;

      return (
        <Card
          className={cn(
            'flex flex-col items-center justify-center text-center',
            this.props.className
          )}
          style={{ height: heightStyle }}
        >
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base">
                {this.props.title ?? translations.chartError}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {this.props.description ?? translations.chartErrorDescription}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {translations.tryAgain}
            </Button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-xs text-muted-foreground mt-2 max-w-xs">
                <summary className="cursor-pointer">{translations.errorDetails}</summary>
                <pre className="mt-1 text-left whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * ChartErrorBoundary - Error boundary for chart/visualization components
 *
 * Catches rendering errors in charts and displays a user-friendly fallback.
 * Particularly useful for Recharts components which can fail on data edge cases.
 */
export function ChartErrorBoundary(props: ChartErrorBoundaryProps) {
  const t = useTranslations('errors');
  const tCommon = useTranslations('common');

  const translations: ErrorTranslations = {
    chartError: t('chartError'),
    chartErrorDescription: t('chartErrorDescription'),
    tryAgain: t('tryAgain'),
    errorDetails: t('errorDetails'),
    sectionError: t('sectionError'),
    sectionErrorDescription: t('sectionErrorDescription'),
    retry: tCommon('retry'),
  };

  return <ChartErrorBoundaryInner {...props} translations={translations} />;
}

/**
 * SectionErrorBoundaryInner - Internal class component for section error boundary
 */
class SectionErrorBoundaryInner extends Component<
  ChartErrorBoundaryProps & { translations: ErrorTranslations },
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps & { translations: ErrorTranslations }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('SectionErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    const { translations } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
            this.props.className
          )}
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {this.props.title ?? translations.sectionError}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {this.props.description ?? translations.sectionErrorDescription}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            {translations.retry}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * SectionErrorBoundary - Error boundary for data sections
 *
 * Similar to ChartErrorBoundary but with a more compact design for
 * data tables and card sections.
 */
export function SectionErrorBoundary(props: ChartErrorBoundaryProps) {
  const t = useTranslations('errors');
  const tCommon = useTranslations('common');

  const translations: ErrorTranslations = {
    chartError: t('chartError'),
    chartErrorDescription: t('chartErrorDescription'),
    tryAgain: t('tryAgain'),
    errorDetails: t('errorDetails'),
    sectionError: t('sectionError'),
    sectionErrorDescription: t('sectionErrorDescription'),
    retry: tCommon('retry'),
  };

  return <SectionErrorBoundaryInner {...props} translations={translations} />;
}

export default ChartErrorBoundary;
