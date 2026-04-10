import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../shared/api/errors';
import { renderWithProviders } from '../../test/render';
import { ForgotPasswordPage } from '../forgot-password-page';

const { forgotMock } = vi.hoisted(() => ({ forgotMock: vi.fn() }));
vi.mock('../../features/auth/api/use-forgot-password', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    forgotPasswordRequest: (email: string) => forgotMock(email),
    useForgotPasswordMutation: () =>
      useMutation({ mutationFn: (email: string) => forgotMock(email) })
  };
});

afterEach(() => {
  forgotMock.mockReset();
});

const routesTree = (
  <Routes>
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  </Routes>
);

function fillEmail(value: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value } });
}

function submit() {
  // Submit the form element directly: jsdom enforces HTML5 type="email"
  // validation on button-click submissions, which would short-circuit
  // Mantine's own validators before they ever run.
  const form = screen.getByRole('button', { name: /send reset link/i }).closest('form');
  if (!form) throw new Error('form not found');
  fireEvent.submit(form);
}

describe('ForgotPasswordPage', () => {
  it('validates email format before submitting', () => {
    renderWithProviders(routesTree, { routes: ['/forgot-password'] });
    fillEmail('not-an-email');
    submit();
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    expect(forgotMock).not.toHaveBeenCalled();
  });

  it('submits and shows a generic confirmation on success', async () => {
    forgotMock.mockResolvedValue({ message: 'ok' });
    renderWithProviders(routesTree, { routes: ['/forgot-password'] });
    fillEmail('jane@example.com');
    submit();
    await waitFor(() => expect(forgotMock).toHaveBeenCalledWith('jane@example.com'));
    expect(
      await screen.findByText(/if an account exists for that email/i)
    ).toBeInTheDocument();
  });

  it('surfaces ApiError messages from the backend', async () => {
    forgotMock.mockRejectedValue(
      new ApiError(429, 'Too many requests', {
        timestamp: '',
        status: 429,
        error: 'Too Many Requests',
        message: 'Too many requests',
        path: '/api/auth/forgot-password'
      })
    );
    renderWithProviders(routesTree, { routes: ['/forgot-password'] });
    fillEmail('jane@example.com');
    submit();
    expect(await screen.findByText('Too many requests')).toBeInTheDocument();
  });
});