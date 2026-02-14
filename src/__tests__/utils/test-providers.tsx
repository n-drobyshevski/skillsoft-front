/**
 * Test Provider Utilities
 *
 * Provides wrapper components and custom render functions
 * for testing components that require providers like NextIntl.
 */
import React, { type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

// Import English messages from the per-namespace split files (single source of truth)
import messages from '../../../messages/en/index';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * AllProviders - Wraps children with all necessary providers for testing
 */
export function AllProviders({ children }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * IntlProvider - Just the NextIntl provider for components that only need i18n
 */
export function IntlProvider({ children }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Custom render function that wraps components with all providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Custom render function for components that only need i18n
 */
export function renderWithIntl(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: IntlProvider, ...options });
}

export default renderWithProviders;
