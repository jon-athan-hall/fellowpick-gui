import type { RouteObject } from 'react-router-dom';
import { HomePage } from './home-page';
import { NotFoundPage } from './not-found-page';

// The home page is the landing page: it explains what the site is for, so a
// visitor who has never signed in is exactly who it is written for. Behind
// RequireAuth it was only ever read by people who no longer needed it.
export const pagePublicRoutes: RouteObject[] = [{ path: '/', element: <HomePage /> }];

export const pageFallbackRoute: RouteObject = {
  path: '*',
  element: <NotFoundPage />,
};
