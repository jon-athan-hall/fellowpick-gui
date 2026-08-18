import { Navigate, type RouteObject } from 'react-router-dom';
import { PickBoard } from './components/pick-board';
import { PreconDetailRoute } from './components/precon-detail-route';
import { PreconsPage } from '../../pages/precons-page';
import { UniversesPage } from '../../pages/universes-page';

export const pickRoutes: RouteObject[] = [
  { path: '/universes', element: <UniversesPage /> },
  { path: '/universes/:universeId', element: <PreconsPage /> },
  {
    // The deck itself is a layout, not a page: it holds the identity header and
    // the switcher, and the two votes are routes beneath it. The bare deck URL
    // has no board of its own, so it redirects to CUT — the side you start on,
    // and the one every existing link to a deck lands on.
    path: '/universes/:universeId/precons/:preconId',
    element: <PreconDetailRoute />,
    children: [
      { index: true, element: <Navigate to="cut" replace /> },
      { path: 'cut', element: <PickBoard pickType="CUT" /> },
      { path: 'add', element: <PickBoard pickType="ADD" /> },
    ],
  },
];
