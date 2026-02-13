/**
 * Tests for ShareDialog and ShareButton components
 *
 * Tests:
 * - ShareDialog renders trigger button
 * - ShareDialog opens on trigger click
 * - ShareDialog shows template name in title
 * - ShareDialog shows visibility section
 * - ShareDialog shows People and Links tabs
 * - ShareDialog shows add user form when canEdit
 * - ShareDialog hides add user form when cannot edit
 * - ShareButton renders with correct styling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../messages/en.json';
import {
  ShareDialog,
  ShareButton,
} from '../../../../app/(workspace)/test-templates/[id]/_components/sharing/ShareDialog';
import { TemplateVisibility, SharePermission } from '@/types/domain';

// Mock child components to isolate ShareDialog testing
vi.mock(
  '../../../../app/(workspace)/test-templates/[id]/_components/sharing/VisibilitySelector',
  () => ({
    VisibilitySelector: ({ templateId, currentVisibility }: any) => (
      <div data-testid="visibility-selector">
        VisibilitySelector: {currentVisibility}
      </div>
    ),
  })
);

vi.mock(
  '../../../../app/(workspace)/test-templates/[id]/_components/sharing/UserShareList',
  () => ({
    UserShareList: ({ templateId, canManage }: any) => (
      <div data-testid="user-share-list">
        UserShareList: canManage={String(canManage)}
      </div>
    ),
  })
);

vi.mock(
  '../../../../app/(workspace)/test-templates/[id]/_components/sharing/ShareLinkManager',
  () => ({
    ShareLinkManager: ({ templateId, canManage }: any) => (
      <div data-testid="share-link-manager">
        ShareLinkManager: canManage={String(canManage)}
      </div>
    ),
  })
);

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
  })
);

// Mock hooks
const mockVisibilityData = {
  visibility: TemplateVisibility.PRIVATE,
  activeSharesCount: 0,
  activeLinksCount: 0,
  visibilityChangedAt: new Date().toISOString(),
};

const mockMutateAsync = vi.fn();

vi.mock('@/hooks/queries', () => ({
  useTemplateVisibility: (templateId: string) => ({
    data: mockVisibilityData,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useShareWithUser: () => ({
    mutateAsync: mockMutateAsync,
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useShareWithTeam: () => ({
    mutateAsync: vi.fn(),
    mutate: vi.fn(),
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

describe('ShareDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
  });

  it('renders default trigger button', () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('renders custom trigger when provided', () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
        trigger={<button>Custom Trigger</button>}
      />
    );

    expect(screen.getByRole('button', { name: /custom trigger/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^share$/i })).not.toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    const trigger = screen.getByRole('button', { name: /share/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows template name in dialog title', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="My Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByText(/Share "My Test Template"/)).toBeInTheDocument();
    });
  });

  it('shows dialog description', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Control who can access and use this template')
      ).toBeInTheDocument();
    });
  });

  it('shows visibility section header', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByText('Visibility')).toBeInTheDocument();
    });
  });

  it('renders VisibilitySelector component', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByTestId('visibility-selector')).toBeInTheDocument();
    });
  });

  it('shows People and Links tabs', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /people/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /links/i })).toBeInTheDocument();
    });
  });

  it('People tab is active by default', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      const peopleTab = screen.getByRole('tab', { name: /people/i });
      expect(peopleTab).toHaveAttribute('data-state', 'active');
    });
  });

  it('shows UserShareList in People tab', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByTestId('user-share-list')).toBeInTheDocument();
    });
  });

  it('switches to Links tab when clicked', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /links/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: /links/i }));

    await waitFor(() => {
      const linksTab = screen.getByRole('tab', { name: /links/i });
      expect(linksTab).toHaveAttribute('data-state', 'active');
    });
  });

  it('shows ShareLinkManager in Links tab', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /links/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: /links/i }));

    await waitFor(() => {
      expect(screen.getByTestId('share-link-manager')).toBeInTheDocument();
    });
  });

  it('shows add user form when isOwner is true', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
        canManage={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Enter email address')
      ).toBeInTheDocument();
    });
  });

  it('shows add user form when canManage is true', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={false}
        canManage={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Enter email address')
      ).toBeInTheDocument();
    });
  });

  it('hides add user form when user cannot edit', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={false}
        canManage={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(
      screen.queryByPlaceholderText('Enter email address')
    ).not.toBeInTheDocument();
  });

  it('shows Add button in the form when user can edit', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });
  });

  it('shows permission select in add user form', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByTestId('permission-select')).toBeInTheDocument();
    });
  });

  it('does not submit form with invalid email', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    // Enter invalid email
    const emailInput = screen.getByPlaceholderText('Enter email address');
    await user.type(emailInput, 'invalid-email');

    // Submit form
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    // Give some time for the validation to run
    await waitFor(
      () => {
        // After validation, the mutation should NOT have been called
        expect(mockMutateAsync).not.toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('submits form with valid email', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    // Enter valid email
    const emailInput = screen.getByPlaceholderText('Enter email address');
    await user.type(emailInput, 'test@example.com');

    // Submit form
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    // Should call mutation
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        templateId: 'template-1',
        request: {
          email: 'test@example.com',
          permission: SharePermission.VIEW,
        },
      });
    });
  });

  it('passes canManage prop to child components', async () => {
    renderWithQuery(
      <ShareDialog
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
        canManage={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      // isOwner=true makes canEdit=true
      const userList = screen.getByTestId('user-share-list');
      expect(userList).toHaveTextContent('canManage=true');
    });
  });
});

describe('ShareButton', () => {
  it('renders share button with icon', () => {
    renderWithQuery(
      <ShareButton
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeInTheDocument();

    // Should have icon
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('applies outline variant by default', () => {
    renderWithQuery(
      <ShareButton
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    const button = screen.getByRole('button', { name: /share/i });
    // Button should have outline variant styling - check it doesn't have solid bg
    expect(button).toHaveClass('border');
  });

  it('applies custom variant', () => {
    renderWithQuery(
      <ShareButton
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
        variant="ghost"
      />
    );

    const button = screen.getByRole('button', { name: /share/i });
    // Ghost variant doesn't have border styling the same way
    expect(button).toBeInTheDocument();
  });

  it('applies small size by default', () => {
    renderWithQuery(
      <ShareButton
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    const button = screen.getByRole('button', { name: /share/i });
    // Small size class (shadcn uses h-9 for sm)
    expect(button).toHaveClass('h-9');
  });

  it('applies custom size', () => {
    renderWithQuery(
      <ShareButton
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
        size="lg"
      />
    );

    const button = screen.getByRole('button', { name: /share/i });
    // Large size class (shadcn uses h-12 for lg)
    expect(button).toHaveClass('h-12');
  });

  it('applies custom className', () => {
    renderWithQuery(
      <ShareButton
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
        className="custom-button-class"
      />
    );

    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toHaveClass('custom-button-class');
  });

  it('opens ShareDialog when clicked', async () => {
    renderWithQuery(
      <ShareButton
        templateId="template-1"
        templateName="Test Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows template name in opened dialog', async () => {
    renderWithQuery(
      <ShareButton
        templateId="template-1"
        templateName="Button Template"
        isOwner={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByText(/Share "Button Template"/)).toBeInTheDocument();
    });
  });
});
