/**
 * Tests for UserShareList component
 *
 * Tests:
 * - Loading state shows skeleton
 * - Error state shows error message
 * - Empty state shows no users message
 * - Shows users in users section
 * - Shows teams in teams section
 * - Shows permission badge when canManage is false
 * - Shows permission select when canManage is true
 * - Shows revoke button when canManage is true
 * - Shows expiry info
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../messages/en.json';
import { UserShareList } from '../../../../app/(workspace)/test-templates/[id]/_components/sharing/UserShareList';
import {
  TemplateShare,
  SharePermission,
  GranteeType,
} from '@/types/domain';

// Mock PermissionSelect and PermissionBadge
vi.mock(
  '../../../../app/(workspace)/test-templates/[id]/_components/sharing/PermissionSelect',
  () => ({
    PermissionSelect: ({ value, onChange, disabled }: any) => (
      <select
        data-testid="permission-select"
        value={value}
        disabled={disabled}
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

// Mock data
const mockUserShare: TemplateShare = {
  id: 'share-1',
  templateId: 'template-1',
  granteeType: GranteeType.USER,
  granteeId: 'user-1',
  granteeName: 'John Doe',
  granteeEmail: 'john@example.com',
  granteeAvatarUrl: null,
  permission: SharePermission.VIEW,
  grantedBy: 'owner-1',
  grantedByName: 'Owner',
  createdAt: new Date().toISOString(),
  expiresAt: null,
};

const mockTeamShare: TemplateShare = {
  id: 'share-2',
  templateId: 'template-1',
  granteeType: GranteeType.TEAM,
  granteeId: 'team-1',
  granteeName: 'Engineering Team',
  granteeEmail: null,
  granteeAvatarUrl: null,
  permission: SharePermission.EDIT,
  grantedBy: 'owner-1',
  grantedByName: 'Owner',
  createdAt: new Date().toISOString(),
  expiresAt: null,
};

const mockExpiredShare: TemplateShare = {
  id: 'share-3',
  templateId: 'template-1',
  granteeType: GranteeType.USER,
  granteeId: 'user-2',
  granteeName: 'Expired User',
  granteeEmail: 'expired@example.com',
  granteeAvatarUrl: null,
  permission: SharePermission.VIEW,
  grantedBy: 'owner-1',
  grantedByName: 'Owner',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
};

const mockFutureExpiryShare: TemplateShare = {
  id: 'share-4',
  templateId: 'template-1',
  granteeType: GranteeType.USER,
  granteeId: 'user-3',
  granteeName: 'Future User',
  granteeEmail: 'future@example.com',
  granteeAvatarUrl: null,
  permission: SharePermission.VIEW,
  grantedBy: 'owner-1',
  grantedByName: 'Owner',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), // In 7 days
};

// Mock hooks
let mockSharesData: TemplateShare[] | undefined = undefined;
let mockIsLoading = false;
let mockError: Error | null = null;
const mockUpdateMutateAsync = vi.fn();
const mockRevokeMutateAsync = vi.fn();

vi.mock('@/hooks/queries', () => ({
  useTemplateShares: (templateId: string) => ({
    data: mockSharesData,
    isLoading: mockIsLoading,
    error: mockError,
  }),
  useUpdateShare: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
  useRevokeShare: () => ({
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

describe('UserShareList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSharesData = undefined;
    mockIsLoading = false;
    mockError = null;
    mockUpdateMutateAsync.mockResolvedValue({});
    mockRevokeMutateAsync.mockResolvedValue({});
  });

  describe('Loading State', () => {
    it('shows skeleton when loading', () => {
      mockIsLoading = true;

      renderWithQuery(<UserShareList templateId="template-1" />);

      // Should show skeleton elements
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('shows error message when fetch fails', () => {
      mockError = new Error('Failed to fetch');

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(screen.getByText('Failed to load shares')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no shares', () => {
      mockSharesData = [];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(
        screen.getByText('No users or teams have access')
      ).toBeInTheDocument();
    });

    it('shows hint text in empty state', () => {
      mockSharesData = [];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(
        screen.getByText(
          'Share this template with users or teams using the form above'
        )
      ).toBeInTheDocument();
    });
  });

  describe('User Shares', () => {
    it('shows user shares in Users section', () => {
      mockSharesData = [mockUserShare];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(screen.getByText('Users (1)')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows user email', () => {
      mockSharesData = [mockUserShare];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('shows user initials in avatar', () => {
      mockSharesData = [mockUserShare];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Team Shares', () => {
    it('shows team shares in Teams section', () => {
      mockSharesData = [mockTeamShare];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(screen.getByText('Teams (1)')).toBeInTheDocument();
      expect(screen.getByText('Engineering Team')).toBeInTheDocument();
    });

    it('shows Team badge for team shares', () => {
      mockSharesData = [mockTeamShare];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    it('shows team initials in avatar', () => {
      mockSharesData = [mockTeamShare];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(screen.getByText('ET')).toBeInTheDocument();
    });
  });

  describe('Mixed Shares', () => {
    it('shows both users and teams sections', () => {
      mockSharesData = [mockUserShare, mockTeamShare];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(screen.getByText('Users (1)')).toBeInTheDocument();
      expect(screen.getByText('Teams (1)')).toBeInTheDocument();
    });
  });

  describe('Permission Display', () => {
    it('shows permission badge when canManage is false', () => {
      mockSharesData = [mockUserShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={false} />
      );

      expect(screen.getByTestId('permission-badge')).toBeInTheDocument();
      expect(screen.queryByTestId('permission-select')).not.toBeInTheDocument();
    });

    it('shows permission select when canManage is true', () => {
      mockSharesData = [mockUserShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={true} />
      );

      expect(screen.getByTestId('permission-select')).toBeInTheDocument();
      expect(screen.queryByTestId('permission-badge')).not.toBeInTheDocument();
    });
  });

  describe('Revoke Button', () => {
    it('shows revoke button when canManage is true', () => {
      mockSharesData = [mockUserShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={true} />
      );

      // Look for the trash icon button
      const revokeButton = screen.getByRole('button');
      expect(revokeButton).toBeInTheDocument();
    });

    it('hides revoke button when canManage is false', () => {
      mockSharesData = [mockUserShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={false} />
      );

      // No buttons should be present
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows confirmation dialog when revoke button is clicked', async () => {
      const user = userEvent.setup();
      mockSharesData = [mockUserShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={true} />
      );

      const revokeButton = screen.getByRole('button');
      await user.click(revokeButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(
          screen.getByText(/Are you sure you want to remove access/)
        ).toBeInTheDocument();
      });
    });

    it('includes user name in confirmation dialog', async () => {
      const user = userEvent.setup();
      mockSharesData = [mockUserShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={true} />
      );

      const revokeButton = screen.getByRole('button');
      await user.click(revokeButton);

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog');
        expect(dialog).toHaveTextContent('John Doe');
      });
    });

    it('calls revoke mutation when confirmed', async () => {
      const user = userEvent.setup();
      mockSharesData = [mockUserShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={true} />
      );

      const revokeButton = screen.getByRole('button');
      await user.click(revokeButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Click confirm button - get buttons within the dialog
      const dialog = screen.getByRole('alertdialog');
      const confirmButton = dialog.querySelector('button.bg-destructive');
      expect(confirmButton).toBeInTheDocument();
      await user.click(confirmButton!);

      await waitFor(() => {
        expect(mockRevokeMutateAsync).toHaveBeenCalledWith({
          templateId: 'template-1',
          shareId: 'share-1',
        });
      });
    });

    it('does not call revoke mutation when cancelled', async () => {
      const user = userEvent.setup();
      mockSharesData = [mockUserShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={true} />
      );

      const revokeButton = screen.getByRole('button');
      await user.click(revokeButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Should not call mutation
      expect(mockRevokeMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('Expiry Display', () => {
    it('shows Expired badge for expired shares', () => {
      mockSharesData = [mockExpiredShare];

      renderWithQuery(<UserShareList templateId="template-1" />);

      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('shows expiry time for future expiry shares', () => {
      mockSharesData = [mockFutureExpiryShare];

      renderWithQuery(<UserShareList templateId="template-1" />);

      // Should show "Expires in X days" text
      expect(screen.getByText(/Expires/)).toBeInTheDocument();
    });

    it('disables permission select for expired shares', () => {
      mockSharesData = [mockExpiredShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={true} />
      );

      const select = screen.getByTestId('permission-select');
      expect(select).toBeDisabled();
    });
  });

  describe('Permission Update', () => {
    it('calls update mutation when permission is changed', async () => {
      const user = userEvent.setup();
      mockSharesData = [mockUserShare];

      renderWithQuery(
        <UserShareList templateId="template-1" canManage={true} />
      );

      const select = screen.getByTestId('permission-select');
      await user.selectOptions(select, SharePermission.EDIT);

      await waitFor(() => {
        expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
          templateId: 'template-1',
          shareId: 'share-1',
          request: { permission: SharePermission.EDIT },
        });
      });
    });
  });
});
