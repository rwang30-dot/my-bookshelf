import fs from 'node:fs';
import path from 'node:path';
import { queryBooks, createBook, testNotionConnection, DEMO_BOOKS } from './notionClient.js';

let inMemoryDemoBooks = [...DEMO_BOOKS];

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq !== -1) {
          const k = trimmed.slice(0, eq).trim();
          const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
          if (k) {
            process.env[k] = v;
          }
        }
      }
    } catch (_) {}
  }
}
loadEnvLocal();

/**
 * Connect/Express compatible middleware for Vite & Node
 */
export function createApiMiddleware() {
  return async (req, res, next) => {
    loadEnvLocal();
    // Only handle /api routes
    if (!req.url.startsWith('/api')) {
      return next ? next() : res.writeHead(404).end();
    }

    // Helper to send JSON
    const sendJson = (status, data) => {
      res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Notion-Database-Id',
      });
      res.end(JSON.stringify(data));
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return sendJson(204, {});
    }

    // Helper to parse JSON body
    const parseBody = () => new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(e);
        }
      });
    });

    const parsedUrl = new URL(req.url, 'http://localhost');
    const pathname = parsedUrl.pathname;

    try {
      // 1. GET /api/config - Check environment status
      if (req.method === 'GET' && pathname === '/api/config') {
        const hasEnvToken = Boolean(process.env.NOTION_API_KEY);
        const hasEnvDb = Boolean(process.env.NOTION_DATABASE_ID);
        return sendJson(200, {
          hasEnvToken,
          hasEnvDb,
          envDbId: hasEnvDb ? `${process.env.NOTION_DATABASE_ID.slice(0, 6)}...` : null,
          notionVersion: '2026-03-11',
        });
      }

      // 2. GET /api/books - Fetch books from Notion or demo
      if (req.method === 'GET' && pathname === '/api/books') {
        const authHeader = req.headers['authorization'];
        const customToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null;
        const customDbId = req.headers['x-notion-database-id'] || parsedUrl.searchParams.get('databaseId');
        const forceDemo = parsedUrl.searchParams.get('demo') === 'true';

        const token = customToken || process.env.NOTION_API_KEY;
        const databaseId = customDbId || process.env.NOTION_DATABASE_ID;

        // If forced demo or missing credentials, return demo books
        if (forceDemo || !token || !databaseId) {
          return sendJson(200, {
            isDemo: true,
            databaseTitle: 'My bookshelf (Demo Mode)',
            books: inMemoryDemoBooks,
            message: !token || !databaseId ? 'No Notion credentials provided. Displaying demo bookshelf.' : 'Showing demo books.',
          });
        }

        try {
          const result = await queryBooks(databaseId, token);
          return sendJson(200, {
            isDemo: false,
            databaseTitle: result.databaseTitle,
            dataSourceId: result.dataSourceId,
            books: result.books,
          });
        } catch (err) {
          console.error('[Notion Query Error]', err.message);
          return sendJson(500, {
            error: err.message,
            fallbackToDemo: true,
            books: inMemoryDemoBooks,
          });
        }
      }

      // 3. POST /api/books - Create new book
      if (req.method === 'POST' && pathname === '/api/books') {
        const body = await parseBody();
        const authHeader = req.headers['authorization'];
        const token = (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null) || process.env.NOTION_API_KEY;
        const databaseId = req.headers['x-notion-database-id'] || body.databaseId || process.env.NOTION_DATABASE_ID;

        if (!token || !databaseId || body.isDemo) {
          // Add to local demo state
          const newBook = {
            id: `demo-user-${Date.now()}`,
            title: body.title || 'Untitled Book',
            author: body.author || 'Unknown Author',
            genre: body.genre || 'General',
            genreColor: 'blue',
            coverImage: body.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
            rating: Number(body.rating) || 5,
            review: body.review || '',
            url: 'https://notion.so',
            createdTime: new Date().toISOString(),
          };
          inMemoryDemoBooks.unshift(newBook);
          return sendJson(201, {
            isDemo: true,
            book: newBook,
            message: 'Book saved to demo bookshelf.',
          });
        }

        const created = await createBook(databaseId, token, body);
        return sendJson(201, {
          isDemo: false,
          book: created,
        });
      }

      // 4. POST /api/test-connection - Diagnostic connection test
      if (req.method === 'POST' && pathname === '/api/test-connection') {
        const body = await parseBody();
        const token = body.apiKey || process.env.NOTION_API_KEY;
        const databaseId = body.databaseId || process.env.NOTION_DATABASE_ID;

        if (!token) {
          return sendJson(400, { error: 'Notion API Key is required.' });
        }
        if (!databaseId) {
          return sendJson(400, { error: 'Notion Database ID is required.' });
        }

        const testResult = await testNotionConnection(databaseId, token);
        return sendJson(200, testResult);
      }

      return sendJson(404, { error: 'Not found' });
    } catch (err) {
      console.error('[API Route Error]', err);
      return sendJson(500, { error: err.message || 'Internal server error' });
    }
  };
}
