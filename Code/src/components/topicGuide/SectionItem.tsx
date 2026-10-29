import React from 'react';
import { StudySectionDef } from '../../utils/topicStructure';
import { QuestionEntry, Citation } from '../../types';
import { TopicItem } from './TopicItem';
import { ChevronDown, ChevronUp, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';

interface SectionItemProps {
  section: StudySectionDef;
  questionsMap: Map<string, QuestionEntry>;
  isOpen: boolean;
  onToggleOpen: () => void;
  openTopics: Record<string, boolean>;
  onToggleTopic: (topicId: string) => void;
  reviewedTopics: Record<string, boolean>;
  onToggleReviewed: (topicId: string) => void;
  onOpenCitation: (citation: Citation) => void;
  activeExamFilter: string;
  searchQuery: string;
}

export const SectionItem: React.FC<SectionItemProps> = ({
  section,
  questionsMap,
  isOpen,
  onToggleOpen,
  openTopics,
  onToggleTopic,
  reviewedTopics,
  onToggleReviewed,
  onOpenCitation,
  activeExamFilter,
  searchQuery,
}) => {
  // Filter topics based on active exam filter and search query
  const visibleTopics = section.topics.filter((topic) => {
    // Exam filter check
    const associatedQuestions = topic.examQuestionIds
      .map((id) => questionsMap.get(id))
      .filter((q): q is QuestionEntry => !!q);

    if (activeExamFilter !== 'all') {
      const hasMatch = associatedQuestions.some((q) => q.exam === activeExamFilter);
      if (!hasMatch) return false;
    }

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = topic.title.toLowerCase().includes(q);
      const codeMatch = topic.code.toLowerCase().includes(q);
      const summaryMatch = topic.summary.toLowerCase().includes(q);
      const plainWordsMatch = topic.plainWords?.toLowerCase().includes(q);
      const examMatch = topic.examQuestionIds.some((id) => id.toLowerCase().includes(q));
      const questionsTextMatch = associatedQuestions.some((aq) =>
        aq.question.toLowerCase().includes(q) ||
        (aq.context && aq.context.toLowerCase().includes(q)) ||
        (aq.alternatives && aq.alternatives.some((alt) => alt.text.toLowerCase().includes(q))) ||
        (aq.sub_questions && aq.sub_questions.some((sq) =>
          sq.question.toLowerCase().includes(q) ||
          (sq.lecture_explanation && sq.lecture_explanation.toLowerCase().includes(q))
        ))
      );

      if (!titleMatch && !codeMatch && !summaryMatch && !plainWordsMatch && !examMatch && !questionsTextMatch) {
        return false;
      }
    }

    return true;
  });

  // Calculate reviewed metrics for this section
  const totalTopicsInSection = section.topics.length;
  const reviewedInSection = section.topics.filter((t) => reviewedTopics[t.id]).length;
  const allSectionReviewed = totalTopicsInSection > 0 && reviewedInSection === totalTopicsInSection;

  // Calculate total questions in this section
  const totalQuestionsInSection = section.topics.reduce((acc, t) => acc + t.examQuestionIds.length, 0);

  // If search/filter hid all topics in this section, hide the section
  if (visibleTopics.length === 0) {
    return null;
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all duration-200">
      {/* Level 1: Section Header */}
      <div
        onClick={onToggleOpen}
        className={`px-5 py-4 cursor-pointer select-none transition flex items-center justify-between gap-4 border-b ${
          isOpen ? 'bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-white border-purple-200' : 'bg-white hover:bg-slate-50 border-transparent'
        }`}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-700 to-indigo-800 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs shrink-0">
            {section.number}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[0.68rem] uppercase font-bold tracking-wider text-purple-700">
                Chapter {section.number}
              </span>
              {section.badge && (
                <span className="text-[0.65rem] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {section.badge}
                </span>
              )}
              {allSectionReviewed && (
                <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Completed</span>
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5 truncate">
              {section.title}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">{section.subtitle}</p>
          </div>
        </div>

        {/* Section Stats & Chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-purple-600" />
              <span>{visibleTopics.length} Topics</span>
            </span>

            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-3 h-3 text-indigo-600" />
              <span>{totalQuestionsInSection} Questions</span>
            </span>

            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold border border-slate-200">
              {reviewedInSection}/{totalTopicsInSection} Reviewed
            </span>
          </div>

          <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Level 2 & 3: Topics List */}
      {isOpen && (
        <div className="p-4 sm:p-5 bg-slate-50/50 space-y-3 border-t border-slate-100">
          {visibleTopics.map((topic) => {
            const associatedQuestions = topic.examQuestionIds
              .map((id) => questionsMap.get(id))
              .filter((q): q is QuestionEntry => !!q)
              .filter((q) => activeExamFilter === 'all' || q.exam === activeExamFilter);

            return (
              <TopicItem
                key={topic.id}
                topic={topic}
                associatedQuestions={associatedQuestions}
                isReviewed={!!reviewedTopics[topic.id]}
                onToggleReviewed={onToggleReviewed}
                onOpenCitation={onOpenCitation}
                isOpen={!!openTopics[topic.id]}
                onToggleOpen={() => onToggleTopic(topic.id)}
                searchQuery={searchQuery}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
