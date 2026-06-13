import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ADMIN_NAMESPACES, pickMessages } from '@/i18n/namespaces';
import { requireAdmin } from '@/lib/dal';

/**
 * Admin Section Layout
 *
 * Server-side authorization backstop for the entire /admin section: redirects
 * to the dashboard unless the *effective* role (lens-downgraded) is ADMIN. This
 * is what stops an admin who has switched to the user/editor lens — or any
 * non-admin — from rendering an admin route and 403-ing on its data fetch,
 * whether they got here by switching lenses, reloading, or following a link.
 *
 * Provides scoped i18n messages for the admin section.
 * Includes shared namespaces plus admin-specific ones (users, teams).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authorize before doing any work / rendering children.
  await requireAdmin();

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
