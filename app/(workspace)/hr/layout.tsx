import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { HR_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * HR Section Layout
 *
 * Provides scoped i18n messages for the HR management section.
 * Includes shared namespaces plus HR-specific ones
 * (competency, forms, indicator, question).
 */
export default async function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    HR_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
