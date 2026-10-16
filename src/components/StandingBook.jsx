import React, { useState } from 'react';
import { Star, BookOpen } from 'lucide-react';

// Exact palettes and stylistic archetypes sampled from the reference image
const BOOK_ARCHETYPES = [
  {
    bg: '#F2A7BE',
    text: '#1C1917',
    subText: '#44403C',
    width: 54,
    height: 375,
    lean: 0,
    hasRibbon: false,
    styleType: 'bold-top-bottom', // Title at top, author at bottom in heavy sans
    name: 'Vintage Pink',
  },
  {
    bg: '#B591A5',
    text: '#FFFFFF',
    subText: '#F5E6EE',
    width: 34,
    height: 360,
    lean: 3.5, // Leaning naturally against neighbor!
    hasRibbon: false,
    styleType: 'serif-condensed',
    name: 'Dusty Lilac',
  },
  {
    bg: '#2A3746',
    text: '#F1F0ED',
    subText: '#94A3B8',
    width: 48,
    height: 345,
    lean: 0,
    hasRibbon: false,
    styleType: 'minimal-center',
    name: 'Navy Slate',
  },
  {
    bg: '#E54536',
    text: '#FFFFFF',
    subText: '#FFD7D2',
    width: 30,
    height: 382,
    lean: -1.5,
    hasRibbon: true, // Bookmark ribbon peeking out!
    ribbonColor: '#F2A7BE',
    styleType: 'tall-narrow',
    name: 'Tomato Red',
  },
  {
    bg: '#1D55A4',
    text: '#FFFFFF',
    subText: '#BFDBFE',
    width: 46,
    height: 355,
    lean: 0,
    hasRibbon: false,
    styleType: 'swiss-editorial',
    name: 'Cobalt Blue',
  },
  {
    bg: '#D4D3CE',
    text: '#1A1A1A',
    subText: '#2563EB',
    width: 66,
    height: 390,
    lean: 0,
    hasRibbon: false,
    styleType: 'chunky-monograph', // Bold display graphic spine
    name: 'Chunky Gray',
  },
  {
    bg: '#1A2033',
    text: '#FFFFFF',
    subText: '#94A3B8',
    width: 58,
    height: 340,
    lean: 0,
    hasRibbon: false,
    styleType: 'minimal-dark',
    name: 'Midnight Indigo',
  },
  {
    bg: '#E4A836',
    text: '#FFFFFF',
    subText: '#FFFBEB',
    width: 42,
    height: 365,
    lean: 0,
    hasRibbon: false,
    styleType: 'clean-serif',
    name: 'Mustard Yellow',
  },
  {
    bg: '#44221E',
    text: '#F1F0ED',
    subText: '#D6D3D1',
    width: 52,
    height: 350,
    lean: 0,
    hasRibbon: false,
    styleType: 'classic-ribbed',
    name: 'Chocolate Maroon',
  },
  {
    bg: '#E76730',
    text: '#FFFFFF',
    subText: '#FED7AA',
    width: 58,
    height: 360,
    lean: 0,
    hasRibbon: true,
    ribbonColor: '#F2A7BE',
    styleType: 'bold-orange',
    name: 'Vivid Orange',
  },
  {
    bg: '#286F43',
    text: '#FFFFFF',
    subText: '#BBF7D0',
    width: 36,
    height: 355,
    lean: 0,
    hasRibbon: false,
    styleType: 'clean-grotesk',
    name: 'Forest Green',
  },
  {
    bg: '#E3E2DD',
    text: '#1C1917',
    subText: '#57534E',
    width: 26,
    height: 340,
    lean: 0,
    hasRibbon: false,
    styleType: 'slim-poetry',
    name: 'Stone Parchment',
  },
  {
    bg: '#FFFFFF',
    text: '#2B6CE0',
    subText: '#64748B',
    width: 52,
    height: 370,
    lean: 0,
    hasRibbon: false,
    styleType: 'graphic-display',
    name: 'Graphic White/Blue',
  },
  {
    bg: '#35373A',
    text: '#FFFFFF',
    subText: '#A1A1AA',
    width: 34,
    height: 368,
    lean: 0,
    hasRibbon: false,
    styleType: 'utilitarian',
    name: 'Charcoal',
  },
];

export default function StandingBook({ book, index, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Pick archetype based on index
  const arch = BOOK_ARCHETYPES[index % BOOK_ARCHETYPES.length];
  const spineWidth = arch.width;
  const bookHeight = arch.height;
  const leanAngle = arch.lean;
  const coverWidth = 240;

  // Author last name
  const authorParts = (book.author || '').trim().split(' ');
  const authorLastName = authorParts[authorParts.length - 1] || book.author;

  return (
    <div
      className="relative flex items-end justify-center select-none cursor-pointer"
      style={{
        // Smooth expansion when hovered to push neighbor books naturally
        width: isHovered ? `${coverWidth + 14}px` : `${spineWidth + 4}px`,
        height: `${bookHeight + 25}px`,
        transition: 'width 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
        zIndex: isHovered ? 50 : (leanAngle !== 0 ? 15 : 10),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(book)}
      title={`${book.title} — ${book.author}`}
    >
      {/* Optional Protruding Ribbon Tag from Reference */}
      {arch.hasRibbon && !isHovered && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-2.5 h-4 rounded-t-sm shadow-sm z-20 pointer-events-none"
          style={{ backgroundColor: arch.ribbonColor || '#F2A7BE' }}
        />
      )}

      {/* 3D Perspective Container */}
      <div
        className="relative perspective-1400"
        style={{
          width: isHovered ? `${coverWidth}px` : `${spineWidth}px`,
          height: `${bookHeight}px`,
          transition: 'width 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Book Assembly */}
        <div
          className="relative w-full h-full preserve-3d"
          style={{
            transform: isHovered
              ? 'rotate(0deg) translateZ(25px) translateY(-8px)'
              : `rotate(${leanAngle}deg) translateZ(0px) translateY(0px)`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* ========================================================= */}
          {/* 1. FRONT COVER VIEW (Revealed on hover with real image)   */}
          {/* ========================================================= */}
          <div
            className="absolute inset-0 rounded-sm overflow-hidden flex flex-col justify-between bg-white"
            style={{
              width: `${coverWidth}px`,
              height: `${bookHeight}px`,
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? 'auto' : 'none',
              transition: 'opacity 0.3s ease, box-shadow 0.45s ease',
              boxShadow: isHovered
                ? '0 20px 35px -8px rgba(0, 0, 0, 0.28), 0 8px 12px -4px rgba(0, 0, 0, 0.15)'
                : 'none',
              border: isHovered ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
            }}
          >
            {/* Real Notion Cover Image */}
            {book.coverImage && !imgError ? (
              <img
                src={book.coverImage}
                alt={book.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              /* Flat Minimalist Editorial Cover */
              <div
                className="w-full h-full flex flex-col justify-between p-6 text-white"
                style={{ backgroundColor: arch.bg }}
              >
                <div className="flex justify-between items-start opacity-80">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white">
                    {book.genre || 'Volume'}
                  </span>
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="my-auto text-center px-1">
                  <h3 className="font-serif text-xl font-bold leading-snug line-clamp-3 text-white">
                    {book.title}
                  </h3>
                  <p className="font-sans text-xs mt-2.5 opacity-90 italic line-clamp-1">
                    {book.author}
                  </p>
                </div>
                <div className="text-center pt-3 border-t border-white/20">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-white/70">
                    My Bookshelf
                  </span>
                </div>
              </div>
            )}

            {/* Subtle spine seam on front cover */}
            <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />

            {/* Quick Metadata Floating Pill on Hover */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/85 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center justify-between shadow-md pointer-events-none">
              <div className="truncate pr-2">
                <p className="font-serif text-xs font-bold truncate leading-tight">{book.title}</p>
                <p className="text-[10px] text-stone-300 truncate">{book.author}</p>
              </div>
              {book.rating !== null && book.rating !== undefined && (
                <div className="flex items-center gap-1 bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-300 font-bold text-[11px] flex-shrink-0">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>{book.rating}</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. FLAT GRAPHIC SPINE (Default art-book appearance)        */}
          {/* ========================================================= */}
          <div
            className="absolute inset-y-0 left-0 rounded-xs flex flex-col justify-between overflow-hidden"
            style={{
              width: `${spineWidth}px`,
              height: `${bookHeight}px`,
              backgroundColor: arch.bg,
              color: arch.text,
              opacity: isHovered ? 0 : 1,
              pointerEvents: isHovered ? 'none' : 'auto',
              transition: 'opacity 0.25s ease',
              boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.15), inset -1px 0 0 rgba(0,0,0,0.12), 1px 2px 6px rgba(0,0,0,0.08)',
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Top Spine Header based on Archetype */}
            <div className="pt-2 px-1 flex flex-col items-center">
              {arch.styleType === 'chunky-monograph' ? (
                <div className="text-[9px] font-mono font-bold tracking-tighter text-blue-600 uppercase text-center leading-tight">
                  {book.genre?.slice(0, 6) || 'VOL'}
                </div>
              ) : arch.styleType === 'classic-ribbed' ? (
                <div className="w-full flex flex-col items-center gap-0.5 pt-1">
                  <div className="w-3/4 h-[1px] bg-white/30" />
                  <div className="w-3/4 h-[1px] bg-white/30" />
                </div>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1" />
              )}
            </div>

            {/* Main Vertical Spine Title */}
            <div className="flex-grow flex items-center justify-center py-2 overflow-hidden px-0.5">
              <span
                className={`writing-vertical whitespace-nowrap line-clamp-1 select-none leading-none ${
                  arch.styleType === 'chunky-monograph'
                    ? 'font-sans font-black text-[15px] tracking-tight text-black'
                    : arch.styleType === 'graphic-display'
                    ? 'font-sans font-extrabold text-[15px] tracking-wider text-[#2B6CE0]'
                    : arch.styleType === 'clean-serif'
                    ? 'font-serif text-[12px] font-semibold tracking-wide'
                    : 'font-sans text-[12px] font-semibold tracking-wide'
                }`}
                style={{
                  maxHeight: `${bookHeight - 85}px`,
                  color: arch.text,
                }}
              >
                {book.title}
              </span>
            </div>

            {/* Bottom Spine Footer */}
            <div className="pb-2 px-1 flex flex-col items-center gap-1">
              <span
                className="text-[9px] font-mono uppercase tracking-wider truncate max-w-[44px] text-center"
                style={{ color: arch.subText }}
              >
                {authorLastName}
              </span>
              {arch.styleType === 'swiss-editorial' && (
                <div className="w-3 h-3 rounded-full border border-white/40 flex items-center justify-center text-[7px] text-white">
                  ⊘
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Contact Shadow along the baseline */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 rounded-full pointer-events-none blur-[1px]"
        style={{
          width: isHovered ? `${coverWidth * 0.9}px` : `${spineWidth * 0.85}px`,
          backgroundColor: 'rgba(0, 0, 0, 0.22)',
          transition: 'width 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      />
    </div>
  );
}
