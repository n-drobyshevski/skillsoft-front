import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SHARED_TEMPLATES_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * Shared Templates Section Layout
 *
 * Provides scoped i18n messages for the shared templates section.
 * Includes shared namespaces plus the 'shared' namespace.
 */
export default async function SharedTemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    SHARED_TEMPLATES_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
