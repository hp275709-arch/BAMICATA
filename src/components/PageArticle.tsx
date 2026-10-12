import React from 'react';
import { FlipPage } from '../types';

interface PageArticleProps {
  page: FlipPage;
  pageIndex: number;
  totalPages: number;
  isLeft: boolean;
  searchQuery?: string;
  onImageClick?: (url: string) => void;
}

export const PageArticle: React.FC<PageArticleProps> = ({
  page,
  pageIndex,
  isLeft,
  searchQuery = '',
}) => {
  // Highlight search matches safely
  const highlightText = (text: string, isHtml: boolean = false) => {
    if (!searchQuery.trim()) {
      if (isHtml) {
        return <span dangerouslySetInnerHTML={{ __html: text }} />;
      }
      return <span>{text}</span>;
    }

    const cleanQuery = searchQuery.trim().toLowerCase();
    
    // For HTML like "THE<br>NEW<br>FORM", replace <br> with temporary token
    const normalized = isHtml ? text.replace(/<br\s*\/?>/gi, '\n') : text;
    const parts = normalized.split(new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

    return (
      <span>
        {parts.map((part, i) => {
          const isMatch = part.toLowerCase() === cleanQuery;
          if (part.includes('\n')) {
            const subLines = part.split('\n');
            return subLines.map((line, lineIdx) => (
              <React.Fragment key={`${i}-${lineIdx}`}>
                {lineIdx > 0 && <br />}
                {isMatch ? (
                  <mark className="bg-amber-200/90 text-stone-900 px-0.5 rounded-xs">
                    {line}
                  </mark>
                ) : (
                  line
                )}
              </React.Fragment>
            ));
          }
          return isMatch ? (
            <mark key={i} className="bg-amber-200/90 text-stone-900 px-0.5 rounded-xs">
              {part}
            </mark>
          ) : (
            part
          );
        })}
      </span>
    );
  };

  const isCover = pageIndex === 0;

  return (
    <article
      className={`page h-full w-full flex flex-col justify-between p-8 sm:p-10 lg:p-12 select-text relative transition-colors ${
        isLeft ? 'paper-left' : 'paper-right'
      } ${isCover ? 'bg-[#f6f2ea]' : 'bg-[#faf7f2]'}`}
      data-page-index={pageIndex}
    >
      {/* Paper texture overlay */}
      <div className="absolute inset-0 pointer-events-none paper-grain opacity-40" />

      {/* Main page content area */}
      <div className="relative z-10 flex-1 flex flex-col justify-start">
        {/* Eyebrow kicker */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium tracking-[0.22em] uppercase text-stone-500 font-editorial-sans">
            {highlightText(page.k)}
          </span>
          {isCover && (
            <span className="text-[10px] tracking-widest text-stone-400 font-editorial-sans uppercase">
              Vol. 1
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className={`font-editorial-serif font-normal text-stone-900 tracking-tight leading-[1.05] ${
            isCover
              ? 'text-4xl sm:text-5xl lg:text-6xl my-4 text-balance'
              : 'text-2xl sm:text-3xl lg:text-4xl mb-4 text-balance'
          }`}
        >
          {highlightText(page.t, true)}
        </h2>

        {/* Copy text */}
        <p className="font-editorial-serif italic text-base sm:text-lg text-stone-600 leading-relaxed max-w-prose mb-6">
          {highlightText(page.c)}
        </p>

        {/* Items List (if any) */}
        {page.items && page.items.length > 0 && (
          <div className="my-3 space-y-3.5 border-t border-stone-200/80 pt-4">
            {page.items.map(([name, desc], idx) => (
              <div
                key={idx}
                className="flex items-baseline justify-between text-xs sm:text-sm font-editorial-sans py-1 border-b border-stone-200/40"
              >
                <strong className="font-medium text-stone-900">
                  {highlightText(name)}
                </strong>
                <span className="mx-2 text-stone-400 text-[10px]" aria-hidden="true">
                  ✳
                </span>
                <span className="text-stone-500 text-xs text-right">
                  {highlightText(desc)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Art / Photo feature */}
        {(page.art || page.imageUrl) && (
          <div className="mt-auto pt-4 relative group">
            <div className="overflow-hidden rounded-xs bg-stone-200 aspect-[4/3] sm:aspect-[16/10] relative shadow-xs border border-stone-300/40">
              {page.imageUrl ? (
                <img
                  src={page.imageUrl}
                  alt={page.k}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-200/60 text-stone-400 font-editorial-serif italic text-sm">
                  <span>Editorial Photography</span>
                </div>
              )}
            </div>
            {page.isPdfPage && (
              <span className="absolute top-6 left-2 px-2 py-0.5 text-[9px] uppercase tracking-wider bg-stone-900/75 text-white backdrop-blur-xs">
                PDF Page {page.pdfPageNum}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer & Page Number */}
      <footer className="relative z-10 pt-6 mt-4 border-t border-stone-200/60 flex items-center justify-between text-[11px] tracking-widest uppercase text-stone-500 font-editorial-sans">
        <span className="truncate pr-4">{page.f}</span>
        <span className="font-mono tabular-nums text-stone-700 font-semibold shrink-0">
          {String(pageIndex + 1).padStart(2, '0')}
        </span>
      </footer>
    </article>
  );
};
