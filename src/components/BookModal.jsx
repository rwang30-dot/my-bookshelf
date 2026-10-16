import React from 'react';
import { X, Star, ExternalLink, Calendar, BookOpen, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BookModal({ book, onClose, onPrev, onNext, hasPrev, hasNext }) {
  if (!book) return null;

  const renderStars = (rating) => {
    if (rating === null || rating === undefined) {
      return <span className="text-sm text-stone-400 italic">Unrated</span>;
    }
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3;

    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center text-amber-500">
          {[...Array(5)].map((_, i) => {
            const isFull = i < fullStars;
            const isHalf = i === fullStars && hasHalfStar;
            return (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  isFull
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-300 text-amber-400 opacity-90'
                    : 'text-stone-300'
                }`}
              />
            );
          })}
        </div>
        <span className="text-sm font-mono font-bold text-stone-800 ml-1">
          {Number(rating).toFixed(1)} / 5.0
        </span>
      </div>
    );
  };

  const formattedDate = book.lastEditedTime
    ? new Date(book.lastEditedTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#F1F0ED] rounded-sm shadow-xl border border-stone-300 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation & Close Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
          {onPrev && (
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              title="Previous Book"
              className="p-1.5 rounded-sm bg-white/90 hover:bg-white text-stone-700 hover:text-black border border-stone-300 transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              disabled={!hasNext}
              title="Next Book"
              className="p-1.5 rounded-sm bg-white/90 hover:bg-white text-stone-700 hover:text-black border border-stone-300 transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-white/90 hover:bg-white text-stone-700 hover:text-black border border-stone-300 transition ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Cover Column */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[210px] aspect-[2/3] rounded-sm shadow-md overflow-hidden bg-stone-200 border border-stone-300">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-between p-4 bg-[#2A3746] text-white text-center">
                    <BookOpen className="w-5 h-5 mx-auto text-white/70" />
                    <div>
                      <h4 className="font-serif font-bold text-base leading-tight">{book.title}</h4>
                      <p className="text-xs text-white/70 mt-1 italic">{book.author}</p>
                    </div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-white/50">{book.genre}</span>
                  </div>
                )}
              </div>

              {/* Notion Page Link */}
              {book.url && (
                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-700 hover:text-black bg-white hover:bg-stone-50 px-3 py-1.5 rounded-sm border border-stone-300 shadow-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View in Notion
                </a>
              )}
            </div>

            {/* Details Column */}
            <div className="sm:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs bg-white text-stone-800 border border-stone-300">
                    {book.genre || 'Uncategorized'}
                  </span>
                  {formattedDate && (
                    <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  )}
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 leading-tight">
                  {book.title}
                </h2>
                <p className="text-sm font-sans text-stone-600 mt-1.5">
                  by <span className="text-stone-900 font-medium">{book.author}</span>
                </p>

                {/* Rating Section */}
                <div className="mt-4 py-3 border-y border-stone-300/70">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 block mb-1">
                    Evaluation
                  </span>
                  {renderStars(book.rating)}
                </div>

                {/* Review Section */}
                <div className="mt-4">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 block mb-2">
                    Review & Notes
                  </span>
                  {book.review ? (
                    <div className="relative bg-white/60 rounded-xs p-4 border border-stone-200">
                      <Quote className="w-4 h-4 text-stone-400/40 absolute top-3 left-3 rotate-180" />
                      <p className="font-serif text-sm text-stone-800 italic leading-relaxed pl-4 whitespace-pre-line">
                        {book.review}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic">
                      No review recorded for this volume.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer ID */}
              <div className="mt-6 pt-3 border-t border-stone-300/70 text-[9px] text-stone-400 flex justify-between items-center font-mono uppercase tracking-wider">
                <span>Notion ID: {book.id?.slice(0, 10)}...</span>
                <span>The Personal Curation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
