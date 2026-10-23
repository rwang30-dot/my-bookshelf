import { createApiMiddleware } from '../server/apiMiddleware.js';

const middleware = createApiMiddleware();

export default async function handler(req, res) {
  if (!req.url.startsWith('/api')) {
    req.url = `/api/books${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
  }
  return middleware(req, res);
}
