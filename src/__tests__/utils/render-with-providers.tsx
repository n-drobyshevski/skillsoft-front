/**
 * Custom render function with all providers
 * Wraps components with necessary context providers for testing
 */
import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

interface AllProvidersProps {
  children: ReactNode;
}

/**
 * All providers wrapper for testing
 * Add any global providers here (Theme, Auth, etc.)
 */
function AllProviders({ children }: AllProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

/**
 * Custom render options
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark' | 'system';
}

/**
 * Custom render function that wraps components with providers
 * Use this instead of @testing-library/react's render
 */
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
): ReturnType<typeof render> {
  const { theme = 'system', ...renderOptions } = options ?? {};

  // Create a wrapper that includes theme preference
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem={theme === 'system'}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Export custom render as default render
export { customRender as render };

// Export the providers wrapper for direct use
export { AllProviders };
