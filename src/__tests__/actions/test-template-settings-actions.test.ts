import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssessmentGoal, type TestTemplate } from '@/types/domain';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
vi.mock('@/services/api', () => ({
  testTemplatesApi: {
    updateTemplate: vi.fn().mockResolvedValue({}),
  },
}));

import { updateTemplateSettings } from '@/app/(workspace)/test-templates/[id]/actions';
import { testTemplatesApi } from '@/services/api';

describe('updateTemplateSettings forceOverwrite plumbing', () => {
  beforeEach(() => {
    // Global mockReset wipes mock implementations between tests, so re-establish the
    // resolved value here (call history is cleared by the global clearMocks setting).
    vi.mocked(testTemplatesApi.updateTemplate).mockResolvedValue({} as TestTemplate);
  });

  it('forwards forceOverwrite=true into the update payload', async () => {
    await updateTemplateSettings('tid-1', { name: 'X', goal: AssessmentGoal.OVERVIEW }, true);
    expect(testTemplatesApi.updateTemplate).toHaveBeenCalledWith(
      'tid-1',
      expect.objectContaining({ forceOverwrite: true }),
    );
  });

  it('defaults forceOverwrite to false when omitted', async () => {
    await updateTemplateSettings('tid-1', { name: 'X', goal: AssessmentGoal.OVERVIEW });
    expect(testTemplatesApi.updateTemplate).toHaveBeenCalledWith(
      'tid-1',
      expect.objectContaining({ forceOverwrite: false }),
    );
  });
});
