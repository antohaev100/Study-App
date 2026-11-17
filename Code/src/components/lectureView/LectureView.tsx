import React, { useState, useMemo, useEffect } from 'react';
import { Citation, LectureAdditionFile, LectureSlideAddition } from '../../types';
import {
  rawLectureAdditions,
  formatSlideAdditionForClipboard,
  formatLectureAdditionsForClipboard,
} from '../../utils/loadLectureAdditions';
import { resolveSourceUrl } from '../../utils/sourceUrls';
import { normalizeQuestionEntry } from '../../utils/questionFormatters';
import { rawSlidesIndex } from '../../utils/citationResolver';
import { RichContent } from '../RichContent';
import { CitationBadge } from '../common/CitationBadge';
import { TopicQuestionItem } from '../topicGuide/TopicQuestionItem';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Search,
  Sparkles,
  Layers,
  ChevronDown,
  Terminal,
  FlaskConical,
  AlertTriangle,
} from 'lucide-react';

interface LectureViewProps {
  onOpenCitation: (citation: Citation) => void;
  onOpenSourcesLibrary: () => void;
}

interface SlideMeta {
  slide: number;
  page?: number | null;
  title: string;
  section: string;
  hasLiterature: boolean;
  hasQuestions: boolean;
  hasLabs: boolean;
}

export const LectureView: React.FC<LectureViewProps> = ({
  onOpenCitation,
  onOpenSourcesLibrary,
}) => {
  // 1. Available lecture decks
  const availableDecks = useMemo(() => {
    const list: Array<{ id: string; lecture_index?: string | number | null; document: string; title: string; totalSlides: number }> = [];

    // Helper for key normalization (strips .pdf, replaces hyphens/underscores)
    const norm = (s: string) => s.toLowerCase().replace(/^lectures\//i, '').replace(/\.pdf$/i, '').replace(/[-_]/g, '_').trim();

    // First collect all decks defined in slides_index (authoritative source)
    Object.entries(rawSlidesIndex).forEach(([key, val]: [string, any]) => {
      if (!key.startsWith('_') && !/^\d+$/.test(key) && val?.title) {
        list.push({
          id: val.id || key,
          lecture_index: val.lecture_index ?? val.lecture_number ?? null,
          document: val.document || key,
          title: val.title || key,
          totalSlides: val.total_slides || val.pages || val.pageMap?.length || 1,
        });
      }
    });

    // Also incorporate any decks from additions files if not already in slides_index
    rawLectureAdditions.forEach((add) => {
      const doc = add.document || (add.lecture_id ? `${add.lecture_id}.pdf` : 'Lectures.pdf');
      const addDocNorm = norm(doc);
      const addIdNorm = add.lecture_id ? norm(add.lecture_id) : '';

      const existing = list.find((d) => {
        const dDocNorm = norm(d.document);
        const dIdNorm = norm(d.id);
        return (
          dDocNorm === addDocNorm ||
          (addIdNorm && dIdNorm === addIdNorm) ||
          (addIdNorm && dDocNorm === addIdNorm) ||
          (dIdNorm && addDocNorm === dIdNorm)
        );
      });

      if (!existing) {
        list.push({
          id: add.lecture_id || doc,
          lecture_index: add.lecture_index ?? null,
          document: doc,
          title: add.title || doc,
          totalSlides: add.slides.reduce((max, s) => Math.max(max, s.slide), 1),
        });
      }
    });

    // Fallback if none loaded
    if (list.length === 0) {
      list.push({
        id: 'lectures-default',
        lecture_index: null,
        document: 'Lectures.pdf',
        title: 'Course Lecture Slides',
        totalSlides: 1,
      });
    }

    // Sort by lecture_index ascending (e.g., L1, L2, L3, L4)
    list.sort((a, b) => {
      const idxA = a.lecture_index != null ? Number(String(a.lecture_index).replace(/\D/g, '')) : NaN;
      const idxB = b.lecture_index != null ? Number(String(b.lecture_index).replace(/\D/g, '')) : NaN;
      if (!isNaN(idxA) && !isNaN(idxB)) return idxA - idxB;
      if (!isNaN(idxA)) return -1;
      if (!isNaN(idxB)) return 1;
      return a.title.localeCompare(b.title);
    });

    return list;
  }, []);

  const [selectedDeckDoc, setSelectedDeckDoc] = useState<string>(() => {
    return availableDecks[0]?.document || 'Lectures.pdf';
  });

  // Keep selectedDeckDoc synced if availableDecks populates
  useEffect(() => {
    if (availableDecks.length > 0 && !availableDecks.some((d) => d.document === selectedDeckDoc)) {
      setSelectedDeckDoc(availableDecks[0].document);
      setCurrentSlideNum(1);
    }
  }, [availableDecks, selectedDeckDoc]);

  // Current lecture addition file
  const currentAdditionFile = useMemo(() => {
    const selNorm = selectedDeckDoc.toLowerCase().replace(/^lectures\//i, '').replace(/\.pdf$/i, '').replace(/[-_]/g, '_').trim();
    return (
      rawLectureAdditions.find((a) => {
        const aDoc = a.document ? a.document.toLowerCase().trim() : '';
        const aDocNorm = aDoc.replace(/^lectures\//i, '').replace(/\.pdf$/i, '').replace(/[-_]/g, '_');
        const aId = a.lecture_id ? a.lecture_id.toLowerCase().trim() : '';
        const aIdNorm = aId.replace(/[-_]/g, '_');

        return (
          (aDoc && (aDoc === selectedDeckDoc.toLowerCase() || aDocNorm === selNorm)) ||
          (aId && (aId === selectedDeckDoc.toLowerCase() || aIdNorm === selNorm))
        );
      }) || null
    );
  }, [selectedDeckDoc]);

  // Current deck metadata from slides_index
  const deckIndexEntry = useMemo(() => {
    if (rawSlidesIndex[selectedDeckDoc]) return rawSlidesIndex[selectedDeckDoc];
    const selNorm = selectedDeckDoc.toLowerCase().replace(/^lectures\//i, '').replace(/\.pdf$/i, '').replace(/[-_]/g, '_').trim();

    const match = Object.entries(rawSlidesIndex).find(([k, v]: [string, any]) => {
      const kNorm = k.toLowerCase().replace(/^lectures\//i, '').replace(/\.pdf$/i, '').replace(/[-_]/g, '_').trim();
      const vIdNorm = v?.id ? String(v.id).toLowerCase().replace(/[-_]/g, '_').trim() : '';
      return (
        k.toLowerCase() === selectedDeckDoc.toLowerCase() ||
        kNorm === selNorm ||
        (vIdNorm && vIdNorm === selNorm)
      );
    });
    return match ? match[1] : null;
  }, [selectedDeckDoc]);

  // Slide additions map for current lecture
  const slideAdditionsMap = useMemo(() => {
    const map = new Map<number, LectureSlideAddition>();
    if (currentAdditionFile?.slides) {
      currentAdditionFile.slides.forEach((s) => {
        map.set(s.slide, s);
      });
    }
    return map;
  }, [currentAdditionFile]);

  // Total slides in current deck
  const totalSlides = useMemo(() => {
    if (deckIndexEntry?.total_slides) return deckIndexEntry.total_slides;
    if (deckIndexEntry?.pages) return deckIndexEntry.pages;
    if (deckIndexEntry?.pageMap?.length) return deckIndexEntry.pageMap.length;
    let max = 1;
    slideAdditionsMap.forEach((_, sNum) => {
      if (sNum > max) max = sNum;
    });
    return max;
  }, [deckIndexEntry, slideAdditionsMap]);

  // Build full list of slides with metadata
  const allSlidesMeta: SlideMeta[] = useMemo(() => {
    const result: SlideMeta[] = [];
    const pageMap = Array.isArray(deckIndexEntry?.pageMap) ? deckIndexEntry.pageMap : [];
    const pageMapLookup = new Map<number, any>();
    pageMap.forEach((pm: any) => {
      if (typeof pm.slide === 'number') pageMapLookup.set(pm.slide, pm);
    });

    for (let s = 1; s <= totalSlides; s++) {
      const pm = pageMapLookup.get(s);
      const addition = slideAdditionsMap.get(s);

      const title = pm?.title || addition?.title || `Slide ${s}`;
      const section = pm?.section || addition?.section || 'Lecture Content';

      const hasLiterature = !!(
        addition?.literature_additions && addition.literature_additions.length > 0
      );
      const hasQuestions = !!(addition?.questions && addition.questions.length > 0);
      const hasLabs = !!(addition?.lab_additions && addition.lab_additions.length > 0);

      result.push({
        slide: s,
        page: pm?.page ?? s,
        title,
        section,
        hasLiterature,
        hasQuestions,
        hasLabs,
      });
    }
    return result;
  }, [totalSlides, deckIndexEntry, slideAdditionsMap]);

  // Active slide number
  const [currentSlideNum, setCurrentSlideNum] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAdditionsFilter, setOnlyAdditionsFilter] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clipboard copy state
  const [copiedSlide, setCopiedSlide] = useState(false);
  const [copiedLecture, setCopiedLecture] = useState(false);

  // Current slide metadata and addition
  const currentSlideMeta = useMemo(() => {
    return (
      allSlidesMeta.find((s) => s.slide === currentSlideNum) || {
        slide: currentSlideNum,
        title: `Slide ${currentSlideNum}`,
        section: 'General',
        hasLiterature: false,
        hasQuestions: false,
        hasLabs: false,
      }
    );
  }, [allSlidesMeta, currentSlideNum]);

  const currentAddition = useMemo(() => {
    return slideAdditionsMap.get(currentSlideNum) || null;
  }, [slideAdditionsMap, currentSlideNum]);

  // Filtered slides list for navigation drawer
  const filteredSlides = useMemo(() => {
    let list = allSlidesMeta;
    if (onlyAdditionsFilter) {
      list = list.filter((s) => s.hasLiterature || s.hasQuestions || s.hasLabs);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.section.toLowerCase().includes(q) ||
          s.slide.toString() === q
      );
    }
    return list;
  }, [allSlidesMeta, onlyAdditionsFilter, searchQuery]);

  // Slides with additions list (for next/prev jump)
  const slidesWithAdditions = useMemo(() => {
    return allSlidesMeta
      .filter((s) => s.hasLiterature || s.hasQuestions || s.hasLabs)
      .map((s) => s.slide);
  }, [allSlidesMeta]);

  const handleNextAddition = () => {
    const next = slidesWithAdditions.find((s) => s > currentSlideNum);
    if (next) {
      setCurrentSlideNum(next);
    } else if (slidesWithAdditions.length > 0) {
      setCurrentSlideNum(slidesWithAdditions[0]);
    }
  };

  // Copy Slide Additions to Clipboard
  const handleCopySlide = async () => {
    if (!currentAddition) return;
    try {
      const markdown = formatSlideAdditionForClipboard(
        currentAdditionFile?.title || selectedDeckDoc,
        selectedDeckDoc,
        currentAddition
      );
      await navigator.clipboard.writeText(markdown);
      setCopiedSlide(true);
      setTimeout(() => setCopiedSlide(false), 2000);
    } catch (e) {
      console.error('Failed to copy slide addition:', e);
    }
  };

  // Copy Full Lecture Additions to Clipboard
  const handleCopyLecture = async () => {
    if (!currentAdditionFile) return;
    try {
      const markdown = formatLectureAdditionsForClipboard(currentAdditionFile);
      await navigator.clipboard.writeText(markdown);
      setCopiedLecture(true);
      setTimeout(() => setCopiedLecture(false), 2000);
    } catch (e) {
      console.error('Failed to copy lecture additions:', e);
    }
  };

  // PDF URL for embedded iframe
  const pdfUrl = useMemo(() => {
    return resolveSourceUrl(selectedDeckDoc, currentSlideNum, 'lecture', currentSlideNum);
  }, [selectedDeckDoc, currentSlideNum]);

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Top Action & Navigation Bar */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Left: Deck Selector & Slide Stepper */}
        <div className="flex items-center flex-wrap gap-2 text-sm">
          {/* Deck Dropdown */}
          <div className="relative">
            <select
              value={selectedDeckDoc}
              onChange={(e) => {
                setSelectedDeckDoc(e.target.value);
                setCurrentSlideNum(1);
              }}
              className="bg-slate-100 hover:bg-slate-200/70 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableDecks.map((deck) => {
                let displayTitle = deck.title;
                if (deck.lecture_index != null) {
                  const cleanTitle = deck.title
                    .replace(/^Lecture\s*\d+\s*[:\-–—]\s*/i, '')
                    .replace(/^L\d+\s*[:\-–—]\s*/i, '')
                    .trim();
                  displayTitle = `Lecture ${deck.lecture_index}: ${cleanTitle}`;
                }
                return (
                  <option key={deck.document} value={deck.document}>
                    {displayTitle.length > 45 ? `${displayTitle.slice(0, 42)}...` : displayTitle}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Slide Navigation Stepper */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-300 shadow-2xs">
            <button
              onClick={() => setCurrentSlideNum((prev) => Math.max(1, prev - 1))}
              disabled={currentSlideNum <= 1}
              className="p-1 hover:bg-slate-200/80 disabled:opacity-30 disabled:hover:bg-transparent rounded-md text-slate-700 transition cursor-pointer"
              title="Previous Slide (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2.5 font-bold text-xs text-slate-700">
              Slide <span className="text-blue-700">{currentSlideNum}</span> / {totalSlides}
            </span>

            <button
              onClick={() => setCurrentSlideNum((prev) => Math.min(totalSlides, prev + 1))}
              disabled={currentSlideNum >= totalSlides}
              className="p-1 hover:bg-slate-200/80 disabled:opacity-30 disabled:hover:bg-transparent rounded-md text-slate-700 transition cursor-pointer"
              title="Next Slide (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Jump to Next Addition */}
          {slidesWithAdditions.length > 0 && (
            <button
              onClick={handleNextAddition}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition cursor-pointer"
              title="Skip to next slide with literature additions or exam questions"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Next Addition ({slidesWithAdditions.length})</span>
            </button>
          )}

          {/* Toggle Slide Drawer */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isSidebarOpen
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Toggle slide list panel"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Slide List</span>
          </button>
        </div>

        {/* Right: AI Chat Clipboard Copy Buttons */}
        <div className="flex items-center gap-2">
          {/* Copy Slide Button */}
          <button
            onClick={handleCopySlide}
            disabled={!currentAddition}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer active:scale-98 shadow-2xs ${
              copiedSlide
                ? 'bg-emerald-600 text-white border-emerald-700'
                : currentAddition
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
            title="Copy this slide's recommended reading insights and related exam questions to clipboard for AI chat"
          >
            {copiedSlide ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSlide ? 'Slide Copied!' : 'Copy Slide Additions'}</span>
          </button>

          {/* Copy Lecture Button */}
          <button
            onClick={handleCopyLecture}
            disabled={!currentAdditionFile || currentAdditionFile.slides.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer active:scale-98 shadow-2xs ${
              copiedLecture
                ? 'bg-emerald-600 text-white border-emerald-700'
                : currentAdditionFile && currentAdditionFile.slides.length > 0
                ? 'bg-purple-700 hover:bg-purple-800 text-white border-purple-800'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
            title="Copy ALL additions across this entire lecture deck to clipboard for comprehensive AI study assistance"
          >
            {copiedLecture ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLecture ? 'Lecture Copied!' : 'Copy Full Lecture'}</span>
          </button>

          {/* Sources Library Modal Link */}
          <button
            onClick={onOpenSourcesLibrary}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition cursor-pointer"
            title="Open Course Sources and Literature Library"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Sources Library</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area (Split Screen) */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Collapsible Slide List Drawer / Sidebar */}
        {isSidebarOpen && (
          <aside className="w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-md">
            {/* Filter and Search */}
            <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search slides & concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyAdditionsFilter}
                    onChange={(e) => setOnlyAdditionsFilter(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Only slides with additions</span>
                </label>
                <span className="text-slate-400 font-mono text-[0.7rem]">
                  {filteredSlides.length} / {allSlidesMeta.length}
                </span>
              </div>
            </div>

            {/* Slides Scroll List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredSlides.map((s) => {
                const isActive = s.slide === currentSlideNum;
                return (
                  <button
                    key={s.slide}
                    onClick={() => {
                      setCurrentSlideNum(s.slide);
                      if (window.innerWidth < 768) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`w-full text-left p-2 rounded-lg border transition cursor-pointer flex items-start gap-2 ${
                      isActive
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs font-semibold'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-[0.68rem] font-mono font-bold shrink-0 ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.slide}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate font-medium">{s.title}</div>
                      <div className="text-[0.68rem] text-slate-400 truncate mt-0.5">
                        {s.section}
                      </div>

                      {/* Badges for Literature, Lab, and Exam additions */}
                      <div className="flex items-center gap-1.5 mt-1">
                        {s.hasLiterature && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[0.62rem] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                            title="Contains Recommended Reading literature addition"
                          >
                            <BookOpen className="w-2.5 h-2.5 text-amber-700" />
                            <span>Lit</span>
                          </span>
                        )}
                        {s.hasLabs && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[0.62rem] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300"
                            title="Contains hands-on lab exercise connection"
                          >
                            <Terminal className="w-2.5 h-2.5 text-emerald-700" />
                            <span>Lab</span>
                          </span>
                        )}
                        {s.hasQuestions && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[0.62rem] font-bold bg-purple-100 text-purple-900 border border-purple-300"
                            title="Contains related solved exam questions"
                          >
                            <GraduationCap className="w-2.5 h-2.5 text-purple-700" />
                            <span>Exam</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Left Side: Embedded Slide Viewer */}
        <section className="flex-1 min-w-0 flex flex-col border-r border-slate-200 bg-slate-100 overflow-hidden">
          {/* Slide Title Bar */}
          <div className="px-4 py-2.5 bg-slate-800 text-white flex items-center justify-between gap-3 shrink-0 shadow-2xs">
            <div className="min-w-0 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded font-mono font-bold text-xs shrink-0">
                Slide {currentSlideNum}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-100 truncate">
                  {currentSlideMeta.title}
                </div>
                <div className="text-[0.7rem] text-slate-400 truncate flex items-center gap-1.5 flex-wrap">
                  {(deckIndexEntry?.lecture_index != null || deckIndexEntry?.lecture_number != null) && (
                    <>
                      <span className="font-semibold text-blue-400">
                        Lecture {deckIndexEntry.lecture_index ?? deckIndexEntry.lecture_number}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>{currentSlideMeta.section}</span>
                  <span>•</span>
                  <span className="text-slate-400">{selectedDeckDoc}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-semibold transition"
                title="Open this slide in a separate browser tab"
              >
                <ExternalLink className="w-3 h-3 text-slate-300" />
                <span className="hidden sm:inline">New Tab</span>
              </a>
            </div>
          </div>

          {/* Embedded PDF iframe */}
          <div className="flex-1 w-full bg-slate-200 relative overflow-hidden">
            <iframe
              key={`${selectedDeckDoc}-${currentSlideNum}`}
              src={pdfUrl}
              title={`Slide ${currentSlideNum}: ${currentSlideMeta.title}`}
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </section>

        {/* Right Side: Recommended Readings & Related Exam Q&As */}
        <section className="w-full md:w-[48%] lg:w-[45%] xl:w-[42%] flex flex-col bg-white overflow-hidden shrink-0">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Slide Additions &amp; Exam Insights
              </h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {currentAddition?.literature_additions && currentAddition.literature_additions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300 text-[0.68rem]">
                  {currentAddition.literature_additions.length} Reading Concept{currentAddition.literature_additions.length > 1 ? 's' : ''}
                </span>
              )}
              {currentAddition?.lab_additions && currentAddition.lab_additions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 text-[0.68rem]">
                  {currentAddition.lab_additions.length} Lab Connection{currentAddition.lab_additions.length > 1 ? 's' : ''}
                </span>
              )}
              {currentAddition?.questions && currentAddition.questions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-900 border border-purple-300 text-[0.68rem]">
                  {currentAddition.questions.length} Exam Q&amp;A{currentAddition.questions.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* If no additions for this slide */}
            {(!currentAddition ||
              ((!currentAddition.literature_additions || currentAddition.literature_additions.length === 0) &&
                (!currentAddition.questions || currentAddition.questions.length === 0) &&
                (!currentAddition.lab_additions || currentAddition.lab_additions.length === 0))) && (
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No Additions for Slide {currentSlideNum}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  This slide does not currently have indexed supplementary reading concepts, hands-on lab connections, or past exam questions attached.
                </p>
                {slidesWithAdditions.length > 0 && (
                  <button
                    onClick={handleNextAddition}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Jump to Next Slide with Additions</span>
                  </button>
                )}
              </div>
            )}

            {/* SECTION 1: Recommended Readings Additions */}
            {currentAddition?.literature_additions && currentAddition.literature_additions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-amber-200">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                    Recommended Readings &amp; Theoretical Depth
                  </h3>
                </div>

                <div className="space-y-3">
                  {currentAddition.literature_additions.map((lit, lIdx) => (
                    <div
                      key={lIdx}
                      className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3.5 space-y-2.5 shadow-2xs"
                    >
                      <div className="font-bold text-sm text-amber-950 flex items-center justify-between">
                        <span>{lit.concept}</span>
                        <span className="text-[0.65rem] font-mono text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full font-bold">
                          Concept #{lIdx + 1}
                        </span>
                      </div>

                      <div className="text-xs text-slate-800 leading-relaxed">
                        <RichContent content={lit.content} />
                      </div>

                      {/* Literature Citations */}
                      {lit.citations && lit.citations.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-200/60">
                          <span className="text-[0.65rem] font-bold text-amber-800 uppercase tracking-wider mr-1">
                            Cited Literature:
                          </span>
                          {lit.citations.map((rawCite, cIdx) => (
                            <CitationBadge
                              key={cIdx}
                              citation={rawCite}
                              onOpenCitation={onOpenCitation}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: Hands-on Lab Connections & Practical Exercises */}
            {currentAddition?.lab_additions && currentAddition.lab_additions.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                      Hands-on Lab Connections &amp; Practical Exercises
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold">
                    {currentAddition.lab_additions.length} Connection{currentAddition.lab_additions.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {currentAddition.lab_additions.map((lab, lIdx) => (
                    <div
                      key={lIdx}
                      className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-3.5 space-y-2.5 shadow-2xs"
                    >
                      <div className="font-bold text-sm text-emerald-950 flex items-center justify-between flex-wrap gap-2">
                        <span className="flex items-center gap-1.5">
                          <span>{lab.lab_title || 'Lab Exercise'}</span>
                          {(lab.task_number || lab.task_id) && (
                            <span className="text-[0.68rem] text-emerald-800 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              {lab.task_number || lab.task_id}
                            </span>
                          )}
                        </span>
                        <span className="text-[0.65rem] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                          Lab Connection #{lIdx + 1}
                        </span>
                      </div>

                      {lab.relevance_summary && (
                        <div className="text-xs font-medium text-emerald-950 bg-emerald-100/70 p-2.5 rounded-lg leading-relaxed border border-emerald-200/60">
                          <RichContent content={lab.relevance_summary} />
                        </div>
                      )}

                      {lab.practical_guidance && (
                        <div className="text-xs text-slate-800 leading-relaxed">
                          <RichContent content={lab.practical_guidance} />
                        </div>
                      )}

                      {lab.code_or_commands && lab.code_or_commands.length > 0 && (
                        <div className="bg-slate-900 rounded-lg p-3 text-slate-100 font-mono text-xs overflow-x-auto space-y-1 shadow-inner">
                          {lab.code_or_commands.map((cmd, cIdx) => (
                            <div key={cIdx} className="flex items-start gap-2">
                              <span className="text-emerald-400 select-none">$</span>
                              <span className="select-all">{cmd}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {lab.common_pitfalls && (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <span className="font-bold">Watch out: </span>
                            <RichContent content={lab.common_pitfalls} className="inline [&>p]:inline" />
                          </div>
                        </div>
                      )}

                      {/* Lab Manual Citations */}
                      {lab.citations && lab.citations.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-emerald-200/60">
                          <span className="text-[0.65rem] font-bold text-emerald-800 uppercase tracking-wider mr-1">
                            Lab Manual Citations:
                          </span>
                          {lab.citations.map((rawCite, cIdx) => (
                            <CitationBadge
                              key={cIdx}
                              citation={rawCite}
                              onOpenCitation={onOpenCitation}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: Related Past Exam Questions (Reusing TopicQuestionItem) */}
            {currentAddition?.questions && currentAddition.questions.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-purple-200">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-700" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-900">
                      Related Exam Questions Answerable from this Slide
                    </h3>
                  </div>
                  <span className="text-xs text-purple-700 font-bold">
                    {currentAddition.questions.length} Question{currentAddition.questions.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {currentAddition.questions.map((rawQ, qIdx) => {
                    const qEntry = normalizeQuestionEntry(rawQ, qIdx);
                    return (
                      <TopicQuestionItem
                        key={qEntry.id || qIdx}
                        question={qEntry}
                        onOpenCitation={onOpenCitation}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
