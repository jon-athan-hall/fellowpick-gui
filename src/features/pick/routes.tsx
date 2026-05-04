import type { RouteObject } from 'react-router-dom';
import { PreconDetailRoute } from './components/precon-detail-route';
import { PreconsPage } from '../../pages/precons-page';
import { UniversesPage } from '../../pages/universes-page';

export const pickRoutes: RouteObject[] = [
  { path: '/universes', element: <UniversesPage /> },
  { path: '/universes/:universeId', element: <PreconsPage /> },
  { path: '/universes/:universeId/precons/:preconId', element: <PreconDetailRoute /> },
];
