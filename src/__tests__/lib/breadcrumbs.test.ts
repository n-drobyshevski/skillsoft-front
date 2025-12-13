/**
 * Tests for useBreadcrumbs hook
 * Tests breadcrumb generation for various route patterns
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Import after mocking
import { useBreadcrumbs } from '@/lib/breadcrumbs';

describe('useBreadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/');
  });

  describe('Basic Route Generation', () => {
    it('should return empty breadcrumbs for root path', () => {
      mockPathname.mockReturnValue('/');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toEqual([]);
      expect(result.current.title).toBe('');
    });

    it('should generate single breadcrumb for simple path', () => {
      mockPathname.mockReturnValue('/dashboard');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toEqual([
        { href: '/dashboard', label: 'Dashboard' }
      ]);
      expect(result.current.title).toBe('Dashboard');
    });

    it('should generate nested breadcrumbs for multi-segment path', () => {
      mockPathname.mockReturnValue('/hr/competencies');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toHaveLength(2);
      expect(result.current.breadcrumbs[0]).toEqual({ href: '/hr', label: 'Hr' });
      expect(result.current.breadcrumbs[1]).toEqual({ href: '/hr/competencies', label: 'Competencies' });
    });

    it('should handle deeply nested paths', () => {
      mockPathname.mockReturnValue('/hr/competencies/123/edit');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toHaveLength(4);
      expect(result.current.breadcrumbs[3]).toEqual({ href: '/hr/competencies/123/edit', label: 'Edit' });
    });
  });

  describe('Special Segment Handling', () => {
    it('should format assessment-questions correctly', () => {
      mockPathname.mockReturnValue('/assessment-questions');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[0].label).toBe('Assessment Questions');
    });

    it('should format behavioral-indicators correctly', () => {
      mockPathname.mockReturnValue('/behavioral-indicators');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[0].label).toBe('Behavioral Indicators');
    });

    it('should format competencies correctly', () => {
      mockPathname.mockReturnValue('/competencies');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[0].label).toBe('Competencies');
    });

    it('should format new segment correctly', () => {
      mockPathname.mockReturnValue('/competencies/new');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[1].label).toBe('New');
    });

    it('should format edit segment correctly', () => {
      mockPathname.mockReturnValue('/competencies/123/edit');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[2].label).toBe('Edit');
    });
  });

  describe('Entity ID Handling', () => {
    it('should label UUID-like segments as Details', () => {
      mockPathname.mockReturnValue('/competencies/a1b2c3d4-e5f6-7890-abcd-ef1234567890');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[1].label).toBe('Details');
    });

    it('should label long alphanumeric IDs as Details', () => {
      // The regex requires length > 10 and matches /^[a-f0-9-]+$/i
      mockPathname.mockReturnValue('/competencies/123456789abc');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[1].label).toBe('Details');
    });

    it('should not treat short segments as IDs', () => {
      mockPathname.mockReturnValue('/competencies/abc');

      const { result } = renderHook(() => useBreadcrumbs());

      // Short segments are not treated as IDs - they get formatted normally
      expect(result.current.breadcrumbs[1].label).toBe('Abc');
    });

    it('should not treat segments with non-hex characters as IDs', () => {
      // The regex /^[a-f0-9-]+$/i only matches hex chars and hyphens
      mockPathname.mockReturnValue('/competencies/template-123');

      const { result } = renderHook(() => useBreadcrumbs());

      // Contains non-hex 't', 'p', 'l', 'm' - formatted as title case
      expect(result.current.breadcrumbs[1].label).toBe('Template 123');
    });
  });

  describe('Custom Titles', () => {
    it('should use custom title for specific segment', () => {
      mockPathname.mockReturnValue('/competencies/comp-123');

      const customTitles = { 'comp-123': 'Communication Skills' };
      const { result } = renderHook(() => useBreadcrumbs(customTitles));

      expect(result.current.breadcrumbs[1].label).toBe('Communication Skills');
    });

    it('should override default formatting with custom title', () => {
      mockPathname.mockReturnValue('/hr/behavioral-indicators');

      const customTitles = { 'behavioral-indicators': 'Indicators' };
      const { result } = renderHook(() => useBreadcrumbs(customTitles));

      expect(result.current.breadcrumbs[1].label).toBe('Indicators');
    });

    it('should apply multiple custom titles', () => {
      mockPathname.mockReturnValue('/hr/competencies/comp-1');

      const customTitles = {
        'hr': 'HR Library',
        'comp-1': 'Leadership'
      };
      const { result } = renderHook(() => useBreadcrumbs(customTitles));

      expect(result.current.breadcrumbs[0].label).toBe('HR Library');
      expect(result.current.breadcrumbs[2].label).toBe('Leadership');
    });

    it('should not affect segments without custom titles', () => {
      mockPathname.mockReturnValue('/hr/competencies');

      const customTitles = { 'hr': 'HR Library' };
      const { result } = renderHook(() => useBreadcrumbs(customTitles));

      expect(result.current.breadcrumbs[0].label).toBe('HR Library');
      expect(result.current.breadcrumbs[1].label).toBe('Competencies');
    });
  });

  describe('Title Extraction', () => {
    it('should set title to last breadcrumb label', () => {
      mockPathname.mockReturnValue('/hr/competencies/details');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.title).toBe('Details');
    });

    it('should set title to Edit for edit pages', () => {
      mockPathname.mockReturnValue('/competencies/123/edit');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.title).toBe('Edit');
    });

    it('should set title to Edit when path contains edit anywhere', () => {
      mockPathname.mockReturnValue('/hr/competencies/abc123/edit/settings');

      const { result } = renderHook(() => useBreadcrumbs());

      // The hook specifically checks for /edit in path and sets title to "Edit"
      expect(result.current.title).toBe('Edit');
    });
  });

  describe('Hyphenated Segments', () => {
    it('should convert hyphenated segments to title case', () => {
      mockPathname.mockReturnValue('/test-templates');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[0].label).toBe('Test Templates');
    });

    it('should handle multi-word hyphenated segments', () => {
      mockPathname.mockReturnValue('/my-long-page-name');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[0].label).toBe('My Long Page Name');
    });
  });

  describe('URL Segment Hierarchy', () => {
    it('should generate correct hrefs for each level', () => {
      mockPathname.mockReturnValue('/admin/users/user-123/profile');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[0].href).toBe('/admin');
      expect(result.current.breadcrumbs[1].href).toBe('/admin/users');
      expect(result.current.breadcrumbs[2].href).toBe('/admin/users/user-123');
      expect(result.current.breadcrumbs[3].href).toBe('/admin/users/user-123/profile');
    });

    it('should handle trailing slashes correctly', () => {
      mockPathname.mockReturnValue('/dashboard/');

      const { result } = renderHook(() => useBreadcrumbs());

      // Filter(Boolean) removes empty segments from trailing slash
      expect(result.current.breadcrumbs).toHaveLength(1);
      expect(result.current.breadcrumbs[0]).toEqual({ href: '/dashboard', label: 'Dashboard' });
    });
  });

  describe('Test Template Routes', () => {
    it('should handle test-templates route', () => {
      mockPathname.mockReturnValue('/test-templates');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[0].label).toBe('Test Templates');
    });

    it('should handle test-templates/new route', () => {
      mockPathname.mockReturnValue('/test-templates/new');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toHaveLength(2);
      expect(result.current.breadcrumbs[0].label).toBe('Test Templates');
      expect(result.current.breadcrumbs[1].label).toBe('New');
    });

    it('should handle test-templates/[id]/builder route', () => {
      // Note: template-123 contains non-hex chars, so it's formatted as title case
      mockPathname.mockReturnValue('/test-templates/template-123/builder');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[0].label).toBe('Test Templates');
      expect(result.current.breadcrumbs[1].label).toBe('Template 123'); // Contains non-hex chars
      expect(result.current.breadcrumbs[2].label).toBe('Builder');
    });

    it('should handle test-templates with UUID id', () => {
      // UUID contains only hex chars and hyphens, so it's treated as an ID
      mockPathname.mockReturnValue('/test-templates/a1b2c3d4-e5f6-7890/builder');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[0].label).toBe('Test Templates');
      expect(result.current.breadcrumbs[1].label).toBe('Details'); // UUID-like ID
      expect(result.current.breadcrumbs[2].label).toBe('Builder');
    });

    it('should use custom title for template name', () => {
      mockPathname.mockReturnValue('/test-templates/template-123');

      const customTitles = { 'template-123': 'Job Fit Assessment' };
      const { result } = renderHook(() => useBreadcrumbs(customTitles));

      expect(result.current.breadcrumbs[1].label).toBe('Job Fit Assessment');
      expect(result.current.title).toBe('Job Fit Assessment');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty segments gracefully', () => {
      mockPathname.mockReturnValue('//dashboard//');

      const { result } = renderHook(() => useBreadcrumbs());

      // Filter(Boolean) removes empty segments
      expect(result.current.breadcrumbs).toHaveLength(1);
      expect(result.current.breadcrumbs[0].label).toBe('Dashboard');
    });

    it('should handle Russian custom titles', () => {
      mockPathname.mockReturnValue('/competencies/comp-1');

      const customTitles = { 'comp-1': 'Коммуникация' };
      const { result } = renderHook(() => useBreadcrumbs(customTitles));

      expect(result.current.breadcrumbs[1].label).toBe('Коммуникация');
    });

    it('should handle numeric segments', () => {
      mockPathname.mockReturnValue('/page/123');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current.breadcrumbs[1].label).toBe('123');
    });
  });
});
