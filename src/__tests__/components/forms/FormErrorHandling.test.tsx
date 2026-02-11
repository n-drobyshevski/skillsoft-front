/**
 * Tests for Form Error Handling
 * Phase 5: Form Validation and Error Display Tests
 *
 * Tests cover:
 * - Client-side validation error display
 * - Server-side validation error handling
 * - Form submission error states
 * - Error clearing on retry
 * - Field-level validation
 * - Cross-field validation
 * - Async validation
 * - Form reset behavior
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ============================================
// TEST SCHEMAS (matching patterns from AddUserForm.tsx)
// ============================================
const userFormSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      'Must contain letters and numbers'
    ),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['USER', 'EDITOR', 'ADMIN']),
}).refine(
  (data) => (data.email && data.email.length > 0) || (data.username && data.username.length > 0),
  { message: 'Provide at least one', path: ['email'] }
);

const competencyFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['COGNITIVE', 'INTERPERSONAL', 'LEADERSHIP', 'ADAPTABILITY']),
  level: z.enum(['NOVICE', 'DEVELOPING', 'PROFICIENT', 'ADVANCED', 'EXPERT']),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userFormSchema>;
type CompetencyFormData = z.infer<typeof competencyFormSchema>;

// ============================================
// TEST FORM COMPONENTS
// ============================================

interface TestUserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  defaultValues?: Partial<UserFormData>;
}

function TestUserForm({ onSubmit, defaultValues }: TestUserFormProps) {
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'USER',
      ...defaultValues,
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} data-testid="user-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...form.register('email')}
          aria-invalid={!!form.formState.errors.email}
          data-testid="email-input"
        />
        {form.formState.errors.email && (
          <span role="alert" data-testid="email-error">
            {form.formState.errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          {...form.register('username')}
          aria-invalid={!!form.formState.errors.username}
          data-testid="username-input"
        />
        {form.formState.errors.username && (
          <span role="alert" data-testid="username-error">
            {form.formState.errors.username.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...form.register('password')}
          aria-invalid={!!form.formState.errors.password}
          data-testid="password-input"
        />
        {form.formState.errors.password && (
          <span role="alert" data-testid="password-error">
            {form.formState.errors.password.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          {...form.register('firstName')}
          data-testid="firstName-input"
        />
      </div>

      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          {...form.register('lastName')}
          data-testid="lastName-input"
        />
      </div>

      <div>
        <label htmlFor="role">Role</label>
        <select id="role" {...form.register('role')} data-testid="role-select">
          <option value="USER">User</option>
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {submitError && (
        <div role="alert" data-testid="submit-error">
          {submitError}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} data-testid="submit-button">
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>

      <button type="button" onClick={() => form.reset()} data-testid="reset-button">
        Reset
      </button>
    </form>
  );
}

interface TestCompetencyFormProps {
  onSubmit: (data: CompetencyFormData) => Promise<void>;
  serverErrors?: Record<string, string>;
}

// Stable empty object reference to prevent infinite re-renders
const EMPTY_SERVER_ERRORS: Record<string, string> = {};

function TestCompetencyForm({ onSubmit, serverErrors }: TestCompetencyFormProps) {
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Use stable reference for empty server errors
  const stableServerErrors = serverErrors ?? EMPTY_SERVER_ERRORS;

  const form = useForm<CompetencyFormData>({
    resolver: zodResolver(competencyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'COGNITIVE',
      level: 'NOVICE',
      isActive: true,
    },
    mode: 'onBlur',
  });

  // Apply server errors to form
  React.useEffect(() => {
    setFieldErrors(stableServerErrors);
  }, [stableServerErrors]);

  const handleSubmit = async (data: CompetencyFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});
    try {
      await onSubmit(data);
    } catch (error) {
      if (error instanceof Error) {
        // Handle server-side validation errors
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.fieldErrors) {
            setFieldErrors(errorData.fieldErrors);
          } else {
            setSubmitError(errorData.message || error.message);
          }
        } catch {
          setSubmitError(error.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} data-testid="competency-form">
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          {...form.register('name')}
          aria-invalid={!!form.formState.errors.name || !!fieldErrors.name}
          data-testid="name-input"
        />
        {(form.formState.errors.name || fieldErrors.name) && (
          <span role="alert" data-testid="name-error">
            {form.formState.errors.name?.message || fieldErrors.name}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...form.register('description')}
          aria-invalid={!!form.formState.errors.description || !!fieldErrors.description}
          data-testid="description-input"
        />
        {(form.formState.errors.description || fieldErrors.description) && (
          <span role="alert" data-testid="description-error">
            {form.formState.errors.description?.message || fieldErrors.description}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <select id="category" {...form.register('category')} data-testid="category-select">
          <option value="COGNITIVE">Cognitive</option>
          <option value="INTERPERSONAL">Interpersonal</option>
          <option value="LEADERSHIP">Leadership</option>
          <option value="ADAPTABILITY">Adaptability</option>
        </select>
      </div>

      <div>
        <label htmlFor="level">Level</label>
        <select id="level" {...form.register('level')} data-testid="level-select">
          <option value="NOVICE">Novice</option>
          <option value="DEVELOPING">Developing</option>
          <option value="PROFICIENT">Proficient</option>
          <option value="ADVANCED">Advanced</option>
          <option value="EXPERT">Expert</option>
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            {...form.register('isActive')}
            data-testid="isActive-checkbox"
          />
          Active
        </label>
      </div>

      {submitError && (
        <div role="alert" data-testid="submit-error">
          {submitError}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} data-testid="submit-button">
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}

// ============================================
// TESTS
// ============================================
describe('Form Error Handling', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // Client-Side Validation
  // ==========================================
  describe('Client-Side Validation', () => {
    describe('User Form Validation', () => {
      it('should show error for invalid email', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TestUserForm onSubmit={onSubmit} />);

        await user.type(screen.getByTestId('email-input'), 'invalid-email');
        await user.tab(); // Trigger blur/validation

        await waitFor(() => {
          expect(screen.getByTestId('email-error')).toHaveTextContent(
            'Please enter a valid email address'
          );
        });
      });

      it('should show error for short username', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TestUserForm onSubmit={onSubmit} />);

        await user.type(screen.getByTestId('username-input'), 'ab');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByTestId('username-error')).toHaveTextContent(
            'Username must be at least 3 characters'
          );
        });
      });

      it('should show error for invalid username characters', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TestUserForm onSubmit={onSubmit} />);

        await user.type(screen.getByTestId('username-input'), 'user@name!');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByTestId('username-error')).toHaveTextContent(
            'Letters, numbers, underscores only'
          );
        });
      });

      it('should show error for short password', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TestUserForm onSubmit={onSubmit} />);

        await user.type(screen.getByTestId('password-input'), 'short1');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByTestId('password-error')).toHaveTextContent(
            'Password must be at least 8 characters'
          );
        });
      });

      it('should show error for password without numbers', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TestUserForm onSubmit={onSubmit} />);

        await user.type(screen.getByTestId('password-input'), 'passwordonly');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByTestId('password-error')).toHaveTextContent(
            'Must contain letters and numbers'
          );
        });
      });

      it('should not show error for valid email input', async () => {
        // This tests that valid input doesn't show errors (complementary to error tests above)
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TestUserForm onSubmit={onSubmit} />);

        const emailInput = screen.getByTestId('email-input');

        // Type a valid email and blur
        await user.type(emailInput, 'valid@example.com');
        await user.tab();

        // Give form time to validate
        await waitFor(() => {
          expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
        });
      });
    });

    describe('Competency Form Validation', () => {
      it('should show error for short name', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TestCompetencyForm onSubmit={onSubmit} />);

        await user.type(screen.getByTestId('name-input'), 'ab');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByTestId('name-error')).toHaveTextContent(
            'Name must be at least 3 characters'
          );
        });
      });

      it('should show error for short description', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TestCompetencyForm onSubmit={onSubmit} />);

        await user.type(screen.getByTestId('description-input'), 'Short');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByTestId('description-error')).toHaveTextContent(
            'Description must be at least 10 characters'
          );
        });
      });
    });
  });

  // ==========================================
  // Form Submission Error States
  // ==========================================
  describe('Form Submission Error States', () => {
    it('should display submit error from server', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(new Error('Server error occurred'));

      render(<TestUserForm onSubmit={onSubmit} defaultValues={{
        email: 'test@example.com',
        password: 'password123',
      }} />);

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toHaveTextContent(
          'Server error occurred'
        );
      });
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<TestUserForm onSubmit={onSubmit} defaultValues={{
        email: 'test@example.com',
        password: 'password123',
      }} />);

      await user.click(screen.getByTestId('submit-button'));

      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Submitting...');

      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).not.toBeDisabled();
      });
    });

    it('should clear previous submit error on retry', async () => {
      const user = userEvent.setup();
      let callCount = 0;
      const onSubmit = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First attempt failed'));
        }
        return Promise.resolve();
      });

      render(<TestUserForm onSubmit={onSubmit} defaultValues={{
        email: 'test@example.com',
        password: 'password123',
      }} />);

      // First submit - should fail
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toHaveTextContent(
          'First attempt failed'
        );
      });

      // Second submit - should succeed and clear error
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('submit-error')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // Server-Side Validation Errors
  // ==========================================
  describe('Server-Side Validation Errors', () => {
    it('should display server-side field errors', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(
        new Error(JSON.stringify({
          fieldErrors: {
            name: 'A competency with this name already exists',
          },
        }))
      );

      render(<TestCompetencyForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('name-input'), 'Existing Name');
      await user.type(screen.getByTestId('description-input'), 'Valid description text');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent(
          'A competency with this name already exists'
        );
      });
    });

    it('should display multiple server-side field errors', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(
        new Error(JSON.stringify({
          fieldErrors: {
            name: 'Name is already taken',
            description: 'Description contains prohibited words',
          },
        }))
      );

      render(<TestCompetencyForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('description-input'), 'Test Description Here');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent('Name is already taken');
        expect(screen.getByTestId('description-error')).toHaveTextContent(
          'Description contains prohibited words'
        );
      });
    });

    it('should display general server error message', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(
        new Error(JSON.stringify({
          message: 'Database connection failed',
        }))
      );

      render(<TestCompetencyForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('description-input'), 'Test Description Here');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toHaveTextContent(
          'Database connection failed'
        );
      });
    });
  });

  // ==========================================
  // Form Reset Behavior
  // ==========================================
  describe('Form Reset Behavior', () => {
    it('should clear all errors on form reset', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestUserForm onSubmit={onSubmit} />);

      // Create validation errors
      await user.type(screen.getByTestId('email-input'), 'invalid');
      await user.type(screen.getByTestId('password-input'), 'short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
        expect(screen.getByTestId('password-error')).toBeInTheDocument();
      });

      // Reset the form
      await user.click(screen.getByTestId('reset-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
        expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
      });
    });

    it('should clear input values on form reset', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestUserForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('username-input'), 'testuser');

      expect(screen.getByTestId('email-input')).toHaveValue('test@example.com');
      expect(screen.getByTestId('username-input')).toHaveValue('testuser');

      await user.click(screen.getByTestId('reset-button'));

      await waitFor(() => {
        expect(screen.getByTestId('email-input')).toHaveValue('');
        expect(screen.getByTestId('username-input')).toHaveValue('');
      });
    });
  });

  // ==========================================
  // Cross-Field Validation
  // ==========================================
  describe('Cross-Field Validation', () => {
    it('should show error when neither email nor username is provided', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestUserForm onSubmit={onSubmit} />);

      // Fill password but not email or username
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Provide at least one');
      });
    });

    it('should not show cross-field error when email is provided', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestUserForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });

      expect(screen.queryByText('Provide at least one')).not.toBeInTheDocument();
    });

    it('should not show cross-field error when username is provided', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestUserForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('username-input'), 'validuser');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });

      expect(screen.queryByText('Provide at least one')).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // Accessibility
  // ==========================================
  describe('Accessibility', () => {
    it('should have aria-invalid on fields with errors', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestUserForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('email-input'), 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId('email-input')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have role="alert" on error messages', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestUserForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('email-input'), 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveAttribute('role', 'alert');
      });
    });

    it('should have role="alert" on submit error', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'));

      render(<TestUserForm onSubmit={onSubmit} defaultValues={{
        email: 'test@example.com',
        password: 'password123',
      }} />);

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toHaveAttribute('role', 'alert');
      });
    });
  });

  // ==========================================
  // Successful Submission
  // ==========================================
  describe('Successful Submission', () => {
    it('should call onSubmit with valid data', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      render(<TestUserForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            password: 'password123',
            role: 'USER',
          })
        );
      });
    });

    it('should not show errors after successful submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      render(<TestUserForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });

      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('submit-error')).not.toBeInTheDocument();
    });
  });
});
