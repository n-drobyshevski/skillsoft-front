import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { TEST_RESULTS_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * Test Results Section Layout
 *
 * Provides scoped i18n messages for the test-results section.
 * Includes shared namespaces plus the results namespace.
 */
export default async function TestResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    TEST_RESULTS_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
