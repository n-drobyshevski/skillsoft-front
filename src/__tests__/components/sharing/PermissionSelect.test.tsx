/**
 * Tests for PermissionSelect and PermissionBadge components
 *
 * Tests:
 * - PermissionSelect renders with correct permission display
 * - PermissionSelect disables when disabled prop is true
 * - PermissionSelect applies size and className props
 * - PermissionBadge renders with correct permission styling
 *
 * Note: Radix UI Select uses portals which don't work well with jsdom.
 * Dropdown interaction tests would require integration testing.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionSelect, PermissionBadge } from '../../../../app/(workspace)/test-templates/[id]/_components/sharing/PermissionSelect';
import { SharePermission } from '@/types/domain';

describe('PermissionSelect', () => {
  it('renders with VIEW permission', () => {
    const onChange = vi.fn();
    render(
      <PermissionSelect
        value={SharePermission.VIEW}
        onChange={onChange}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('renders with EDIT permission', () => {
    const onChange = vi.fn();
    render(
      <PermissionSelect
        value={SharePermission.EDIT}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('renders with MANAGE permission', () => {
    const onChange = vi.fn();
    render(
      <PermissionSelect
        value={SharePermission.MANAGE}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders with VIEW color styling (blue)', () => {
    const { container } = render(
      <PermissionSelect
        value={SharePermission.VIEW}
        onChange={vi.fn()}
      />
    );

    // Check for the blue color class on the icon
    const icon = container.querySelector('svg.text-blue-600');
    expect(icon).toBeInTheDocument();
  });

  it('renders with EDIT color styling (amber)', () => {
    const { container } = render(
      <PermissionSelect
        value={SharePermission.EDIT}
        onChange={vi.fn()}
      />
    );

    // Check for the amber color class on the icon
    const icon = container.querySelector('svg.text-amber-600');
    expect(icon).toBeInTheDocument();
  });

  it('renders with MANAGE color styling (purple)', () => {
    const { container } = render(
      <PermissionSelect
        value={SharePermission.MANAGE}
        onChange={vi.fn()}
      />
    );

    // Check for the purple color class on the icon
    const icon = container.querySelector('svg.text-purple-600');
    expect(icon).toBeInTheDocument();
  });

  it('disables the select when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <PermissionSelect
        value={SharePermission.VIEW}
        onChange={onChange}
        disabled={true}
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });

  it('is enabled by default', () => {
    const onChange = vi.fn();
    render(
      <PermissionSelect
        value={SharePermission.VIEW}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).not.toBeDisabled();
  });

  it('applies small size class when size is sm', () => {
    const onChange = vi.fn();
    render(
      <PermissionSelect
        value={SharePermission.VIEW}
        onChange={onChange}
        size="sm"
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('h-8');
    expect(trigger).toHaveClass('text-xs');
  });

  it('applies default size class when size is default', () => {
    const onChange = vi.fn();
    render(
      <PermissionSelect
        value={SharePermission.VIEW}
        onChange={onChange}
        size="default"
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('h-10');
  });

  it('applies custom className', () => {
    const onChange = vi.fn();
    render(
      <PermissionSelect
        value={SharePermission.VIEW}
        onChange={onChange}
        className="custom-class"
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('custom-class');
  });

  it('has correct data-state attribute when closed', () => {
    const onChange = vi.fn();
    render(
      <PermissionSelect
        value={SharePermission.VIEW}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });
});

describe('PermissionBadge', () => {
  it('renders VIEW permission badge', () => {
    render(<PermissionBadge permission={SharePermission.VIEW} />);

    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('renders EDIT permission badge', () => {
    render(<PermissionBadge permission={SharePermission.EDIT} />);

    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('renders MANAGE permission badge', () => {
    render(<PermissionBadge permission={SharePermission.MANAGE} />);

    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('applies VIEW color classes', () => {
    const { container } = render(
      <PermissionBadge permission={SharePermission.VIEW} />
    );

    const badge = container.querySelector('.bg-blue-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies EDIT color classes', () => {
    const { container } = render(
      <PermissionBadge permission={SharePermission.EDIT} />
    );

    const badge = container.querySelector('.bg-amber-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies MANAGE color classes', () => {
    const { container } = render(
      <PermissionBadge permission={SharePermission.MANAGE} />
    );

    const badge = container.querySelector('.bg-purple-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies small size class when size is sm', () => {
    const { container } = render(
      <PermissionBadge permission={SharePermission.VIEW} size="sm" />
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('text-xs');
  });

  it('applies custom className', () => {
    const { container } = render(
      <PermissionBadge
        permission={SharePermission.VIEW}
        className="custom-badge-class"
      />
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-badge-class');
  });
});
