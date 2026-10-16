import assert from 'node:assert';
import { EventEmitter } from 'node:events';
import { createApiMiddleware } from '../server/apiMiddleware.js';

console.log('🧪 Testing API Middleware with direct mock streams (sandbox safe)...');

const handler = createApiMiddleware();

function mockRequest(method, url, body = null, headers = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = { ...headers };

  const res = {
    statusCode: null,
    headers: {},
    body: '',
    writeHead(status, headers) {
      this.statusCode = status;
      this.headers = headers;
      return this;
    },
    end(chunk) {
      if (chunk) this.body += chunk;
      this.emit('finish');
    },
  };
  Object.setPrototypeOf(res, EventEmitter.prototype);

  const promise = new Promise((resolve) => {
    res.on('finish', () => {
      resolve({
        status: res.statusCode,
        headers: res.headers,
        json: () => JSON.parse(res.body),
        text: () => res.body,
      });
    });
  });

  // Call handler
  handler(req, res);

  // Send body if any
  if (body) {
    req.emit('data', JSON.stringify(body));
  }
  req.emit('end');

  return promise;
}

async function runTests() {
  // 1. Test GET /api/config
  const configRes = await mockRequest('GET', '/api/config');
  assert.strictEqual(configRes.status, 200);
  const configData = configRes.json();
  assert.strictEqual(configData.notionVersion, '2026-03-11');
  console.log('✅ GET /api/config passed:', configData);

  // 2. Test GET /api/books (default demo mode)
  const booksRes = await mockRequest('GET', '/api/books?demo=true');
  assert.strictEqual(booksRes.status, 200);
  const booksData = booksRes.json();
  assert.strictEqual(booksData.isDemo, true);
  assert.ok(Array.isArray(booksData.books));
  assert.ok(booksData.books.length >= 6);
  console.log(`✅ GET /api/books returned ${booksData.books.length} demo books.`);

  // 3. Test POST /api/books (add new demo book)
  const newBook = {
    title: 'Neuromancer',
    author: 'William Gibson',
    genre: 'Sci-Fi',
    rating: 4.7,
    review: 'The sky above the port was the color of television, tuned to a dead channel.',
    isDemo: true,
  };
  const postRes = await mockRequest('POST', '/api/books', newBook);
  assert.strictEqual(postRes.status, 201);
  const postData = postRes.json();
  assert.strictEqual(postData.book.title, 'Neuromancer');
  assert.strictEqual(postData.book.author, 'William Gibson');
  assert.strictEqual(postData.book.rating, 4.7);
  console.log('✅ POST /api/books created demo book successfully.');

  // 4. Test GET /api/books contains the newly added book
  const verifyRes = await mockRequest('GET', '/api/books?demo=true');
  const verifyData = verifyRes.json();
  const found = verifyData.books.find((b) => b.title === 'Neuromancer');
  assert.ok(found, 'Newly added book should appear in the books list');
  console.log('✅ Verified added book is present in the collection.');

  console.log('🎉 All in-memory API Middleware tests passed perfectly!');
}

runTests();
