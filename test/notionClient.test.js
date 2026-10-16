import assert from 'node:assert';
import {
  sanitizeNotionId,
  parseBookPage,
  extractPlainText,
  DEMO_BOOKS
} from '../server/notionClient.js';

console.log('🧪 Starting Notion Client Unit Tests...');

// 1. Test sanitizeNotionId
console.log('Testing sanitizeNotionId...');
const rawUuid = 'a8aec43a-cf32-4976-a5a3-e40103e1b660';
assert.strictEqual(sanitizeNotionId(rawUuid), 'a8aec43acf324976a5a3e40103e1b660');

const notionUrl = 'https://www.notion.so/myworkspace/a8aec43acf324976a5a3e40103e1b660?v=123';
assert.strictEqual(sanitizeNotionId(notionUrl), 'a8aec43acf324976a5a3e40103e1b660');
console.log('✅ sanitizeNotionId tests passed.');

// 2. Test extractPlainText
console.log('Testing extractPlainText...');
const richTextArr = [
  { plain_text: 'Hello ' },
  { text: { content: 'World' } },
];
assert.strictEqual(extractPlainText(richTextArr), 'Hello World');
console.log('✅ extractPlainText tests passed.');

// 3. Test parseBookPage with 2026-03-11 Notion Page structure
console.log('Testing parseBookPage with 6 properties...');
const mockPage = {
  id: 'page-1234-5678',
  in_trash: false,
  url: 'https://notion.so/page-1234-5678',
  last_edited_time: '2026-10-16T10:00:00.000Z',
  properties: {
    Title: {
      type: 'title',
      title: [{ plain_text: 'The Left Hand of Darkness' }],
    },
    Author: {
      type: 'rich_text',
      rich_text: [{ plain_text: 'Ursula K. Le Guin' }],
    },
    Genre: {
      type: 'select',
      select: {
        name: 'Sci-Fi',
        color: 'blue',
      },
    },
    'Cover Image': {
      type: 'files',
      files: [
        {
          type: 'external',
          external: { url: 'https://example.com/cover.jpg' },
        },
      ],
    },
    Rating: {
      type: 'number',
      number: 4.8,
    },
    Review: {
      type: 'rich_text',
      rich_text: [
        { plain_text: 'A profound exploration of gender, duality, and winter politics on Gethen.' },
      ],
    },
  },
};

const parsed = parseBookPage(mockPage);
assert.strictEqual(parsed.title, 'The Left Hand of Darkness');
assert.strictEqual(parsed.author, 'Ursula K. Le Guin');
assert.strictEqual(parsed.genre, 'Sci-Fi');
assert.strictEqual(parsed.genreColor, 'blue');
assert.strictEqual(parsed.coverImage, 'https://example.com/cover.jpg');
assert.strictEqual(parsed.rating, 4.8);
assert.strictEqual(parsed.review, 'A profound exploration of gender, duality, and winter politics on Gethen.');
console.log('✅ parseBookPage passed for standard properties.');

// 4. Test page cover fallback
console.log('Testing page cover fallback...');
const mockPageWithCover = {
  id: 'page-cover-test',
  properties: {
    Title: { type: 'title', title: [{ plain_text: 'Test Title' }] },
  },
  cover: {
    type: 'external',
    external: { url: 'https://example.com/page-cover.png' },
  },
};
const parsedCover = parseBookPage(mockPageWithCover);
assert.strictEqual(parsedCover.coverImage, 'https://example.com/page-cover.png');
console.log('✅ Page cover fallback passed.');

// 5. Test Demo Books validation
assert.ok(DEMO_BOOKS.length >= 6, 'Demo books must have at least 6 books');
DEMO_BOOKS.forEach(book => {
  assert.ok(book.title, 'Book must have title');
  assert.ok(book.author, 'Book must have author');
  assert.ok(book.genre, 'Book must have genre');
  assert.ok(typeof book.rating === 'number', 'Book must have numeric rating');
  assert.ok(book.review, 'Book must have review');
});
console.log('✅ DEMO_BOOKS structure validation passed.');

console.log('🎉 All Notion Client unit tests passed successfully!');
