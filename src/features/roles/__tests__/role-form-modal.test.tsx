import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../shared/api/errors';
import { renderWithProviders } from '../../../test/render';
import { RoleFormModal } from '../components/role-form-modal';

const { createMock, updateMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateMock: vi.fn()
}));

vi.mock('../api/use-create-role', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    createRoleRequest: (body: unknown) => createMock(body),
    useCreateRoleMutation: () =>
      useMutation({ mutationFn: (body: unknown) => createMock(body) })
  };
});

vi.mock('../api/use-update-role', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    updateRoleRequest: (vars: unknown) => updateMock(vars),
    useUpdateRoleMutation: () =>
      useMutation({ mutationFn: (vars: unknown) => updateMock(vars) })
  };
});

afterEach(() => {
  createMock.mockReset();
  updateMock.mockReset();
});

function getByPath(path: string): HTMLInputElement {
  const el = document.querySelector<HTMLInputElement>(`input[data-path="${path}"]`);
  if (!el) throw new Error(`No input with data-path="${path}"`);
  return el;
}

function submit(buttonName: RegExp) {
  const form = screen.getByRole('button', { name: buttonName }).closest('form');
  if (!form) throw new Error('form not found');
  fireEvent.submit(form);
}

describe('RoleFormModal', () => {
  it('does not render when closed', () => {
    renderWithProviders(<RoleFormModal opened={false} onClose={() => {}} role={null} />);
    expect(screen.queryByText(/create role/i)).not.toBeInTheDocument();
  });

  it('creates a new role on submit and closes', async () => {
    createMock.mockResolvedValue({ id: '1', name: 'ROLE_NEW' });
    const onClose = vi.fn();
    renderWithProviders(<RoleFormModal opened={true} onClose={onClose} role={null} />);
    fireEvent.change(getByPath('name'), { target: { value: 'ROLE_NEW' } });
    submit(/create role/i);
    await waitFor(() => expect(createMock).toHaveBeenCalledWith({ name: 'ROLE_NEW' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('pre-fills the form when editing an existing role', () => {
    renderWithProviders(
      <RoleFormModal
        opened={true}
        onClose={() => {}}
        role={{ id: '1', name: 'ROLE_ADMIN' }}
      />
    );
    expect(getByPath('name')).toHaveValue('ROLE_ADMIN');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('updates an existing role on submit', async () => {
    updateMock.mockResolvedValue({ id: '1', name: 'ROLE_RENAMED' });
    const onClose = vi.fn();
    renderWithProviders(
      <RoleFormModal
        opened={true}
        onClose={onClose}
        role={{ id: '1', name: 'ROLE_ADMIN' }}
      />
    );
    fireEvent.change(getByPath('name'), { target: { value: 'ROLE_RENAMED' } });
    submit(/save changes/i);
    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith({ id: '1', body: { name: 'ROLE_RENAMED' } })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('rejects empty names without calling the API', () => {
    renderWithProviders(<RoleFormModal opened={true} onClose={() => {}} role={null} />);
    fireEvent.change(getByPath('name'), { target: { value: '   ' } });
    submit(/create role/i);
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('surfaces ApiError messages from the backend', async () => {
    createMock.mockRejectedValue(
      new ApiError(409, 'Role name already exists', {
        timestamp: '',
        status: 409,
        error: 'Conflict',
        message: 'Role name already exists',
        path: '/api/roles'
      })
    );
    renderWithProviders(<RoleFormModal opened={true} onClose={() => {}} role={null} />);
    fireEvent.change(getByPath('name'), { target: { value: 'ROLE_USER' } });
    submit(/create role/i);
    expect(await screen.findByText('Role name already exists')).toBeInTheDocument();
  });
});