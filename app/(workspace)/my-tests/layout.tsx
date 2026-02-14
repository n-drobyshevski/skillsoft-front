import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { MY_TESTS_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * My Tests Section Layout
 *
 * Provides scoped i18n messages for the my-tests section.
 * Includes shared namespaces plus the myTests namespace.
 */
export default async function MyTestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    MY_TESTS_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
