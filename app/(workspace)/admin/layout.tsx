import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ADMIN_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * Admin Section Layout
 *
 * Provides scoped i18n messages for the admin section.
 * Includes shared namespaces plus admin-specific ones (users, teams).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    ADMIN_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
