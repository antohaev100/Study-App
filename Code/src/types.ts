export interface Citation {
  document: string;
  page: number;
  slide?: number;
  section?: string;
  label: string;
  title?: string;
  type: 'lecture' | 'literature';
}

export interface Alternative {
  text: string;
  is_correct: boolean;
  lecture_explanation: string;
  lecture_citations?: Citation[];
  RR_addition?: string;
  literature_citations?: Citation[];
}

export interface SubQuestion {
  label?: string; // e.g. 'a', 'b', 'c', 'i'
  points?: number | null;
  question: string;
  lecture_explanation: string;
  lecture_citations?: Citation[];
  RR_addition?: string;
  literature_citations?: Citation[];
}

export interface Abbreviation {
  abbreviation: string;
  term?: string;
  phrase: string;
  expansion?: string;
  pronunciation: string;
}

export interface RawQuestion {
  number: string;
  type?: 'multiple_choice' | 'written';
  points?: number | null;
  question?: string;
  context?: string;
  alternatives?: Alternative[];
  sub_questions?: SubQuestion[];
  abbreviations?: Abbreviation[];
}

export interface RawExamBlock {
  exam: string;
  questions: RawQuestion[];
}

export interface QuestionEntry {
  id: string; // e.g. "260610-1"
  exam: string;
  number: string;
  type: 'multiple_choice' | 'written';
  points?: number | null;
  question: string;
  context?: string;
  alternatives: Alternative[];
  sub_questions: SubQuestion[];
  abbreviations?: Abbreviation[];
  originalIndex: number;
}

export interface AppState {
  index: number;
  browseIndex: number;
  isStudyMode: boolean;
  qElapsed: number;
  bElapsed: number;
  order: number[];
}

export type {
  CourseMetadata,
  CheatSheetNumericalLimit,
  CheatSheetWhyQuestion,
  CheatSheetTechnologyTriad,
  CheatSheetData,
  ExamReference,
  TopicInfoBlock,
  QuestionTopicDef,
  StudySectionDef,
} from './utils/topicStructure';
