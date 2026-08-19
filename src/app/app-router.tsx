import { useRoutes, type RouteObject } from 'react-router-dom';
import { authPublicRoutes, RequireAuth, RequireRole } from '../features/auth';
import { pickRoutes } from '../features/pick';
import { roleAdminRoutes } from '../features/role';
import { userAdminRoutes, userAuthenticatedRoutes } from '../features/user';
import { pageFallbackRoute, pagePublicRoutes } from '../pages/routes';
import { AppLayout } from './app-layout';

const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      ...authPublicRoutes,
      ...pagePublicRoutes,
      ...pickRoutes,
      {
        element: <RequireAuth />,
        children: [
          ...userAuthenticatedRoutes,
          {
            element: <RequireRole role="ROLE_ADMIN" />,
            children: [...userAdminRoutes, ...roleAdminRoutes],
          },
        ],
      },
      pageFallbackRoute,
    ],
  },
];

// Defines all application routes by composing each feature's RouteObject[] arrays.
export function AppRouter() {
  return useRoutes(routes);
}
