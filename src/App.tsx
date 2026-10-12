/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { FlipPage } from './types';
import { INITIAL_PAGES } from './data/defaultPages';
import { HeaderBar } from './components/HeaderBar';
import { FlipbookReader } from './components/FlipbookReader';
import { ContentsDrawer } from './components/ContentsDrawer';
import { SearchDrawer } from './components/SearchDrawer';
import { ThumbnailStrip } from './components/ThumbnailStrip';
import { PageEditorModal } from './components/PageEditorModal';
import { PdfImportModal } from './components/PdfImportModal';

const STORAGE_KEY = 'bamicata_flipbook_pages_v2';

export default function App() {
  const [pages, setPages] = useState<FlipPage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('flipbook_pages_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If first page still has old title, update to BAMICATA
          return parsed.map((p, idx) => {
            if (idx === 0 && (p.t.includes('THE<br>NEW<br>FORM') || p.t.includes('THE NEW FORM'))) {
              return { ...p, t: 'BAMICATA' };
            }
            return p;
          });
        }
      }
    } catch {
      // LocalStorage error fallback
    }
    return INITIAL_PAGES;
  });

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isContentsOpen, setIsContentsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isPdfImportOpen, setIsPdfImportOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSinglePageMode, setIsSinglePageMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Status message timer
  const showStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  }, []);

  // Sync to local storage
  const handleSavePages = (newPages: FlipPage[]) => {
    setPages(newPages);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPages));
    } catch {
      // Ignore storage errors
    }
    showStatus(`Saved ${newPages.length} publication pages.`);
  };

  const handleResetDefault = () => {
    setPages(INITIAL_PAGES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setCurrentPage(0);
    showStatus('Restored original sample publication.');
  };

  const handlePdfImportSuccess = (importedPages: FlipPage[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setPages(importedPages);
      setCurrentPage(0);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(importedPages));
      } catch {
        // Ignore
      }
      showStatus(`Imported ${importedPages.length} pages from PDF document.`);
    } else {
      const merged = [...pages, ...importedPages];
      setPages(merged);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // Ignore
      }
      showStatus(`Appended ${importedPages.length} PDF pages. Total: ${merged.length} pages.`);
    }
  };

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Global escape and hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Escape') {
        setIsContentsOpen(false);
        setIsSearchOpen(false);
        setIsThumbnailsOpen(false);
        setIsEditorOpen(false);
        setIsPdfImportOpen(false);
      } else if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        if (!e.metaKey && !e.ctrlKey) {
          toggleFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Responsive mode auto-detector
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isSinglePageMode) {
        setIsSinglePageMode(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSinglePageMode]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#141414] text-stone-100 overflow-hidden select-none">
      {/* Top Header Bar adhering to Top Bar Contract */}
      <HeaderBar
        onOpenContents={() => setIsContentsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleThumbnails={() => setIsThumbnailsOpen((prev) => !prev)}
        onOpenEditor={() => setIsEditorOpen(true)}
        onOpenPdfImport={() => setIsPdfImportOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isThumbnailsOpen={isThumbnailsOpen}
        isSearchOpen={isSearchOpen}
        isContentsOpen={isContentsOpen}
      />

      {/* Main Flipbook Viewport */}
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        <FlipbookReader
          pages={pages}
          currentPage={currentPage}
          onPageChange={(idx) => setCurrentPage(idx)}
          searchQuery={searchQuery}
          isSinglePageMode={isSinglePageMode}
          onToggleSinglePage={() => setIsSinglePageMode((prev) => !prev)}
        />

        {/* Temporary Toast / Status notification */}
        {statusMessage && (
          <div className="absolute top-4 z-50 px-4 py-2 bg-stone-900/90 border border-amber-400/50 text-amber-200 text-xs font-editorial-sans rounded-sm shadow-xl backdrop-blur-xs animate-in fade-in slide-in-from-top-2 duration-200">
            {statusMessage}
          </div>
        )}
      </main>

      {/* Table of Contents Drawer */}
      <ContentsDrawer
        isOpen={isContentsOpen}
        onClose={() => setIsContentsOpen(false)}
        pages={pages}
        currentPage={currentPage}
        onSelectPage={(idx) => {
          setCurrentPage(idx);
          showStatus(`Navigated to page ${idx + 1}`);
        }}
      />

      {/* Live Search Drawer */}
      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        pages={pages}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onSelectPage={(idx) => {
          setCurrentPage(idx);
          showStatus(`Jumped to matching result on page ${idx + 1}`);
        }}
      />

      {/* Bottom Thumbnail Carousel Strip */}
      <ThumbnailStrip
        isOpen={isThumbnailsOpen}
        onClose={() => setIsThumbnailsOpen(false)}
        pages={pages}
        currentPage={currentPage}
        onSelectPage={(idx) => setCurrentPage(idx)}
      />

      {/* Visual / JSON Page Studio Modal */}
      <PageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        pages={pages}
        currentPageIndex={currentPage}
        onSavePages={handleSavePages}
        onResetDefault={handleResetDefault}
      />

      {/* PDF.js Real File Importer Modal */}
      <PdfImportModal
        isOpen={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        onImportSuccess={handlePdfImportSuccess}
      />
    </div>
  );
}
