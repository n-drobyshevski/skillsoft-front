/**
 * Tests for VisibilitySelector and VisibilityBadge components
 *
 * Tests:
 * - VisibilitySelector renders all visibility options
 * - VisibilitySelector shows current visibility as selected
 * - VisibilitySelector shows active links badge for LINK visibility
 * - VisibilitySelector disabled when user cannot edit
 * - VisibilitySelector shows confirmation dialog when changing from LINK with active links
 * - VisibilityBadge renders with correct visibility styling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../messages/en.json';
import {
  VisibilitySelector,
  VisibilityBadge,
} from '../../../../app/(workspace)/test-templates/[id]/_components/sharing/VisibilitySelector';
import { TemplateVisibility } from '@/types/domain';

// Mock the useChangeVisibility hook
const mockMutateAsync = vi.fn();
const mockMutate = vi.fn();

vi.mock('@/hooks/queries', () => ({
  useChangeVisibility: () => ({
    mutateAsync: mockMutateAsync,
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="en" messages={messages}>
        {ui}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}

describe('VisibilitySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({ visibility: TemplateVisibility.PUBLIC });
  });

  it('renders all visibility options', () => {
    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PRIVATE}
        isOwner={true}
      />
    );

    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Anyone with link')).toBeInTheDocument();
  });

  it('shows description for each visibility option', () => {
    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PRIVATE}
        isOwner={true}
      />
    );

    expect(
      screen.getByText('Only you and people you share with can access')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Anyone in the organization can view and use')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Anyone with the link can access (anonymous allowed)')
    ).toBeInTheDocument();
  });

  it('shows checkmark on current visibility', () => {
    const { container } = renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PUBLIC}
        isOwner={true}
      />
    );

    // The selected option (PUBLIC) should have the check icon
    // Check for the Check icon within the Public option
    const publicLabel = screen.getByText('Public').closest('label');
    expect(publicLabel).toBeInTheDocument();

    // The Check icon should be within the selected label
    const checkIcon = publicLabel?.querySelector('svg.text-primary');
    expect(checkIcon).toBeInTheDocument();
  });

  it('shows active links count badge when LINK visibility has active links', () => {
    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.LINK}
        activeLinksCount={5}
        isOwner={true}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not show active links badge when count is 0', () => {
    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.LINK}
        activeLinksCount={0}
        isOwner={true}
      />
    );

    expect(screen.queryByText(/active/)).not.toBeInTheDocument();
  });

  it('applies disabled styling when user cannot edit', () => {
    const { container } = renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PRIVATE}
        isOwner={false}
        canManage={false}
      />
    );

    // Labels should have opacity-60 class when disabled
    const labels = container.querySelectorAll('label');
    labels.forEach((label) => {
      expect(label).toHaveClass('cursor-not-allowed');
      expect(label).toHaveClass('opacity-60');
    });
  });

  it('allows editing when isOwner is true', () => {
    const { container } = renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PRIVATE}
        isOwner={true}
        canManage={false}
      />
    );

    // Labels should not have disabled styling
    const labels = container.querySelectorAll('label');
    labels.forEach((label) => {
      expect(label).not.toHaveClass('cursor-not-allowed');
    });
  });

  it('allows editing when canManage is true', () => {
    const { container } = renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PRIVATE}
        isOwner={false}
        canManage={true}
      />
    );

    // Labels should not have disabled styling
    const labels = container.querySelectorAll('label');
    labels.forEach((label) => {
      expect(label).not.toHaveClass('cursor-not-allowed');
    });
  });

  it('changes visibility when clicking a different option', async () => {
    const onVisibilityChange = vi.fn();

    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PRIVATE}
        isOwner={true}
        onVisibilityChange={onVisibilityChange}
      />
    );

    // Click on PUBLIC option
    const publicLabel = screen.getByText('Public').closest('label');
    if (publicLabel) {
      fireEvent.click(publicLabel);
    }

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        templateId: 'template-1',
        request: { visibility: TemplateVisibility.PUBLIC },
      });
    });
  });

  it('does not trigger change when clicking the same visibility', async () => {
    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PRIVATE}
        isOwner={true}
      />
    );

    // Click on PRIVATE option (current)
    const privateLabel = screen.getByText('Private').closest('label');
    if (privateLabel) {
      fireEvent.click(privateLabel);
    }

    // Should not call mutateAsync
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows confirmation dialog when changing from LINK with active links', async () => {
    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.LINK}
        activeLinksCount={3}
        isOwner={true}
      />
    );

    // Click on PRIVATE option
    const privateLabel = screen.getByText('Private').closest('label');
    if (privateLabel) {
      fireEvent.click(privateLabel);
    }

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Revoke Active Share Links?')).toBeInTheDocument();
    });

    // Should show the count of active links in the dialog description
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(
      screen.getByText(/Anyone with these links will no longer be able to access/)
    ).toBeInTheDocument();
  });

  it('cancels visibility change when clicking Cancel in dialog', async () => {
    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.LINK}
        activeLinksCount={3}
        isOwner={true}
      />
    );

    // Click on PRIVATE option to trigger dialog
    const privateLabel = screen.getByText('Private').closest('label');
    if (privateLabel) {
      fireEvent.click(privateLabel);
    }

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText('Revoke Active Share Links?')).toBeInTheDocument();
    });

    // Click Cancel
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    // Dialog should close and no mutation should be called
    await waitFor(() => {
      expect(screen.queryByText('Revoke Active Share Links?')).not.toBeInTheDocument();
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('confirms visibility change when clicking Revoke & Change in dialog', async () => {
    const onVisibilityChange = vi.fn();

    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.LINK}
        activeLinksCount={3}
        isOwner={true}
        onVisibilityChange={onVisibilityChange}
      />
    );

    // Click on PRIVATE option to trigger dialog
    const privateLabel = screen.getByText('Private').closest('label');
    if (privateLabel) {
      fireEvent.click(privateLabel);
    }

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText('Revoke Active Share Links?')).toBeInTheDocument();
    });

    // Click Revoke & Change
    const confirmButton = screen.getByRole('button', { name: /Revoke & Change/i });
    fireEvent.click(confirmButton);

    // Should call mutation
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        templateId: 'template-1',
        request: { visibility: TemplateVisibility.PRIVATE },
      });
    });
  });

  it('does not show confirmation when changing from LINK with no active links', async () => {
    renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.LINK}
        activeLinksCount={0}
        isOwner={true}
      />
    );

    // Click on PRIVATE option
    const privateLabel = screen.getByText('Private').closest('label');
    if (privateLabel) {
      fireEvent.click(privateLabel);
    }

    // Should not show confirmation dialog
    expect(screen.queryByText('Revoke Active Share Links?')).not.toBeInTheDocument();

    // Should call mutation directly
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('shows correct icons for each visibility option', () => {
    const { container } = renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PRIVATE}
        isOwner={true}
      />
    );

    // Each option should have an icon
    const icons = container.querySelectorAll('svg');
    // Should have at least 3 icons (one for each visibility option)
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });

  it('applies correct color classes for PRIVATE visibility', () => {
    const { container } = renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PRIVATE}
        isOwner={true}
      />
    );

    // PRIVATE option should have slate colors when selected
    const privateLabel = screen.getByText('Private').closest('label');
    expect(privateLabel).toHaveClass('bg-slate-50');
    expect(privateLabel).toHaveClass('border-slate-300');
  });

  it('applies correct color classes for PUBLIC visibility', () => {
    const { container } = renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.PUBLIC}
        isOwner={true}
      />
    );

    // PUBLIC option should have emerald colors when selected
    const publicLabel = screen.getByText('Public').closest('label');
    expect(publicLabel).toHaveClass('bg-emerald-50');
    expect(publicLabel).toHaveClass('border-emerald-500');
  });

  it('applies correct color classes for LINK visibility', () => {
    const { container } = renderWithQuery(
      <VisibilitySelector
        templateId="template-1"
        currentVisibility={TemplateVisibility.LINK}
        isOwner={true}
      />
    );

    // LINK option should have blue colors when selected
    const linkLabel = screen.getByText('Anyone with link').closest('label');
    expect(linkLabel).toHaveClass('bg-blue-50');
    expect(linkLabel).toHaveClass('border-blue-500');
  });
});

describe('VisibilityBadge', () => {
  it('renders PRIVATE visibility badge', () => {
    renderWithQuery(<VisibilityBadge visibility={TemplateVisibility.PRIVATE} />);

    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('renders PUBLIC visibility badge', () => {
    renderWithQuery(<VisibilityBadge visibility={TemplateVisibility.PUBLIC} />);

    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('renders LINK visibility badge', () => {
    renderWithQuery(<VisibilityBadge visibility={TemplateVisibility.LINK} />);

    expect(screen.getByText('Anyone with link')).toBeInTheDocument();
  });

  it('applies PRIVATE color classes (slate)', () => {
    const { container } = renderWithQuery(
      <VisibilityBadge visibility={TemplateVisibility.PRIVATE} />
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-slate-50');
  });

  it('applies PUBLIC color classes (emerald)', () => {
    const { container } = renderWithQuery(
      <VisibilityBadge visibility={TemplateVisibility.PUBLIC} />
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-emerald-50');
  });

  it('applies LINK color classes (blue)', () => {
    const { container } = renderWithQuery(
      <VisibilityBadge visibility={TemplateVisibility.LINK} />
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-blue-50');
  });

  it('applies small size class when size is sm', () => {
    const { container } = renderWithQuery(
      <VisibilityBadge visibility={TemplateVisibility.PRIVATE} size="sm" />
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('px-1.5');
    expect(badge).toHaveClass('py-0');
  });

  it('applies custom className', () => {
    const { container } = renderWithQuery(
      <VisibilityBadge
        visibility={TemplateVisibility.PRIVATE}
        className="custom-badge"
      />
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-badge');
  });

  it('has icon for each visibility type', () => {
    const { container } = renderWithQuery(
      <VisibilityBadge visibility={TemplateVisibility.PRIVATE} />
    );

    // Should have an SVG icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
