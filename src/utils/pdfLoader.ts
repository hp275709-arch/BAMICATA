import * as pdfjsLib from 'pdfjs-dist';
// Vite handles ?url by generating a URL to the worker bundle asset
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedPdfPage {
  pageNumber: number;
  imageDataUrl: string;
  text: string;
  width: number;
  height: number;
}

/**
 * Loads a PDF file and renders all pages into high-res images and extracts text.
 */
export async function loadPdfPages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedPdfPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages: ExtractedPdfPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 }); // High-DPI scale for sharp reading
    
    // Create off-screen canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    // @ts-expect-error pdfjs typing compatibility
    await page.render(renderContext).promise;

    // Extract text content for full-text search
    const textContent = await page.getTextContent();
    const text = textContent.items
      // @ts-expect-error item structure has str
      .map((item) => (item.str ? item.str : ''))
      .join(' ');

    pages.push({
      pageNumber: i,
      imageDataUrl: canvas.toDataURL('image/jpeg', 0.92),
      text,
      width: viewport.width,
      height: viewport.height,
    });

    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  return pages;
}
