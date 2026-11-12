import { QuestionEntry, RawQuestion } from '../types';
import { resolveCitation } from './citationResolver';

/**
 * Normalizes any raw question object into a standardized QuestionEntry.
 */
export function normalizeQuestionEntry(
  q: RawQuestion | QuestionEntry,
  idx: number = 0,
  defaultExam: string = 'Exam'
): QuestionEntry {
  const anyQ = q as any;
  const exam =
    anyQ.exam ||
    (anyQ.number && anyQ.number.includes('-') ? anyQ.number.split('-')[0] : defaultExam);

  const num = anyQ.number
    ? anyQ.number.includes('-')
      ? anyQ.number.split('-')[1]
      : anyQ.number
    : `${idx + 1}`;

  const isWritten =
    anyQ.type === 'written' ||
    (Array.isArray(anyQ.sub_questions) && anyQ.sub_questions.length > 0);

  return {
    id: anyQ.id || `${exam}-${num}`,
    exam,
    number: num,
    topic: anyQ.topic || '',
    type: isWritten ? 'written' : 'multiple_choice',
    points: typeof anyQ.points === 'number' && !isNaN(anyQ.points) ? anyQ.points : null,
    question: anyQ.question || '',
    context: anyQ.context || '',
    alternatives: anyQ.alternatives || [],
    sub_questions: anyQ.sub_questions || [],
    abbreviations: anyQ.abbreviations || [],
    originalIndex: typeof anyQ.originalIndex === 'number' ? anyQ.originalIndex : idx,
  };
}

/**
 * Formats a question into clean, structured Markdown for the clipboard.
 * Shared between Exam Practice Mode and Lecture View.
 */
export function formatQuestionForClipboard(
  q: RawQuestion | QuestionEntry,
  idx: number = 0
): string {
  const item = normalizeQuestionEntry(q, idx);
  const sections: string[] = [];

  let headerText = `### Exam ${item.exam} — Question ${item.number}`;
  if (typeof item.points === 'number' && !isNaN(item.points)) {
    headerText += ` (${item.points} ${item.points === 1 ? 'pt' : 'pts'})`;
  }
  if (item.type === 'written') {
    headerText += ` [Written Question]`;
  } else {
    headerText += ` [Multiple Choice]`;
  }
  sections.push(headerText);

  if (item.context && item.context.trim()) {
    sections.push(`**Scenario / Context**:\n${item.context.trim()}`);
  }

  if (item.question && item.question.trim()) {
    sections.push(`**Question Prompt**:\n${item.question.trim()}`);
  }

  if (item.type === 'written' && item.sub_questions && item.sub_questions.length > 0) {
    const subLines: string[] = ['**Subquestions & Model Answers**:'];
    item.sub_questions.forEach((sub, sIdx) => {
      const lbl = sub.label ? `(${sub.label})` : `(${sIdx + 1})`;
      const pts = typeof sub.points === 'number' && !isNaN(sub.points) ? ` [${sub.points} pts]` : '';
      const entryParts = [`- **${lbl}${pts}** ${sub.question.trim()}`];

      if (sub.lecture_explanation) {
        entryParts.push(`  - *Model Answer*: ${sub.lecture_explanation.trim()}`);
        if (sub.lecture_citations && sub.lecture_citations.length > 0) {
          const cites = sub.lecture_citations
            .map((c) => {
              const res = resolveCitation(c);
              return `[${res.label}](${res.url})`;
            })
            .join(', ');
          entryParts.push(`  - *Citations*: ${cites}`);
        }
      }

      if (sub.RR_addition) {
        entryParts.push(`  - *Literature Addition*: ${sub.RR_addition.trim()}`);
        if (sub.literature_citations && sub.literature_citations.length > 0) {
          const cites = sub.literature_citations
            .map((c) => {
              const res = resolveCitation(c);
              return `[${res.label}](${res.url})`;
            })
            .join(', ');
          entryParts.push(`  - *Literature Citations*: ${cites}`);
        }
      }

      subLines.push(entryParts.join('\n'));
    });
    sections.push(subLines.join('\n\n'));
  } else if (item.alternatives && item.alternatives.length > 0) {
    const altLines: string[] = ['**Alternatives & Explanations**:'];
    item.alternatives.forEach((alt, aIdx) => {
      const letter = String.fromCharCode(65 + aIdx);
      const mark = alt.is_correct ? '✓ True' : '✗ False';
      const entryParts = [`- **(${letter}) [${mark}]** ${alt.text.trim()}`];

      if (alt.lecture_explanation) {
        entryParts.push(`  - *Explanation*: ${alt.lecture_explanation.trim()}`);
        if (alt.lecture_citations && alt.lecture_citations.length > 0) {
          const cites = alt.lecture_citations
            .map((c) => {
              const res = resolveCitation(c);
              return `[${res.label}](${res.url})`;
            })
            .join(', ');
          entryParts.push(`  - *Citations*: ${cites}`);
        }
      }

      if (alt.RR_addition) {
        entryParts.push(`  - *Literature Addition*: ${alt.RR_addition.trim()}`);
        if (alt.literature_citations && alt.literature_citations.length > 0) {
          const cites = alt.literature_citations
            .map((c) => {
              const res = resolveCitation(c);
              return `[${res.label}](${res.url})`;
            })
            .join(', ');
          entryParts.push(`  - *Literature Citations*: ${cites}`);
        }
      }

      altLines.push(entryParts.join('\n'));
    });
    sections.push(altLines.join('\n\n'));
  }

  if (item.abbreviations && item.abbreviations.length > 0) {
    const abbrLines = item.abbreviations.map(
      (a) => `- **${a.abbreviation}**: ${a.phrase} (Say: *${a.pronunciation}*)`
    );
    sections.push(`**Key Terms & Abbreviations**:\n${abbrLines.join('\n')}`);
  }

  return sections.join('\n\n');
}
