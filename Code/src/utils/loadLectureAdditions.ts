import { LectureAdditionFile, LectureSlideAddition } from '../types';
import { resolveCitation } from './citationResolver';
import { formatQuestionForClipboard } from './questionFormatters';

const additionModules = import.meta.glob<{ default: LectureAdditionFile }>(
  [
    '../data/lecture_additions/*.json',
    '../data/lecture_additions/**/*.json',
  ],
  { eager: true }
);

export function getAllLectureAdditions(): LectureAdditionFile[] {
  const files: LectureAdditionFile[] = [];
  for (const path in additionModules) {
    const mod = additionModules[path];
    const data = (mod && 'default' in mod ? mod.default : mod) as LectureAdditionFile;
    if (data && (data.lecture_id || data.document) && Array.isArray(data.slides)) {
      files.push(data);
    }
  }
  return files;
}

export const rawLectureAdditions: LectureAdditionFile[] = getAllLectureAdditions();

export function getLectureAdditionsMap(): Map<string, LectureAdditionFile> {
  const map = new Map<string, LectureAdditionFile>();
  for (const item of rawLectureAdditions) {
    if (item.lecture_id) {
      map.set(item.lecture_id.toLowerCase().trim(), item);
    }
    if (item.document) {
      const cleanDoc = item.document.replace(/\.pdf$/i, '').toLowerCase().trim();
      map.set(cleanDoc, item);
      map.set(item.document.toLowerCase().trim(), item);
    }
  }
  return map;
}

/**
 * Formats a single slide's recommended reading additions and related exam Q&As
 * into clean Markdown ready to be copied to the clipboard and pasted into an AI chat.
 */
export function formatSlideAdditionForClipboard(
  lectureTitle: string,
  docName: string,
  slide: LectureSlideAddition
): string {
  const headerParts = [`# Lecture Slide Note: ${docName} — Slide ${slide.slide}`];
  if (slide.title) headerParts.push(`**Slide Title**: ${slide.title}`);
  if (slide.section) headerParts.push(`**Section / Module**: ${slide.section}`);

  const sections: string[] = [headerParts.join('\n')];

  // Literature Additions
  if (slide.literature_additions && slide.literature_additions.length > 0) {
    const litLines: string[] = ['## Recommended Readings & Literature Insights'];
    slide.literature_additions.forEach((item, i) => {
      litLines.push(`### Concept ${i + 1}: ${item.concept}`);
      litLines.push(item.content.trim());
      if (item.citations && item.citations.length > 0) {
        const citeBadges = item.citations
          .map((c) => {
            const res = resolveCitation(c);
            return res.label || res.document;
          })
          .join(', ');
        litLines.push(`*Literature Citations: ${citeBadges}*`);
      }
    });
    sections.push(litLines.join('\n\n'));
  }

  // Related Exam Questions
  if (slide.questions && slide.questions.length > 0) {
    const qLines: string[] = [
      `## Related Past Exam Questions & Solved Answers (${slide.questions.length})`,
      'The following exam questions are directly answerable using the concepts covered in this slide:',
    ];
    slide.questions.forEach((q, idx) => {
      qLines.push(formatQuestionForClipboard(q, idx));
    });
    sections.push(qLines.join('\n\n'));
  }

  return sections.join('\n\n---\n\n');
}

/**
 * Formats an entire lecture deck's additions into a master Markdown document.
 */
export function formatLectureAdditionsForClipboard(lecture: LectureAdditionFile): string {
  const title = lecture.title || lecture.document;
  const slides = (lecture.slides || []).filter(
    (s) =>
      (s.literature_additions && s.literature_additions.length > 0) ||
      (s.questions && s.questions.length > 0)
  );

  const sections: string[] = [
    `# Complete Lecture Synthesis & Exam Guide\n**Lecture**: ${title}\n**Document**: ${lecture.document}\n**Slides with Additions**: ${slides.length} slides indexed\n\n*This document contains deep literature additions from Recommended Readings and solved past exam questions for each slide. Use this alongside the lecture PDF.*`,
  ];

  slides.forEach((slide) => {
    sections.push(formatSlideAdditionForClipboard(title, lecture.document, slide));
  });

  return sections.join('\n\n========================================\n\n');
}
