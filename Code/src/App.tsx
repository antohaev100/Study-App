import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { rawExamBlocks } from './utils/loadExams';
import { QuestionEntry, RawExamBlock, Citation } from './types';
import { Header } from './components/Header';
import { QuestionsDrawer } from './components/QuestionsDrawer';
import { NotesSidebar } from './components/NotesSidebar';
import { QuestionCard } from './components/QuestionCard';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { CitationModal } from './components/CitationModal';
import { SourcesLibraryModal } from './components/SourcesLibraryModal';

import { TopicGuideView } from './components/topicGuide/TopicGuideView';

const LOCAL_STORAGE_STATE_KEY = 'course_study_app_state_v2';
const LOCAL_STORAGE_NOTES_KEY = 'course_study_app_notes_v2';
const LOCAL_STORAGE_VIEW_KEY = 'course_study_app_view_v1';

function shuffleArray(len: number): number[] {
  const arr = Array.from({ length: len }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  // Flatten questions from raw json
  const entries: QuestionEntry[] = useMemo(() => {
    const flat: QuestionEntry[] = [];
    rawExamBlocks.forEach((examBlock) => {
      const examLabel = examBlock.exam || 'Unknown';
      (examBlock.questions || []).forEach((q) => {
        const isWritten =
          q.type === 'written' ||
          (Array.isArray(q.sub_questions) && q.sub_questions.length > 0);

        flat.push({
          id: `${examLabel}-${q.number}`,
          exam: examLabel,
          number: q.number || '?',
          type: isWritten ? 'written' : 'multiple_choice',
          points: typeof q.points === 'number' && !isNaN(q.points) ? q.points : null,
          question: q.question || '',
          context: q.context || '',
          alternatives: q.alternatives || [],
          sub_questions: q.sub_questions || [],
          abbreviations: q.abbreviations || [],
          originalIndex: flat.length,
        });
      });
    });
    return flat;
  }, []);

  // Persistent notes state
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY) || localStorage.getItem('dvad20_study_app_notes_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load saved state or default
  const savedState = useMemo(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_STATE_KEY) || localStorage.getItem('dvad20_study_app_state_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const [order, setOrder] = useState<number[]>(() => {
    if (savedState?.order && Array.isArray(savedState.order) && savedState.order.length === entries.length) {
      return savedState.order;
    }
    return shuffleArray(entries.length);
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof savedState?.index === 'number' && savedState.index < entries.length) {
      return savedState.index;
    }
    return 0;
  });

  const [browseIndex, setBrowseIndex] = useState<number>(() => {
    if (typeof savedState?.browseIndex === 'number' && savedState.browseIndex < entries.length) {
      return savedState.browseIndex;
    }
    return 0;
  });

  const [isStudyMode, setIsStudyMode] = useState<boolean>(() => {
    return !!savedState?.isStudyMode;
  });

  const [qElapsed, setQElapsed] = useState<number>(() => savedState?.qElapsed || 0);
  const [bElapsed, setBElapsed] = useState<number>(() => savedState?.bElapsed || 0);

  // View mode state (Topic Guide vs Exam Practice)
  const [currentView, setCurrentView] = useState<'guide' | 'exam'>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_VIEW_KEY);
      return saved === 'guide' || saved === 'exam' ? saved : 'guide';
    } catch {
      return 'guide';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_VIEW_KEY, currentView);
    } catch (e) {
      console.error('Failed to save view mode:', e);
    }
  }, [currentView]);

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSourcesLibraryOpen, setIsSourcesLibraryOpen] = useState(false);
  const [revealedStates, setRevealedStates] = useState<Record<number, boolean>>({});

  // Citation modal state
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);

  // Active question depends on mode
  const activeEntryIndex = isStudyMode ? order[currentIndex] ?? 0 : browseIndex;
  const currentQuestion = entries[activeEntryIndex] || entries[0];
  const questionKey = currentQuestion ? currentQuestion.id : 'default';

  // Save state to localStorage whenever main state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_STATE_KEY,
        JSON.stringify({
          index: currentIndex,
          browseIndex,
          isStudyMode,
          qElapsed,
          bElapsed,
          order,
        })
      );
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [currentIndex, browseIndex, isStudyMode, qElapsed, bElapsed, order]);

  // Reset revealed alternatives whenever question changes
  useEffect(() => {
    setRevealedStates({});
  }, [activeEntryIndex]);

  // Timers: tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setBElapsed((prev) => prev + 1);
      if (isStudyMode) {
        setQElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isStudyMode]);

  // Actions
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const toggleStudyMode = useCallback(() => {
    setIsStudyMode((prev) => {
      const nextMode = !prev;
      setQElapsed(0);
      setRevealedStates({});
      if (nextMode) {
        setIsNotesOpen(true);
      }
      return nextMode;
    });
  }, []);

  const handleStudyNext = useCallback(() => {
    setQElapsed(0);
    setCurrentIndex((prev) => (prev + 1) % order.length);
  }, [order.length]);

  const handleStudyPrev = useCallback(() => {
    setQElapsed(0);
    setCurrentIndex((prev) => (prev - 1 + order.length) % order.length);
  }, [order.length]);

  const handleBrowseNext = useCallback(() => {
    setBrowseIndex((prev) => (prev + 1) % entries.length);
  }, [entries.length]);

  const handleBrowsePrev = useCallback(() => {
    setBrowseIndex((prev) => (prev - 1 + entries.length) % entries.length);
  }, [entries.length]);

  const handleReroll = useCallback(() => {
    const newOrder = shuffleArray(entries.length);
    setOrder(newOrder);
    setCurrentIndex(0);
    setQElapsed(0);
    setRevealedStates({});
  }, [entries.length]);

  const handleResetBreak = useCallback(() => {
    setBElapsed(0);
  }, []);

  const handleSelectQuestion = useCallback(
    (index: number) => {
      if (isStudyMode) {
        const orderPos = order.indexOf(index);
        if (orderPos !== -1) {
          setCurrentIndex(orderPos);
        } else {
          setCurrentIndex(0);
        }
        setQElapsed(0);
      } else {
        setBrowseIndex(index);
      }
      setRevealedStates({});
    },
    [isStudyMode, order]
  );

  const handleToggleAlternative = useCallback((altIndex: number) => {
    setRevealedStates((prev) => ({
      ...prev,
      [altIndex]: !prev[altIndex],
    }));
  }, []);

  const handleRevealAll = useCallback(() => {
    if (!currentQuestion) return;
    const all: Record<number, boolean> = {};
    if (currentQuestion.type === 'written') {
      (currentQuestion.sub_questions || []).forEach((_, idx) => {
        all[idx] = true;
      });
    } else {
      (currentQuestion.alternatives || []).forEach((_, idx) => {
        all[idx] = true;
      });
    }
    setRevealedStates(all);
  }, [currentQuestion]);

  const handleResetRevealed = useCallback(() => {
    setRevealedStates({});
  }, []);

  const handleSaveNote = useCallback((key: string, text: string) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (text.trim()) {
        next[key] = text;
      } else {
        delete next[key];
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save notes:', e);
      }
      return next;
    });
  }, []);

  const handleOpenCitation = useCallback((citation: Citation) => {
    setActiveCitation(citation);
    setIsCitationModalOpen(true);
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isStudyMode) handleStudyNext();
        else handleBrowseNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isStudyMode) handleStudyPrev();
        else handleBrowsePrev();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        toggleStudyMode();
      } else if (e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleDrawer();
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setCurrentView((prev) => (prev === 'guide' ? 'exam' : 'guide'));
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNotesOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'r' && isStudyMode) {
        e.preventDefault();
        handleReroll();
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleRevealAll();
      } else if (e.key >= '1' && e.key <= '9') {
        const altIdx = parseInt(e.key, 10) - 1;
        if (currentQuestion) {
          const maxCount =
            currentQuestion.type === 'written'
              ? currentQuestion.sub_questions.length
              : currentQuestion.alternatives.length;
          if (altIdx < maxCount) {
            e.preventDefault();
            handleToggleAlternative(altIdx);
          }
        }
      } else if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsShortcutsOpen(false);
        setIsCitationModalOpen(false);
        setIsSourcesLibraryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isStudyMode,
    handleStudyNext,
    handleStudyPrev,
    handleBrowseNext,
    handleBrowsePrev,
    toggleStudyMode,
    toggleDrawer,
    handleReroll,
    handleRevealAll,
    handleToggleAlternative,
    currentQuestion,
  ]);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500 text-sm">
        Loading questions...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f4f6f8] text-[#2c3e50] overflow-hidden">
      {/* Top Navigation Bar */}
      <Header
        currentView={currentView}
        onChangeView={setCurrentView}
        onToggleDrawer={toggleDrawer}
        isStudyMode={isStudyMode}
        onToggleStudyMode={toggleStudyMode}
        onBrowsePrev={handleBrowsePrev}
        onBrowseNext={handleBrowseNext}
        browseIndex={browseIndex}
        totalQuestions={entries.length}
        onStudyPrev={handleStudyPrev}
        onStudyNext={handleStudyNext}
        onReroll={handleReroll}
        currentIndex={currentIndex}
        orderLength={order.length}
        qElapsed={qElapsed}
        bElapsed={bElapsed}
        onResetBreak={handleResetBreak}
        isNotesOpen={isNotesOpen}
        onToggleNotes={() => setIsNotesOpen((prev) => !prev)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSourcesLibrary={() => setIsSourcesLibraryOpen(true)}
      />

      {/* Main Workspace Area: Conditional between Topic Guide (Blueprint) and Exam Practice Mode */}
      {currentView === 'guide' ? (
        <main className="flex-1 overflow-y-auto flex flex-col bg-[#f8fafc]">
          <TopicGuideView
            entries={entries}
            onOpenCitation={handleOpenCitation}
            onOpenSourcesLibrary={() => setIsSourcesLibraryOpen(true)}
          />
        </main>
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Slide-out Drawer */}
          <QuestionsDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            entries={entries}
            activeEntryIndex={activeEntryIndex}
            onSelectQuestion={handleSelectQuestion}
            isStudyMode={isStudyMode}
          />

          {/* Notes Sidebar */}
          <NotesSidebar
            questionKey={questionKey}
            notes={notes}
            onSaveNote={handleSaveNote}
            isOpen={isNotesOpen}
            onToggle={() => setIsNotesOpen(false)}
          />

          {/* Center Question View */}
          <main className="flex-1 overflow-y-auto flex flex-col bg-[#f4f6f8]">
            <QuestionCard
              question={currentQuestion}
              revealedStates={revealedStates}
              onToggleAlternative={handleToggleAlternative}
              onRevealAll={handleRevealAll}
              onResetRevealed={handleResetRevealed}
              onOpenCitation={handleOpenCitation}
            />
          </main>
        </div>
      )}

      {/* Keyboard Shortcuts Helper Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Citation Viewer Modal */}
      <CitationModal
        citation={activeCitation}
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
      />

      {/* Sources & Literature Library Modal */}
      <SourcesLibraryModal
        isOpen={isSourcesLibraryOpen}
        onClose={() => setIsSourcesLibraryOpen(false)}
        onOpenCitation={handleOpenCitation}
      />
    </div>
  );
}
