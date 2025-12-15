/**
 * Tests for Error Boundary Components
 * Phase 5: Error Handling Tests
 *
 * Tests cover:
 * - Error boundary catching and displaying errors
 * - Recovery from errors (reset functionality)
 * - Error logging behavior
 * - ErrorCard component
 * - Next.js error.tsx page behavior
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// TEST COMPONENTS
// ============================================

/**
 * Simple Error Boundary implementation for testing
 * Mimics the behavior of Next.js error.tsx pages
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TestErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div role="alert" data-testid="error-boundary">
          <h2>Something went wrong!</h2>
          <p data-testid="error-message">{this.state.error?.message}</p>
          <button onClick={this.reset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Component that throws an error for testing
 */
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error from component');
  }
  return <div data-testid="working-component">Working correctly</div>;
}

/**
 * Component that throws on user interaction
 */
function InteractiveThrowingComponent() {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error('Error triggered by user action');
  }

  return (
    <button onClick={() => setShouldThrow(true)} data-testid="trigger-error">
      Click to trigger error
    </button>
  );
}

/**
 * Component that throws with custom error details
 */
function DetailedErrorComponent({ errorType }: { errorType: 'network' | 'validation' | 'auth' }): React.ReactElement {
  const errorMessages = {
    network: 'Network request failed',
    validation: 'Form validation error',
    auth: 'Authentication required',
  };

  throw new Error(errorMessages[errorType]);
}

/**
 * ErrorCard component mock (matching src/components/feedback/ErrorCard.tsx)
 */
function ErrorCard({ error, callback }: { error: string; callback?: () => void }) {
  return (
    <div data-testid="error-card" role="alert">
      <div data-testid="error-icon">Warning</div>
      <h3 data-testid="error-title">Error Loading Page</h3>
      <p data-testid="error-description">{error}</p>
      {callback && (
        <button onClick={callback} data-testid="retry-button">
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Next.js style error page component (matching app/(workspace)/admin/users/error.tsx)
 */
function NextErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Simulate error logging/reporting
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-error', { detail: error }));
    }
  }, [error]);

  return (
    <div data-testid="next-error-page" role="alert">
      <div data-testid="error-icon-container">
        <span data-testid="alert-icon">Alert</span>
      </div>
      <h1 data-testid="error-heading">Something went wrong!</h1>
      <p data-testid="error-description">
        We encountered an error while loading the page.
      </p>
      {error.digest && (
        <div data-testid="error-digest">Error ID: {error.digest}</div>
      )}
      <button onClick={reset} data-testid="try-again-button">
        Try again
      </button>
      <a href="/dashboard" data-testid="home-link">
        Back to Dashboard
      </a>
    </div>
  );
}

// ============================================
// TESTS
// ============================================
describe('Error Boundary Tests', () => {
  // Suppress console.error during tests since we expect errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  // ==========================================
  // Basic Error Catching
  // ==========================================
  describe('Basic Error Catching', () => {
    it('should catch errors thrown by child components', () => {
      render(
        <TestErrorBoundary>
          <ThrowingComponent />
        </TestErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    });

    it('should display the error message', () => {
      render(
        <TestErrorBoundary>
          <ThrowingComponent />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Test error from component'
      );
    });

    it('should render children normally when no error occurs', () => {
      render(
        <TestErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should catch errors from nested components', () => {
      render(
        <TestErrorBoundary>
          <div>
            <div>
              <ThrowingComponent />
            </div>
          </div>
        </TestErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  // ==========================================
  // Error Recovery
  // ==========================================
  describe('Error Recovery', () => {
    it('should reset error state when reset is called', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      function ControlledComponent() {
        if (shouldThrow) {
          throw new Error('Controlled error');
        }
        return <div data-testid="recovered">Recovered!</div>;
      }

      const { rerender } = render(
        <TestErrorBoundary
          key="boundary"
          onReset={() => {
            shouldThrow = false;
          }}
        >
          <ControlledComponent />
        </TestErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      await user.click(screen.getByText('Try again'));

      // After reset, the component should re-render without error
      rerender(
        <TestErrorBoundary key="boundary">
          <ControlledComponent />
        </TestErrorBoundary>
      );

      // The error boundary should have reset
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should call onReset callback when reset button is clicked', async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();

      render(
        <TestErrorBoundary onReset={onReset}>
          <ThrowingComponent />
        </TestErrorBoundary>
      );

      await user.click(screen.getByText('Try again'));

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // Error Logging
  // ==========================================
  describe('Error Logging', () => {
    it('should call onError callback with error and errorInfo', () => {
      const onError = vi.fn();

      render(
        <TestErrorBoundary onError={onError}>
          <ThrowingComponent />
        </TestErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('should pass the correct error message to callback', () => {
      const onError = vi.fn();

      render(
        <TestErrorBoundary onError={onError}>
          <ThrowingComponent />
        </TestErrorBoundary>
      );

      const [error] = onError.mock.calls[0];
      expect(error.message).toBe('Test error from component');
    });
  });

  // ==========================================
  // Custom Fallback UI
  // ==========================================
  describe('Custom Fallback UI', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (
        <div data-testid="custom-fallback">Custom error UI</div>
      );

      render(
        <TestErrorBoundary fallback={customFallback}>
          <ThrowingComponent />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // Interactive Error Triggering
  // ==========================================
  describe('Interactive Error Triggering', () => {
    it('should catch errors triggered by user interaction', async () => {
      const user = userEvent.setup();

      render(
        <TestErrorBoundary>
          <InteractiveThrowingComponent />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('trigger-error')).toBeInTheDocument();

      await user.click(screen.getByTestId('trigger-error'));

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Error triggered by user action'
      );
    });
  });

  // ==========================================
  // Different Error Types
  // ==========================================
  describe('Different Error Types', () => {
    it('should display network error correctly', () => {
      render(
        <TestErrorBoundary>
          <DetailedErrorComponent errorType="network" />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Network request failed'
      );
    });

    it('should display validation error correctly', () => {
      render(
        <TestErrorBoundary>
          <DetailedErrorComponent errorType="validation" />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Form validation error'
      );
    });

    it('should display auth error correctly', () => {
      render(
        <TestErrorBoundary>
          <DetailedErrorComponent errorType="auth" />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Authentication required'
      );
    });
  });
});

// ============================================
// ErrorCard Component Tests
// ============================================
describe('ErrorCard Component', () => {
  it('should render error message', () => {
    render(<ErrorCard error="Something went wrong" />);

    expect(screen.getByTestId('error-card')).toBeInTheDocument();
    expect(screen.getByTestId('error-description')).toHaveTextContent(
      'Something went wrong'
    );
  });

  it('should render error title', () => {
    render(<ErrorCard error="Test error" />);

    expect(screen.getByTestId('error-title')).toHaveTextContent(
      'Error Loading Page'
    );
  });

  it('should render warning icon', () => {
    render(<ErrorCard error="Test error" />);

    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('should render retry button when callback is provided', () => {
    const callback = vi.fn();
    render(<ErrorCard error="Test error" callback={callback} />);

    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  });

  it('should not render retry button when callback is not provided', () => {
    render(<ErrorCard error="Test error" />);

    expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
  });

  it('should call callback when retry button is clicked', async () => {
    const user = userEvent.setup();
    const callback = vi.fn();
    render(<ErrorCard error="Test error" callback={callback} />);

    await user.click(screen.getByTestId('retry-button'));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should have alert role for accessibility', () => {
    render(<ErrorCard error="Test error" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ============================================
// Next.js Error Page Tests
// ============================================
describe('Next.js Error Page', () => {
  it('should render error heading', () => {
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<NextErrorPage error={error} reset={reset} />);

    expect(screen.getByTestId('error-heading')).toHaveTextContent(
      'Something went wrong!'
    );
  });

  it('should render error description', () => {
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<NextErrorPage error={error} reset={reset} />);

    expect(screen.getByTestId('error-description')).toBeInTheDocument();
  });

  it('should render error digest when available', () => {
    const error = Object.assign(new Error('Test error'), { digest: 'abc123' });
    const reset = vi.fn();

    render(<NextErrorPage error={error} reset={reset} />);

    expect(screen.getByTestId('error-digest')).toHaveTextContent('Error ID: abc123');
  });

  it('should not render error digest when not available', () => {
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<NextErrorPage error={error} reset={reset} />);

    expect(screen.queryByTestId('error-digest')).not.toBeInTheDocument();
  });

  it('should render try again button', () => {
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<NextErrorPage error={error} reset={reset} />);

    expect(screen.getByTestId('try-again-button')).toBeInTheDocument();
  });

  it('should call reset when try again button is clicked', async () => {
    const user = userEvent.setup();
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<NextErrorPage error={error} reset={reset} />);

    await user.click(screen.getByTestId('try-again-button'));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('should render home link', () => {
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<NextErrorPage error={error} reset={reset} />);

    const homeLink = screen.getByTestId('home-link');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/dashboard');
  });

  it('should dispatch app-error event on mount', () => {
    const error = new Error('Test error');
    const reset = vi.fn();
    const eventHandler = vi.fn();

    window.addEventListener('app-error', eventHandler);

    render(<NextErrorPage error={error} reset={reset} />);

    expect(eventHandler).toHaveBeenCalledTimes(1);
    expect(eventHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: error,
      })
    );

    window.removeEventListener('app-error', eventHandler);
  });

  it('should have alert role for accessibility', () => {
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<NextErrorPage error={error} reset={reset} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
