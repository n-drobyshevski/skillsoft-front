import { describe, it, expect } from 'vitest';
import { isTemplateLocked } from '@/app/(workspace)/test-templates/[id]/settings/_components/templateLock';

describe('isTemplateLocked', () => {
  it('is true for PUBLISHED', () => expect(isTemplateLocked('PUBLISHED')).toBe(true));
  it('is true for ARCHIVED', () => expect(isTemplateLocked('ARCHIVED')).toBe(true));
  it('is false for DRAFT', () => expect(isTemplateLocked('DRAFT')).toBe(false));
  it('is false for undefined', () => expect(isTemplateLocked(undefined)).toBe(false));
});
