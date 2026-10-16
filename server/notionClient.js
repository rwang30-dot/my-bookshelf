/**
 * Notion Client for "My bookshelf"
 * Implements Notion API Version 2026-03-11 with Data Sources architecture
 * and fallback support for legacy database query paths.
 */

const NOTION_API_VERSION = '2026-03-11';
const NOTION_LEGACY_VERSION = '2022-06-28';
const NOTION_BASE_URL = 'https://api.notion.com/v1';

// Clean Notion UUID (accepts 32-char hex string with or without dashes or full URLs)
export function sanitizeNotionId(rawId) {
  if (!rawId) return '';
  const trimmed = rawId.trim();
  // If user pasted a full URL, extract 32-char hex ID
  const urlMatch = trimmed.match(/[a-f0-9]{32}/i);
  if (urlMatch) return urlMatch[0];
  // Strip hyphens
  return trimmed.replace(/-/g, '');
}

/**
 * Standard headers for Notion API requests
 */
function getHeaders(token, version = NOTION_API_VERSION) {
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': version,
    'Content-Type': 'application/json',
  };
}

/**
 * Resolves database details and data source ID for Notion API 2026-03-11
 */
export async function getDatabaseMetadata(databaseId, token) {
  const cleanDbId = sanitizeNotionId(databaseId);
  const response = await fetch(`${NOTION_BASE_URL}/databases/${cleanDbId}`, {
    method: 'GET',
    headers: getHeaders(token, NOTION_API_VERSION),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsed;
    try { parsed = JSON.parse(errorBody); } catch (_) {}
    throw new Error(parsed?.message || `Failed to fetch database (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  
  // In Notion API 2025/2026+, databases have a data_sources array
  let dataSourceId = null;
  let properties = data.properties || {};

  if (Array.isArray(data.data_sources) && data.data_sources.length > 0) {
    dataSourceId = data.data_sources[0].id;
    try {
      const dsRes = await fetch(`${NOTION_BASE_URL}/data_sources/${dataSourceId}`, {
        method: 'GET',
        headers: getHeaders(token, NOTION_API_VERSION),
      });
      if (dsRes.ok) {
        const dsData = await dsRes.json();
        if (dsData.properties) {
          properties = dsData.properties;
        }
      }
    } catch (_) {}
  }

  return {
    database: data,
    dataSourceId,
    title: extractPlainText(data.title) || 'Untitled Bookshelf',
    properties,
  };
}

/**
 * Helper to extract plain text from Notion rich text arrays
 */
export function extractPlainText(richTextArray) {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map(item => item.plain_text || item.text?.content || '').join('');
}

/**
 * Parse a raw Notion Page object into our clean Book model
 */
export function parseBookPage(page) {
  const props = page.properties || {};

  // 1. Title (look for 'Title', or any property of type 'title')
  let title = '';
  const titleProp = props['Title'] || props['title'] || Object.values(props).find(p => p.type === 'title');
  if (titleProp?.title) {
    title = extractPlainText(titleProp.title);
  }

  // 2. Author (look for 'Author', 'Authors', or rich_text/select)
  let author = '';
  const authorProp = props['Author'] || props['author'] || props['Authors'];
  if (authorProp) {
    if (authorProp.type === 'rich_text') {
      author = extractPlainText(authorProp.rich_text);
    } else if (authorProp.type === 'select') {
      author = authorProp.select?.name || '';
    } else if (authorProp.type === 'people' && Array.isArray(authorProp.people)) {
      author = authorProp.people.map(p => p.name).filter(Boolean).join(', ');
    }
  }

  // 3. Genre (Single select)
  let genre = 'Uncategorized';
  let genreColor = 'default';
  const genreProp = props['Genre'] || props['genre'] || Object.values(props).find(p => p.type === 'select');
  if (genreProp?.select) {
    genre = genreProp.select.name || 'Uncategorized';
    genreColor = genreProp.select.color || 'default';
  }

  // 4. Cover Image (check property 'Cover Image', 'Cover', or page-level cover)
  let coverImage = '';
  const coverProp = props['Cover Image'] || props['Cover'] || props['cover_image'] || Object.values(props).find(p => p.type === 'files');
  if (coverProp?.files && coverProp.files.length > 0) {
    const fileObj = coverProp.files[0];
    coverImage = fileObj.file?.url || fileObj.external?.url || '';
  }
  // Fallback to page-level cover
  if (!coverImage && page.cover) {
    coverImage = page.cover.external?.url || page.cover.file?.url || '';
  }

  // 5. Rating: Number
  let rating = null;
  const ratingProp = props['Rating'] || props['rating'] || Object.values(props).find(p => p.type === 'number');
  if (ratingProp && typeof ratingProp.number === 'number') {
    rating = ratingProp.number;
  }

  // 6. Review: Rich text
  let review = '';
  const reviewProp = props['Review'] || props['review'] || props['Notes'];
  if (reviewProp?.rich_text) {
    review = extractPlainText(reviewProp.rich_text);
  }

  return {
    id: page.id,
    title: title || 'Untitled Book',
    author: author || 'Unknown Author',
    genre,
    genreColor,
    coverImage,
    rating,
    review,
    url: page.url || `https://notion.so/${page.id.replace(/-/g, '')}`,
    lastEditedTime: page.last_edited_time,
    createdTime: page.created_time,
  };
}

/**
 * Queries books from the Notion database using latest 2026-03-11 Data Sources API
 * with automatic fallback to database query.
 */
export async function queryBooks(databaseId, token, options = {}) {
  const cleanDbId = sanitizeNotionId(databaseId);
  const metadata = await getDatabaseMetadata(cleanDbId, token);

  let queryEndpoint;
  let headers;
  const requestBody = {
    page_size: options.pageSize || 100,
  };

  // Add sorting if requested
  if (options.sorts) {
    requestBody.sorts = options.sorts;
  } else {
    requestBody.sorts = [
      {
        timestamp: 'created_time',
        direction: 'descending',
      },
    ];
  }

  if (options.filter) {
    requestBody.filter = options.filter;
  }

  let results = [];

  if (metadata.dataSourceId) {
    // Latest Notion 2026-03-11 Data Sources Query
    queryEndpoint = `${NOTION_BASE_URL}/data_sources/${metadata.dataSourceId}/query`;
    headers = getHeaders(token, NOTION_API_VERSION);
  } else {
    // Legacy Database Query fallback
    queryEndpoint = `${NOTION_BASE_URL}/databases/${cleanDbId}/query`;
    headers = getHeaders(token, NOTION_LEGACY_VERSION);
  }

  const response = await fetch(queryEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    // If data source query failed, attempt fallback to legacy database query
    if (metadata.dataSourceId) {
      const fallbackResponse = await fetch(`${NOTION_BASE_URL}/databases/${cleanDbId}/query`, {
        method: 'POST',
        headers: getHeaders(token, NOTION_LEGACY_VERSION),
        body: JSON.stringify(requestBody),
      });
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        results = fallbackData.results || [];
      } else {
        const errText = await response.text();
        throw new Error(`Failed to query data source and database: ${errText}`);
      }
    } else {
      const errText = await response.text();
      throw new Error(`Failed to query database (${response.status}): ${errText}`);
    }
  } else {
    const data = await response.json();
    results = data.results || [];
  }

  // Filter out trashed pages (in_trash in 2026-03-11 or archived in legacy)
  const activePages = results.filter(page => !page.in_trash && !page.archived);
  const books = activePages.map(parseBookPage);

  return {
    databaseTitle: metadata.title,
    dataSourceId: metadata.dataSourceId,
    books,
  };
}

/**
 * Creates a new book entry in the Notion database
 */
export async function createBook(databaseId, token, book) {
  const cleanDbId = sanitizeNotionId(databaseId);
  const metadata = await getDatabaseMetadata(cleanDbId, token);

  // Match properties from schema
  const schemaProps = metadata.properties || {};
  
  // Find matching property names in the user's database
  const titleKey = Object.keys(schemaProps).find(k => k.toLowerCase() === 'title' || schemaProps[k].type === 'title') || 'Title';
  const authorKey = Object.keys(schemaProps).find(k => k.toLowerCase() === 'author' || k.toLowerCase() === 'authors') || 'Author';
  const genreKey = Object.keys(schemaProps).find(k => k.toLowerCase() === 'genre' || schemaProps[k].type === 'select') || 'Genre';
  const coverKey = Object.keys(schemaProps).find(k => k.toLowerCase() === 'cover image' || k.toLowerCase() === 'cover' || schemaProps[k].type === 'files') || 'Cover Image';
  const ratingKey = Object.keys(schemaProps).find(k => k.toLowerCase() === 'rating' || schemaProps[k].type === 'number') || 'Rating';
  const reviewKey = Object.keys(schemaProps).find(k => k.toLowerCase() === 'review' || k.toLowerCase() === 'reviews' || k.toLowerCase() === 'notes') || 'Review';

  const properties = {
    [titleKey]: {
      title: [{ text: { content: book.title || 'Untitled' } }],
    },
    [authorKey]: {
      rich_text: [{ text: { content: book.author || '' } }],
    },
    [genreKey]: {
      select: { name: book.genre || 'General' },
    },
    [ratingKey]: {
      number: Number(book.rating) || 0,
    },
    [reviewKey]: {
      rich_text: [{ text: { content: book.review || '' } }],
    },
  };

  // If user provided a cover image URL and the property exists as files
  if (book.coverImage && schemaProps[coverKey]?.type === 'files') {
    properties[coverKey] = {
      files: [
        {
          name: `${book.title || 'book'}-cover`,
          type: 'external',
          external: { url: book.coverImage },
        },
      ],
    };
  }

  // Construct payload. In 2026-03-11, parent can be data_source_id or database_id
  const payload = {
    parent: metadata.dataSourceId
      ? { type: 'data_source_id', data_source_id: metadata.dataSourceId }
      : { database_id: cleanDbId },
    properties,
  };

  // Add page cover if provided
  if (book.coverImage) {
    payload.cover = {
      type: 'external',
      external: { url: book.coverImage },
    };
  }

  const response = await fetch(`${NOTION_BASE_URL}/pages`, {
    method: 'POST',
    headers: getHeaders(token, NOTION_API_VERSION),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // If data_source_id parent fails, try database_id parent fallback
    if (metadata.dataSourceId) {
      payload.parent = { database_id: cleanDbId };
      const retryResponse = await fetch(`${NOTION_BASE_URL}/pages`, {
        method: 'POST',
        headers: getHeaders(token, NOTION_LEGACY_VERSION),
        body: JSON.stringify(payload),
      });
      if (retryResponse.ok) {
        const page = await retryResponse.json();
        return parseBookPage(page);
      }
    }
    const errText = await response.text();
    throw new Error(`Failed to create book in Notion: ${errText}`);
  }

  const page = await response.json();
  return parseBookPage(page);
}

/**
 * Diagnostic validation of the Notion database structure
 */
export async function testNotionConnection(databaseId, token) {
  const cleanDbId = sanitizeNotionId(databaseId);
  const metadata = await getDatabaseMetadata(cleanDbId, token);
  const props = metadata.properties;

  const propertyCheck = {
    title: {
      found: Boolean(Object.values(props).find(p => p.type === 'title')),
      propertyName: Object.keys(props).find(k => props[k].type === 'title') || null,
      expected: 'Title (title)',
    },
    author: {
      found: Boolean(Object.keys(props).some(k => k.toLowerCase().includes('author'))),
      propertyName: Object.keys(props).find(k => k.toLowerCase().includes('author')) || null,
      expected: 'Author (rich_text / select)',
    },
    genre: {
      found: Boolean(Object.values(props).some(p => p.type === 'select')),
      propertyName: Object.keys(props).find(k => props[k].type === 'select') || null,
      expected: 'Genre (select)',
    },
    coverImage: {
      found: Boolean(Object.values(props).some(p => p.type === 'files')) || true, // page cover is also supported
      propertyName: Object.keys(props).find(k => props[k].type === 'files') || '(Page Cover supported)',
      expected: 'Cover Image (files or page cover)',
    },
    rating: {
      found: Boolean(Object.values(props).some(p => p.type === 'number')),
      propertyName: Object.keys(props).find(k => props[k].type === 'number') || null,
      expected: 'Rating (number)',
    },
    review: {
      found: Boolean(Object.keys(props).some(k => k.toLowerCase().includes('review') || k.toLowerCase().includes('note'))),
      propertyName: Object.keys(props).find(k => k.toLowerCase().includes('review') || k.toLowerCase().includes('note')) || null,
      expected: 'Review (rich_text)',
    },
  };

  return {
    success: true,
    databaseTitle: metadata.title,
    dataSourceId: metadata.dataSourceId,
    apiVersion: NOTION_API_VERSION,
    propertyCheck,
    totalProperties: Object.keys(props).length,
  };
}

/**
 * Curated high-quality demo books for out-of-the-box preview
 */
export const DEMO_BOOKS = [
  {
    id: 'demo-1',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    genre: 'Fiction',
    genreColor: 'purple',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    rating: 5,
    review: 'A magnificent, sweeping exploration of identity, creativity, friendship, and video games spanning three decades. Sam and Sadie are unforgettable characters whose bond transcends romance.',
    url: 'https://notion.so',
    lastEditedTime: '2026-09-15T14:30:00.000Z',
  },
  {
    id: 'demo-2',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre: 'Sci-Fi',
    genreColor: 'blue',
    coverImage: 'https://images.unsplash.com/photo-1618609377864-68609b857e90?auto=format&fit=crop&w=800&q=80',
    rating: 5,
    review: 'Astoundingly fun hard sci-fi. Ryland Grace waking up with amnesia on an interstellar mission to save humanity is thrilling enough, but the companionship with Rocky steals the entire show. "Amaze! Amaze! Amaze!"',
    url: 'https://notion.so',
    lastEditedTime: '2026-08-20T10:15:00.000Z',
  },
  {
    id: 'demo-3',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    genre: 'Literary',
    genreColor: 'yellow',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    review: 'Told through the perspective of Klara, an Artificial Friend with acute observational qualities. Ishiguro delicately asks what it means to love someone in an increasingly fractured technological world.',
    url: 'https://notion.so',
    lastEditedTime: '2026-07-04T18:00:00.000Z',
  },
  {
    id: 'demo-4',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    genre: 'Historical Fiction',
    genreColor: 'orange',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80',
    rating: 5,
    review: 'Profoundly moving retelling of the Iliad from Patroclus’s point of view. Miller’s prose is lyric poetry and the emotional payoff of the final act lingered with me for weeks.',
    url: 'https://notion.so',
    lastEditedTime: '2026-06-12T09:40:00.000Z',
  },
  {
    id: 'demo-5',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Non-Fiction',
    genreColor: 'green',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    rating: 4,
    review: 'Practical and actionable framework for continuous 1% improvement. The cue-craving-response-reward loop and habit stacking concepts are deeply practical tools.',
    url: 'https://notion.so',
    lastEditedTime: '2026-05-18T11:20:00.000Z',
  },
  {
    id: 'demo-6',
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Sci-Fi',
    genreColor: 'blue',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    review: 'The grandmaster of ecological and political science fiction. Arrakis feels palpably real, harsh, and mystical. The spice must flow.',
    url: 'https://notion.so',
    lastEditedTime: '2026-04-10T16:45:00.000Z',
  },
  {
    id: 'demo-7',
    title: 'Crying in H Mart',
    author: 'Michelle Zauner',
    genre: 'Memoir',
    genreColor: 'pink',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    review: 'An extraordinarily raw memoir intertwining grief, food, Korean heritage, and maternal love. Heartbreaking, yet comforting in its sensory culinary memories.',
    url: 'https://notion.so',
    lastEditedTime: '2026-03-22T21:10:00.000Z',
  },
  {
    id: 'demo-8',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fantasy',
    genreColor: 'default',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    rating: 4.2,
    review: 'Between life and death there is a library where every book gives you a chance to try another life you could have lived. A comforting tale on regret and possibility.',
    url: 'https://notion.so',
    lastEditedTime: '2026-02-14T13:00:00.000Z',
  },
];
