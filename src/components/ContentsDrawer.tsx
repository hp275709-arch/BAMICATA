import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { FlipPage } from '../types';

interface ContentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pages: FlipPage[];
  currentPage: number;
  onSelectPage: (index: number) => void;
}

export const ContentsDrawer: React.FC<ContentsDrawerProps> = ({
  isOpen,
  onClose,
  pages,
  currentPage,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="w-full max-w-md h-full bg-[#18181b] border-r border-stone-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="font-editorial-serif text-2xl text-stone-100 font-normal">
              Table of Contents
            </h2>
            <p className="text-xs text-stone-400 font-editorial-sans mt-0.5">
              Issue 01 · 2026 · {pages.length} Pages
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-sm hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {pages.map((p, idx) => {
            const isCurrent = idx === currentPage || (idx % 2 === 0 && idx === currentPage - 1);
            const cleanTitle = p.t.replace(/<br\s*\/?>/gi, ' ');

            return (
              <button
                key={p.id || idx}
                onClick={() => {
                  onSelectPage(idx);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-sm transition-all flex items-start gap-3.5 group border ${
                  isCurrent
                    ? 'bg-stone-800/90 border-amber-400/40 text-stone-100 shadow-xs'
                    : 'bg-stone-900/40 border-stone-850 hover:bg-stone-850 hover:border-stone-700 text-stone-300'
                }`}
              >
                {/* Number */}
                <span className="font-mono tabular-nums text-xs font-semibold text-amber-400/80 shrink-0 pt-0.5">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-stone-500 font-editorial-sans">
                    {p.k}
                  </div>
                  <div className="font-editorial-serif text-base text-stone-200 group-hover:text-white truncate mt-0.5">
                    {cleanTitle}
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-1 mt-0.5 font-editorial-serif italic">
                    {p.c}
                  </p>
                </div>

                {/* Right Arrow / Active indicator */}
                <div className="shrink-0 pt-1 text-stone-500 group-hover:text-stone-200 transition-colors">
                  <ChevronRight size={15} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 text-[11px] text-stone-500 font-editorial-sans flex justify-between items-center">
          <span>BAMICATA Editorial Publication</span>
          <span>Press ESC to close</span>
        </div>
      </div>

      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};
