import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../shared/api/errors';
import { renderWithProviders } from '../../test/render';
import { ResetPasswordPage } from '../reset-password-page';

const { resetMock } = vi.hoisted(() => ({ resetMock: vi.fn() }));
vi.mock('../../features/auth/api/use-reset-password', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    resetPasswordRequest: (vars: { token: string; newPassword: string }) => resetMock(vars),
    useResetPasswordMutation: () =>
      useMutation({
        mutationFn: (vars: { token: string; newPassword: string }) => resetMock(vars)
      })
  };
});

afterEach(() => {
  resetMock.mockReset();
});

const routesTree = (
  <Routes>
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </Routes>
);

function getByPath(path: string): HTMLInputElement {
  // Mantine's PasswordInput links its label to a wrapper, not the inner
  // <input>, so getByLabelText can't traverse it. Mantine's useForm
  // integration sets data-path on the input, which gives us a stable hook.
  const el = document.querySelector<HTMLInputElement>(`input[data-path="${path}"]`);
  if (!el) throw new Error(`No input with data-path="${path}"`);
  return el;
}

function fillPasswords(newPwd: string, confirmPwd: string = newPwd) {
  fireEvent.change(getByPath('newPassword'), { target: { value: newPwd } });
  fireEvent.change(getByPath('confirmPassword'), { target: { value: confirmPwd } });
}

function submit() {
  // Submit the form element directly to bypass jsdom's HTML5 validation,
  // which would otherwise short-circuit Mantine's form validators.
  const form = screen.getByRole('button', { name: /reset password/i }).closest('form');
  if (!form) throw new Error('form not found');
  fireEvent.submit(form);
}

describe('ResetPasswordPage', () => {
  it('shows a missing-token error when no token is in the URL', () => {
    renderWithProviders(routesTree, { routes: ['/reset-password'] });
    expect(screen.getByText(/missing reset token/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^new password$/i)).not.toBeInTheDocument();
  });

  it('rejects passwords shorter than 8 characters', () => {
    renderWithProviders(routesTree, { routes: ['/reset-password?token=abc'] });
    fillPasswords('short');
    submit();
    expect(screen.getByText(/password must be 8–100 characters/i)).toBeInTheDocument();
    expect(resetMock).not.toHaveBeenCalled();
  });

  it('rejects mismatched confirmation passwords', () => {
    renderWithProviders(routesTree, { routes: ['/reset-password?token=abc'] });
    fillPasswords('longenough1', 'differentpwd1');
    submit();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(resetMock).not.toHaveBeenCalled();
  });

  it('submits token + newPassword and shows success', async () => {
    resetMock.mockResolvedValue({ message: 'ok' });
    renderWithProviders(routesTree, { routes: ['/reset-password?token=abc'] });
    fillPasswords('longenough1');
    submit();
    await waitFor(() =>
      expect(resetMock).toHaveBeenCalledWith({ token: 'abc', newPassword: 'longenough1' })
    );
    expect(await screen.findByText(/your password has been reset/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue to sign in/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('surfaces ApiError messages from the backend', async () => {
    resetMock.mockRejectedValue(
      new ApiError(400, 'Token expired', {
        timestamp: '',
        status: 400,
        error: 'Bad Request',
        message: 'Token expired',
        path: '/api/auth/reset-password'
      })
    );
    renderWithProviders(routesTree, { routes: ['/reset-password?token=expired'] });
    fillPasswords('longenough1');
    submit();
    expect(await screen.findByText('Token expired')).toBeInTheDocument();
  });
});