import React from 'react';
import { StudySectionDef } from '../../utils/topicStructure';
import { QuestionEntry, Citation } from '../../types';
import { TopicItem } from './TopicItem';
import { RichContent } from '../RichContent';
import { ChevronDown, ChevronUp, Layers, HelpCircle, CheckCircle2, Sparkles } from 'lucide-react';

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
  // Helper to resolve all questions linked either via topic.examQuestionIds or question.topic
  const getAssociatedQuestions = (topic: (typeof section.topics)[0]): QuestionEntry[] => {
    const list: QuestionEntry[] = [];
    const seen = new Set<string>();

    for (const id of topic.examQuestionIds) {
      const q = questionsMap.get(id);
      if (q && !seen.has(q.id)) {
        seen.add(q.id);
        list.push(q);
      }
    }

    for (const q of questionsMap.values()) {
      if (q.topic && (q.topic === topic.id || q.topic === topic.code)) {
        if (!seen.has(q.id)) {
          seen.add(q.id);
          list.push(q);
        }
      }
    }

    return list;
  };

  // Filter topics based on active exam filter and search query
  const visibleTopics = section.topics.filter((topic) => {
    // Exam filter check
    const associatedQuestions = getAssociatedQuestions(topic);

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
  const totalQuestionsInSection = section.topics.reduce((acc, t) => acc + getAssociatedQuestions(t).length, 0);

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

      {/* Level 2 & 3: Section Knowledge & Topics List */}
      {isOpen && (
        <div className="p-4 sm:p-5 bg-slate-50/50 space-y-4 border-t border-slate-100">
          {/* Section-Level Overview & Mental Model */}
          {section.plainWords && (
            <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-purple-50/90 border border-purple-200/80 rounded-lg p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Section Mental Model &amp; Core Analogy</span>
              </div>
              <RichContent content={section.plainWords} className="text-purple-950 leading-relaxed font-medium text-xs" />
            </div>
          )}

          {/* Section-Level Core Knowledge Blocks */}
          {section.infoNeeded && section.infoNeeded.length > 0 && (
            <div className="space-y-3">
              {section.infoNeeded.map((block, bIdx) => (
                <div key={bIdx} className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2 shadow-2xs">
                  {block.title && (
                    <h5 className="font-bold text-xs text-purple-950 uppercase tracking-wide">
                      {block.title}
                    </h5>
                  )}

                  {block.points && block.points.length > 0 && (
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700 leading-relaxed text-xs">
                      {block.points.map((pt, pIdx) => (
                        <li key={pIdx}>
                          <RichContent content={pt} className="inline text-slate-700 text-xs" />
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Comparison / Parameter Table if present */}
                  {block.table && (
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left border-collapse border border-slate-200 rounded text-[0.72rem]">
                        <thead>
                          <tr className="bg-purple-100/70 text-purple-950 font-bold">
                            {block.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="border border-slate-200 px-2.5 py-1.5">
                                <RichContent content={h} className="text-purple-950 font-bold text-xs" />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="border border-slate-200 px-2.5 py-1.5 text-slate-800">
                                  <RichContent content={cell} className="text-slate-800 text-xs" />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {block.formula && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center text-purple-900 font-bold">
                      <RichContent
                        content={block.formula.includes('$') || block.formula.includes('\\[') ? block.formula : `$$${block.formula}$$`}
                        className="text-center font-bold text-xs"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section-Level Examiner Tip / Key Takeaway */}
          {section.keyTakeaway && (
            <div className="border-l-4 border-purple-600 pl-3 py-2 bg-purple-50/60 rounded-r text-purple-950">
              <span className="font-bold uppercase text-[0.68rem] tracking-wider text-purple-900 block">
                Section Synthesis &amp; Major Pitfalls
              </span>
              <RichContent content={section.keyTakeaway} className="mt-0.5 leading-relaxed text-purple-950 text-xs" />
            </div>
          )}

          {/* Topics Divider / Label */}
          <div className="pt-2 border-t border-slate-200/80 space-y-3">
            <div className="text-[0.68rem] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Section Question Topics ({visibleTopics.length}):</span>
            </div>

            {visibleTopics.map((topic) => {
              const associatedQuestions = getAssociatedQuestions(topic)
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
        </div>
      )}
    </div>
  );
};
