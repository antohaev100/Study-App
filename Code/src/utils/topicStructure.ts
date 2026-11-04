export interface CourseMetadata {
  code: string;
  title: string;
  subtitle?: string;
  description: string;
}

export interface CheatSheetNumericalLimit {
  label: string;
  value: string;
  detail: string;
}

export interface CheatSheetWhyQuestion {
  question: string;
  answer: string;
}

export interface CheatSheetTechnologyTriad {
  category: string;
  items: string[];
}

export interface CheatSheetData {
  numericalLimits: CheatSheetNumericalLimit[];
  whyQuestions: CheatSheetWhyQuestion[];
  technologyTriads: CheatSheetTechnologyTriad[];
}

export interface ExamReference {
  exam: string;
  questionNumber: string;
  note?: string;
}

export interface TopicInfoBlock {
  title?: string;
  points?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  formula?: string;
}

export interface QuestionTopicDef {
  id: string;
  code: string;
  title: string;
  summary: string;
  badge?: string;
  plainWords: string;
  keyTakeaway: string;
  infoNeeded: TopicInfoBlock[];
  examReferences?: ExamReference[];
  examQuestionIds: string[]; // Normalized as ["260610-1", "260108-2"]
  abbreviations?: string[];
}

export interface StudySectionDef {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  badge: string;
  plainWords?: string;
  keyTakeaway?: string;
  infoNeeded?: TopicInfoBlock[];
  topics: QuestionTopicDef[];
}

// Safely discover and load taxonomy (question_topics.json) and topic guide (course_topic_guide.json or course_guide.json) from src/data/
const taxonomyModules = import.meta.glob<{ default: any }>(
  ['../data/question_topics.json', '../data/question_topic.json'],
  { eager: true }
);
const guideModules = import.meta.glob<{ default: any }>(
  ['../data/course_topic_guide.json', '../data/course_guide.json'],
  { eager: true }
);

const rawTaxonomy: any = Object.values(taxonomyModules)[0]?.default || null;
const rawCourseGuide: any = Object.values(guideModules)[0]?.default || {};

// Process and normalize raw JSON into strongly-typed structures
export const COURSE_METADATA: CourseMetadata = rawTaxonomy?.course || rawCourseGuide.course || {
  code: 'COURSE',
  title: 'Course Study Guide',
  subtitle: 'Curriculum & Exam Reference',
  description: 'Interactive study guide',
};

export const CHEAT_SHEET_DATA: CheatSheetData = rawCourseGuide.cheatSheet || rawTaxonomy?.cheatSheet || {
  numericalLimits: [],
  whyQuestions: [],
  technologyTriads: [],
};

// Build index maps for rapid lookup of enrichment data by id
const guideSectionMap = new Map<string, any>();
const guideTopicMap = new Map<string, any>();

if (Array.isArray(rawCourseGuide.sections)) {
  for (const sec of rawCourseGuide.sections) {
    if (sec && sec.id) {
      guideSectionMap.set(sec.id, sec);
      if (Array.isArray(sec.topics)) {
        for (const top of sec.topics) {
          if (top && top.id) {
            guideTopicMap.set(top.id, top);
          }
        }
      }
    }
  }
}

// Master sections: if taxonomy file exists, it defines structure and titles. Otherwise fallback to rawCourseGuide.sections.
const baseSections: any[] = rawTaxonomy?.sections || rawCourseGuide.sections || [];

export const STUDY_SECTIONS: StudySectionDef[] = baseSections.map((sec: any) => {
  const secGuide = guideSectionMap.get(sec.id) || {};

  return {
    id: sec.id,
    number: sec.number || '',
    title: sec.title || '',
    subtitle: sec.subtitle || '',
    summary: sec.summary || '',
    badge: sec.badge || '',
    plainWords: secGuide.plainWords || sec.plainWords || '',
    keyTakeaway: secGuide.keyTakeaway || sec.keyTakeaway || '',
    infoNeeded: secGuide.infoNeeded || sec.infoNeeded || [],
    topics: (sec.topics || []).map((topic: any) => {
      const topGuide = guideTopicMap.get(topic.id) || {};

      // Normalize examReferences into examQuestionIds ["<exam>-<questionNumber>"]
      const idsFromRefs: string[] = Array.isArray(topGuide.examReferences || topic.examReferences)
        ? (topGuide.examReferences || topic.examReferences).map((ref: any) => `${ref.exam}-${ref.questionNumber}`)
        : [];

      const existingIds: string[] = Array.isArray(topGuide.examQuestionIds || topic.examQuestionIds)
        ? (topGuide.examQuestionIds || topic.examQuestionIds)
        : [];

      const combinedIds = Array.from(new Set([...idsFromRefs, ...existingIds]));

      return {
        id: topic.id,
        code: topic.code || '',
        title: topic.title || '',
        summary: topic.summary || '',
        badge: topic.badge || '',
        plainWords: topGuide.plainWords || topic.plainWords || '',
        keyTakeaway: topGuide.keyTakeaway || topic.keyTakeaway || '',
        infoNeeded: topGuide.infoNeeded || topic.infoNeeded || [],
        examReferences: topGuide.examReferences || topic.examReferences || [],
        examQuestionIds: combinedIds,
        abbreviations: topGuide.abbreviations || topic.abbreviations || [],
      };
    }),
  };
});

