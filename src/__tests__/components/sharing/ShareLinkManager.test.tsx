/**
 * Tests for ShareLinkManager component
 *
 * Tests:
 * - Shows link count header
 * - Loading state shows skeleton
 * - Empty state shows no links message
 * - Shows create button when canManage is true
 * - Hides create button when canManage is false
 * - Shows links list with details
 * - Shows expired/used up badges
 * - Revoke functionality with confirmation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../messages/en/index';
import { ShareLinkManager } from '../../../../app/(workspace)/test-templates/[id]/_components/sharing/ShareLinkManager';
import { ShareLink, SharePermission } from '@/types/domain';

// Mock child components
vi.mock(
  '../../../../app/(workspace)/test-templates/[id]/_components/sharing/PermissionSelect',
  () => ({
    PermissionSelect: ({ value, onChange }: any) => (
      <select
        data-testid="permission-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SharePermission)}
      >
        <option value={SharePermission.VIEW}>Viewer</option>
        <option value={SharePermission.EDIT}>Editor</option>
        <option value={SharePermission.MANAGE}>Manager</option>
      </select>
    ),
    PermissionBadge: ({ permission }: any) => (
      <span data-testid="permission-badge">{permission}</span>
    ),
  })
);

vi.mock(
  '../../../../app/(workspace)/test-templates/[id]/_components/sharing/CopyLinkButton',
  () => ({
    CopyLinkButton: ({ token }: any) => (
      <button data-testid="copy-link-button">Copy</button>
    ),
    ShareUrlDisplay: ({ token }: any) => (
      <span data-testid="share-url">Link URL</span>
    ),
  })
);

// Mock data
const mockActiveLink: ShareLink = {
  id: 'link-1',
  templateId: 'template-1',
  token: 'abc123token',
  tokenMasked: false,
  permission: SharePermission.VIEW,
  createdById: 'owner-1',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), // In 7 days
  usageCount: 5,
  label: 'Interview Link',
  isActive: true,
};

const mockExpiredLink: ShareLink = {
  id: 'link-2',
  templateId: 'template-1',
  token: 'expired123',
  tokenMasked: false,
  permission: SharePermission.VIEW,
  createdById: 'owner-1',
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
  expiresAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  usageCount: 10,
  label: 'Expired Link',
  isActive: true,
};

const mockUsedUpLink: ShareLink = {
  id: 'link-3',
  templateId: 'template-1',
  token: 'usedup123',
  tokenMasked: false,
  permission: SharePermission.VIEW,
  createdById: 'owner-1',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
  usageCount: 10,
  maxUses: 10, // Limit reached
  label: 'Used Up Link',
  isActive: true,
};

// Mock hooks
let mockLinksData: ShareLink[] | undefined = undefined;
let mockLinksLoading = false;
let mockLinkCount = { activeCount: 0, maxLinks: 10 };
let mockCanCreate = true;
const mockCreateMutateAsync = vi.fn();
const mockRevokeMutateAsync = vi.fn();

vi.mock('@/hooks/queries', () => ({
  useActiveShareLinks: (templateId: string) => ({
    data: mockLinksData,
    isLoading: mockLinksLoading,
    error: null,
  }),
  useLinkCount: (templateId: string) => ({
    data: mockLinkCount,
  }),
  useCanCreateLink: (templateId: string) => ({
    data: mockCanCreate,
  }),
  useCreateShareLink: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
  useRevokeShareLink: () => ({
    mutateAsync: mockRevokeMutateAsync,
    isPending: false,
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

describe('ShareLinkManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLinksData = undefined;
    mockLinksLoading = false;
    mockLinkCount = { activeCount: 0, maxLinks: 10 };
    mockCanCreate = true;
    mockCreateMutateAsync.mockResolvedValue({ id: 'new-link', token: 'newtoken' });
    mockRevokeMutateAsync.mockResolvedValue({});
  });

  describe('Header', () => {
    it('shows Share Links title', () => {
      mockLinksData = [];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByText('Share Links')).toBeInTheDocument();
    });

    it('shows link count', () => {
      mockLinksData = [];
      mockLinkCount = { activeCount: 3, maxLinks: 10 };

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByText('3 of 10 links used')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows skeleton when loading', () => {
      mockLinksLoading = true;

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no links', () => {
      mockLinksData = [];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByText('No active share links')).toBeInTheDocument();
    });

    it('shows hint text in empty state', () => {
      mockLinksData = [];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(
        screen.getByText(
          'Create a link to share this template without adding specific users'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Create Button', () => {
    it('shows create button when canManage is true', () => {
      mockLinksData = [];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      expect(
        screen.getByRole('button', { name: /create link/i })
      ).toBeInTheDocument();
    });

    it('hides create button when canManage is false', () => {
      mockLinksData = [];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={false} />
      );

      expect(
        screen.queryByRole('button', { name: /create link/i })
      ).not.toBeInTheDocument();
    });

    it('disables create button when canCreate is false', () => {
      mockLinksData = [];
      mockCanCreate = false;

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      const button = screen.getByRole('button', { name: /create link/i });
      expect(button).toBeDisabled();
    });

    it('shows limit warning when canCreate is false', () => {
      mockLinksData = [];
      mockCanCreate = false;

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      expect(
        screen.getByText(/Maximum link limit reached/)
      ).toBeInTheDocument();
    });
  });

  describe('Create Form', () => {
    it('shows create form when button is clicked', async () => {
      const user = userEvent.setup();
      mockLinksData = [];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      await user.click(screen.getByRole('button', { name: /create link/i }));

      await waitFor(() => {
        expect(screen.getByText('Permission')).toBeInTheDocument();
        expect(screen.getByText('Expires In')).toBeInTheDocument();
      });
    });

    it('shows cancel button in form', async () => {
      const user = userEvent.setup();
      mockLinksData = [];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      await user.click(screen.getByRole('button', { name: /create link/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /cancel/i })
        ).toBeInTheDocument();
      });
    });

    it('hides form when cancel is clicked', async () => {
      const user = userEvent.setup();
      mockLinksData = [];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      await user.click(screen.getByRole('button', { name: /create link/i }));

      await waitFor(() => {
        expect(screen.getByText('Permission')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByText('Permission')).not.toBeInTheDocument();
      });
    });

    it('has label and max uses optional fields', async () => {
      const user = userEvent.setup();
      mockLinksData = [];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      await user.click(screen.getByRole('button', { name: /create link/i }));

      await waitFor(() => {
        expect(screen.getByText('Label (Optional)')).toBeInTheDocument();
        expect(screen.getByText('Max Uses (Optional)')).toBeInTheDocument();
      });
    });

    it('submits form and creates link', async () => {
      const user = userEvent.setup();
      mockLinksData = [];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      await user.click(screen.getByRole('button', { name: /create link/i }));

      await waitFor(() => {
        expect(screen.getByText('Permission')).toBeInTheDocument();
      });

      // The submit button inside the form also says "Create Link"
      const buttons = screen.getAllByRole('button', { name: /create link/i });
      const submitButton = buttons[buttons.length - 1]; // The last one is the form submit
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateMutateAsync).toHaveBeenCalledWith({
          templateId: 'template-1',
          request: expect.objectContaining({
            permission: SharePermission.VIEW,
            expiresInDays: 7,
          }),
        });
      });
    });
  });

  describe('Links List', () => {
    it('shows link label', () => {
      mockLinksData = [mockActiveLink];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByText('Interview Link')).toBeInTheDocument();
    });

    it('shows default label when no label set', () => {
      mockLinksData = [{ ...mockActiveLink, label: undefined }];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByText('Share Link')).toBeInTheDocument();
    });

    it('shows permission badge', () => {
      mockLinksData = [mockActiveLink];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByTestId('permission-badge')).toBeInTheDocument();
    });

    it('shows usage count', () => {
      mockLinksData = [mockActiveLink];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByText(/5.*uses/)).toBeInTheDocument();
    });

    it('shows expiry time', () => {
      mockLinksData = [mockActiveLink];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByText(/Expires/)).toBeInTheDocument();
    });

    it('shows Expired badge for expired links', () => {
      mockLinksData = [mockExpiredLink];

      const { container } = renderWithQuery(
        <ShareLinkManager templateId="template-1" />
      );

      // Look for the Expired badge specifically (not the expiry text)
      const expiredBadge = container.querySelector('[data-slot="badge"]');
      expect(expiredBadge).toHaveTextContent('Expired');
    });

    it('shows Used Up badge for exhausted links', () => {
      mockLinksData = [mockUsedUpLink];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByText('Used Up')).toBeInTheDocument();
    });

    it('shows share URL display for active links', () => {
      mockLinksData = [mockActiveLink];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.getByTestId('share-url')).toBeInTheDocument();
    });

    it('hides share URL display for expired links', () => {
      mockLinksData = [mockExpiredLink];

      renderWithQuery(<ShareLinkManager templateId="template-1" />);

      expect(screen.queryByTestId('share-url')).not.toBeInTheDocument();
    });
  });

  describe('Revoke Link', () => {
    it('shows revoke button when canManage is true', () => {
      mockLinksData = [mockActiveLink];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      // Find the button with trash icon (revoke button)
      const buttons = screen.getAllByRole('button');
      const revokeButton = buttons.find((btn) =>
        btn.querySelector('svg.lucide-trash-2')
      );
      expect(revokeButton).toBeInTheDocument();
    });

    it('hides revoke button when canManage is false', () => {
      mockLinksData = [mockActiveLink];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={false} />
      );

      // No buttons should be present
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows confirmation dialog on revoke click', async () => {
      const user = userEvent.setup();
      mockLinksData = [mockActiveLink];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      const buttons = screen.getAllByRole('button');
      const revokeButton = buttons.find((btn) =>
        btn.querySelector('svg.lucide-trash-2')
      );

      if (revokeButton) {
        await user.click(revokeButton);
      }

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText('Revoke Share Link')).toBeInTheDocument();
      });
    });

    it('revokes link when confirmed', async () => {
      const user = userEvent.setup();
      mockLinksData = [mockActiveLink];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      const buttons = screen.getAllByRole('button');
      const revokeButton = buttons.find((btn) =>
        btn.querySelector('svg.lucide-trash-2')
      );

      if (revokeButton) {
        await user.click(revokeButton);
      }

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Click confirm button
      const dialog = screen.getByRole('alertdialog');
      const confirmButton = dialog.querySelector('button.bg-destructive');
      if (confirmButton) {
        await user.click(confirmButton);
      }

      await waitFor(() => {
        expect(mockRevokeMutateAsync).toHaveBeenCalledWith({
          templateId: 'template-1',
          linkId: 'link-1',
        });
      });
    });

    it('does not revoke when cancelled', async () => {
      const user = userEvent.setup();
      mockLinksData = [mockActiveLink];

      renderWithQuery(
        <ShareLinkManager templateId="template-1" canManage={true} />
      );

      const buttons = screen.getAllByRole('button');
      const revokeButton = buttons.find((btn) =>
        btn.querySelector('svg.lucide-trash-2')
      );

      if (revokeButton) {
        await user.click(revokeButton);
      }

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockRevokeMutateAsync).not.toHaveBeenCalled();
    });
  });
});
