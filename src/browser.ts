import { setupWorker } from 'msw/browser';

import handlers from './app/handlers';

export const worker = setupWorker(...handlers);
