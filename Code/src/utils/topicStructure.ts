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
  topics: QuestionTopicDef[];
}

// Safely discover and load course_guide.json from src/data/ if present without crashing the build if missing
const guideModules = import.meta.glob<{ default: any }>(
  '../data/course_guide.json',
  { eager: true }
);
const rawCourseGuide: any = Object.values(guideModules)[0]?.default || {};

// Process and normalize raw JSON into strongly-typed structures
export const COURSE_METADATA: CourseMetadata = rawCourseGuide.course || {
  code: 'COURSE',
  title: 'Course Study Guide',
  subtitle: 'Curriculum & Exam Reference',
  description: 'Interactive study guide',
};

export const CHEAT_SHEET_DATA: CheatSheetData = rawCourseGuide.cheatSheet || {
  numericalLimits: [],
  whyQuestions: [],
  technologyTriads: [],
};

export const STUDY_SECTIONS: StudySectionDef[] = (rawCourseGuide.sections || []).map((sec: any) => ({
  id: sec.id,
  number: sec.number,
  title: sec.title,
  subtitle: sec.subtitle || '',
  summary: sec.summary || '',
  badge: sec.badge || '',
  topics: (sec.topics || []).map((topic: any) => {
    // Normalize examReferences into examQuestionIds ["<exam>-<questionNumber>"]
    const idsFromRefs: string[] = Array.isArray(topic.examReferences)
      ? topic.examReferences.map((ref: any) => `${ref.exam}-${ref.questionNumber}`)
      : [];

    const existingIds: string[] = Array.isArray(topic.examQuestionIds)
      ? topic.examQuestionIds
      : [];

    const combinedIds = Array.from(new Set([...idsFromRefs, ...existingIds]));

    return {
      id: topic.id,
      code: topic.code,
      title: topic.title,
      summary: topic.summary,
      badge: topic.badge,
      plainWords: topic.plainWords || '',
      keyTakeaway: topic.keyTakeaway || '',
      infoNeeded: topic.infoNeeded || [],
      examReferences: topic.examReferences || [],
      examQuestionIds: combinedIds,
      abbreviations: topic.abbreviations || [],
    };
  }),
}));

