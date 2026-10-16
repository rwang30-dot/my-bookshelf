import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, AlertCircle, Layers } from 'lucide-react';
import PhysicalShelf from './components/PhysicalShelf.jsx';
import EditorialHeader from './components/EditorialHeader.jsx';
import BookModal from './components/BookModal.jsx';
import AddBookModal from './components/AddBookModal.jsx';
import NotionSettingsModal from './components/NotionSettingsModal.jsx';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [databaseTitle, setDatabaseTitle] = useState('My bookshelf');

  // Modals state
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filters, Search & Shelf Layout state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [shelfLayout, setShelfLayout] = useState('single'); // 'single' matches the reference image panorama

  // Fetch books from backend (Vite middleware / Node server)
  const fetchBooks = async (forceDemoMode = isDemo) => {
    setLoading(true);
    setError(null);

    const savedToken = localStorage.getItem('notion_api_key') || '';
    const savedDbId = localStorage.getItem('notion_database_id') || '';

    try {
      const headers = {};
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`;
      if (savedDbId) headers['x-notion-database-id'] = savedDbId;

      const url = `/api/books?demo=${forceDemoMode}`;
      const res = await fetch(url, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch books from Notion');
      }

      setBooks(data.books || []);
      setIsDemo(data.isDemo ?? forceDemoMode);
      if (data.databaseTitle) {
        setDatabaseTitle(data.databaseTitle);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const configRes = await fetch('/api/config');
        const configData = await configRes.json();
        const savedToken = localStorage.getItem('notion_api_key');
        const savedDbId = localStorage.getItem('notion_database_id');
        const hasCredentials = Boolean(
          (savedToken && savedDbId) || (configData.hasEnvToken && configData.hasEnvDb)
        );

        if (hasCredentials) {
          setIsDemo(false);
          await fetchBooks(false);
        } else {
          setIsDemo(true);
          await fetchBooks(true);
        }
      } catch (e) {
        setIsDemo(true);
        fetchBooks(true);
      }
    }
    init();
  }, []);

  // Distinct genres from loaded books
  const genres = useMemo(() => {
    const set = new Set();
    books.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return ['All', ...Array.from(set).sort()];
  }, [books]);

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search filter
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          book.title?.toLowerCase().includes(q) ||
          book.author?.toLowerCase().includes(q) ||
          book.genre?.toLowerCase().includes(q) ||
          book.review?.toLowerCase().includes(q);

        // Genre filter
        const matchesGenre =
          selectedGenre === 'All' ||
          (book.genre && book.genre.toLowerCase() === selectedGenre.toLowerCase());

        // Rating filter
        let matchesRating = true;
        if (selectedRating === '5') {
          matchesRating = book.rating >= 4.8;
        } else if (selectedRating === '4+') {
          matchesRating = book.rating >= 4.0;
        } else if (selectedRating === '3+') {
          matchesRating = book.rating >= 3.0;
        }

        return matchesSearch && matchesGenre && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === 'rating-desc') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === 'rating-asc') {
          return (a.rating || 0) - (b.rating || 0);
        }
        if (sortBy === 'title-asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'author-asc') {
          return (a.author || '').localeCompare(b.author || '');
        }
        if (sortBy === 'recent') {
          return new Date(b.createdTime || 0) - new Date(a.createdTime || 0);
        }
        return 0;
      });
  }, [books, searchQuery, selectedGenre, selectedRating, sortBy]);

  // Partition books across shelves for the physical bookcase look
  const shelfRows = useMemo(() => {
    if (shelfLayout === 'single' || filteredBooks.length <= 6) {
      return [{ id: 'shelf-all', label: 'Primary Collection', books: filteredBooks }];
    }
    // Divide books into balanced shelves (approx 6-7 books per shelf)
    const booksPerShelf = Math.ceil(filteredBooks.length / 2);
    const shelf1 = filteredBooks.slice(0, booksPerShelf);
    const shelf2 = filteredBooks.slice(booksPerShelf);

    return [
      { id: 'shelf-1', label: 'Upper Tier', books: shelf1 },
      { id: 'shelf-2', label: 'Lower Tier', books: shelf2 },
    ];
  }, [filteredBooks, shelfLayout]);

  // Modal navigation handlers
  const currentModalIndex = useMemo(() => {
    if (!selectedBook) return -1;
    return filteredBooks.findIndex((b) => b.id === selectedBook.id);
  }, [selectedBook, filteredBooks]);

  const handlePrevBook = () => {
    if (currentModalIndex > 0) {
      setSelectedBook(filteredBooks[currentModalIndex - 1]);
    }
  };

  const handleNextBook = () => {
    if (currentModalIndex < filteredBooks.length - 1) {
      setSelectedBook(filteredBooks[currentModalIndex + 1]);
    }
  };

  const handleBookAdded = (newBook) => {
    setBooks((prev) => [newBook, ...prev]);
    setSelectedBook(newBook);
  };

  return (
    <div className="min-h-screen bg-[#F1F0ED] text-[#1A1A1A] flex flex-col font-sans selection:bg-stone-300">
      {/* Editorial Header */}
      <EditorialHeader
        books={filteredBooks}
        totalBooksCount={books.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        genres={genres}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        sortBy={sortBy}
        setSortBy={setSortBy}
        shelfLayout={shelfLayout}
        setShelfLayout={setShelfLayout}
        isDemo={isDemo}
        loading={loading}
        onRefresh={() => fetchBooks(isDemo)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdd={() => setIsAddOpen(true)}
      />

      {/* Main Bookshelf Arena */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 flex flex-col justify-start">
        {/* Error Alert if any */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1 bg-white border border-rose-300 rounded-lg text-rose-800 font-medium hover:bg-rose-50"
            >
              Check Setup
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            <div className="flex items-end gap-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 bg-stone-300/70 rounded-t-sm animate-pulse"
                  style={{ height: `${280 + (i % 4) * 25}px` }}
                />
              ))}
            </div>
            <div className="w-full max-w-2xl h-5 bg-stone-400/50 rounded-sm shadow-md" />
            <p className="font-serif italic text-sm text-stone-500">
              Retrieving volumes from Notion archive...
            </p>
          </div>
        ) : filteredBooks.length > 0 ? (
          /* Physical Shelves View */
          <div className="py-4 space-y-6 sm:space-y-12">
            {shelfRows.map((row, idx) => (
              <PhysicalShelf
                key={row.id}
                books={row.books}
                shelfNumber={idx + 1}
                totalShelves={shelfRows.length}
                shelfLabel={row.label}
                onSelectBook={(book) => setSelectedBook(book)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="py-24 text-center bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-stone-300 max-w-xl mx-auto my-8 p-8">
            <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-800 text-xl">
              No matching volumes found
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 max-w-sm mx-auto">
              {searchQuery || selectedGenre !== 'All' || selectedRating !== 'All'
                ? 'Try broadening your search term, genre selection, or score filter.'
                : 'Your bookshelf has no entries yet. Use "Add Book" to catalogue your first read.'}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {(searchQuery || selectedGenre !== 'All' || selectedRating !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('All');
                    setSelectedRating('All');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 rounded-xl border border-stone-300 transition shadow-sm"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow transition"
              >
                + Add Book
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-stone-300/60 bg-[#E9E7E1]/60 py-6 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider">
          <p>
            <strong>The Personal Curation</strong> — Independent Reading Archive
          </p>
          <div className="flex items-center gap-2 text-stone-400">
            <span>Notion Live</span>
            <span>·</span>
            <span>{books.length} Volumes</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onPrev={handlePrevBook}
        onNext={handleNextBook}
        hasPrev={currentModalIndex > 0}
        hasNext={currentModalIndex < filteredBooks.length - 1}
      />

      <AddBookModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onBookAdded={handleBookAdded}
        isDemo={isDemo}
      />

      <NotionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDemo={isDemo}
        setIsDemo={(val) => {
          setIsDemo(val);
          fetchBooks(val);
        }}
        onConfigSaved={() => {
          fetchBooks(false);
        }}
      />
    </div>
  );
}
