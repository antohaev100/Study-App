import React from 'react';
import { Menu, GraduationCap, ChevronLeft, ChevronRight, Shuffle, RotateCcw, Clock, Coffee, FileEdit, HelpCircle, BookOpen } from 'lucide-react';
import { formatTime, getStage } from '../utils/renderContent';

interface HeaderProps {
  currentView: 'guide' | 'exam';
  onChangeView: (view: 'guide' | 'exam') => void;
  onToggleDrawer: () => void;
  isStudyMode: boolean;
  onToggleStudyMode: () => void;
  // Browse Mode
  onBrowsePrev: () => void;
  onBrowseNext: () => void;
  browseIndex: number;
  totalQuestions: number;
  // Study Mode
  onStudyPrev: () => void;
  onStudyNext: () => void;
  onReroll: () => void;
  currentIndex: number;
  orderLength: number;
  qElapsed: number;
  bElapsed: number;
  onResetBreak: () => void;
  // Notes & Extras
  isNotesOpen: boolean;
  onToggleNotes: () => void;
  onOpenShortcuts: () => void;
  onOpenSourcesLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onChangeView,
  onToggleDrawer,
  isStudyMode,
  onToggleStudyMode,
  onBrowsePrev,
  onBrowseNext,
  browseIndex,
  totalQuestions,
  onStudyPrev,
  onStudyNext,
  onReroll,
  currentIndex,
  orderLength,
  qElapsed,
  bElapsed,
  onResetBreak,
  isNotesOpen,
  onToggleNotes,
  onOpenShortcuts,
  onOpenSourcesLibrary,
}) => {
  const stage = getStage(qElapsed);

  return (
    <header className="bg-white border-b border-[#e0e0e0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs sticky top-0 z-30 select-none">
      {/* View Mode Segmented Switcher & Exam Controls */}
      <div className="flex items-center flex-wrap gap-2 text-sm">
        {/* Main Mode Toggle: Topic Guide vs Exam Mode */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-300 shadow-2xs mr-1">
          <button
            type="button"
            onClick={() => onChangeView('guide')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              currentView === 'guide'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Course Study Guide (Blueprint View): Chapters, topics, mental models, core rules & model answers"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Topic Guide</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeView('exam')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              currentView === 'exam'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Interactive Exam Practice Mode: Question browser, timers, study sessions & notes"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Exam Practice Mode</span>
          </button>
        </div>

        {/* Exam Controls only shown when in Exam Practice Mode */}
        {currentView === 'exam' && (
          <>
            <button
              onClick={onToggleDrawer}
              className="flex items-center gap-1.5 bg-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded-sm font-semibold text-xs transition cursor-pointer active:scale-98"
              title="Toggle Questions Overview Drawer"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Questions</span>
            </button>

            <button
              onClick={onToggleStudyMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold text-xs transition cursor-pointer active:scale-98 ${
                isStudyMode
                  ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-xs'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              title={isStudyMode ? 'Exit Study Mode to Browse Mode' : 'Enter Study Mode with randomized questions & timers'}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{isStudyMode ? 'Exit Study Mode' : 'Enter Study Mode'}</span>
            </button>
          </>
        )}

        {/* Browse Controls */}
        {currentView === 'exam' && !isStudyMode && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <button
              onClick={onBrowsePrev}
              className="flex items-center gap-1 bg-slate-500 hover:bg-slate-600 text-white px-2.5 py-1.5 rounded-sm font-semibold text-xs transition cursor-pointer"
              title="Previous Question (Arrow Left)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={onBrowseNext}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-sm font-semibold text-xs transition cursor-pointer"
              title="Next Question (Arrow Right)"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded border border-slate-200">
              {browseIndex + 1} / {totalQuestions}
            </span>
          </div>
        )}

        {/* Study Mode Controls */}
        {currentView === 'exam' && isStudyMode && (
          <div className="flex items-center flex-wrap gap-1.5 pl-2 border-l border-slate-200">
            <button
              onClick={onStudyPrev}
              className="flex items-center gap-1 bg-slate-500 hover:bg-slate-600 text-white px-2.5 py-1.5 rounded-sm font-semibold text-xs transition cursor-pointer"
              title="Previous Study Question"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={onStudyNext}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-sm font-semibold text-xs transition cursor-pointer"
              title="Next Study Question"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onReroll}
              className="flex items-center gap-1 bg-[#d84315] hover:bg-[#bf360c] text-white px-2.5 py-1.5 rounded-sm font-semibold text-xs transition cursor-pointer"
              title="Reroll & Reshuffle Questions Order"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Reroll</span>
            </button>
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded border border-slate-200">
              {currentIndex + 1} / {orderLength}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded border shadow-2xs transition-colors duration-300 ${stage.color}`}
              title={stage.desc}
            >
              Stage: {stage.label}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Timers, Sources Library & Extras */}
      <div className="flex items-center gap-2.5 text-xs">
        {currentView === 'exam' && isStudyMode && (
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Question:</span>
              <strong className="text-slate-900 font-mono text-sm">{formatTime(qElapsed)}</strong>
            </div>

            <div className="h-4 w-px bg-slate-300" />

            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              <span>Session:</span>
              <strong className="text-slate-900 font-mono text-sm">{formatTime(bElapsed)}</strong>
            </div>

            <button
              onClick={onResetBreak}
              className="flex items-center gap-1 text-[0.72rem] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded font-semibold transition cursor-pointer ml-1"
              title="Reset Break / Session Timer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Break</span>
            </button>
          </div>
        )}

        {/* Course Sources Library button */}
        <button
          onClick={onOpenSourcesLibrary}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded font-semibold text-xs transition cursor-pointer border bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs"
          title="Browse Course Lecture Slides and Recommended Readings"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span>Course Sources</span>
        </button>

        {/* Notes Pane Toggle only in Exam view */}
        {currentView === 'exam' && (
          <button
            onClick={onToggleNotes}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-semibold text-xs transition cursor-pointer border ${
              isNotesOpen
                ? 'bg-purple-50 text-purple-700 border-purple-300'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
            title="Toggle Question Notes Sidebar"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>
        )}

        {/* Keyboard shortcut help */}
        <button
          onClick={onOpenShortcuts}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
