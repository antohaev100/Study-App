export interface Citation {
  id?: string;
  task_id?: string;
  slide?: number;
  type: 'lecture' | 'literature' | 'lab';
  document?: string;
  page?: number;
  section?: string;
  label?: string;
  title?: string;
  lecture_index?: string | number | null;
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
  topic?: string;
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
  topic?: string;
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

export interface LiteratureAdditionItem {
  concept: string;
  content: string;
  citations?: Citation[];
}

export interface LabAdditionItem {
  lab_id?: string;
  task_id?: string;
  lab_title?: string;
  task_number?: string;
  relevance_summary: string;
  practical_guidance?: string;
  code_or_commands?: string[];
  common_pitfalls?: string;
  citations?: Citation[];
}

export interface LectureSlideAddition {
  slide: number;
  title?: string;
  section?: string;
  literature_additions?: LiteratureAdditionItem[];
  questions?: RawQuestion[];
  lab_additions?: LabAdditionItem[];
}

export interface LectureAdditionFile {
  lecture_id?: string;
  lecture_index?: string | number | null;
  document?: string;
  title?: string;
  slides: LectureSlideAddition[];
}

export interface LabTaskEntry {
  task_id?: string;
  task: string;
  title: string;
  pages?: [number, number] | number[];
  page?: number;
}

export interface LabIndexEntry {
  id?: string;
  lab_number?: string | number;
  title: string;
  description?: string;
  tools?: string[];
  total_pages?: number;
  tasks?: LabTaskEntry[];
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
