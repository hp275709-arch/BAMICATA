export interface PageItem {
  name: string;
  desc: string;
}

export interface FlipPage {
  id: string;
  k: string; // Eyebrow category (e.g. "CHAPTER 01")
  t: string; // Title (e.g. "Form &<br>function")
  c: string; // Copy / description
  f: string; // Footer label (e.g. "DESIGN NOTES")
  art?: boolean;
  imageUrl?: string;
  items?: [string, string][];
  isPdfPage?: boolean;
  pdfPageNum?: number;
}
