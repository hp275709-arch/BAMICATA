import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, ChevronRight } from 'lucide-react';
import { FlipPage } from '../types';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pages: FlipPage[];
  onSelectPage: (index: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchDrawer: React.FC<SearchDrawerProps> = ({
  isOpen,
  onClose,
  pages,
  onSelectPage,
  searchQuery,
  onSearchChange,
}) => {
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    onSearchChange(val);
  };

  const clearSearch = () => {
    setInternalQuery('');
    onSearchChange('');
    inputRef.current?.focus();
  };

  // Find matching pages
  const q = internalQuery.trim().toLowerCase();
  const results = q
    ? pages
        .map((page, index) => {
          const itemsText = page.items
            ? page.items.map((it) => `${it[0]} ${it[1]}`).join(' ')
            : '';
          const searchable = `${page.k} ${page.t.replace(/<br\s*\/?>/gi, ' ')} ${page.c} ${page.f} ${itemsText}`.toLowerCase();
          const matches = searchable.includes(q);

          let snippet = '';
          if (matches) {
            const copyMatch = page.c.toLowerCase().indexOf(q);
            if (copyMatch >= 0) {
              const start = Math.max(0, copyMatch - 20);
              const end = Math.min(page.c.length, copyMatch + q.length + 40);
              snippet = (start > 0 ? '…' : '') + page.c.substring(start, end) + (end < page.c.length ? '…' : '');
            } else {
              snippet = page.c;
            }
          }

          return {
            page,
            index,
            matches,
            snippet,
          };
        })
        .filter((r) => r.matches)
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Click outside */}
      <div className="flex-1" onClick={onClose} />

      <div className="w-full max-w-md h-full bg-[#18181b] border-l border-stone-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-100">
            <SearchIcon size={18} className="text-amber-400" />
            <h2 className="font-editorial-serif text-2xl font-normal">Search Journal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-sm hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search input field */}
        <div className="p-4 border-b border-stone-800/80">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={internalQuery}
              onChange={handleInputChange}
              placeholder="Search words, materials, chapters..."
              className="w-full pl-3 pr-9 py-2.5 bg-stone-900 border border-stone-750 focus:border-amber-400/80 rounded-sm text-stone-200 placeholder-stone-500 text-sm font-editorial-sans focus:outline-none"
            />
            {internalQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="mt-2 text-xs text-stone-400 flex items-center justify-between font-editorial-sans">
            <span>
              {q
                ? results.length > 0
                  ? `Found ${results.length} matching page${results.length > 1 ? 's' : ''}`
                  : 'No matches found'
                : 'Type a query to search all pages'}
            </span>
            {q && results.length > 0 && (
              <span className="text-amber-400/90 font-mono text-[11px]">
                {results.length} result{results.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {q && results.length === 0 && (
            <div className="py-12 text-center text-stone-400 font-editorial-serif italic text-sm">
              <p>No results found for &ldquo;{internalQuery}&rdquo;</p>
              <p className="text-xs text-stone-500 font-editorial-sans not-italic mt-1">
                Try searching for keywords like &ldquo;Form&rdquo;, &ldquo;Cotton&rdquo;, or &ldquo;Light&rdquo;
              </p>
            </div>
          )}

          {!q && (
            <div className="py-8 text-center text-stone-500 font-editorial-sans text-xs">
              <p className="uppercase tracking-wider text-stone-600 mb-2">Suggested queries</p>
              <div className="flex flex-wrap justify-center gap-2 px-4">
                {['Form', 'Space', 'Linen', 'Cotton', 'Shadow', 'Ritual'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setInternalQuery(term);
                      onSearchChange(term);
                    }}
                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-sm border border-stone-800 text-xs transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map(({ page, index, snippet }) => {
            const cleanTitle = page.t.replace(/<br\s*\/?>/gi, ' ');
            return (
              <button
                key={page.id || index}
                onClick={() => {
                  onSelectPage(index);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-sm bg-stone-900/60 border border-stone-800 hover:bg-stone-850 hover:border-amber-400/50 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-xs font-semibold text-amber-400/90">
                      Page {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-stone-600">·</span>
                    <span className="text-[10px] uppercase tracking-wider text-stone-500 font-editorial-sans">
                      {page.k}
                    </span>
                  </div>
                  <div className="font-editorial-serif text-base text-stone-200 group-hover:text-white truncate mt-1">
                    {cleanTitle}
                  </div>
                  <p className="text-xs text-stone-400 mt-1 font-editorial-serif italic line-clamp-2">
                    {snippet}
                  </p>
                </div>
                <div className="pt-2 text-stone-600 group-hover:text-amber-400 transition-colors">
                  <ChevronRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
