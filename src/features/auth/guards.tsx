import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/use-auth';

// When used as a layout route element, no children are passed and the
// guarded subtree is rendered via <Outlet />. When used to wrap a single
// element directly, children take precedence.
export function RequireAuth({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children ?? <Outlet />}</>;
}

// Route guard that redirects users who lack the specified role.
export function RequireRole({
  role,
  children
}: {
  role: string;
  children?: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.roles.includes(role)) return <Navigate to="/" replace />;
  return <>{children ?? <Outlet />}</>;
}