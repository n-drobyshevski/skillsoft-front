import type { TestTemplate } from '@/types/domain';

// Published and archived templates are "locked": editing them overwrites a
// non-draft version, so the settings form gates the save behind a warning.
export function isTemplateLocked(status: TestTemplate['status']): boolean {
  return status === 'PUBLISHED' || status === 'ARCHIVED';
}
