import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { TEST_TEMPLATES_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * Test Templates Section Layout
 *
 * Provides scoped i18n messages for the test-templates section.
 * Includes shared namespaces plus template-specific ones (template,
 * assessment, likert, frequency, forms, question, competency,
 * indicator, candidate, results, activity, help, shared, myTests).
 *
 * This reduces the client-side i18n payload from the full 228KB/329KB
 * to only the ~32 namespaces needed by this section.
 */
export default async function TestTemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    TEST_TEMPLATES_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
