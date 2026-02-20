/**
 * Tests for useTemplateSharingQuery hooks
 *
 * Tests the template sharing hook key structures and basic API contracts.
 * After migration from React Query to simple fetch hooks, these tests verify:
 * - Query key structures (for structural compatibility)
 * - Template sharing key generation
 *
 * Note: Detailed integration tests for the hooks themselves require
 * component-level rendering with MSW, which is covered by the sharing
 * component tests (VisibilitySelector.test, UserShareList.test, etc.).
 */
import { describe, it, expect } from 'vitest';
import {
  templateSharingKeys,
} from '@/hooks/queries';

describe('templateSharingKeys', () => {
  it('generates correct visibility key', () => {
    const key = templateSharingKeys.visibility('template-1');
    expect(key).toEqual(['templateSharing', 'visibility', 'template-1']);
  });

  it('generates correct shares list key', () => {
    const key = templateSharingKeys.sharesList('template-1');
    expect(key).toEqual(['templateSharing', 'shares', 'template-1', 'list']);
  });

  it('generates correct links list key', () => {
    const key = templateSharingKeys.linksList('template-1');
    expect(key).toEqual(['templateSharing', 'links', 'template-1', 'list']);
  });

  it('generates correct link validation key', () => {
    const key = templateSharingKeys.linkValidation('abc123');
    expect(key).toEqual(['templateSharing', 'validate', 'abc123']);
  });

  it('generates correct active links key', () => {
    const key = templateSharingKeys.activeLinks('template-1');
    expect(key).toEqual(['templateSharing', 'links', 'template-1', 'active']);
  });

  it('generates correct link count key', () => {
    const key = templateSharingKeys.linkCount('template-1');
    expect(key).toEqual(['templateSharing', 'links', 'template-1', 'count']);
  });

  it('generates correct canCreateLink key', () => {
    const key = templateSharingKeys.canCreateLink('template-1');
    expect(key).toEqual(['templateSharing', 'links', 'template-1', 'canCreate']);
  });

  it('all keys share the same root prefix', () => {
    const keys = [
      templateSharingKeys.visibility('t1'),
      templateSharingKeys.sharesList('t1'),
      templateSharingKeys.linksList('t1'),
      templateSharingKeys.activeLinks('t1'),
      templateSharingKeys.linkValidation('token'),
    ];

    keys.forEach((key) => {
      expect(key[0]).toBe('templateSharing');
    });
  });
});
