import { FlipPage } from '../types';
import coverImg from '../assets/images/cover_sculptural_form_1791804472313.jpg';
import interiorImg from '../assets/images/interior_quiet_space_1791804484262.jpg';
import craftImg from '../assets/images/craft_detail_study_1791804495104.jpg';
import archImg from '../assets/images/architecture_field_notes_1791804505649.jpg';

export const INITIAL_PAGES: FlipPage[] = [
  {
    id: 'page-1',
    k: 'ISSUE 01 · 2026',
    t: 'BAMICATA',
    c: 'A visual journal of modern objects, quiet spaces and considered design.',
    f: 'COVER / SPRING EDITION',
    art: true,
    imageUrl: coverImg,
  },
  {
    id: 'page-2',
    k: 'WELCOME',
    t: 'A slower<br>point of view.',
    c: 'An independent collection exploring everyday design, thoughtful materials and the beauty of simplicity.',
    f: 'INTRODUCTION',
    art: true,
    imageUrl: interiorImg,
  },
  {
    id: 'page-3',
    k: 'CHAPTER 01',
    t: 'Form &<br>function',
    c: 'Pieces made to be used, lived with and loved. A balance between utility and a timeless silhouette.',
    f: 'DESIGN NOTES',
    items: [
      ['Everyday object', 'Material · texture · purpose'],
      ['Quiet essentials', 'Form follows feeling'],
      ['Natural details', 'Small things, considered'],
    ],
  },
  {
    id: 'page-4',
    k: 'CHAPTER 02',
    t: 'Space to<br>breathe.',
    c: 'Light, shadow and natural materials create a calm setting for daily rituals.',
    f: 'INTERIORS',
    art: true,
    imageUrl: interiorImg,
  },
  {
    id: 'page-5',
    k: 'COLLECTION 01',
    t: 'The new<br>uniform',
    c: 'A considered wardrobe built around proportion, texture and pieces that work together.',
    f: 'LOOKBOOK',
    items: [
      ['Relaxed cotton shirt', 'Soft structure · easy fit'],
      ['Everyday overshirt', 'Layering piece · utility'],
      ['Wide-leg trouser', 'Clean line · comfort'],
    ],
  },
  {
    id: 'page-6',
    k: 'DETAIL STUDY',
    t: 'Made of<br>details.',
    c: 'A closer look at stitching, finishes and subtle choices that make a piece feel complete.',
    f: 'CRAFT',
    art: true,
    imageUrl: craftImg,
  },
  {
    id: 'page-7',
    k: 'MATERIALS',
    t: 'Honest<br>materials.',
    c: 'Natural textures and durable finishes bring warmth to the everyday.',
    f: 'MATERIAL JOURNAL',
    items: [
      ['Organic cotton', 'Soft hand feel'],
      ['Brushed canvas', 'Tactile and durable'],
      ['Recycled paper', 'A lighter footprint'],
    ],
  },
  {
    id: 'page-8',
    k: 'FIELD NOTES',
    t: 'Outside<br>the frame.',
    c: 'The best ideas often appear between destinations — in a street, a studio or an ordinary afternoon.',
    f: 'FIELD NOTES',
    art: true,
    imageUrl: archImg,
  },
  {
    id: 'page-9',
    k: 'LAST PAGE',
    t: 'Until<br>next time.',
    c: 'Thank you for reading. Keep what inspires you, and make it your own.',
    f: 'END OF ISSUE',
    art: true,
    imageUrl: coverImg,
  },
  {
    id: 'page-10',
    k: 'COLOPHON',
    t: 'Made with<br>intention.',
    c: 'An independent digital publication. Replace this sample content with your own images, text and pages.',
    f: 'FLIPBOOK STUDIO',
    items: [
      ['Typography', 'Cormorant Garamond & Plus Jakarta Sans'],
      ['Production', 'Printed digitally on archival paper'],
      ['Art Direction', 'Flipbook Studio Workshop'],
    ],
  },
];
