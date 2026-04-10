import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../shared/api/errors';
import { renderWithProviders } from '../../test/render';
import { VerifyEmailPage } from '../verify-email-page';

const { verifyMock } = vi.hoisted(() => ({ verifyMock: vi.fn() }));
vi.mock('../../features/auth/api/use-verify-email', async () => {
  const { useQuery } = await import('@tanstack/react-query');
  return {
    verifyEmailRequest: (token: string) => verifyMock(token),
    useVerifyEmailQuery: (token: string | null) =>
      useQuery({
        queryKey: ['auth', 'verify', token],
        queryFn: () => verifyMock(token),
        enabled: token !== null,
        retry: false
      })
  };
});

afterEach(() => {
  verifyMock.mockReset();
});

const routesTree = (
  <Routes>
    <Route path="/verify" element={<VerifyEmailPage />} />
  </Routes>
);

describe('VerifyEmailPage', () => {
  it('shows an error when no token is in the URL', () => {
    renderWithProviders(routesTree, { routes: ['/verify'] });
    expect(screen.getByText(/missing verification token/i)).toBeInTheDocument();
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('calls verify and shows success on a valid token', async () => {
    verifyMock.mockResolvedValue({ message: 'ok' });
    renderWithProviders(routesTree, { routes: ['/verify?token=abc123'] });
    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('abc123'));
    expect(await screen.findByText(/your email has been verified/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue to sign in/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('surfaces ApiError messages from the backend', async () => {
    verifyMock.mockRejectedValue(
      new ApiError(400, 'Token expired', {
        timestamp: '',
        status: 400,
        error: 'Bad Request',
        message: 'Token expired',
        path: '/api/auth/verify'
      })
    );
    renderWithProviders(routesTree, { routes: ['/verify?token=expired'] });
    expect(await screen.findByText('Token expired')).toBeInTheDocument();
  });
});