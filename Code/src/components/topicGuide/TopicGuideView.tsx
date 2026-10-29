import React, { useState, useMemo, useEffect } from 'react';
import { STUDY_SECTIONS, COURSE_METADATA } from '../../utils/topicStructure';
import { QuestionEntry, Citation } from '../../types';
import { SectionItem } from './SectionItem';
import { CheatSheetModal } from './CheatSheetModal';
import {
  Search,
  X,
  Zap,
  Filter,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const LOCAL_STORAGE_REVIEWED_KEY = 'course_study_reviewed_topics_v1';

interface TopicGuideViewProps {
  entries: QuestionEntry[];
  onOpenCitation: (citation: Citation) => void;
  onOpenSourcesLibrary: () => void;
}

export const TopicGuideView: React.FC<TopicGuideViewProps> = ({
  entries,
  onOpenCitation,
  onOpenSourcesLibrary,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Exam session filter
  const [activeExamFilter, setActiveExamFilter] = useState('all');

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Default open first section
    return { 'sec-1': true };
  });

  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});

  // Reviewed checklist state from localStorage
  const [reviewedTopics, setReviewedTopics] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REVIEWED_KEY) || localStorage.getItem('dvad20_study_reviewed_topics_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Cheat Sheet Modal state
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  // Sync reviewed topics to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_REVIEWED_KEY, JSON.stringify(reviewedTopics));
    } catch (e) {
      console.error('Failed to save reviewed topics to localStorage:', e);
    }
  }, [reviewedTopics]);

  // Map of question ID (e.g., "260610-1") to QuestionEntry for instant lookup
  const questionsMap = useMemo(() => {
    const map = new Map<string, QuestionEntry>();
    entries.forEach((q) => {
      map.set(q.id, q);
    });
    return map;
  }, [entries]);

  // Extract available exam codes from entries
  const availableExams = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((q) => set.add(q.exam));
    return Array.from(set).sort().reverse();
  }, [entries]);

  // Total topics count across all sections
  const totalTopics = useMemo(() => {
    return STUDY_SECTIONS.reduce((acc, sec) => acc + sec.topics.length, 0);
  }, []);

  // Total reviewed count
  const reviewedCount = useMemo(() => {
    return Object.values(reviewedTopics).filter(Boolean).length;
  }, [reviewedTopics]);

  const progressPercent = Math.round((reviewedCount / (totalTopics || 1)) * 100);

  // Toggle individual section
  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Toggle individual topic
  const handleToggleTopic = (topicId: string) => {
    setOpenTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // Toggle topic reviewed status
  const handleToggleReviewed = (topicId: string) => {
    setReviewedTopics((prev) => {
      const next = { ...prev };
      if (next[topicId]) {
        delete next[topicId];
      } else {
        next[topicId] = true;
      }
      return next;
    });
  };

  // Reset reviewed progress
  const handleResetProgress = () => {
    if (window.confirm('Reset your revision checklist progress?')) {
      setReviewedTopics({});
    }
  };

  // Expand / Collapse all sections
  const allSectionsOpen = STUDY_SECTIONS.every((sec) => openSections[sec.id]);

  const handleToggleAllSections = () => {
    if (allSectionsOpen) {
      setOpenSections({});
    } else {
      const all: Record<string, boolean> = {};
      STUDY_SECTIONS.forEach((sec) => {
        all[sec.id] = true;
      });
      setOpenSections(all);
    }
  };

  // When search query is entered, auto-expand matching sections and topics
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const openSecs: Record<string, boolean> = {};
      const openTops: Record<string, boolean> = {};

      STUDY_SECTIONS.forEach((sec) => {
        sec.topics.forEach((topic) => {
          const titleMatch = topic.title.toLowerCase().includes(q);
          const summaryMatch = topic.summary.toLowerCase().includes(q);
          const plainWordsMatch = topic.plainWords?.toLowerCase().includes(q);
          const codeMatch = topic.code.toLowerCase().includes(q);
          const examMatch = topic.examQuestionIds.some((id) => id.toLowerCase().includes(q));

          if (titleMatch || summaryMatch || plainWordsMatch || codeMatch || examMatch) {
            openSecs[sec.id] = true;
            openTops[topic.id] = true;
          }
        });
      });

      setOpenSections(openSecs);
      setOpenTopics(openTops);
    }
  }, [searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-5xl mx-auto w-full flex flex-col gap-6">
      {/* Top Hero Card & Blueprint Introduction */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-md border border-purple-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-purple-700/80 text-purple-200 border border-purple-500/30 text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Course Study Guide &amp; Blueprint
              </span>
              <span className="bg-white/10 text-white text-[0.7rem] font-medium px-2 py-0.5 rounded-full">
                {COURSE_METADATA.code} {COURSE_METADATA.title}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Progressive Curriculum Guide
            </h1>
            <p className="text-xs md:text-sm text-purple-200 leading-relaxed">
              {COURSE_METADATA.description ||
                '3-tier progressive disclosure: Master foundational mental models, examine deep technical mechanisms, and self-test against real exam questions with structured model answers.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap md:flex-col items-stretch gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCheatSheetOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition active:scale-98 cursor-pointer"
              title="Open Quick-Access Cram Sheet with ports, limits and 1-line answers"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Quick Cram Sheet</span>
            </button>

            <button
              type="button"
              onClick={onOpenSourcesLibrary}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition cursor-pointer"
              title="Open Course Slides & Recommended Readings index"
            >
              <BookOpen className="w-4 h-4 text-purple-300" />
              <span>Course Sources</span>
            </button>
          </div>
        </div>

        {/* Revision Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-purple-200">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Revision Checklist Progress:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white">
                {reviewedCount} / {totalTopics} Topics ({progressPercent}%)
              </span>
              {reviewedCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="text-[0.68rem] text-purple-300 hover:text-white underline transition ml-2 cursor-pointer"
                  title="Reset revision progress"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Global Real-Time Search & Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, mental models, technical terms (e.g. 'BBR', 'CoDel', 'P4', 'OpenFlow', 'VXLAN')..."
            className="w-full pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls Row: Exam Filter Pills & Expand All */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Exam Session Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Exam:
            </span>

            <button
              type="button"
              onClick={() => setActiveExamFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer border ${
                activeExamFilter === 'all'
                  ? 'bg-purple-700 text-white border-purple-800 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              All Exams
            </button>

            {availableExams.map((examCode) => (
              <button
                key={examCode}
                type="button"
                onClick={() => setActiveExamFilter(examCode)}
                className={`px-2 py-1 rounded-md text-[0.72rem] font-medium transition cursor-pointer border ${
                  activeExamFilter === examCode
                    ? 'bg-purple-700 text-white border-purple-800 shadow-2xs font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {examCode}
              </button>
            ))}
          </div>

          {/* Expand / Collapse All Sections */}
          <button
            type="button"
            onClick={handleToggleAllSections}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md border border-slate-300 transition cursor-pointer"
          >
            {allSectionsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{allSectionsOpen ? 'Collapse All Chapters' : 'Expand All Chapters'}</span>
          </button>
        </div>
      </div>

      {/* Sections List (Level 1 Accordions) */}
      <div className="space-y-4">
        {STUDY_SECTIONS.map((section) => (
          <SectionItem
            key={section.id}
            section={section}
            questionsMap={questionsMap}
            isOpen={!!openSections[section.id]}
            onToggleOpen={() => handleToggleSection(section.id)}
            openTopics={openTopics}
            onToggleTopic={handleToggleTopic}
            reviewedTopics={reviewedTopics}
            onToggleReviewed={handleToggleReviewed}
            onOpenCitation={onOpenCitation}
            activeExamFilter={activeExamFilter}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* Quick Cram Sheet Modal */}
      <CheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
};
