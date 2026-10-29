import { RawExamBlock } from '../types';

/**
 * Loads all exam question JSON files dynamically from src/data/exams/.
 * Vite's import.meta.glob ensures all exam files are bundled and inlined
 * directly into dist/index.html when building single-file standalone distribution.
 *
 * It dynamically discovers any .json file located in src/data/exams/ (including subdirectories).
 */
const examModules = import.meta.glob<{ default: RawExamBlock | RawExamBlock[] }>(
  [
    '../data/exams/*.json',
    '../data/exams/**/*.json',
  ],
  { eager: true }
);

export function getAllExamBlocks(): RawExamBlock[] {
  const blocksMap = new Map<string, RawExamBlock>();

  for (const path in examModules) {
    const mod = examModules[path];
    const data = (mod && 'default' in mod ? mod.default : mod) as RawExamBlock | RawExamBlock[];
    const items = Array.isArray(data) ? data : (data && (data as RawExamBlock).exam ? [data as RawExamBlock] : []);
    
    for (const block of items) {
      if (block.exam && Array.isArray(block.questions)) {
        // Keep the first or prefer top-level file
        if (!blocksMap.has(block.exam) || path.includes('/exam_') || path.includes('/exams/')) {
          blocksMap.set(block.exam, block);
        }
      }
    }
  }

  const blocks = Array.from(blocksMap.values());

  // Sort exams in reverse chronological order (newest first: 260610, 260108, 251107, etc.)
  blocks.sort((a, b) => {
    const numA = parseInt(a.exam, 10) || 0;
    const numB = parseInt(b.exam, 10) || 0;
    return numB - numA;
  });

  return blocks;
}

export const rawExamBlocks: RawExamBlock[] = getAllExamBlocks();

