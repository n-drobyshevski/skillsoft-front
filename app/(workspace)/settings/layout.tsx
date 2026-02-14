import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SETTINGS_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * Settings Section Layout
 *
 * Provides scoped i18n messages for the settings section.
 * Includes shared namespaces plus the settings namespace.
 */
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    SETTINGS_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
