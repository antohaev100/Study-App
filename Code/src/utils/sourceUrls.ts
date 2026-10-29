declare const __LECTURE_FILES__: string[] | undefined;

const availableLectureFiles = new Set<string>(
  typeof __LECTURE_FILES__ !== 'undefined' && Array.isArray(__LECTURE_FILES__)
    ? __LECTURE_FILES__
    : []
);

/**
 * Resolves a citation document and page to a clean relative URL.
 * - Literature/RR citations -> "RR/<filename>#page=<page>"
 * - Lecture citations -> "lectures/<filename>#page=<page>" (falling back to lectures.pdf if merged)
 */
export function resolveSourceUrl(
  document?: string,
  page?: number,
  type?: 'lecture' | 'literature',
  slide?: number
): string {
  if (!document) return '';

  const cleanDoc = document.trim();

  // 1. Recommended Readings / Literature
  if (
    type === 'literature' ||
    cleanDoc.startsWith('Recommended_Readings/') ||
    cleanDoc.startsWith('RR/') ||
    cleanDoc.startsWith('RR_')
  ) {
    const fileName = cleanDoc.replace(/^(Recommended_Readings|RR)\//i, '');
    const pageHash = page && page > 0 ? `#page=${page}` : '';
    return `RR/${fileName}${pageHash}`;
  }

  // 2. Lectures
  const bareName = cleanDoc.replace(/^lectures\//i, '');

  let targetFile = bareName;
  let targetPage = page && page > 0 ? page : 1;

  // If the exact deck name does not exist, fallback to lectures.pdf (combined deck)
  if (!availableLectureFiles.has(bareName)) {
    if (availableLectureFiles.has('lectures.pdf')) {
      targetFile = 'lectures.pdf';
      // In a merged deck, slide number corresponds to the page in lectures.pdf
      if (slide && slide > 0) {
        targetPage = slide;
      }
    }
  }

  return `lectures/${targetFile}#page=${targetPage}`;
}

export function cleanDocumentName(document?: string): string {
  if (!document) return '';
  return document
    .replace(/^(Recommended_Readings|RR|lectures)\//i, '')
    .replace(/\.pdf$/i, '')
    .replace(/_/g, ' ')
    .trim();
}
