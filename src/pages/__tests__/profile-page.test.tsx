import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../../features/auth/types';
import { ApiError } from '../../shared/api/errors';
import { renderWithProviders } from '../../test/render';
import { ProfilePage } from '../profile-page';

const { updateMock, changePasswordMock, resendMock } = vi.hoisted(() => ({
  updateMock: vi.fn(),
  changePasswordMock: vi.fn(),
  resendMock: vi.fn()
}));

vi.mock('../../features/users/api/use-update-user', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    updateUserRequest: (vars: unknown) => updateMock(vars),
    useUpdateUserMutation: () =>
      useMutation({ mutationFn: (vars: unknown) => updateMock(vars) })
  };
});

vi.mock('../../features/users/api/use-change-password', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    changePasswordRequest: (vars: unknown) => changePasswordMock(vars),
    useChangePasswordMutation: () =>
      useMutation({ mutationFn: (vars: unknown) => changePasswordMock(vars) })
  };
});

vi.mock('../../features/auth/api/use-resend-verification', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    resendVerificationRequest: () => resendMock(),
    useResendVerificationMutation: () => useMutation({ mutationFn: () => resendMock() })
  };
});

afterEach(() => {
  updateMock.mockReset();
  changePasswordMock.mockReset();
  resendMock.mockReset();
});

const baseUser: AuthUser = {
  id: 'user-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  roles: ['ROLE_USER'],
  verified: true
};

const routesTree = (
  <Routes>
    <Route path="/profile" element={<ProfilePage />} />
  </Routes>
);

function renderProfile(user: AuthUser | null = baseUser) {
  return renderWithProviders(routesTree, {
    routes: ['/profile'],
    auth: user ? { user, isAuthenticated: true } : {}
  });
}

// Mantine inputs (TextInput, PasswordInput, etc.) don't set htmlFor on
// their labels, so getByLabelText can't traverse to the inner input.
// Mantine's useForm integration sets data-path on the input itself, which
// is the stable hook for form-bound fields.
function getByPath(path: string): HTMLInputElement {
  const el = document.querySelector<HTMLInputElement>(`input[data-path="${path}"]`);
  if (!el) throw new Error(`No input with data-path="${path}"`);
  return el;
}

function submitWithin(buttonName: RegExp) {
  const form = screen.getByRole('button', { name: buttonName }).closest('form');
  if (!form) throw new Error('form not found');
  fireEvent.submit(form);
}

describe('ProfilePage', () => {
  it('shows a sign-in prompt when there is no user', () => {
    renderProfile(null);
    expect(screen.getByText(/must be signed in/i)).toBeInTheDocument();
  });

  it('renders the current user details', () => {
    renderProfile();
    expect(getByPath('name')).toHaveValue('Jane Doe');
    expect(getByPath('email')).toHaveValue('jane@example.com');
  });

  it('disables the save button until the form is dirty', () => {
    renderProfile();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
    fireEvent.change(getByPath('name'), { target: { value: 'Jane Q. Doe' } });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled();
  });

  it('submits profile updates and shows success', async () => {
    updateMock.mockResolvedValue({
      id: 'user-123',
      name: 'Jane Q. Doe',
      email: 'jane@example.com',
      verified: true,
      roles: ['ROLE_USER'],
      createdAt: '2026-01-01T00:00:00Z'
    });
    renderProfile();
    fireEvent.change(getByPath('name'), { target: { value: 'Jane Q. Doe' } });
    submitWithin(/save changes/i);
    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith({
        id: 'user-123',
        body: { name: 'Jane Q. Doe', email: 'jane@example.com' }
      })
    );
    expect(await screen.findByText(/profile updated/i)).toBeInTheDocument();
  });

  it('surfaces ApiError messages from profile updates', async () => {
    updateMock.mockRejectedValue(
      new ApiError(409, 'Email already in use', {
        timestamp: '',
        status: 409,
        error: 'Conflict',
        message: 'Email already in use',
        path: '/api/users/user-123'
      })
    );
    renderProfile();
    fireEvent.change(getByPath('email'), { target: { value: 'taken@example.com' } });
    submitWithin(/save changes/i);
    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
  });

  it('rejects mismatched new passwords', () => {
    renderProfile();
    fireEvent.change(getByPath('currentPassword'), { target: { value: 'oldpassword1' } });
    fireEvent.change(getByPath('newPassword'), { target: { value: 'newpassword1' } });
    fireEvent.change(getByPath('confirmPassword'), { target: { value: 'different1' } });
    submitWithin(/update password/i);
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it('submits a password change with current + new passwords', async () => {
    changePasswordMock.mockResolvedValue({ message: 'ok' });
    renderProfile();
    fireEvent.change(getByPath('currentPassword'), { target: { value: 'oldpassword1' } });
    fireEvent.change(getByPath('newPassword'), { target: { value: 'newpassword1' } });
    fireEvent.change(getByPath('confirmPassword'), { target: { value: 'newpassword1' } });
    submitWithin(/update password/i);
    await waitFor(() =>
      expect(changePasswordMock).toHaveBeenCalledWith({
        id: 'user-123',
        body: { currentPassword: 'oldpassword1', newPassword: 'newpassword1' }
      })
    );
    expect(await screen.findByText(/password updated/i)).toBeInTheDocument();
  });

  it('surfaces ApiError messages from password changes', async () => {
    changePasswordMock.mockRejectedValue(
      new ApiError(400, 'Current password is incorrect', {
        timestamp: '',
        status: 400,
        error: 'Bad Request',
        message: 'Current password is incorrect',
        path: '/api/users/user-123/password'
      })
    );
    renderProfile();
    fireEvent.change(getByPath('currentPassword'), { target: { value: 'wrongpwd1' } });
    fireEvent.change(getByPath('newPassword'), { target: { value: 'newpassword1' } });
    fireEvent.change(getByPath('confirmPassword'), { target: { value: 'newpassword1' } });
    submitWithin(/update password/i);
    expect(await screen.findByText('Current password is incorrect')).toBeInTheDocument();
  });

  it('shows a Verified badge when the user is verified', () => {
    renderProfile();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.queryByText(/email not verified/i)).not.toBeInTheDocument();
  });

  it('shows a Not verified badge and resend banner when the user is unverified', () => {
    renderProfile({ ...baseUser, verified: false });
    expect(screen.getByText('Not verified')).toBeInTheDocument();
    expect(screen.getByText(/email not verified/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /resend verification email/i })
    ).toBeInTheDocument();
  });

  it('calls the resend mutation when the resend button is clicked', async () => {
    resendMock.mockResolvedValue({ message: 'ok' });
    renderProfile({ ...baseUser, verified: false });
    fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }));
    await waitFor(() => expect(resendMock).toHaveBeenCalled());
    expect(await screen.findByText(/new verification email has been sent/i)).toBeInTheDocument();
  });
});