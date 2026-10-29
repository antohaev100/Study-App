import React, { useState, useEffect, useRef } from 'react';
import { QuestionEntry } from '../types';
import { Search, ChevronDown, ChevronRight, BookOpen, CheckSquare, X } from 'lucide-react';

interface QuestionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: QuestionEntry[];
  activeEntryIndex: number;
  onSelectQuestion: (index: number) => void;
  isStudyMode: boolean;
}

export const QuestionsDrawer: React.FC<QuestionsDrawerProps> = ({
  isOpen,
  onClose,
  entries,
  activeEntryIndex,
  onSelectQuestion,
  isStudyMode,
}) => {
  const [search, setSearch] = useState('');
  const [openExams, setOpenExams] = useState<Record<string, boolean>>({});
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  // Group entries by exam
  const groupedByExam = React.useMemo(() => {
    const groups: Record<string, QuestionEntry[]> = {};
    entries.forEach((item) => {
      const examKey = item.exam || 'Unknown';
      if (!groups[examKey]) {
        groups[examKey] = [];
      }
      groups[examKey].push(item);
    });
    return groups;
  }, [entries]);

  // When activeEntryIndex changes, auto-open that exam group
  useEffect(() => {
    if (entries[activeEntryIndex]) {
      const currentExam = entries[activeEntryIndex].exam;
      setOpenExams((prev) => ({
        ...prev,
        [currentExam]: true,
      }));
    }
  }, [activeEntryIndex, entries]);

  // Scroll active question into view when drawer opens
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [isOpen, activeEntryIndex]);

  const toggleExam = (examKey: string) => {
    setOpenExams((prev) => ({
      ...prev,
      [examKey]: !prev[examKey],
    }));
  };

  const filteredGroups = React.useMemo(() => {
    if (!search.trim()) return groupedByExam;
    const term = search.toLowerCase();
    const result: Record<string, QuestionEntry[]> = {};

    Object.entries(groupedByExam).forEach(([examKey, list]) => {
      const filtered = list.filter((item) => {
        const matchesExam = examKey.toLowerCase().includes(term);
        const matchesNum = String(item.number).includes(term);
        const matchesQuestion = item.question ? item.question.toLowerCase().includes(term) : false;
        const matchesContext = item.context ? item.context.toLowerCase().includes(term) : false;
        const matchesAlternatives = (item.alternatives || []).some((a) =>
          a.text.toLowerCase().includes(term) ||
          (a.lecture_explanation && a.lecture_explanation.toLowerCase().includes(term))
        );
        const matchesSubQuestions = (item.sub_questions || []).some((sq) =>
          sq.question.toLowerCase().includes(term) ||
          (sq.lecture_explanation && sq.lecture_explanation.toLowerCase().includes(term))
        );
        return matchesExam || matchesNum || matchesQuestion || matchesContext || matchesAlternatives || matchesSubQuestions;
      });

      if (filtered.length > 0) {
        result[examKey] = filtered;
      }
    });

    return result;
  }, [groupedByExam, search]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[340px] max-w-[85vw] bg-white border-r border-[#e0e0e0] z-50 flex flex-col shadow-2xl transition-transform duration-250 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#e0e0e0] flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Questions Overview</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-[#f0f0f0] bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions or keywords..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex justify-between items-center text-[0.72rem] text-slate-400 mt-2 px-1">
            <span>Total Questions: {entries.length}</span>
            <span>{isStudyMode ? 'Study Mode Active' : 'Browse Mode'}</span>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {Object.keys(filteredGroups).length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No matching questions found for "{search}"
            </div>
          ) : (
            Object.entries(filteredGroups).map(([examKey, list]) => {
              const isExamOpen = search.trim() ? true : !!openExams[examKey];
              const containsActive = list.some((item) => item.originalIndex === activeEntryIndex);

              return (
                <div key={examKey} className="drawer-group">
                  <button
                    onClick={() => toggleExam(examKey)}
                    className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold transition select-none ${
                      containsActive
                        ? 'bg-blue-50/70 text-blue-900 border-l-3 border-blue-600'
                        : 'bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                      Exam: {examKey}
                      <span className="ml-1 text-[0.7rem] font-normal text-slate-400">
                        ({list.length} {list.length === 1 ? 'question' : 'questions'})
                      </span>
                    </span>
                    {isExamOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isExamOpen && (
                    <div className="bg-white py-1">
                      {list.map((item) => {
                        const isActive = item.originalIndex === activeEntryIndex;
                        return (
                          <div
                            key={`${item.exam}-${item.number}`}
                            ref={isActive ? activeItemRef : null}
                            onClick={() => {
                              onSelectQuestion(item.originalIndex);
                              onClose();
                            }}
                            className={`px-4 py-2 pl-7 cursor-pointer text-xs border-b border-slate-50 transition flex items-center justify-between group ${
                              isActive
                                ? 'bg-blue-50 font-semibold text-blue-800 border-l-4 border-blue-600'
                                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-700'
                            }`}
                          >
                            <span className="truncate pr-2">
                              Question {item.number}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {typeof item.points === 'number' && !isNaN(item.points) && (
                                <span className="text-[0.65rem] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  {item.points}p
                                </span>
                              )}
                              <span
                                className={`text-[0.68rem] px-1.5 py-0.5 rounded ${
                                  isActive
                                    ? 'bg-blue-200 text-blue-900 font-bold'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'
                                }`}
                              >
                                {item.type === 'written'
                                  ? `${(item.sub_questions || []).length} parts`
                                  : `${(item.alternatives || []).length} alts`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
