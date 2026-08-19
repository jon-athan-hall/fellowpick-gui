import { fireEvent, screen } from '@testing-library/react';
import { useRoutes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { ForgotPasswordPage } from '../../../pages/forgot-password-page';
import { LoginPage } from '../../../pages/login-page';
import { RegisterPage } from '../../../pages/register-page';
import { ResetPasswordPage } from '../../../pages/reset-password-page';
import { AuthFormPanel } from '../components/auth-form-panel';

// AuthFormPanel is what keeps the four auth pages from drifting into four
// designs of the same form, which is what they had already done once. So the
// tests are in two halves: what the panel does, and that all four wear it.

function renderPanel(props: Partial<Parameters<typeof AuthFormPanel>[0]> = {}) {
  return renderWithProviders(
    <AuthFormPanel title="Sign in" onSubmit={() => {}} submitLabel="Go" {...props}>
      <input aria-label="Email" placeholder="you@example.com" />
    </AuthFormPanel>
  );
}

describe('AuthFormPanel', () => {
  it('makes the title the page’s only h1', () => {
    renderPanel({ title: 'Create an account' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create an account');
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });

  it('shows an error only when there is one', () => {
    const { unmount } = renderPanel();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    unmount();

    renderPanel({ error: 'Login failed' });
    expect(screen.getByRole('alert')).toHaveTextContent('Login failed');
  });

  it('submits through the form rather than a button click handler', () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    renderPanel({ onSubmit });
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // Leaving the fields up after a success invites a second go at something that
  // already worked.
  it('replaces the fields and the submit button once it succeeds', () => {
    renderPanel({ success: 'A reset link is on its way.' });
    expect(screen.getByRole('alert')).toHaveTextContent('A reset link is on its way.');
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go' })).not.toBeInTheDocument();
  });

  it('puts a navigating action where the submit button was', () => {
    renderPanel({
      success: 'Your password has been reset.',
      action: { to: '/login', label: 'Continue to sign in' },
    });
    expect(screen.getByRole('link', { name: 'Continue to sign in' })).toHaveAttribute(
      'href',
      '/login'
    );
    expect(screen.queryByRole('button', { name: 'Go' })).not.toBeInTheDocument();
  });

  // A form with no fields and no button is markup pretending to be a control.
  it('renders no form at all when there is nothing to submit', () => {
    const { container } = renderPanel({
      onSubmit: undefined,
      error: 'Missing reset token.',
      links: [{ to: '/forgot-password', label: 'Request a new reset link' }],
    });
    expect(container.querySelector('form')).toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a new reset link' })).toBeInTheDocument();
  });

  it('renders links as router links to their destinations', () => {
    renderPanel({
      links: [
        { to: '/register', label: 'Need an account? Register' },
        { to: '/forgot-password', label: 'Forgot your password?' },
      ],
    });
    expect(screen.getByRole('link', { name: 'Need an account? Register' })).toHaveAttribute(
      'href',
      '/register'
    );
    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });

  it('renders no link row when a form has no links', () => {
    renderPanel({ links: [] });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

// Rendered through the router because these pages read the URL and navigate.
function AuthPages() {
  return useRoutes([
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
  ]);
}

function pageAt(path: string) {
  return renderWithProviders(<AuthPages />, { routes: [path] });
}

describe('the four auth forms agree', () => {
  it.each([
    ['/login', 'Sign in', 'Sign in'],
    ['/register', 'Create an account', 'Register'],
    ['/forgot-password', 'Reset your password', 'Send reset link'],
    ['/reset-password?token=abc', 'Choose a new password', 'Reset password'],
  ])('%s wears the shared panel', (path, heading, submitLabel) => {
    pageAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
    expect(screen.getByRole('button', { name: submitLabel })).toBeInTheDocument();
  });

  // Three of the four had no placeholders at all, which was a good part of what
  // made them look unrelated to sign-in.
  it.each(['/login', '/register', '/forgot-password', '/reset-password?token=abc'])(
    '%s gives every field a placeholder',
    (path) => {
      const { container } = pageAt(path);
      const fields = [...container.querySelectorAll('input')].filter(
        (input) => input.type !== 'hidden'
      );
      expect(fields.length).toBeGreaterThan(0);
      expect(fields.filter((input) => !input.placeholder)).toEqual([]);
    }
  );

  it.each([
    ['/login', 'Need an account? Register', '/register'],
    ['/register', 'Already have an account? Sign in', '/login'],
    ['/forgot-password', 'Back to sign in', '/login'],
  ])('%s offers a way out', (path, label, href) => {
    pageAt(path);
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
  });

  // The one auth page with no form: a reset link that arrived without a token.
  it('shows the reset page with no form when the token is missing', () => {
    const { container } = pageAt('/reset-password');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reset your password');
    expect(container.querySelector('form')).toBeNull();
    expect(screen.getByRole('link', { name: 'Request a new reset link' })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });
});
