import { Citation } from '../types';
import { resolveSourceUrl } from './sourceUrls';

export interface PageMapEntry {
  slide: number;
  page?: number | null;
  title?: string;
  section?: string;
  headings?: string[];
}

export interface DocumentIndexEntry {
  id?: string;
  title?: string;
  author?: string;
  description?: string;
  pages?: number;
  pageMap?: PageMapEntry[];
  // Legacy format support
  document?: string;
  slide?: number;
  page?: number;
  section?: string;
}

export interface ResolvedCitation extends Citation {
  document: string;
  page: number;
  slide?: number;
  displayPage?: number | null;
  section?: string;
  label: string;
  title?: string;
  type: 'lecture' | 'literature';
  url: string;
}

// Load slide and RR indexes from data folder
const slideModules = import.meta.glob<{ default: Record<string, DocumentIndexEntry> }>(
  '../data/slides_index.json',
  { eager: true }
);
const rawSlidesIndex = Object.values(slideModules)[0]?.default || {};

const rrModules = import.meta.glob<{ default: Record<string, DocumentIndexEntry> }>(
  '../data/rr_index.json',
  { eager: true }
);
const rawRrIndex = Object.values(rrModules)[0]?.default || {};

// Helpers to build fast lookups
interface DocLookup {
  filename: string;
  doc: DocumentIndexEntry;
  slidesMap: Map<number, PageMapEntry>;
}

function buildIndexLookups(rawIndex: Record<string, DocumentIndexEntry>) {
  const byId = new Map<string, DocLookup>();
  const byFilename = new Map<string, DocLookup>();
  const legacySlides = new Map<number, DocumentIndexEntry>();

  for (const [key, val] of Object.entries(rawIndex)) {
    if (!val) continue;

    // Detect legacy slides_index format where key is a slide number (e.g. "1", "2")
    if (/^\d+$/.test(key) && val.document) {
      legacySlides.set(Number(key), val);
      continue;
    }

    // Modern index format where key is the bare filename
    const filename = key;
    const slidesMap = new Map<number, PageMapEntry>();

    if (Array.isArray(val.pageMap)) {
      for (const pm of val.pageMap) {
        if (typeof pm.slide === 'number') {
          slidesMap.set(pm.slide, pm);
        } else if (typeof pm.page === 'number') {
          // Fallback if older format used page as sheet identifier
          slidesMap.set(pm.page, {
            ...pm,
            slide: pm.page,
            title: pm.headings?.[0] || pm.title,
          });
        }
      }
    }

    const lookup: DocLookup = { filename, doc: val, slidesMap };

    if (val.id) {
      byId.set(val.id.toLowerCase().trim(), lookup);
    }
    byFilename.set(filename.toLowerCase().trim(), lookup);

    // Also strip extensions and folder prefixes for relaxed matching
    const cleanKey = filename.replace(/^(Recommended_Readings|RR|lectures)\//i, '').replace(/\.pdf$/i, '').toLowerCase().trim();
    if (!byFilename.has(cleanKey)) {
      byFilename.set(cleanKey, lookup);
    }
  }

  return { byId, byFilename, legacySlides };
}

const slidesIndex = buildIndexLookups(rawSlidesIndex);
const rrIndex = buildIndexLookups(rawRrIndex);

/**
 * Resolves a citation (either minimal { id, slide, type } or legacy full object)
 * into a complete, display-ready citation with label, title, page, and url.
 */
export function resolveCitation(cite: Citation): ResolvedCitation {
  const type = cite.type || 'lecture';
  const lookups = type === 'lecture' ? slidesIndex : rrIndex;
  const fallbackLookups = type === 'lecture' ? rrIndex : slidesIndex;

  let matchedLookup: DocLookup | undefined;

  // 1. Try matching by document ID
  if (cite.id) {
    const idKey = cite.id.toLowerCase().trim();
    matchedLookup = lookups.byId.get(idKey) || fallbackLookups.byId.get(idKey);
  }

  // 2. Try matching by document filename
  if (!matchedLookup && cite.document) {
    const docKey = cite.document.toLowerCase().trim();
    const cleanKey = cite.document
      .replace(/^(Recommended_Readings|RR|lectures)\//i, '')
      .replace(/\.pdf$/i, '')
      .toLowerCase()
      .trim();
    matchedLookup =
      lookups.byFilename.get(docKey) ||
      lookups.byFilename.get(cleanKey) ||
      fallbackLookups.byFilename.get(docKey) ||
      fallbackLookups.byFilename.get(cleanKey);
  }

  // Check legacy slide map if no document found but slide number is present for lectures
  let legacyEntry: DocumentIndexEntry | undefined;
  if (!matchedLookup && type === 'lecture' && typeof cite.slide === 'number') {
    legacyEntry = slidesIndex.legacySlides.get(cite.slide);
  }

  const slideNum = cite.slide ?? legacyEntry?.slide ?? cite.page ?? 1;
  const pageMapEntry = matchedLookup?.slidesMap.get(slideNum);

  // Determine physical page for viewer URL navigation (always slideNum in PDF)
  const resolvedPage = slideNum;
  const displayPage = pageMapEntry?.page ?? cite.page ?? slideNum;

  const resolvedDoc =
    matchedLookup?.filename ||
    cite.document ||
    legacyEntry?.document ||
    (type === 'lecture' ? 'DVAD27_Lectures.pdf' : '');

  const docTitle = matchedLookup?.doc.title || '';
  const resolvedTitle =
    cite.title ||
    pageMapEntry?.title ||
    legacyEntry?.title ||
    docTitle ||
    resolvedDoc.replace(/\.pdf$/i, '');

  const resolvedSection =
    cite.section ||
    pageMapEntry?.section ||
    legacyEntry?.section ||
    '';

  // Format a friendly display label
  let resolvedLabel = cite.label;
  if (!resolvedLabel) {
    if (type === 'lecture') {
      resolvedLabel = `Slide ${slideNum}`;
    } else {
      const authorOrTitle = matchedLookup?.doc.author || docTitle || resolvedDoc.replace(/\.pdf$/i, '');
      const shortAuthor = authorOrTitle.split(',')[0].replace(/\(.*?\)/g, '').trim();
      const pageStr = displayPage ? `p. ${displayPage}` : `Slide ${slideNum}`;
      resolvedLabel = shortAuthor ? `${shortAuthor} (${pageStr})` : pageStr;
    }
  }

  const resolvedUrl = resolveSourceUrl(resolvedDoc, resolvedPage, type, slideNum);

  return {
    ...cite,
    document: resolvedDoc,
    page: resolvedPage,
    slide: slideNum,
    displayPage,
    title: resolvedTitle,
    section: resolvedSection,
    label: resolvedLabel,
    type,
    url: resolvedUrl,
  };
}

