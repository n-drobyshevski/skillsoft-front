/**
 * React Query Test Utilities
 *
 * Provides QueryClient wrapper and render utilities for testing
 * components and hooks that use React Query.
 */
import React, { type ReactElement, type ReactNode } from 'react';
import { render, renderHook, type RenderOptions, type RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

/**
 * Create a new QueryClient for testing
 * Configured with:
 * - No retries (faster test failures)
 * - No garbage collection during tests
 * - Errors logged instead of thrown
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  });
}

interface QueryWrapperProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

/**
 * Wrapper component that provides QueryClient and Theme
 */
export function QueryWrapper({ children, queryClient }: QueryWrapperProps) {
  const client = queryClient ?? createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/**
 * Custom render options for query-enabled components
 */
interface QueryRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  theme?: 'light' | 'dark' | 'system';
}

/**
 * Render a component with QueryClient and Theme providers
 * Use this for testing components that use React Query hooks
 */
export function renderWithQuery(
  ui: ReactElement,
  options?: QueryRenderOptions
): ReturnType<typeof render> & { queryClient: QueryClient } {
  const { queryClient = createTestQueryClient(), theme = 'system', ...renderOptions } = options ?? {};

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme={theme}
        enableSystem={theme === 'system'}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    queryClient,
  };
}

/**
 * Custom render hook options for query-enabled hooks
 */
interface QueryHookOptions<TProps> extends Omit<RenderHookOptions<TProps>, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Render a hook with QueryClient provider
 * Use this for testing React Query hooks directly
 */
export function renderQueryHook<TResult, TProps>(
  renderCallback: (props: TProps) => TResult,
  options?: QueryHookOptions<TProps>
): ReturnType<typeof renderHook<TResult, TProps>> & { queryClient: QueryClient } {
  const { queryClient = createTestQueryClient(), ...hookOptions } = options ?? {};

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const result = renderHook(renderCallback, { wrapper, ...hookOptions });

  return {
    ...result,
    queryClient,
  };
}

/**
 * Wait for all pending queries to settle
 * Useful after mutations that invalidate queries
 */
export async function waitForQueries(queryClient: QueryClient) {
  await queryClient.getQueryCache().onStable();
}

/**
 * Clear all queries from the cache
 * Use in afterEach to ensure test isolation
 */
export function clearQueryCache(queryClient: QueryClient) {
  queryClient.clear();
}
