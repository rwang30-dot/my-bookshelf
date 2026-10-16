import React, { useState } from 'react';
import { Star, BookOpen, Quote, ExternalLink } from 'lucide-react';

const NOTION_COLOR_MAP = {
  gray: 'bg-stone-100 text-stone-700 border-stone-200',
  brown: 'bg-[#f4eee7] text-[#78543d] border-[#e8ded3]',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  yellow: 'bg-amber-50 text-amber-800 border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  default: 'bg-stone-100 text-stone-700 border-stone-200',
};

// Map genre names to consistent colors if Notion color isn't provided
const GENRE_COLOR_FALLBACKS = {
  'fiction': 'purple',
  'sci-fi': 'blue',
  'science fiction': 'blue',
  'fantasy': 'purple',
  'non-fiction': 'green',
  'memoir': 'pink',
  'biography': 'yellow',
  'history': 'brown',
  'thriller': 'red',
  'mystery': 'orange',
};

export default function BookCard({ book, onSelect }) {
  const [imgError, setImgError] = useState(false);

  const genreLower = (book.genre || '').toLowerCase();
  const colorKey = book.genreColor && book.genreColor !== 'default'
    ? book.genreColor
    : (GENRE_COLOR_FALLBACKS[genreLower] || 'default');

  const badgeStyle = NOTION_COLOR_MAP[colorKey] || NOTION_COLOR_MAP.default;

  // Star Rating Display
  const renderStars = (rating) => {
    if (rating === null || rating === undefined) {
      return <span className="text-xs text-stone-400 italic">Unrated</span>;
    }
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3;

    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center text-amber-500">
          {[...Array(5)].map((_, i) => {
            const isFull = i < fullStars;
            const isHalf = i === fullStars && hasHalfStar;
            return (
              <span key={i} className="relative inline-block">
                <Star
                  className={`w-3.5 h-3.5 ${
                    isFull
                      ? 'fill-amber-400 text-amber-400'
                      : isHalf
                      ? 'fill-amber-300 text-amber-400 opacity-90'
                      : 'text-stone-300'
                  }`}
                />
              </span>
            );
          })}
        </div>
        <span className="text-xs font-semibold text-stone-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelect(book)}
      className="group cursor-pointer flex flex-col bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-book-hover hover:-translate-y-1 transition-all duration-300"
    >
      {/* Book Cover Area */}
      <div className="relative aspect-[2/3] w-full bg-stone-100 overflow-hidden book-spine-effect">
        {book.coverImage && !imgError ? (
          <img
            src={book.coverImage}
            alt={book.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          /* Elegant Editorial Placeholder Cover */
          <div className="w-full h-full flex flex-col justify-between p-5 bg-gradient-to-br from-[#3b2a22] via-[#523d32] to-[#2b1e18] text-amber-100/90 shadow-inner">
            <div className="flex justify-between items-start opacity-70">
              <BookOpen className="w-5 h-5 text-amber-300" />
              <span className="text-[10px] tracking-widest uppercase font-mono">My Bookshelf</span>
            </div>
            <div className="text-center my-auto">
              <h4 className="font-serif text-lg font-semibold leading-tight line-clamp-3 text-amber-50">
                {book.title}
              </h4>
              <p className="font-sans text-xs text-amber-200/70 mt-2 italic line-clamp-1">
                {book.author}
              </p>
            </div>
            <div className="border-t border-amber-500/20 pt-2 text-center text-[10px] uppercase tracking-wider text-amber-300/60 font-sans">
              {book.genre || 'Book'}
            </div>
          </div>
        )}

        {/* Rating Floating Tag */}
        {book.rating !== null && book.rating !== undefined && (
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-medium text-white">{book.rating}</span>
          </div>
        )}
      </div>

      {/* Book Metadata & Properties */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Genre Single Select Tag */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${badgeStyle}`}
            >
              {book.genre || 'Uncategorized'}
            </span>
            {renderStars(book.rating)}
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-stone-900 text-base leading-snug line-clamp-2 group-hover:text-amber-800 transition-colors">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs font-medium text-stone-500 mt-1 line-clamp-1">
            by <span className="text-stone-700">{book.author}</span>
          </p>
        </div>

        {/* Review Excerpt */}
        {book.review ? (
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-start gap-1.5 text-stone-600">
            <Quote className="w-3.5 h-3.5 text-amber-600/70 flex-shrink-0 mt-0.5 rotate-180" />
            <p className="text-xs italic line-clamp-2 text-stone-500 font-serif leading-relaxed">
              "{book.review}"
            </p>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <span className="text-[11px] text-stone-400 italic">No written review yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
