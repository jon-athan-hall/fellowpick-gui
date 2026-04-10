import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../shared/api/errors';
import { renderWithProviders } from '../../../test/render';
import { UsersTable } from '../components/users-table';
import type { Page, UserResponse } from '../types';

const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));
vi.mock('../api/use-users', async () => {
  const { useQuery, keepPreviousData } = await import('@tanstack/react-query');
  return {
    listUsersRequest: (params: unknown) => listMock(params),
    useUsersQuery: (params: unknown) =>
      useQuery({
        queryKey: ['users', 'list', params],
        queryFn: () => listMock(params),
        placeholderData: keepPreviousData,
        retry: false
      })
  };
});

afterEach(() => {
  listMock.mockReset();
});

function makePage(content: UserResponse[], overrides: Partial<Page<UserResponse>> = {}): Page<UserResponse> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: 20,
    ...overrides
  };
}

const sampleUsers: UserResponse[] = [
  {
    id: '1',
    name: 'Alice Admin',
    email: 'alice@example.com',
    verified: true,
    roles: ['ROLE_ADMIN', 'ROLE_USER'],
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Bob User',
    email: 'bob@example.com',
    verified: false,
    roles: ['ROLE_USER'],
    createdAt: '2026-02-20T00:00:00Z'
  }
];

describe('UsersTable', () => {
  it('renders a loader while pending', () => {
    listMock.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<UsersTable onManageRoles={() => {}} onDelete={() => {}} />);
    expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });

  it('renders an empty state when no users come back', async () => {
    listMock.mockResolvedValue(makePage([]));
    renderWithProviders(<UsersTable onManageRoles={() => {}} onDelete={() => {}} />);
    expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
  });

  it('renders user rows with name, email, verified badge, and role badges', async () => {
    listMock.mockResolvedValue(makePage(sampleUsers));
    renderWithProviders(<UsersTable onManageRoles={() => {}} onDelete={() => {}} />);
    expect(await screen.findByText('Alice Admin')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob User')).toBeInTheDocument();
    // Both verified badges (Yes/No) and role badges
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('ROLE_ADMIN')).toBeInTheDocument();
    // ROLE_USER appears twice — once per user
    expect(screen.getAllByText('ROLE_USER')).toHaveLength(2);
  });

  it('wires the manage-roles and delete callbacks to the correct user', async () => {
    const onManageRoles = vi.fn();
    const onDelete = vi.fn();
    listMock.mockResolvedValue(makePage(sampleUsers));
    renderWithProviders(<UsersTable onManageRoles={onManageRoles} onDelete={onDelete} />);
    await screen.findByText('Alice Admin');
    fireEvent.click(screen.getByRole('button', { name: 'Manage roles for Alice Admin' }));
    expect(onManageRoles).toHaveBeenCalledWith(sampleUsers[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Bob User' }));
    expect(onDelete).toHaveBeenCalledWith(sampleUsers[1]);
  });

  it('paginates by calling the query with the new page index', async () => {
    listMock.mockResolvedValue(
      makePage(sampleUsers, { totalPages: 3, totalElements: 50 })
    );
    renderWithProviders(<UsersTable onManageRoles={() => {}} onDelete={() => {}} />);
    await screen.findByText('Alice Admin');
    await waitFor(() =>
      expect(listMock).toHaveBeenCalledWith({ page: 0, size: 20, sort: 'createdAt,desc' })
    );
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() =>
      expect(listMock).toHaveBeenCalledWith({ page: 1, size: 20, sort: 'createdAt,desc' })
    );
  });

  it('surfaces ApiError messages from the list query', async () => {
    listMock.mockRejectedValue(
      new ApiError(403, 'Forbidden', {
        timestamp: '',
        status: 403,
        error: 'Forbidden',
        message: 'Forbidden',
        path: '/api/users'
      })
    );
    renderWithProviders(<UsersTable onManageRoles={() => {}} onDelete={() => {}} />);
    await waitFor(() => expect(screen.getByText('Forbidden')).toBeInTheDocument());
  });
});