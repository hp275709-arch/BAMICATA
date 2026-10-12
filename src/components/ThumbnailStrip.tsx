import React, { useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FlipPage } from '../types';

interface ThumbnailStripProps {
  isOpen: boolean;
  onClose: () => void;
  pages: FlipPage[];
  currentPage: number;
  onSelectPage: (index: number) => void;
}

export const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
  isOpen,
  onClose,
  pages,
  currentPage,
  onSelectPage,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active thumbnail
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [isOpen, currentPage]);

  if (!isOpen) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 border-t border-stone-800 backdrop-blur-md shadow-2xl p-4 animate-in slide-in-from-bottom duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Top Header of Thumbnail Strip */}
        <div className="flex items-center justify-between pb-3 px-1 text-xs text-stone-400 font-editorial-sans">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-widest text-stone-300 font-medium">Page Thumbnails</span>
            <span>·</span>
            <span>{pages.length} Pages</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="p-1 rounded-sm bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors"
              title="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={scrollRight}
              className="p-1 rounded-sm bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors"
              title="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-sm text-stone-400 hover:text-stone-100 transition-colors ml-2"
              title="Close thumbnails"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar"
        >
          {pages.map((p, idx) => {
            const isActive = idx === currentPage || (idx % 2 === 0 && idx === currentPage - 1);
            const cleanTitle = p.t.replace(/<br\s*\/?>/gi, ' ');

            return (
              <button
                key={p.id || idx}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => onSelectPage(idx)}
                className={`flex-shrink-0 w-28 sm:w-32 h-40 rounded-sm p-2 flex flex-col justify-between text-left transition-all duration-200 border relative overflow-hidden group ${
                  isActive
                    ? 'bg-[#faf7f2] border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-105'
                    : 'bg-[#faf7f2]/90 border-stone-700/80 hover:border-stone-400 hover:bg-[#faf7f2]'
                }`}
              >
                {/* Header preview */}
                <div className="relative z-10 w-full overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] font-mono tabular-nums font-semibold text-stone-700">
                    <span>p.{String(idx + 1).padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase tracking-wider text-stone-400 truncate max-w-[50px]">
                      {p.k}
                    </span>
                  </div>
                  <h4 className="font-editorial-serif text-[11px] leading-tight text-stone-900 truncate mt-1">
                    {cleanTitle}
                  </h4>
                </div>

                {/* Thumbnail Art or Text lines representation */}
                <div className="relative z-10 flex-1 my-1 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.k}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xs"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-100 p-1 flex flex-col justify-center space-y-1 rounded-xs">
                      <div className="h-1 bg-stone-300 w-3/4 rounded-full" />
                      <div className="h-1 bg-stone-200 w-full rounded-full" />
                      <div className="h-1 bg-stone-200 w-2/3 rounded-full" />
                    </div>
                  )}
                </div>

                {/* Footer preview */}
                <div className="relative z-10 text-[8px] uppercase tracking-wider text-stone-400 truncate">
                  {p.f}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
