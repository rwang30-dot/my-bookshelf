import React, { useState } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Settings,
  Star,
  SlidersHorizontal,
  Layers,
  X,
} from 'lucide-react';

export default function EditorialHeader({
  books,
  totalBooksCount,
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  genres,
  selectedRating,
  setSelectedRating,
  sortBy,
  setSortBy,
  shelfLayout,
  setShelfLayout,
  isDemo,
  loading,
  onRefresh,
  onOpenSettings,
  onOpenAdd,
}) {
  const [showSearch, setShowSearch] = useState(false);

  // Compute summary stats
  const validRatings = books.filter(b => typeof b.rating === 'number' && !isNaN(b.rating));
  const avgRating = validRatings.length > 0
    ? (validRatings.reduce((sum, b) => sum + b.rating, 0) / validRatings.length).toFixed(1)
    : '—';

  return (
    <header className="pt-6 sm:pt-10 pb-4 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* ========================================================= */}
      {/* 1. TOP NAV BAR (Minimalist studio header like reference)   */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] text-stone-700 pb-8 sm:pb-12">
        {/* Left Studio Monogram / Brand */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm tracking-widest text-stone-900">
            JZA / BOOKSHELF
          </span>
          <span
            onClick={onOpenSettings}
            className={`cursor-pointer inline-flex items-center text-[9px] font-semibold px-2 py-0.5 rounded-full border transition ${
              isDemo
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-[#E3E8DC] text-[#254A2D] border-[#C4D1B8]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isDemo ? 'bg-amber-500' : 'bg-[#286F43]'
              }`}
            />
            {isDemo ? 'Demo' : 'Live Notion'}
          </span>
        </div>

        {/* Right Navigation & Utility Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="hover:text-black transition flex items-center gap-1.5"
            title="Search books"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="hover:text-black transition flex items-center gap-1.5"
            title="Sync with Notion"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="hover:text-black transition flex items-center gap-1.5"
            title="Notion connection setup"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Setup</span>
          </button>

          <button
            onClick={onOpenAdd}
            className="text-white bg-stone-900 hover:bg-black px-3 py-1.5 rounded-sm shadow-sm transition active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CENTERED HIGH-CONTRAST EDITORIAL TITLE (From Reference) */}
      {/* ========================================================= */}
      <div className="text-center my-4 sm:my-8 select-none">
        {/* Top Tag: "PART 1" */}
        <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-stone-500 font-medium mb-3">
          PART 1
        </p>

        {/* Main Sculptural Title */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight uppercase text-stone-950 leading-[0.92]">
          THE PERSONAL
          <br />
          <span className="font-serif">CURATION</span>
        </h1>

        {/* Minimal Subtitle */}
        <p className="text-xs font-mono tracking-widest text-stone-400 uppercase mt-4">
          A Catalog of {totalBooksCount} Volumes · Score {avgRating} / 5.0
        </p>
      </div>

      {/* ========================================================= */}
      {/* 3. DISCREET EDITORIAL SEARCH & FILTERS                     */}
      {/* ========================================================= */}
      <div className="mt-8 space-y-3">
        {/* Expandable or Always Visible Minimal Search */}
        {(showSearch || searchQuery) && (
          <div className="relative max-w-md mx-auto animate-fadeIn">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volumes, authors, notes..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white/80 border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 transition font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-stone-400 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Genre Filter Tags (Flat & Clean) */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
          {genres.map((g) => {
            const isSelected = selectedGenre === g;
            const count = g === 'All'
              ? books.length
              : books.filter(b => b.genre?.toLowerCase() === g.toLowerCase()).length;

            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white/60 hover:bg-white text-stone-700 border border-stone-200'
                }`}
              >
                <span>{g}</span>
                <span
                  className={`text-[9px] px-1 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rating & Sorting Controls (Minimalist) */}
        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-mono uppercase text-stone-500">
          {/* Rating Filter */}
          <div className="flex items-center gap-1 bg-white/60 border border-stone-200 px-2.5 py-1 rounded-sm">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="bg-transparent text-stone-700 focus:outline-none cursor-pointer uppercase font-mono text-[10px]"
            >
              <option value="All">All Scores</option>
              <option value="5">5-Star only</option>
              <option value="4+">4.0 & above</option>
              <option value="3+">3.0 & above</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1 bg-white/60 border border-stone-200 px-2.5 py-1 rounded-sm">
            <SlidersHorizontal className="w-3 h-3 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-stone-700 focus:outline-none cursor-pointer uppercase font-mono text-[10px]"
            >
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="author-asc">Author: A to Z</option>
              <option value="recent">Recently Read</option>
            </select>
          </div>

          {/* Shelf Arrangement Toggle */}
          <button
            onClick={() => setShelfLayout(shelfLayout === 'single' ? 'multi' : 'single')}
            className="flex items-center gap-1 hover:text-black underline underline-offset-4 hidden sm:flex"
          >
            <Layers className="w-3 h-3 text-stone-400" />
            <span>{shelfLayout === 'single' ? 'Single Shelf' : 'Tiered'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
