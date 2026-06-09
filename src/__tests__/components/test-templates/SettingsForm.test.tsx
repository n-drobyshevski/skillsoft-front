import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../messages/en/index';
import { AssessmentGoal, type TestTemplate } from '@/types/domain';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockUpdate = vi.fn().mockResolvedValue({ success: true });
const mockCreateNewVersion = vi.fn();
vi.mock('@/app/(workspace)/test-templates/[id]/actions', () => ({
  updateTemplateSettings: (...args: unknown[]) => mockUpdate(...args),
  archiveTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  createNewVersion: (...args: unknown[]) => mockCreateNewVersion(...args),
}));

import { SettingsForm } from '@/app/(workspace)/test-templates/[id]/settings/_components/SettingsForm';

const baseTemplate: TestTemplate = {
  id: 'tid-1',
  name: 'Leadership',
  description: 'desc',
  goal: AssessmentGoal.OVERVIEW,
  competencyIds: [],
  questionsPerIndicator: 3,
  timeLimitMinutes: 60,
  passingScore: 70,
  isActive: true,
  shuffleQuestions: false,
  shuffleOptions: false,
  allowSkip: false,
  allowBackNavigation: false,
  showResultsImmediately: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  status: 'PUBLISHED',
};

const renderForm = (template: TestTemplate) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SettingsForm template={template} />
    </NextIntlClientProvider>,
  );

describe('SettingsForm locked-template editing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({ success: true });
  });

  it('lets a published template be edited and confirms before force-saving', async () => {
    const user = userEvent.setup();
    renderForm({ ...baseTemplate, status: 'PUBLISHED' });

    const nameInput = screen.getByDisplayValue('Leadership');
    await user.clear(nameInput);
    await user.type(nameInput, 'Leadership v2');

    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/overwrite the published template/i)).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /edit anyway/i }));
    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith(
        'tid-1',
        expect.objectContaining({ name: 'Leadership v2' }),
        true,
      ),
    );
  });

  it('cancelling the dialog does not save', async () => {
    const user = userEvent.setup();
    renderForm({ ...baseTemplate, status: 'PUBLISHED' });

    const nameInput = screen.getByDisplayValue('Leadership');
    await user.clear(nameInput);
    await user.type(nameInput, 'Leadership v2');
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    await screen.findByText(/overwrite the published template/i);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() =>
      expect(screen.queryByText(/overwrite the published template/i)).not.toBeInTheDocument(),
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('saves a draft directly with forceOverwrite=false and no dialog', async () => {
    const user = userEvent.setup();
    renderForm({ ...baseTemplate, status: 'DRAFT' });

    expect(screen.queryByText(/editing a published template/i)).not.toBeInTheDocument();

    const nameInput = screen.getByDisplayValue('Leadership');
    await user.clear(nameInput);
    await user.type(nameInput, 'Draft v2');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith(
        'tid-1',
        expect.objectContaining({ name: 'Draft v2' }),
        false,
      ),
    );
    expect(screen.queryByText(/overwrite the/i)).not.toBeInTheDocument();
  });

  it('uses archived-specific copy and force-saves an archived template', async () => {
    const user = userEvent.setup();
    renderForm({ ...baseTemplate, status: 'ARCHIVED', isActive: false });

    expect(screen.getByText(/editing an archived template/i)).toBeInTheDocument();

    const nameInput = screen.getByDisplayValue('Leadership');
    await user.clear(nameInput);
    await user.type(nameInput, 'Archived v2');

    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/overwrite the archived template/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /edit anyway/i }));
    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith(
        'tid-1',
        expect.objectContaining({ name: 'Archived v2' }),
        true,
      ),
    );
  });
});
