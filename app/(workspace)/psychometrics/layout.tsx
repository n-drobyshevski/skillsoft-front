import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { PSYCHOMETRICS_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * Psychometrics Section Layout
 *
 * Provides scoped i18n messages for the psychometrics section.
 * Includes shared namespaces (common, navigation, errors, etc.) plus
 * the psychometrics-specific namespace.
 *
 * This reduces the client-side i18n payload from the full 228KB/329KB
 * to only the ~18 namespaces needed by this section.
 */
export default async function PsychometricsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    PSYCHOMETRICS_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
