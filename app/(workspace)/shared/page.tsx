import { redirect } from 'next/navigation';

/**
 * Shared page now redirects to the Test Catalog with the shared tab active.
 * The "Shared with Me" content has been consolidated into the Test Catalog page.
 */
export default function SharedPage() {
  redirect('/test-templates?source=shared');
}
