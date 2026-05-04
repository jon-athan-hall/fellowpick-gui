import type { RouteObject } from 'react-router-dom';
import { RolesPage } from '../../pages/roles-page';

export const roleAdminRoutes: RouteObject[] = [
  { path: '/admin/roles', element: <RolesPage /> },
];
