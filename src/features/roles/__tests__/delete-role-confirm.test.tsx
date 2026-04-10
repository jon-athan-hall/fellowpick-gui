import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../shared/api/errors';
import { renderWithProviders } from '../../../test/render';
import { DeleteRoleConfirm } from '../components/delete-role-confirm';

const { deleteMock } = vi.hoisted(() => ({ deleteMock: vi.fn() }));
vi.mock('../api/use-delete-role', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    deleteRoleRequest: (id: string) => deleteMock(id),
    useDeleteRoleMutation: () =>
      useMutation({ mutationFn: (id: string) => deleteMock(id) })
  };
});

afterEach(() => {
  deleteMock.mockReset();
});

describe('DeleteRoleConfirm', () => {
  it('does not render when no role is targeted', () => {
    renderWithProviders(<DeleteRoleConfirm role={null} onClose={() => {}} />);
    expect(screen.queryByText(/delete role/i)).not.toBeInTheDocument();
  });

  it('shows the role name and asks for confirmation', () => {
    renderWithProviders(
      <DeleteRoleConfirm role={{ id: '1', name: 'ROLE_USER' }} onClose={() => {}} />
    );
    expect(screen.getByText('ROLE_USER')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('calls delete and closes on confirm', async () => {
    deleteMock.mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderWithProviders(
      <DeleteRoleConfirm role={{ id: '1', name: 'ROLE_USER' }} onClose={onClose} />
    );
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith('1'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('surfaces ApiError messages from the backend', async () => {
    deleteMock.mockRejectedValue(
      new ApiError(409, 'Role is in use', {
        timestamp: '',
        status: 409,
        error: 'Conflict',
        message: 'Role is in use',
        path: '/api/roles/1'
      })
    );
    renderWithProviders(
      <DeleteRoleConfirm role={{ id: '1', name: 'ROLE_USER' }} onClose={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(await screen.findByText('Role is in use')).toBeInTheDocument();
  });

  it('closes without deleting when cancelled', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <DeleteRoleConfirm role={{ id: '1', name: 'ROLE_USER' }} onClose={onClose} />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });
});