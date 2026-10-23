import { createApiMiddleware } from '../server/apiMiddleware.js';

const middleware = createApiMiddleware();

export default async function handler(req, res) {
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return middleware(req, res);
}
