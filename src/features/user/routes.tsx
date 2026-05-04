import type { RouteObject } from 'react-router-dom';
import { ProfilePage } from '../../pages/profile-page';
import { UsersPage } from '../../pages/users-page';

export const userAuthenticatedRoutes: RouteObject[] = [
  { path: '/profile', element: <ProfilePage /> },
];

export const userAdminRoutes: RouteObject[] = [
  { path: '/admin/users', element: <UsersPage /> },
];
