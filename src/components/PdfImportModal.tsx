import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { loadPdfPages } from '../utils/pdfLoader';
import { FlipPage } from '../types';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedPages: FlipPage[], mode: 'replace' | 'append') => void;
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  if (!isOpen) return null;

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please choose a valid PDF file.');
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleProcessPdf = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setProgress({ current: 0, total: 1 });

    try {
      const extractedPages = await loadPdfPages(file, (curr, tot) => {
        setProgress({ current: curr, total: tot });
      });

      if (!extractedPages || extractedPages.length === 0) {
        throw new Error('No pages could be extracted from this PDF document.');
      }

      // Convert extracted PDF pages into FlipPage objects
      const docBaseName = file.name.replace(/\.pdf$/i, '');
      const newFlipPages: FlipPage[] = extractedPages.map((p) => {
        const words = p.text.trim().split(/\s+/).slice(0, 30).join(' ');
        const snippet = words ? words + '…' : `Page ${p.pageNumber} from ${docBaseName}`;

        return {
          id: `pdf-${Date.now()}-${p.pageNumber}`,
          k: docBaseName.toUpperCase().slice(0, 24),
          t: `Page ${p.pageNumber}`,
          c: snippet,
          f: `${docBaseName.slice(0, 20)} / P.${p.pageNumber}`,
          art: true,
          imageUrl: p.imageDataUrl,
          isPdfPage: true,
          pdfPageNum: p.pageNumber,
        };
      });

      onImportSuccess(newFlipPages, importMode);
      onClose();
    } catch (err: unknown) {
      console.error('PDF extraction failed:', err);
      setError((err as Error).message || 'Failed to process PDF document. Please check the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#18181b] border border-stone-800 rounded-sm shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xs bg-amber-400/10 text-amber-400">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="font-editorial-serif text-xl text-stone-100 font-normal">
                Import PDF with PDF.js
              </h2>
              <p className="text-xs text-stone-400 font-editorial-sans">
                Render PDF pages directly into the digital flipbook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-sm hover:bg-stone-800 transition-colors disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* File Dropzone */}
          {!file ? (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.files[0];
                if (dropped) handleFileChange(dropped);
              }}
              className="border-2 border-dashed border-stone-750 hover:border-amber-400/70 bg-stone-900/40 hover:bg-stone-900/80 rounded-sm p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group"
            >
              <UploadCloud
                size={36}
                className="text-stone-500 group-hover:text-amber-400 transition-colors mb-3"
              />
              <span className="text-sm font-medium text-stone-200 font-editorial-sans">
                Select or drop your PDF publication here
              </span>
              <span className="text-xs text-stone-400 mt-1 font-editorial-sans">
                Magazines, lookbooks, brochures, or manuscripts (.pdf)
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(f);
                }}
                className="hidden"
              />
            </label>
          ) : (
            <div className="p-4 bg-stone-900 rounded-sm border border-stone-750 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={24} className="text-amber-400 shrink-0" />
                <div className="truncate">
                  <p className="text-sm text-stone-100 font-medium truncate">{file.name}</p>
                  <p className="text-xs text-stone-400 font-mono">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to render
                  </p>
                </div>
              </div>
              {!isLoading && (
                <button
                  onClick={() => setFile(null)}
                  className="p-1 text-stone-400 hover:text-stone-200 text-xs hover:underline"
                >
                  Change
                </button>
              )}
            </div>
          )}

          {/* Mode Selection */}
          <div className="space-y-2">
            <span className="text-xs text-stone-400 font-editorial-sans uppercase tracking-wider">
              Import Target
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`p-3 rounded-sm border text-left transition-colors ${
                  importMode === 'replace'
                    ? 'border-amber-400 bg-stone-850 text-stone-100'
                    : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:bg-stone-850'
                }`}
              >
                <div className="font-medium text-stone-200">Replace Current</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Open entire PDF as new flipbook
                </div>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`p-3 rounded-sm border text-left transition-colors ${
                  importMode === 'append'
                    ? 'border-amber-400 bg-stone-850 text-stone-100'
                    : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:bg-stone-850'
                }`}
              >
                <div className="font-medium text-stone-200">Append Pages</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Add PDF pages to current book
                </div>
              </button>
            </div>
          </div>

          {/* Progress / Loading indicator */}
          {isLoading && progress && (
            <div className="space-y-2 bg-stone-900/80 p-4 rounded-sm border border-stone-800">
              <div className="flex items-center justify-between text-xs text-stone-300 font-editorial-sans">
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-amber-400" />
                  <span>Rendering PDF pages into flipbook...</span>
                </span>
                <span className="font-mono tabular-nums text-amber-400">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-200"
                  style={{
                    width: `${Math.round((progress.current / Math.max(1, progress.total)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-800/60 rounded-sm text-xs text-rose-300 font-editorial-sans">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/50 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 font-editorial-sans">
            Powered by high-DPI PDF.js rendering
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 rounded-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessPdf}
              disabled={!file || isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 rounded-sm transition-colors shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  <span>Render &amp; Load Book</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
