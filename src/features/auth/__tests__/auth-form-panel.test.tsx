import { fireEvent, screen } from '@testing-library/react';
import { useRoutes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { LoginPage } from '../../../pages/login-page';
import { RegisterPage } from '../../../pages/register-page';
import { AuthFormPanel } from '../components/auth-form-panel';

// AuthFormPanel is what keeps sign-in and register from drifting into two
// designs of the same form, which is what they had already done once. So the
// tests are in two halves: what the panel does, and that both pages use it.

function renderPanel(props: Partial<Parameters<typeof AuthFormPanel>[0]> = {}) {
  return renderWithProviders(
    <AuthFormPanel title="Sign in" onSubmit={() => {}} submitLabel="Go" {...props}>
      <input aria-label="Email" />
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

// Rendered through the router because both pages call useNavigate.
function AuthPages() {
  return useRoutes([
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
  ]);
}

function pageAt(path: string) {
  return renderWithProviders(<AuthPages />, { routes: [path] });
}

describe('the two auth forms agree', () => {
  it.each([
    ['/login', 'Sign in', 'Sign in'],
    ['/register', 'Create an account', 'Register'],
  ])('%s wears the shared panel', (path, heading, submitLabel) => {
    pageAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
    expect(screen.getByRole('button', { name: submitLabel })).toBeInTheDocument();
  });

  // Register used to have neither, which is most of what made it look unlike
  // sign-in: an order-2 title on a bare Paper with no placeholders.
  it.each([
    ['/login', ['you@example.com', '••••••••']],
    ['/register', ['Frodo Baggins', 'you@example.com', '••••••••']],
  ])('%s gives every field a placeholder', (path, placeholders) => {
    pageAt(path);
    for (const placeholder of placeholders) {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    }
  });

  it.each([
    ['/login', 'Need an account? Register', '/register'],
    ['/register', 'Already have an account? Sign in', '/login'],
  ])('%s offers the way to the other', (path, label, href) => {
    pageAt(path);
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
  });
});
