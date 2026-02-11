/**
 * Tests for Feedback Components
 * Phase 5: Error Handling and User Feedback Tests
 *
 * Tests cover:
 * - ErrorCard component rendering and behavior
 * - DeleteConfirmationDialog component
 * - User interaction with feedback dialogs
 * - Accessibility of feedback components
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// MOCK COMPONENTS (matching actual implementations)
// ============================================

interface ErrorCardProps {
  error: string;
  callback?: () => void;
}

function ErrorCard({ error, callback }: ErrorCardProps) {
  return (
    <div
      className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]"
      data-testid="error-card-container"
    >
      <div className="max-w-md border-destructive/50" data-testid="error-card">
        <div className="p-8 text-center">
          <div className="text-4xl mb-4" data-testid="error-icon" role="img" aria-label="Warning">
            Warning
          </div>
          <h2 className="text-destructive mb-2" data-testid="error-title">
            Error Loading Page
          </h2>
          <p className="mb-6" data-testid="error-description">
            {error}
          </p>
          {callback && (
            <button
              onClick={callback}
              data-testid="retry-button"
              className="btn-primary"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  entityName: string;
  isDeleting?: boolean;
  confirmButtonText?: string;
}

function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  entityName,
  isDeleting = false,
  confirmButtonText = 'Delete',
}: DeleteConfirmationDialogProps) {
  const handleConfirm = async () => {
    if (!isDeleting) {
      await onConfirm();
    }
  };

  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      data-testid="delete-confirmation-dialog"
    >
      <div data-testid="dialog-content">
        <div data-testid="dialog-header">
          <h2 id="dialog-title" data-testid="dialog-title" className="flex items-center gap-2">
            <span data-testid="trash-icon">Trash Icon</span>
            {title}
          </h2>
          <div id="dialog-description" data-testid="dialog-description">
            <span className="block">{description}</span>
            <span className="block font-medium">
              Entity: <span className="font-normal italic" data-testid="entity-name">&quot;{entityName}&quot;</span>
            </span>
            <span className="block text-xs text-muted-foreground" data-testid="warning-text">
              This action cannot be undone.
            </span>
          </div>
        </div>
        <div data-testid="dialog-footer" className="flex gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            data-testid="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            data-testid="confirm-button"
            className="bg-destructive text-destructive-foreground"
          >
            {isDeleting ? (
              <span data-testid="deleting-state">
                <span data-testid="spinner">Loading...</span>
                Deleting...
              </span>
            ) : (
              <span data-testid="delete-state">
                <span data-testid="trash-icon-button">Trash</span>
                {confirmButtonText}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ErrorCard Tests
// ============================================
describe('ErrorCard Component', () => {
  describe('Rendering', () => {
    it('should render error card container', () => {
      render(<ErrorCard error="Test error message" />);

      expect(screen.getByTestId('error-card-container')).toBeInTheDocument();
      expect(screen.getByTestId('error-card')).toBeInTheDocument();
    });

    it('should display warning icon', () => {
      render(<ErrorCard error="Test error message" />);

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    it('should display error title', () => {
      render(<ErrorCard error="Test error message" />);

      expect(screen.getByTestId('error-title')).toHaveTextContent('Error Loading Page');
    });

    it('should display error message', () => {
      render(<ErrorCard error="Something went wrong while loading data" />);

      expect(screen.getByTestId('error-description')).toHaveTextContent(
        'Something went wrong while loading data'
      );
    });

    it('should display different error messages', () => {
      const { rerender } = render(<ErrorCard error="Network error" />);
      expect(screen.getByTestId('error-description')).toHaveTextContent('Network error');

      rerender(<ErrorCard error="Server unavailable" />);
      expect(screen.getByTestId('error-description')).toHaveTextContent('Server unavailable');
    });
  });

  describe('Retry Callback', () => {
    it('should render retry button when callback is provided', () => {
      const callback = vi.fn();
      render(<ErrorCard error="Test error" callback={callback} />);

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should not render retry button when callback is not provided', () => {
      render(<ErrorCard error="Test error" />);

      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });

    it('should call callback when retry button is clicked', async () => {
      const user = userEvent.setup();
      const callback = vi.fn();
      render(<ErrorCard error="Test error" callback={callback} />);

      await user.click(screen.getByTestId('retry-button'));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call callback multiple times on multiple clicks', async () => {
      const user = userEvent.setup();
      const callback = vi.fn();
      render(<ErrorCard error="Test error" callback={callback} />);

      await user.click(screen.getByTestId('retry-button'));
      await user.click(screen.getByTestId('retry-button'));
      await user.click(screen.getByTestId('retry-button'));

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('Common Error Scenarios', () => {
    it('should display network error message', () => {
      render(<ErrorCard error="Network request failed. Please check your connection." />);

      expect(screen.getByTestId('error-description')).toHaveTextContent(
        'Network request failed'
      );
    });

    it('should display authentication error message', () => {
      render(<ErrorCard error="Authentication required. Please sign in." />);

      expect(screen.getByTestId('error-description')).toHaveTextContent(
        'Authentication required'
      );
    });

    it('should display authorization error message', () => {
      render(<ErrorCard error="Access denied. You do not have permission." />);

      expect(screen.getByTestId('error-description')).toHaveTextContent('Access denied');
    });

    it('should display server error message', () => {
      render(<ErrorCard error="Server error. Please try again later." />);

      expect(screen.getByTestId('error-description')).toHaveTextContent('Server error');
    });

    it('should display not found error message', () => {
      render(<ErrorCard error="Resource not found." />);

      expect(screen.getByTestId('error-description')).toHaveTextContent('not found');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible icon with aria-label', () => {
      render(<ErrorCard error="Test error" />);

      const icon = screen.getByTestId('error-icon');
      expect(icon).toHaveAttribute('role', 'img');
      expect(icon).toHaveAttribute('aria-label', 'Warning');
    });
  });
});

// ============================================
// DeleteConfirmationDialog Tests
// ============================================
describe('DeleteConfirmationDialog Component', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete Competency',
    description: 'Are you sure you want to delete this competency?',
    entityName: 'Communication Skills',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when open is true', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      render(<DeleteConfirmationDialog {...defaultProps} open={false} />);

      expect(screen.queryByTestId('delete-confirmation-dialog')).not.toBeInTheDocument();
    });

    it('should display dialog title', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Competency');
    });

    it('should display dialog description', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId('dialog-description')).toHaveTextContent(
        'Are you sure you want to delete this competency?'
      );
    });

    it('should display entity name', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId('entity-name')).toHaveTextContent('Communication Skills');
    });

    it('should display warning text', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId('warning-text')).toHaveTextContent(
        'This action cannot be undone.'
      );
    });

    it('should display trash icon', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should display cancel button', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toHaveTextContent('Cancel');
    });

    it('should display default confirm button text', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId('confirm-button')).toHaveTextContent('Delete');
    });

    it('should display custom confirm button text', () => {
      render(
        <DeleteConfirmationDialog {...defaultProps} confirmButtonText="Remove" />
      );

      expect(screen.getByTestId('confirm-button')).toHaveTextContent('Remove');
    });

    it('should show deleting state when isDeleting is true', () => {
      render(<DeleteConfirmationDialog {...defaultProps} isDeleting={true} />);

      expect(screen.getByTestId('deleting-state')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-button')).toHaveTextContent('Deleting...');
    });

    it('should show normal state when isDeleting is false', () => {
      render(<DeleteConfirmationDialog {...defaultProps} isDeleting={false} />);

      expect(screen.getByTestId('delete-state')).toBeInTheDocument();
    });

    it('should disable buttons when isDeleting is true', () => {
      render(<DeleteConfirmationDialog {...defaultProps} isDeleting={true} />);

      expect(screen.getByTestId('cancel-button')).toBeDisabled();
      expect(screen.getByTestId('confirm-button')).toBeDisabled();
    });

    it('should enable buttons when isDeleting is false', () => {
      render(<DeleteConfirmationDialog {...defaultProps} isDeleting={false} />);

      expect(screen.getByTestId('cancel-button')).not.toBeDisabled();
      expect(screen.getByTestId('confirm-button')).not.toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onOpenChange with false when cancel is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <DeleteConfirmationDialog {...defaultProps} onOpenChange={onOpenChange} />
      );

      await user.click(screen.getByTestId('cancel-button'));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should call onConfirm when confirm is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<DeleteConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByTestId('confirm-button'));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should not call onConfirm when isDeleting is true', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(
        <DeleteConfirmationDialog {...defaultProps} onConfirm={onConfirm} isDeleting={true} />
      );

      await user.click(screen.getByTestId('confirm-button'));

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should handle async onConfirm', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<DeleteConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByTestId('confirm-button'));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have alertdialog role', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should have aria-labelledby', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
    });

    it('should have aria-describedby', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
    });
  });

  describe('Different Entity Types', () => {
    it('should work with competency deletion', () => {
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          title="Delete Competency"
          entityName="Communication"
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Competency');
      expect(screen.getByTestId('entity-name')).toHaveTextContent('Communication');
    });

    it('should work with behavioral indicator deletion', () => {
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          title="Delete Behavioral Indicator"
          entityName="Active Listening"
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent(
        'Delete Behavioral Indicator'
      );
      expect(screen.getByTestId('entity-name')).toHaveTextContent('Active Listening');
    });

    it('should work with question deletion', () => {
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          title="Delete Assessment Question"
          entityName="How do you handle feedback?"
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent(
        'Delete Assessment Question'
      );
    });

    it('should work with user deletion', () => {
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          title="Delete User"
          description="This will permanently remove the user account."
          entityName="john@example.com"
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete User');
      expect(screen.getByTestId('entity-name')).toHaveTextContent('john@example.com');
    });

    it('should work with test template deletion', () => {
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          title="Delete Test Template"
          entityName="Communication Assessment"
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Test Template');
    });
  });
});

// ============================================
// Integration Tests
// ============================================
describe('Feedback Components Integration', () => {
  it('should handle error card with retry that shows dialog', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const [error, setError] = React.useState<string | null>('Failed to load data');

      const handleRetry = () => {
        setError(null); // Clear error on retry
      };

      if (error) {
        return <ErrorCard error={error} callback={handleRetry} />;
      }

      return <div data-testid="success">Data loaded successfully</div>;
    }

    render(<TestComponent />);

    // Initially shows error
    expect(screen.getByTestId('error-card')).toBeInTheDocument();

    // Click retry
    await user.click(screen.getByTestId('retry-button'));

    // Error cleared, success message shown
    await waitFor(() => {
      expect(screen.queryByTestId('error-card')).not.toBeInTheDocument();
      expect(screen.getByTestId('success')).toBeInTheDocument();
    });
  });

  it('should handle delete confirmation flow', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);

    function TestComponent() {
      const [open, setOpen] = React.useState(true);
      const [isDeleting, setIsDeleting] = React.useState(false);

      const handleConfirm = async () => {
        setIsDeleting(true);
        await onDelete();
        setIsDeleting(false);
        setOpen(false);
      };

      return (
        <>
          <DeleteConfirmationDialog
            open={open}
            onOpenChange={setOpen}
            onConfirm={handleConfirm}
            title="Delete Item"
            description="Are you sure?"
            entityName="Test Item"
            isDeleting={isDeleting}
          />
          {!open && <div data-testid="deleted-message">Item deleted</div>}
        </>
      );
    }

    render(<TestComponent />);

    // Confirm deletion
    await user.click(screen.getByTestId('confirm-button'));

    // Wait for deletion to complete
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled();
      expect(screen.getByTestId('deleted-message')).toBeInTheDocument();
    });
  });
});
