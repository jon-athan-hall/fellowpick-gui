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
      // Keyed, for the same reason PreconDetailRoute keys on preconId: both
      // sides are a PickBoard in the same outlet slot, so without a key React
      // reconciles rather than remounts and the board keeps its page and sort
      // snapshot across the switch. The candidate pool runs several times
      // longer than the deck, so page 11 of ADD carried into CUT is past the
      // end of the list and the table renders empty.
      { path: 'cut', element: <PickBoard key="CUT" pickType="CUT" /> },
      { path: 'add', element: <PickBoard key="ADD" pickType="ADD" /> },
    ],
  },
];
