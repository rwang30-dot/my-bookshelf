import React from 'react';
import { BookOpen, Star, Sparkles, Bookmark } from 'lucide-react';

export default function StatsHeader({ books }) {
  const totalBooks = books.length;

  const validRatings = books.filter(b => typeof b.rating === 'number' && !isNaN(b.rating));
  const avgRating = validRatings.length > 0
    ? (validRatings.reduce((acc, b) => acc + b.rating, 0) / validRatings.length).toFixed(1)
    : '—';

  const fiveStarBooks = validRatings.filter(b => b.rating >= 4.8).length;

  // Calculate top genre
  const genreCounts = {};
  books.forEach(b => {
    if (b.genre) {
      genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    }
  });

  let topGenre = '—';
  let maxCount = 0;
  Object.entries(genreCounts).forEach(([genre, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topGenre = genre;
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6">
      {/* Total Books */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/70 shadow-sm flex items-center gap-3.5">
        <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 block">
            Books Read
          </span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            {totalBooks}
          </span>
        </div>
      </div>

      {/* Average Rating */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/70 shadow-sm flex items-center gap-3.5">
        <div className="p-2.5 bg-yellow-50 text-yellow-700 rounded-xl">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 block">
            Average Rating
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              {avgRating}
            </span>
            <span className="text-xs text-stone-400">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Top Genre */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/70 shadow-sm flex items-center gap-3.5">
        <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
          <Bookmark className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 block">
            Favorite Genre
          </span>
          <span className="text-base sm:text-lg font-serif font-bold text-stone-900 truncate block max-w-[120px]">
            {topGenre}
          </span>
        </div>
      </div>

      {/* Top Shelf / 5-Star Books */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/70 shadow-sm flex items-center gap-3.5">
        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 block">
            5-Star Reads
          </span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            {fiveStarBooks}
          </span>
        </div>
      </div>
    </div>
  );
}
