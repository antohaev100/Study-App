import { LectureAdditionFile, LectureSlideAddition } from '../types';
import { resolveCitation, rawSlidesIndex } from './citationResolver';
import { formatQuestionForClipboard } from './questionFormatters';

const additionModules = import.meta.glob<{ default: LectureAdditionFile }>(
  [
    '../data/lecture_additions/*.json',
    '../data/lecture_additions/**/*.json',
    '../data/lecture_literature/*.json',
    '../data/lecture_literature/**/*.json',
    '../data/lecture_literature_additions/*.json',
    '../data/lecture_literature_additions/**/*.json',
    '../data/lecture_exams/*.json',
    '../data/lecture_exams/**/*.json',
    '../data/lecture_exam_additions/*.json',
    '../data/lecture_exam_additions/**/*.json',
    '../data/lecture_labs/*.json',
    '../data/lecture_labs/**/*.json',
    '../data/lecture_lab_additions/*.json',
    '../data/lecture_lab_additions/**/*.json',
  ],
  { eager: true }
);

function normalizeDeckKey(raw: string): string {
  return raw
    .replace(/^lectures\//i, '')
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .trim();
}

export function getAllLectureAdditions(): LectureAdditionFile[] {
  // Group all imported addition files by deck key and merge slide by slide
  const deckMap = new Map<
    string,
    {
      lecture_id: string;
      document: string;
      title: string;
      slidesMap: Map<number, LectureSlideAddition>;
    }
  >();

  for (const path in additionModules) {
    const mod = additionModules[path];
    const data = (mod && 'default' in mod ? mod.default : mod) as LectureAdditionFile;
    if (!data || (!data.lecture_id && !data.document) || !Array.isArray(data.slides)) {
      continue;
    }

    // Resolve document filename and canonical title from slides_index.json if omitted
    let docName = data.document;
    let canonicalTitle = data.title;

    if (data.lecture_id) {
      for (const [sKey, sVal] of Object.entries(rawSlidesIndex)) {
        const entry = sVal as any;
        if (!sKey.startsWith('_') && !/^\d+$/.test(sKey) && entry) {
          if (entry.id?.toLowerCase() === data.lecture_id.toLowerCase()) {
            if (!docName) docName = sKey;
            if (!canonicalTitle) canonicalTitle = entry.title;
            break;
          }
        }
      }
    }

    if (!docName) {
      docName = data.lecture_id ? `${data.lecture_id}.pdf` : 'Lectures.pdf';
    }
    const deckKey = normalizeDeckKey(docName);

    let deck = deckMap.get(deckKey);
    if (!deck) {
      deck = {
        lecture_id: data.lecture_id || deckKey,
        document: docName,
        title: canonicalTitle || data.title || docName.replace(/\.pdf$/i, ''),
        slidesMap: new Map<number, LectureSlideAddition>(),
      };
      deckMap.set(deckKey, deck);
    } else {
      if (canonicalTitle && deck.title === deck.document.replace(/\.pdf$/i, '')) {
        deck.title = canonicalTitle;
      }
      if (data.lecture_id && !deck.lecture_id) {
        deck.lecture_id = data.lecture_id;
      }
    }

    // Merge slides
    for (const s of data.slides) {
      if (typeof s.slide !== 'number') continue;

      let slideObj = deck.slidesMap.get(s.slide);
      if (!slideObj) {
        slideObj = {
          slide: s.slide,
          title: s.title || '',
          section: s.section || '',
          literature_additions: [],
          questions: [],
          lab_additions: [],
        };
        deck.slidesMap.set(s.slide, slideObj);
      } else {
        if (s.title && !slideObj.title) slideObj.title = s.title;
        if (s.section && !slideObj.section) slideObj.section = s.section;
      }

      // Merge literature additions
      if (Array.isArray(s.literature_additions) && s.literature_additions.length > 0) {
        if (!slideObj.literature_additions) slideObj.literature_additions = [];
        slideObj.literature_additions.push(...s.literature_additions);
      }

      // Merge questions
      if (Array.isArray(s.questions) && s.questions.length > 0) {
        if (!slideObj.questions) slideObj.questions = [];
        slideObj.questions.push(...s.questions);
      }

      // Merge lab additions
      if (Array.isArray(s.lab_additions) && s.lab_additions.length > 0) {
        if (!slideObj.lab_additions) slideObj.lab_additions = [];
        slideObj.lab_additions.push(...s.lab_additions);
      }
    }
  }

  // Convert map to sorted files
  const files: LectureAdditionFile[] = [];
  for (const deck of deckMap.values()) {
    const sortedSlides = Array.from(deck.slidesMap.values()).sort((a, b) => a.slide - b.slide);
    files.push({
      lecture_id: deck.lecture_id,
      document: deck.document,
      title: deck.title,
      slides: sortedSlides,
    });
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
 * Formats a single slide's recommended reading additions, related exam Q&As,
 * and lab practical guidance into clean Markdown ready to be copied to the clipboard.
 */
export function formatSlideAdditionForClipboard(
  lectureTitle: string,
  docName: string,
  slide: LectureSlideAddition
): string {
  // Resolve canonical slide title & section from slides_index if omitted on addition
  const deckKey = normalizeDeckKey(docName);
  let slideTitle = slide.title;
  let slideSection = slide.section;

  if (!slideTitle || !slideSection) {
    for (const [sKey, sVal] of Object.entries(rawSlidesIndex)) {
      const entry = sVal as any;
      if (!sKey.startsWith('_') && !/^\d+$/.test(sKey) && entry) {
        if (normalizeDeckKey(sKey) === deckKey || entry.id?.toLowerCase() === deckKey) {
          const pm = entry.pageMap?.find((p: any) => p.slide === slide.slide);
          if (pm) {
            if (!slideTitle) slideTitle = pm.title;
            if (!slideSection) slideSection = pm.section;
          }
          break;
        }
      }
    }
  }

  const headerParts = [`# Lecture Slide Note: ${docName} — Slide ${slide.slide}`];
  if (slideTitle) headerParts.push(`**Slide Title**: ${slideTitle}`);
  if (slideSection) headerParts.push(`**Section / Module**: ${slideSection}`);

  const sections: string[] = [headerParts.join('\n')];

  // 1. Literature Additions
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

  // 2. Hands-on Lab Additions
  if (slide.lab_additions && slide.lab_additions.length > 0) {
    const labLines: string[] = ['## Hands-on Lab Connections & Practical Exercises'];
    slide.lab_additions.forEach((lab, i) => {
      const taskLabel = lab.task_number
        ? ` — ${lab.task_number}`
        : lab.task_id
          ? ` — ${lab.task_id}`
          : '';
      labLines.push(`### Lab Connection ${i + 1}: ${lab.lab_title || 'Lab Exercise'}${taskLabel}`);
      if (lab.relevance_summary) {
        labLines.push(`**Relevance**: ${lab.relevance_summary.trim()}`);
      }
      if (lab.practical_guidance) {
        labLines.push(`**Practical Guidance**:\n${lab.practical_guidance.trim()}`);
      }
      if (Array.isArray(lab.code_or_commands) && lab.code_or_commands.length > 0) {
        labLines.push('**Commands & Code**:\n```bash\n' + lab.code_or_commands.join('\n') + '\n```');
      }
      if (lab.common_pitfalls) {
        labLines.push(`> [!WARNING] Common Pitfalls:\n> ${lab.common_pitfalls.trim()}`);
      }
      if (lab.citations && lab.citations.length > 0) {
        const citeBadges = lab.citations
          .map((c) => {
            const res = resolveCitation(c);
            return res.label || res.document;
          })
          .join(', ');
        labLines.push(`*Lab Citations: ${citeBadges}*`);
      }
    });
    sections.push(labLines.join('\n\n'));
  }

  // 3. Related Exam Questions
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
      (s.questions && s.questions.length > 0) ||
      (s.lab_additions && s.lab_additions.length > 0)
  );

  const sections: string[] = [
    `# Complete Lecture Synthesis & Exam Guide\n**Lecture**: ${title}\n**Document**: ${lecture.document}\n**Slides with Additions**: ${slides.length} slides indexed\n\n*This document contains deep literature additions from Recommended Readings, hands-on lab connections, and solved past exam questions for each slide. Use this alongside the lecture PDF.*`,
  ];

  slides.forEach((slide) => {
    sections.push(formatSlideAdditionForClipboard(title, lecture.document, slide));
  });

  return sections.join('\n\n========================================\n\n');
}
