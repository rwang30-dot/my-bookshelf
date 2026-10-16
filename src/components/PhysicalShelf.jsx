import React from 'react';
import StandingBook from './StandingBook.jsx';

export default function PhysicalShelf({
  books,
  shelfNumber = 1,
  totalShelves = 1,
  shelfLabel = 'Collection',
  onSelectBook,
}) {
  if (!books || books.length === 0) return null;

  return (
    <div className="relative my-6 sm:my-10 w-full max-w-7xl mx-auto">
      {/* Optional Shelf Tier Indicator */}
      {totalShelves > 1 && (
        <div className="flex items-center justify-between mb-2 px-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">
            Shelf {shelfNumber} — {shelfLabel}
          </span>
          <span className="text-[10px] font-mono text-stone-400">
            {books.length} {books.length === 1 ? 'Volume' : 'Volumes'}
          </span>
        </div>
      )}

      {/* Books Row Container */}
      <div className="relative px-2 sm:px-6">
        {/* Soft Contact Ambient Gradient behind books */}
        <div className="absolute inset-x-6 bottom-0 h-28 bg-gradient-to-t from-black/[0.03] to-transparent pointer-events-none" />

        {/* The Row of Standing & Leaning Books */}
        <div className="relative flex items-end justify-start md:justify-center overflow-x-auto pb-0 px-2 scrollbar-thin scrollbar-thumb-stone-300">
          <div className="flex items-end gap-1 sm:gap-1.5 min-w-max">
            {books.map((book, idx) => (
              <StandingBook
                key={book.id || idx}
                book={book}
                index={idx}
                onSelect={onSelectBook}
              />
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CLEAN ARCHITECTURAL BASELINE FLOOR (Matching reference)   */}
        {/* ========================================================= */}
        <div className="relative w-full z-10">
          {/* Crisp Minimal Floor Baseline */}
          <div className="w-full h-[1.5px] bg-[#D4D1C9]" />
          {/* Subtle contact shadow below line */}
          <div className="w-full h-3 bg-gradient-to-b from-black/[0.04] to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
