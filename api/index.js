import { createApiMiddleware } from '../server/apiMiddleware.js';

const middleware = createApiMiddleware();

export default async function handler(req, res) {
  return middleware(req, res);
}
