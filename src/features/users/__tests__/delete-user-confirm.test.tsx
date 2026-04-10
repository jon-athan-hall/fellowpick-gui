import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../shared/api/errors';
import { renderWithProviders } from '../../../test/render';
import { DeleteUserConfirm } from '../components/delete-user-confirm';
import type { UserResponse } from '../types';

const { deleteMock } = vi.hoisted(() => ({ deleteMock: vi.fn() }));
vi.mock('../api/use-delete-user', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    deleteUserRequest: (id: string) => deleteMock(id),
    useDeleteUserMutation: () =>
      useMutation({ mutationFn: (id: string) => deleteMock(id) })
  };
});

afterEach(() => {
  deleteMock.mockReset();
});

const sampleUser: UserResponse = {
  id: 'u-1',
  name: 'Bob User',
  email: 'bob@example.com',
  verified: true,
  roles: ['ROLE_USER'],
  createdAt: '2026-01-01T00:00:00Z'
};

describe('DeleteUserConfirm', () => {
  it('does not render when no user is targeted', () => {
    renderWithProviders(<DeleteUserConfirm user={null} onClose={() => {}} />);
    expect(screen.queryByText(/delete user/i)).not.toBeInTheDocument();
  });

  it('shows the user name and email and asks for confirmation', () => {
    renderWithProviders(<DeleteUserConfirm user={sampleUser} onClose={() => {}} />);
    expect(screen.getByText('Bob User')).toBeInTheDocument();
    expect(screen.getByText(/bob@example\.com/)).toBeInTheDocument();
  });

  it('calls delete and closes on confirm', async () => {
    deleteMock.mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderWithProviders(<DeleteUserConfirm user={sampleUser} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith('u-1'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('surfaces ApiError messages from the backend', async () => {
    deleteMock.mockRejectedValue(
      new ApiError(403, 'Cannot delete yourself', {
        timestamp: '',
        status: 403,
        error: 'Forbidden',
        message: 'Cannot delete yourself',
        path: '/api/users/u-1'
      })
    );
    renderWithProviders(<DeleteUserConfirm user={sampleUser} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(await screen.findByText('Cannot delete yourself')).toBeInTheDocument();
  });

  it('closes without deleting when cancelled', () => {
    const onClose = vi.fn();
    renderWithProviders(<DeleteUserConfirm user={sampleUser} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });
});