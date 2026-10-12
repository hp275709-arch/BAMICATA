import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Volume2, VolumeX, BookOpen, FileText } from 'lucide-react';
import { FlipPage } from '../types';
import { PageArticle } from './PageArticle';
import { playPageTurnSound } from '../utils/audio';

interface FlipbookReaderProps {
  pages: FlipPage[];
  currentPage: number;
  onPageChange: (index: number) => void;
  searchQuery: string;
  isSinglePageMode: boolean;
  onToggleSinglePage: () => void;
}

export const FlipbookReader: React.FC<FlipbookReaderProps> = ({
  pages,
  currentPage,
  onPageChange,
  searchQuery,
  isSinglePageMode,
  onToggleSinglePage,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = pages.length;
  const leftPageIndex = isSinglePageMode ? currentPage : Math.floor(currentPage / 2) * 2;
  const rightPageIndex = isSinglePageMode ? -1 : leftPageIndex + 1;

  const leftPage = pages[leftPageIndex];
  const rightPage = rightPageIndex >= 0 && rightPageIndex < totalPages ? pages[rightPageIndex] : null;

  // Sound triggering helper
  const triggerTurn = (targetIndex: number, direction: 'forward' | 'backward') => {
    if (isAnimating) return;
    if (targetIndex < 0 || targetIndex >= totalPages) return;

    if (soundEnabled) {
      playPageTurnSound();
    }

    setTurnDirection(direction);
    setIsAnimating(true);

    setTimeout(() => {
      onPageChange(targetIndex);
      setTimeout(() => {
        setIsAnimating(false);
        setTurnDirection(null);
      }, 180);
    }, 180);
  };

  const handlePrev = () => {
    if (currentPage <= 0) return;
    const step = isSinglePageMode ? 1 : 2;
    const nextIdx = Math.max(0, currentPage - step);
    triggerTurn(nextIdx, 'backward');
  };

  const handleNext = () => {
    const step = isSinglePageMode ? 1 : 2;
    if (currentPage + (isSinglePageMode ? 0 : 1) >= totalPages - 1 && !isSinglePageMode) return;
    if (currentPage >= totalPages - 1 && isSinglePageMode) return;
    const nextIdx = Math.min(totalPages - 1, currentPage + step);
    triggerTurn(nextIdx, 'forward');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        onPageChange(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        onPageChange(totalPages - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, isSinglePageMode]);

  const canGoPrev = currentPage > 0;
  const canGoNext = isSinglePageMode
    ? currentPage < totalPages - 1
    : leftPageIndex + 1 < totalPages - 1;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden select-none">
      {/* Floating Control Toolbar */}
      <div className="z-30 w-full max-w-4xl px-4 py-3 flex items-center justify-between text-xs text-stone-300 font-editorial-sans">
        <div className="flex items-center gap-3">
          <span className="text-stone-400 font-medium">
            {isSinglePageMode
              ? `Page ${String(currentPage + 1).padStart(2, '0')} of ${totalPages}`
              : `Spread ${String(leftPageIndex + 1).padStart(2, '0')}${
                  rightPage ? `–${String(rightPageIndex + 1).padStart(2, '0')}` : ''
                } of ${totalPages}`}
          </span>
          <span className="text-stone-600">·</span>
          <button
            onClick={onToggleSinglePage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-stone-900/80 hover:bg-stone-800 text-stone-300 transition-colors border border-stone-800"
            title={isSinglePageMode ? 'Switch to 2-Page Spread' : 'Switch to Single Page'}
          >
            {isSinglePageMode ? <BookOpen size={13} /> : <FileText size={13} />}
            <span>{isSinglePageMode ? 'Double Page' : 'Single Page'}</span>
          </button>
        </div>

        {/* Zoom & Sound Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-sm transition-colors border border-stone-800 ${
              soundEnabled ? 'text-amber-300 bg-stone-900/80' : 'text-stone-500 bg-stone-900/40'
            }`}
            title={soundEnabled ? 'Mute page turning sound' : 'Enable page turning sound'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          <div className="flex items-center bg-stone-900/80 rounded-sm border border-stone-800">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
              disabled={zoomLevel <= 0.85}
              className="p-1.5 text-stone-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="px-2 text-[11px] font-mono tabular-nums text-stone-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.45, Number((z + 0.15).toFixed(2))))}
              disabled={zoomLevel >= 1.45}
              className="p-1.5 text-stone-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Flipbook Stage */}
      <div
        ref={containerRef}
        className="book-stage relative flex-1 w-full max-w-6xl px-4 sm:px-8 py-2 sm:py-4 flex items-center justify-center overflow-auto"
      >
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="Previous Page"
          className="absolute left-2 sm:left-4 z-20 p-3 sm:p-4 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-stone-200 backdrop-blur-xs disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="Next Page"
          className="absolute right-2 sm:right-4 z-20 p-3 sm:p-4 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-stone-200 backdrop-blur-xs disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
        >
          <ChevronRight size={22} />
        </button>

        {/* Book Container with Zoom Transform */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className={`relative max-w-full transition-all duration-300 ${
            isSinglePageMode
              ? 'w-[420px] sm:w-[500px] h-[580px] sm:h-[680px]'
              : 'w-full max-w-4xl lg:max-w-5xl h-[540px] sm:h-[620px] lg:h-[680px]'
          }`}
        >
          {/* Realistic Book Outer Shadow */}
          <div className="absolute inset-0 bg-black/40 blur-2xl rounded-sm transform translate-y-6 scale-95 pointer-events-none" />

          {/* Book Spread */}
          <div
            className={`relative w-full h-full rounded-sm overflow-hidden flex transition-all duration-300 ${
              isAnimating
                ? turnDirection === 'forward'
                  ? 'opacity-90 scale-[0.99]'
                  : 'opacity-90 scale-[0.99]'
                : ''
            }`}
          >
            {/* Left Page (or single page) */}
            <div
              onClick={() => {
                if (canGoPrev && !isSinglePageMode) handlePrev();
              }}
              className={`relative h-full flex-1 overflow-hidden cursor-default ${
                canGoPrev && !isSinglePageMode ? 'hover:cursor-w-resize' : ''
              }`}
            >
              {leftPage && (
                <PageArticle
                  page={leftPage}
                  pageIndex={leftPageIndex}
                  totalPages={totalPages}
                  isLeft={true}
                  searchQuery={searchQuery}
                />
              )}
            </div>

            {/* Book Spine Center Crease / Gutter (only in 2-page mode) */}
            {!isSinglePageMode && (
              <div className="w-[18px] h-full book-gutter z-20 shrink-0 pointer-events-none shadow-inner" />
            )}

            {/* Right Page (only in 2-page mode) */}
            {!isSinglePageMode && (
              <div
                onClick={() => {
                  if (canGoNext) handleNext();
                }}
                className={`relative h-full flex-1 overflow-hidden cursor-default ${
                  canGoNext ? 'hover:cursor-e-resize' : ''
                }`}
              >
                {rightPage ? (
                  <PageArticle
                    page={rightPage}
                    pageIndex={rightPageIndex}
                    totalPages={totalPages}
                    isLeft={false}
                    searchQuery={searchQuery}
                  />
                ) : (
                  // Blank back inside cover
                  <div className="w-full h-full bg-[#f4eee4] paper-right p-12 flex flex-col justify-center items-center text-stone-400 font-editorial-serif italic">
                    <span className="text-xl">End of publication</span>
                    <span className="text-xs uppercase tracking-widest font-editorial-sans mt-2 text-stone-400">
                      Issue 01
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reading Progress Bar at Bottom */}
      <div className="w-full max-w-4xl px-6 py-2.5 z-20">
        <div className="w-full bg-stone-800/80 h-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400/90 transition-all duration-300"
            style={{
              width: `${Math.min(100, ((currentPage + 1) / totalPages) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
