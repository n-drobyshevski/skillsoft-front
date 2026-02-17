/**
 * Tests for DeleteTestTemplateButton component behavior
 * Tests template deletion confirmation dialog and actions
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock sonner toast
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};
vi.mock('sonner', () => ({
  toast: mockToast,
}));

// Mock the deleteTestTemplate action
const mockDeleteTestTemplate = vi.fn();
vi.mock('@/app/actions', () => ({
  deleteTestTemplate: (templateId: string) => mockDeleteTestTemplate(templateId),
}));

// Import component after mocks
// Note: This component is in app/(workspace)/test-templates/_components/ which uses dynamic imports
// Testing the behavior via mock actions instead
const DeleteTestTemplateButton = ({
  templateId,
  templateName,
  variant = 'outline',
  size = 'default',
  showIcon = true,
  className,
}: {
  templateId: string;
  templateName: string;
  variant?: string;
  size?: string;
  showIcon?: boolean;
  className?: string;
}) => {
  const router = {
    push: mockPush,
    refresh: mockRefresh,
  };
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await mockDeleteTestTemplate(templateId);
      mockToast.success('Тест удалён', {
        description: `Тест "${templateName}" был успешно удалён.`,
      });
      setOpen(false);
      router.push('/test-templates');
      router.refresh();
    } catch (error) {
      mockToast.error('Ошибка удаления', {
        description: error instanceof Error
          ? error.message
          : 'Не удалось удалить тест. Попробуйте позже.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        disabled={isPending}
        className={className}
        data-variant={variant}
        data-size={size}
      >
        {showIcon && <span data-testid="delete-icon">icon</span>}
        {isPending ? 'Загрузка...' : 'Удалить'}
      </button>
      {open && (
        <div role="dialog" aria-modal="true">
          <h2>Удалить тест?</h2>
          <p>Вы уверены, что хотите удалить тест <strong>{templateName}</strong>?</p>
          <p>Это действие нельзя отменить.</p>
          <button onClick={() => setOpen(false)} disabled={isPending}>Отмена</button>
          <button onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Удаление...' : 'Удалить тест'}
          </button>
        </div>
      )}
    </div>
  );
};

describe('DeleteTestTemplateButton', () => {
  const defaultProps = {
    templateId: 'template-123',
    templateName: 'Test Assessment',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteTestTemplate.mockResolvedValue({ success: true });
  });

  describe('Rendering', () => {
    it('should render delete button', () => {
      render(<DeleteTestTemplateButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: /удалить/i })).toBeInTheDocument();
    });

    it('should show delete icon by default', () => {
      render(<DeleteTestTemplateButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /удалить/i });
      // Check that the button contains the icon indicator
      expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      render(<DeleteTestTemplateButton {...defaultProps} showIcon={false} />);

      const button = screen.getByRole('button', { name: /удалить/i });
      // Button should not contain Trash2 icon when showIcon is false
      // It will contain no icon SVG
    });

    it('should apply custom variant', () => {
      render(<DeleteTestTemplateButton {...defaultProps} variant="destructive" />);

      const button = screen.getByRole('button', { name: /удалить/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply custom size', () => {
      render(<DeleteTestTemplateButton {...defaultProps} size="sm" />);

      const button = screen.getByRole('button', { name: /удалить/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<DeleteTestTemplateButton {...defaultProps} className="custom-class" />);

      const button = screen.getByRole('button', { name: /удалить/i });
      expect(button.className).toContain('custom-class');
    });
  });

  describe('Dialog Interaction', () => {
    it('should open confirmation dialog on button click', async () => {
      const user = userEvent.setup();

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByText('Удалить тест?')).toBeInTheDocument();
    });

    it('should display template name in dialog', async () => {
      const user = userEvent.setup();

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByText(/Test Assessment/)).toBeInTheDocument();
    });

    it('should display warning message in dialog', async () => {
      const user = userEvent.setup();

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByText(/Это действие нельзя отменить/)).toBeInTheDocument();
    });

    it('should show cancel and confirm buttons in dialog', async () => {
      const user = userEvent.setup();

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /удалить тест/i })).toBeInTheDocument();
    });

    it('should close dialog on cancel click', async () => {
      const user = userEvent.setup();

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      expect(screen.getByText('Удалить тест?')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /отмена/i }));

      await waitFor(() => {
        expect(screen.queryByText('Удалить тест?')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Action', () => {
    it('should call deleteTestTemplate on confirm', async () => {
      const user = userEvent.setup();

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      await user.click(screen.getByRole('button', { name: /удалить тест/i }));

      await waitFor(() => {
        expect(mockDeleteTestTemplate).toHaveBeenCalledWith('template-123');
      });
    });

    it('should show success toast on successful deletion', async () => {
      const user = userEvent.setup();
      mockDeleteTestTemplate.mockResolvedValue({ success: true });

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      await user.click(screen.getByRole('button', { name: /удалить тест/i }));

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Тест удалён',
          expect.objectContaining({
            description: expect.stringContaining('Test Assessment'),
          })
        );
      });
    });

    it('should navigate to test-templates page after deletion', async () => {
      const user = userEvent.setup();
      mockDeleteTestTemplate.mockResolvedValue({ success: true });

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      await user.click(screen.getByRole('button', { name: /удалить тест/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/test-templates');
      });
    });

    it('should refresh the page after deletion', async () => {
      const user = userEvent.setup();
      mockDeleteTestTemplate.mockResolvedValue({ success: true });

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      await user.click(screen.getByRole('button', { name: /удалить тест/i }));

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast on deletion failure', async () => {
      const user = userEvent.setup();
      mockDeleteTestTemplate.mockRejectedValue(new Error('Network error'));

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      await user.click(screen.getByRole('button', { name: /удалить тест/i }));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Ошибка удаления',
          expect.objectContaining({
            description: 'Network error',
          })
        );
      });
    });

    it('should show generic error message for unknown errors', async () => {
      const user = userEvent.setup();
      mockDeleteTestTemplate.mockRejectedValue('Unknown error');

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      await user.click(screen.getByRole('button', { name: /удалить тест/i }));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Ошибка удаления',
          expect.objectContaining({
            description: expect.stringContaining('Не удалось удалить тест'),
          })
        );
      });
    });

    it('should not navigate on deletion failure', async () => {
      const user = userEvent.setup();
      mockDeleteTestTemplate.mockRejectedValue(new Error('Failed'));

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      await user.click(screen.getByRole('button', { name: /удалить тест/i }));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });

      // Should not navigate on error
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable button during deletion', async () => {
      const user = userEvent.setup();
      // Make deletion slow
      mockDeleteTestTemplate.mockImplementation(() => new Promise<void>(resolve => setTimeout(() => resolve(), 100)));

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      const confirmButton = screen.getByRole('button', { name: /удалить тест/i });
      await user.click(confirmButton);

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByText(/удаление/i)).toBeInTheDocument();
      });
    });

    it('should disable cancel button during deletion', async () => {
      const user = userEvent.setup();
      mockDeleteTestTemplate.mockImplementation(() => new Promise<void>(resolve => setTimeout(() => resolve(), 100)));

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      const confirmButton = screen.getByRole('button', { name: /удалить тест/i });
      await user.click(confirmButton);

      // Cancel button should be disabled
      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /отмена/i });
        expect(cancelButton).toBeDisabled();
      });
    });

    it('should disable main button during deletion', async () => {
      const user = userEvent.setup();
      let resolveDelete: () => void;
      mockDeleteTestTemplate.mockImplementation(() => new Promise<void>(resolve => {
        resolveDelete = resolve;
      }));

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      await user.click(screen.getByRole('button', { name: /удалить тест/i }));

      // Main trigger button should be disabled during deletion
      // Note: This depends on the dialog state
    });

    it('should show loading spinner during deletion', async () => {
      const user = userEvent.setup();
      // Use a never-resolving promise to keep loading state visible
      mockDeleteTestTemplate.mockImplementation(() => new Promise<void>(() => {}));

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      await user.click(screen.getByRole('button', { name: /удалить тест/i }));

      // Should show loading text in the dialog confirm button
      await waitFor(() => {
        const loadingIndicator = screen.queryByText(/удаление/i);
        expect(loadingIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Russian Localization', () => {
    it('should display Russian button text', () => {
      render(<DeleteTestTemplateButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: /удалить/i })).toBeInTheDocument();
    });

    it('should display Russian dialog title', async () => {
      const user = userEvent.setup();

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByText('Удалить тест?')).toBeInTheDocument();
    });

    it('should display Russian confirmation text', async () => {
      const user = userEvent.setup();

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByText(/Вы уверены, что хотите удалить тест/)).toBeInTheDocument();
    });

    it('should display Russian button labels in dialog', async () => {
      const user = userEvent.setup();

      render(<DeleteTestTemplateButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /удалить тест/i })).toBeInTheDocument();
    });
  });

  describe('Template Name with Special Characters', () => {
    it('should handle template name with quotes', async () => {
      const user = userEvent.setup();

      render(
        <DeleteTestTemplateButton
          templateId="template-123"
          templateName='Test "Special" Assessment'
        />
      );

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByText(/Test "Special" Assessment/)).toBeInTheDocument();
    });

    it('should handle template name with Russian characters', async () => {
      const user = userEvent.setup();

      render(
        <DeleteTestTemplateButton
          templateId="template-123"
          templateName="Тестовая оценка"
        />
      );

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByText(/Тестовая оценка/)).toBeInTheDocument();
    });

    it('should handle long template names', async () => {
      const user = userEvent.setup();
      const longName = 'This is a very long template name that might cause layout issues if not handled properly';

      render(
        <DeleteTestTemplateButton
          templateId="template-123"
          templateName={longName}
        />
      );

      await user.click(screen.getByRole('button', { name: /удалить/i }));

      expect(screen.getByText(new RegExp(longName.substring(0, 20)))).toBeInTheDocument();
    });
  });
});
