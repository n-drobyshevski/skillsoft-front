import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { PROFILE_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * Profile Section Layout
 *
 * Provides scoped i18n messages for the profile section.
 * Includes shared namespaces plus profile-specific ones (profile,
 * users, settings).
 *
 * This reduces the client-side i18n payload from the full 228KB/329KB
 * to only the ~20 namespaces needed by this section.
 */
export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    PROFILE_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
