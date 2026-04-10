import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../shared/api/errors';
import { renderWithProviders } from '../../../test/render';
import { UserRolesModal, type RoleOption } from '../components/user-roles-modal';
import type { UserResponse } from '../types';

const { assignMock, removeMock } = vi.hoisted(() => ({
  assignMock: vi.fn(),
  removeMock: vi.fn()
}));

vi.mock('../api/use-assign-role', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    assignRoleRequest: (vars: unknown) => assignMock(vars),
    useAssignRoleMutation: () =>
      useMutation({ mutationFn: (vars: unknown) => assignMock(vars) })
  };
});

vi.mock('../api/use-remove-role', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    removeRoleRequest: (vars: unknown) => removeMock(vars),
    useRemoveRoleMutation: () =>
      useMutation({ mutationFn: (vars: unknown) => removeMock(vars) })
  };
});

afterEach(() => {
  assignMock.mockReset();
  removeMock.mockReset();
});

const allRoles: RoleOption[] = [
  { id: 'r-admin', name: 'ROLE_ADMIN' },
  { id: 'r-user', name: 'ROLE_USER' },
  { id: 'r-mod', name: 'ROLE_MODERATOR' }
];

const userWithUserRole: UserResponse = {
  id: 'u-1',
  name: 'Bob User',
  email: 'bob@example.com',
  verified: true,
  roles: ['ROLE_USER'],
  createdAt: '2026-01-01T00:00:00Z'
};

describe('UserRolesModal', () => {
  it('does not render visible content when no user is targeted', () => {
    renderWithProviders(
      <UserRolesModal user={null} availableRoles={allRoles} onClose={() => {}} />
    );
    expect(screen.queryByText(/manage roles/i)).not.toBeInTheDocument();
  });

  it('shows current roles and addable roles for the user', () => {
    renderWithProviders(
      <UserRolesModal user={userWithUserRole} availableRoles={allRoles} onClose={() => {}} />
    );
    expect(screen.getByText(/manage roles: bob user/i)).toBeInTheDocument();
    // Current role appears in the "Current roles" badges section
    expect(screen.getByText('ROLE_USER')).toBeInTheDocument();
    // Remove button for the current role
    expect(screen.getByRole('button', { name: /remove role_user/i })).toBeInTheDocument();
  });

  it('removes a role when the badge close button is clicked', async () => {
    removeMock.mockResolvedValue({ ...userWithUserRole, roles: [] });
    renderWithProviders(
      <UserRolesModal user={userWithUserRole} availableRoles={allRoles} onClose={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /remove role_user/i }));
    await waitFor(() =>
      expect(removeMock).toHaveBeenCalledWith({ userId: 'u-1', roleId: 'r-user' })
    );
  });

  it('disables Add until a role is selected', () => {
    renderWithProviders(
      <UserRolesModal user={userWithUserRole} availableRoles={allRoles} onClose={() => {}} />
    );
    expect(screen.getByRole('button', { name: /^add$/i })).toBeDisabled();
  });

  it('shows an empty hint when no roles are addable', () => {
    const userWithAllRoles: UserResponse = {
      ...userWithUserRole,
      roles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MODERATOR']
    };
    renderWithProviders(
      <UserRolesModal user={userWithAllRoles} availableRoles={allRoles} onClose={() => {}} />
    );
    expect(screen.getByText(/no more roles available to assign/i)).toBeInTheDocument();
  });

  it('surfaces ApiError messages from a failed remove', async () => {
    removeMock.mockRejectedValue(
      new ApiError(409, 'Cannot remove last admin', {
        timestamp: '',
        status: 409,
        error: 'Conflict',
        message: 'Cannot remove last admin',
        path: '/api/users/u-1/roles/r-user'
      })
    );
    renderWithProviders(
      <UserRolesModal user={userWithUserRole} availableRoles={allRoles} onClose={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /remove role_user/i }));
    expect(await screen.findByText('Cannot remove last admin')).toBeInTheDocument();
  });
});