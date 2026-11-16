import { Citation } from '../types';
import { resolveSourceUrl } from './sourceUrls';

export interface PageMapEntry {
  slide: number;
  page?: number | null;
  title?: string;
  section?: string;
  headings?: string[];
}

export interface OutlineNode {
  title: string;
  slides: [number, number];
  children?: OutlineNode[];
}

export interface DocumentIndexEntry {
  id?: string;
  title?: string;
  author?: string;
  description?: string;
  total_slides?: number;
  total_pages?: number | null;
  pages?: number;
  pageMap?: PageMapEntry[];
  outline?: OutlineNode[];
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
  type: 'lecture' | 'literature' | 'lab';
  url: string;
}

// Load slide, RR, and Labs indexes from data folder
const slideModules = import.meta.glob<{ default: Record<string, DocumentIndexEntry> }>(
  '../data/slides_index.json',
  { eager: true }
);
export const rawSlidesIndex: Record<string, any> = Object.values(slideModules)[0]?.default || {};

const rrModules = import.meta.glob<{ default: Record<string, DocumentIndexEntry> }>(
  '../data/rr_index.json',
  { eager: true }
);
export const rawRrIndex: Record<string, any> = Object.values(rrModules)[0]?.default || {};

const labModules = import.meta.glob<{ default: Record<string, any> }>(
  ['../data/labs_index.json', '../data/lab_index.json'],
  { eager: true }
);
export const rawLabsIndex = Object.values(labModules)[0]?.default || {};

// Helpers to build fast lookups
interface DocLookup {
  filename: string;
  doc: DocumentIndexEntry;
  slidesMap: Map<number, PageMapEntry>;
  tasksMap?: Map<string, any>;
}

function buildIndexLookups(rawIndex: Record<string, DocumentIndexEntry>) {
  const byId = new Map<string, DocLookup>();
  const byFilename = new Map<string, DocLookup>();
  const legacySlides = new Map<number, DocumentIndexEntry>();

  for (const [key, val] of Object.entries(rawIndex)) {
    if (!val || key.startsWith('_') || key.startsWith('$') || key === 'markdown_and_latex_support') continue;

    // Detect legacy slides_index format where key is a slide number (e.g. "1", "2")
    if (/^\d+$/.test(key) && val.document) {
      legacySlides.set(Number(key), val);
      continue;
    }

    // Modern index format where key is the bare filename
    const filename = key;
    const slidesMap = new Map<number, PageMapEntry>();
    const tasksMap = new Map<string, any>();

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

    // Support labs_index task ranges and task_id
    if (Array.isArray((val as any).tasks)) {
      for (const t of (val as any).tasks) {
        if (t.task_id) {
          tasksMap.set(String(t.task_id).toLowerCase().trim(), t);
        }
        if (Array.isArray(t.pages) && t.pages.length >= 2) {
          for (let p = t.pages[0]; p <= t.pages[1]; p++) {
            slidesMap.set(p, {
              slide: p,
              page: p,
              title: t.title,
              section: t.task,
            });
          }
        } else if (typeof t.page === 'number') {
          slidesMap.set(t.page, {
            slide: t.page,
            page: t.page,
            title: t.title,
            section: t.task,
          });
        }
      }
    }

    const lookup: DocLookup = { filename, doc: val, slidesMap, tasksMap };

    if (val.id) {
      byId.set(val.id.toLowerCase().trim(), lookup);
    }
    byFilename.set(filename.toLowerCase().trim(), lookup);

    // Also strip extensions and folder prefixes for relaxed matching
    const cleanKey = filename.replace(/^(Recommended_Readings|RR|lectures|labs)\//i, '').replace(/\.pdf$/i, '').toLowerCase().trim();
    if (!byFilename.has(cleanKey)) {
      byFilename.set(cleanKey, lookup);
    }
  }

  return { byId, byFilename, legacySlides };
}

const slidesIndex = buildIndexLookups(rawSlidesIndex);
const rrIndex = buildIndexLookups(rawRrIndex);
const labsIndex = buildIndexLookups(rawLabsIndex);

interface OutlineMatch {
  title: string;
  section: string;
}

/**
 * Recursively searches an outline tree for the node whose inclusive
 * [start_slide, end_slide] range contains slideNum.
 * If multiple siblings at the same level overlap on slideNum,
 * resolves to their parent node (returns null to caller).
 */
function findOutlineMatch(
  nodes: OutlineNode[] | undefined,
  slideNum: number,
  ancestors: string[] = []
): OutlineMatch | null {
  if (!Array.isArray(nodes) || nodes.length === 0) return null;

  const matchingNodes = nodes.filter(
    (node) =>
      node &&
      Array.isArray(node.slides) &&
      node.slides.length >= 2 &&
      slideNum >= node.slides[0] &&
      slideNum <= node.slides[1]
  );

  // If no match or multiple siblings overlap on this slide, resolve to parent
  if (matchingNodes.length !== 1) {
    return null;
  }

  const matched = matchingNodes[0];
  const currentPath = [...ancestors, matched.title];

  const childMatch = findOutlineMatch(matched.children, slideNum, currentPath);
  if (childMatch) {
    return childMatch;
  }

  return {
    title: matched.title,
    section: ancestors.join(' › '),
  };
}

/**
 * Resolves a citation (either minimal { id, slide, type } or legacy full object)
 * into a complete, display-ready citation with label, title, page, and url.
 */
export function resolveCitation(cite: Citation): ResolvedCitation {
  const type = cite.type || 'lecture';
  const lookups = type === 'lecture' ? slidesIndex : type === 'lab' ? labsIndex : rrIndex;
  const fallbackLookups = type === 'lecture' ? rrIndex : type === 'lab' ? slidesIndex : slidesIndex;

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
      .replace(/^(Recommended_Readings|RR|lectures|labs)\//i, '')
      .replace(/\.pdf$/i, '')
      .toLowerCase()
      .trim();
    matchedLookup =
      lookups.byFilename.get(docKey) ||
      lookups.byFilename.get(cleanKey) ||
      fallbackLookups.byFilename.get(docKey) ||
      fallbackLookups.byFilename.get(cleanKey);
  }

  // 3. Fallback: if lab citation with task_id and no matchedLookup yet, search across lab lookups
  if (!matchedLookup && cite.task_id) {
    const taskKey = cite.task_id.toLowerCase().trim();
    for (const lookup of lookups.byId.values()) {
      if (lookup.tasksMap?.has(taskKey)) {
        matchedLookup = lookup;
        break;
      }
    }
  }

  // Check legacy slide map if no document found but slide number is present for lectures
  let legacyEntry: DocumentIndexEntry | undefined;
  if (!matchedLookup && type === 'lecture' && typeof cite.slide === 'number') {
    legacyEntry = slidesIndex.legacySlides.get(cite.slide);
  }

  // Check task matching for labs
  let matchedTask: any = undefined;
  if (cite.task_id && matchedLookup?.tasksMap) {
    matchedTask = matchedLookup.tasksMap.get(cite.task_id.toLowerCase().trim());
  }

  let taskStartPage: number | undefined;
  if (matchedTask) {
    if (Array.isArray(matchedTask.pages) && matchedTask.pages.length > 0) {
      taskStartPage = matchedTask.pages[0];
    } else if (typeof matchedTask.page === 'number') {
      taskStartPage = matchedTask.page;
    }
  }

  const slideNum = cite.slide ?? taskStartPage ?? legacyEntry?.slide ?? cite.page ?? 1;
  const pageMapEntry = matchedLookup?.slidesMap.get(slideNum);
  const outlineMatch = !pageMapEntry ? findOutlineMatch(matchedLookup?.doc.outline, slideNum) : null;

  // Determine physical page for viewer URL navigation (always slideNum in PDF)
  const resolvedPage = slideNum;
  const displayPage = matchedTask
    ? (taskStartPage ?? pageMapEntry?.page ?? cite.page ?? slideNum)
    : (pageMapEntry?.page ?? cite.page ?? slideNum);

  const resolvedDoc =
    matchedLookup?.filename ||
    cite.document ||
    legacyEntry?.document ||
    (type === 'lecture' ? 'Lectures.pdf' : type === 'lab' ? 'Lab.pdf' : '');

  const docTitle = matchedLookup?.doc.title || '';
  const resolvedTitle =
    cite.title ||
    matchedTask?.title ||
    pageMapEntry?.title ||
    outlineMatch?.title ||
    legacyEntry?.title ||
    docTitle ||
    resolvedDoc.replace(/\.pdf$/i, '');

  const resolvedSection =
    cite.section ||
    matchedTask?.task ||
    matchedTask?.task_id ||
    pageMapEntry?.section ||
    outlineMatch?.section ||
    (outlineMatch && docTitle && outlineMatch.title !== docTitle ? docTitle : '') ||
    legacyEntry?.section ||
    '';

  // Format a friendly display label
  let resolvedLabel = cite.label;
  if (!resolvedLabel) {
    if (type === 'lecture') {
      resolvedLabel = `Slide ${slideNum}`;
    } else if (type === 'lab') {
      const labNum = (matchedLookup?.doc as any)?.lab_number;
      const labPrefix = labNum ? `Lab ${labNum}` : docTitle || 'Lab';
      const taskStr = matchedTask
        ? (matchedTask.task || matchedTask.task_id)
        : (resolvedSection || (displayPage ? `p. ${displayPage}` : `Page ${resolvedPage}`));
      resolvedLabel = `${labPrefix} (${taskStr})`;
    } else {
      const authorOrTitle = matchedLookup?.doc.author || docTitle || resolvedDoc.replace(/\.pdf$/i, '');
      const shortAuthor = authorOrTitle.split(',')[0].replace(/\(.*?\)/g, '').trim();
      const pageStr = pageMapEntry?.page
        ? `p. ${pageMapEntry.page}`
        : cite.page
          ? `p. ${cite.page}`
          : `Slide ${slideNum}`;
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

