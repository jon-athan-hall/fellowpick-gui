import type { RouteObject } from 'react-router-dom';
import { HomePage } from './home-page';
import { NotFoundPage } from './not-found-page';

export const pageAuthenticatedRoutes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
];

export const pageFallbackRoute: RouteObject = {
  path: '*',
  element: <NotFoundPage />,
};
