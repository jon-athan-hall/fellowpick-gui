import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../shared/api/errors';
import { renderWithProviders } from '../../../test/render';
import { RolesTable } from '../components/roles-table';

const { rolesMock } = vi.hoisted(() => ({ rolesMock: vi.fn() }));
vi.mock('../api/use-roles', async () => {
  const { useQuery } = await import('@tanstack/react-query');
  return {
    rolesRequest: () => rolesMock(),
    useRolesQuery: () =>
      useQuery({ queryKey: ['roles'], queryFn: () => rolesMock(), retry: false })
  };
});

afterEach(() => {
  rolesMock.mockReset();
});

describe('RolesTable', () => {
  it('renders a loader while the query is pending', () => {
    rolesMock.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<RolesTable onEdit={() => {}} onDelete={() => {}} />);
    expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });

  it('renders an empty state when there are no roles', async () => {
    rolesMock.mockResolvedValue([]);
    renderWithProviders(<RolesTable onEdit={() => {}} onDelete={() => {}} />);
    expect(await screen.findByText(/no roles yet/i)).toBeInTheDocument();
  });

  it('renders rows for each role and wires the action callbacks', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    rolesMock.mockResolvedValue([
      { id: '1', name: 'ROLE_ADMIN' },
      { id: '2', name: 'ROLE_USER' }
    ]);
    renderWithProviders(<RolesTable onEdit={onEdit} onDelete={onDelete} />);
    expect(await screen.findByText('ROLE_ADMIN')).toBeInTheDocument();
    expect(screen.getByText('ROLE_USER')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit ROLE_ADMIN' }));
    expect(onEdit).toHaveBeenCalledWith({ id: '1', name: 'ROLE_ADMIN' });

    fireEvent.click(screen.getByRole('button', { name: 'Delete ROLE_USER' }));
    expect(onDelete).toHaveBeenCalledWith({ id: '2', name: 'ROLE_USER' });
  });

  it('surfaces ApiError messages when the query fails', async () => {
    rolesMock.mockRejectedValue(
      new ApiError(403, 'Forbidden', {
        timestamp: '',
        status: 403,
        error: 'Forbidden',
        message: 'Forbidden',
        path: '/api/roles'
      })
    );
    renderWithProviders(<RolesTable onEdit={() => {}} onDelete={() => {}} />);
    await waitFor(() => expect(screen.getByText('Forbidden')).toBeInTheDocument());
  });
});