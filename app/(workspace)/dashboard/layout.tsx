import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { DASHBOARD_NAMESPACES, pickMessages } from '@/i18n/namespaces';

/**
 * Dashboard Section Layout
 *
 * Provides scoped i18n messages for the dashboard section.
 * Includes shared namespaces plus dashboard-specific ones
 * (dashboard, activity, competency, indicator).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    DASHBOARD_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
