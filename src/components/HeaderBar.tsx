import React from 'react';
import { BookOpen, Search, Grid, Edit3, UploadCloud, Maximize, Minimize } from 'lucide-react';

interface HeaderBarProps {
  onOpenContents: () => void;
  onOpenSearch: () => void;
  onToggleThumbnails: () => void;
  onOpenEditor: () => void;
  onOpenPdfImport: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isThumbnailsOpen: boolean;
  isSearchOpen: boolean;
  isContentsOpen: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenContents,
  onOpenSearch,
  onToggleThumbnails,
  onOpenEditor,
  onOpenPdfImport,
  isFullscreen,
  onToggleFullscreen,
  isThumbnailsOpen,
  isSearchOpen,
  isContentsOpen,
}) => {
  return (
    <header className="h-16 px-4 sm:px-8 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md flex items-center justify-between gap-8 shrink-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
          className="font-editorial-serif text-xl sm:text-2xl font-normal text-stone-100 hover:text-white transition-colors tracking-wider whitespace-nowrap"
        >
          BAMICATA
        </a>
        <span className="hidden md:inline text-xs tracking-widest text-stone-500 uppercase font-editorial-sans">
          · Studio Reader
        </span>
      </div>

      {/* Zone 2: Clean single-line nav links / interactive controls */}
      <nav className="flex items-center gap-2 sm:gap-4 text-xs font-editorial-sans text-stone-300">
        <button
          onClick={onOpenContents}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap shrink-0 ${
            isContentsOpen
              ? 'bg-stone-800 text-stone-100'
              : 'hover:bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookOpen size={14} />
          <span className="hidden sm:inline">Contents</span>
        </button>

        <button
          onClick={onOpenSearch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap shrink-0 ${
            isSearchOpen
              ? 'bg-stone-800 text-stone-100'
              : 'hover:bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search</span>
        </button>

        <button
          onClick={onToggleThumbnails}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap shrink-0 ${
            isThumbnailsOpen
              ? 'bg-stone-800 text-stone-100'
              : 'hover:bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Grid size={14} />
          <span className="hidden sm:inline">Thumbnails</span>
        </button>

        <button
          onClick={onOpenEditor}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm hover:bg-stone-900 text-stone-400 hover:text-stone-200 transition-colors whitespace-nowrap shrink-0"
          title="Edit and manage flipbook pages"
        >
          <Edit3 size={14} />
          <span className="hidden sm:inline">Edit Pages</span>
        </button>

        <button
          onClick={onOpenPdfImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm hover:bg-stone-900 text-amber-400/90 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          title="Import PDF with PDF.js"
        >
          <UploadCloud size={14} />
          <span className="hidden sm:inline">Import PDF</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          onClick={onToggleFullscreen}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-200 bg-stone-900 border border-stone-800 hover:border-stone-700 hover:bg-stone-850 rounded-sm transition-colors whitespace-nowrap shrink-0"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
          <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
        </button>
      </div>
    </header>
  );
};
