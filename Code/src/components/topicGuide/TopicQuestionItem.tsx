import React, { useState, useEffect } from 'react';
import { QuestionEntry, Alternative, SubQuestion, Citation } from '../../types';
import { RichContent } from '../RichContent';
import {
  Award,
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCcw,
  Bookmark,
  BookOpen,
  ExternalLink,
  Volume2,
  X,
  FileText,
} from 'lucide-react';

interface TopicQuestionItemProps {
  question: QuestionEntry;
  onOpenCitation: (citation: Citation) => void;
  globalRevealTrigger?: number;
  globalResetTrigger?: number;
}

export const TopicQuestionItem: React.FC<TopicQuestionItemProps> = ({
  question,
  onOpenCitation,
  globalRevealTrigger,
  globalResetTrigger,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [revealedStates, setRevealedStates] = useState<Record<number, boolean>>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  const [showAbbreviations, setShowAbbreviations] = useState(false);

  const isWritten = question.type === 'written';
  const itemCount = isWritten
    ? (question.sub_questions || []).length
    : (question.alternatives || []).length;

  const allRevealed =
    itemCount > 0 && Array.from({ length: itemCount }).every((_, i) => revealedStates[i]);

  // Sync with global topic-level Reveal All / Reset All triggers
  useEffect(() => {
    if (globalRevealTrigger && globalRevealTrigger > 0) {
      setIsExpanded(true);
      const all: Record<number, boolean> = {};
      for (let i = 0; i < itemCount; i++) {
        all[i] = true;
      }
      setRevealedStates(all);
    }
  }, [globalRevealTrigger, itemCount]);

  useEffect(() => {
    if (globalResetTrigger && globalResetTrigger > 0) {
      setIsExpanded(false);
      setRevealedStates({});
      setExpandedDetails({});
      setShowAbbreviations(false);
    }
  }, [globalResetTrigger]);

  const toggleAlternative = (idx: number) => {
    setRevealedStates((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleDetailExpansion = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDetails((prev) => ({
      ...prev,
      [idx]: prev[idx] === undefined ? false : !prev[idx],
    }));
  };

  const revealAllForQuestion = () => {
    const all: Record<number, boolean> = {};
    for (let i = 0; i < itemCount; i++) {
      all[i] = true;
    }
    setRevealedStates(all);
  };

  const resetRevealedForQuestion = () => {
    setRevealedStates({});
    setExpandedDetails({});
  };

  const examPdfPath = `exams/${question.exam}.pdf`;

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs transition">
      {/* Question Header Banner (Always visible) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-800 hover:bg-slate-750 text-white px-4 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2 cursor-pointer select-none transition"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold uppercase tracking-wider text-purple-300">
            Exam {question.exam}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-semibold text-slate-200">Question {question.number}</span>

          {/* Points Badge */}
          {typeof question.points === 'number' && !isNaN(question.points) && (
            <span className="text-[0.68rem] font-bold px-1.5 py-0.2 rounded bg-emerald-700/80 text-emerald-200 flex items-center gap-1 border border-emerald-600/40">
              <Award className="w-3 h-3" />
              <span>{question.points} {question.points === 1 ? 'pt' : 'pts'}</span>
            </span>
          )}

          {/* Format Type Badge */}
          {isWritten ? (
            <span className="text-[0.65rem] font-bold px-1.5 py-0.2 rounded bg-indigo-700/80 text-indigo-200 border border-indigo-600/40">
              Written
            </span>
          ) : (
            <span className="text-[0.65rem] font-medium px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
              Multiple Choice
            </span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {question.abbreviations && question.abbreviations.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowAbbreviations(!showAbbreviations);
                if (!isExpanded) setIsExpanded(true);
              }}
              className={`text-[0.7rem] flex items-center gap-1 font-semibold px-2 py-0.5 rounded transition cursor-pointer border ${
                showAbbreviations
                  ? 'bg-purple-700 text-white border-purple-600'
                  : 'bg-slate-700 hover:bg-slate-600 text-purple-200 border-slate-600'
              }`}
              title={showAbbreviations ? 'Hide abbreviations' : 'View abbreviations'}
            >
              <Volume2 className="w-3 h-3" />
              <span>Abbr ({question.abbreviations.length})</span>
            </button>
          )}

          <a
            href={examPdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.7rem] text-slate-300 hover:text-white flex items-center gap-1 font-medium bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded transition border border-slate-600"
            title="Open clean exam PDF in new tab"
          >
            <FileText className="w-3 h-3 text-blue-400" />
            <span>PDF</span>
          </a>

          <span className="text-[0.68rem] bg-slate-900/60 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            {question.id}
          </span>

          {/* Reveal / Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[0.7rem] font-semibold px-2 py-0.5 rounded bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-700/60 transition cursor-pointer ml-1"
            title={isExpanded ? 'Collapse question details' : 'Reveal question content'}
          >
            <span>{isExpanded ? 'Hide' : 'Reveal'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Question Details: Only visible when the individual question is revealed */}
      {isExpanded && (
        <div className="animate-fadeIn">
          {/* Shared Context / Scenario if present */}
          {question.context && question.context.trim() && (
            <div className="p-3.5 bg-slate-100/90 border-b border-slate-200 text-xs text-slate-800 leading-relaxed">
              <span className="font-bold text-[0.65rem] uppercase tracking-wider text-slate-500 block mb-1">
                Context / Scenario:
              </span>
              <RichContent content={question.context} />
            </div>
          )}

          {/* Question Prompt */}
          {question.question && question.question.trim() && (
            <div className="p-4 bg-white text-slate-900 font-medium text-xs leading-relaxed border-b border-slate-200">
              <RichContent content={question.question} />
            </div>
          )}

          {/* Abbreviations Guide Dropdown if open */}
          {showAbbreviations && question.abbreviations && question.abbreviations.length > 0 && (
            <div className="p-3 bg-purple-50/70 border-b border-purple-200 animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.68rem] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>Abbreviations &amp; Pronunciations:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAbbreviations(false)}
                  className="text-purple-600 hover:text-purple-900 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.abbreviations.map((abbr, aIdx) => (
                  <div key={aIdx} className="bg-white p-2 rounded border border-purple-100 shadow-2xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-purple-900 bg-purple-100 px-1.5 py-0.2 rounded text-[0.7rem]">
                        {abbr.abbreviation || abbr.term}
                      </span>
                      <span className="text-[0.68rem] text-slate-500 font-medium">
                        Say: <strong className="text-purple-800">{abbr.pronunciation}</strong>
                      </span>
                    </div>
                    <div className="text-[0.7rem] text-slate-700 mt-1">{abbr.phrase || abbr.expansion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Sub-Header: Title & Action (Reveal All / Reset) */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {isWritten ? 'Subquestions & Model Rubric:' : 'Alternatives (Click to test knowledge):'}
            </span>

            {itemCount > 0 && (
              <button
                type="button"
                onClick={allRevealed ? resetRevealedForQuestion : revealAllForQuestion}
                className="flex items-center gap-1 text-[0.7rem] font-semibold px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 transition cursor-pointer shadow-2xs"
                title={allRevealed ? 'Hide all revealed answers for this question' : 'Reveal all answers for this question'}
              >
                {allRevealed ? <RotateCcw className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{allRevealed ? 'Reset Answers' : 'Reveal All'}</span>
              </button>
            )}
          </div>

          {/* Question Content: Written Subquestions OR Multiple Choice Alternatives */}
          <div className="p-3.5 bg-slate-50/50">
            {isWritten ? (
              /* WRITTEN QUESTION SUBQUESTIONS LIST */
              <div className="space-y-3">
                {(question.sub_questions || []).map((subQ: SubQuestion, idx: number) => {
                  const isRevealed = !!revealedStates[idx];
                  const displayLabel = subQ.label ? `(${subQ.label})` : `(${idx + 1})`;

                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs transition"
                    >
                      {/* Subquestion Prompt Header */}
                      <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 shrink-0 font-mono">
                            {displayLabel}
                          </span>
                          <div className="flex-1 text-slate-900 text-xs font-semibold leading-relaxed">
                            <RichContent content={subQ.question} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {typeof subQ.points === 'number' && !isNaN(subQ.points) && (
                            <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                              {subQ.points} {subQ.points === 1 ? 'pt' : 'pts'}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleAlternative(idx)}
                            className={`text-xs font-bold px-3 py-1 rounded transition cursor-pointer border ${
                              isRevealed
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-2xs'
                            }`}
                          >
                            {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
                          </button>
                        </div>
                      </div>

                      {/* Revealed Model Answer Details */}
                      {isRevealed && (
                        <div className="p-3.5 bg-white text-xs leading-relaxed flex flex-col gap-3 animate-fadeIn border-t border-slate-100">
                          {/* Lecture Technical Model Answer */}
                          {subQ.lecture_explanation && (
                            <div className="border-l-3 border-[#2196f3] pl-3 py-1.5 bg-blue-50/30 rounded-r">
                              <div className="text-[0.68rem] uppercase font-bold text-blue-700 tracking-wider mb-1 flex items-center justify-between">
                                <span>Comprehensive Model Answer</span>
                              </div>
                              <div className="text-slate-800">
                                <RichContent content={subQ.lecture_explanation} />
                              </div>

                              {/* Citations */}
                              {subQ.lecture_citations && subQ.lecture_citations.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-blue-100/60">
                                  <span className="text-[0.65rem] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1 mr-1">
                                    <Bookmark className="w-3 h-3 text-blue-600" /> Cited Slide(s):
                                  </span>
                                  {subQ.lecture_citations.map((cite, cIdx) => (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenCitation(cite);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.7rem] font-semibold bg-blue-100/80 hover:bg-blue-200 text-blue-800 border border-blue-200 transition cursor-pointer"
                                      title={`Click to review ${cite.document} at page ${cite.page} in the in-app viewer`}
                                    >
                                      <ExternalLink className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                      <span>{cite.label}</span>
                                      {cite.title && (
                                        <span className="opacity-70 font-normal max-w-[130px] truncate hidden sm:inline">
                                          • {cite.title}
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Literature Supplementary Addition */}
                          {subQ.RR_addition && (
                            <div className="border-l-3 border-[#e65100] pl-3 py-1.5 bg-amber-50/30 rounded-r">
                              <div className="text-[0.68rem] uppercase font-bold text-amber-800 tracking-wider mb-1 flex items-center justify-between">
                                <span>Literature Addition &amp; Deep Systems Insight</span>
                              </div>
                              <div className="text-slate-800">
                                <RichContent content={subQ.RR_addition} />
                              </div>

                              {subQ.literature_citations && subQ.literature_citations.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-amber-100/60">
                                  <span className="text-[0.65rem] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1 mr-1">
                                    <BookOpen className="w-3 h-3 text-amber-600" /> Literature Source(s):
                                  </span>
                                  {subQ.literature_citations.map((cite, cIdx) => (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenCitation(cite);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.7rem] font-semibold bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-200 transition cursor-pointer"
                                      title={`Click to review ${cite.document} at page ${cite.page} in the in-app viewer`}
                                    >
                                      <ExternalLink className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                                      <span>{cite.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* MULTIPLE CHOICE ALTERNATIVES LIST */
              <div className="space-y-2.5">
                {question.alternatives.map((alt: Alternative, idx: number) => {
                  const isRevealed = !!revealedStates[idx];
                  const letter = String.fromCharCode(65 + idx);
                  const isDetailExpanded = expandedDetails[idx] !== false;

                  let buttonColor = 'bg-[#fafafa] hover:bg-[#f0f4f8] text-[#2c3e50] border-[#e0e0e0]';
                  if (isRevealed) {
                    if (alt.is_correct) {
                      buttonColor = 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9] font-medium';
                    } else {
                      buttonColor = 'bg-[#ffebee] text-[#c62828] border-[#ffcdd2] font-medium';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className="border border-[#e0e0e0] rounded-md bg-white overflow-hidden shadow-2xs transition"
                    >
                      {/* Alternative Button */}
                      <button
                        type="button"
                        onClick={() => toggleAlternative(idx)}
                        className={`w-full text-left p-3 transition flex items-start justify-between gap-3 cursor-pointer border-b ${buttonColor} ${
                          isRevealed ? '' : 'border-b-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-black/5 shrink-0 mt-0.5 font-mono">
                            {letter}
                          </span>
                          <div className="flex-1 text-xs">
                            <RichContent content={alt.text} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-center">
                          {isRevealed ? (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                alt.is_correct ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                              }`}
                            >
                              {alt.is_correct ? '✓ True' : '✗ False'}
                            </span>
                          ) : (
                            <span className="text-[0.7rem] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100 group-hover:bg-slate-200">
                              Click to test
                            </span>
                          )}

                          {isRevealed && (
                            <div
                              onClick={(e) => toggleDetailExpansion(idx, e)}
                              className="p-1 hover:bg-black/5 rounded text-slate-500"
                              title={isDetailExpanded ? 'Collapse explanations' : 'Expand explanations'}
                            >
                              {isDetailExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Explanations Details */}
                      {isRevealed && isDetailExpanded && (
                        <div className="p-3.5 bg-white text-xs leading-relaxed flex flex-col gap-3 border-t border-slate-100 animate-fadeIn">
                          {/* Lecture Technical Explanation */}
                          {alt.lecture_explanation ? (
                            <div className="border-l-3 border-[#2196f3] pl-3 py-1.5 bg-blue-50/30 rounded-r">
                              <div className="text-[0.68rem] uppercase font-bold text-blue-700 tracking-wider mb-1 flex items-center justify-between">
                                <span>Technical Explanation</span>
                              </div>
                              <div className="text-slate-800">
                                <RichContent content={alt.lecture_explanation} />
                              </div>

                              {/* Citations */}
                              {alt.lecture_citations && alt.lecture_citations.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-blue-100/60">
                                  <span className="text-[0.65rem] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1 mr-1">
                                    <Bookmark className="w-3 h-3 text-blue-600" /> Cited Slide(s):
                                  </span>
                                  {alt.lecture_citations.map((cite, cIdx) => (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenCitation(cite);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.7rem] font-semibold bg-blue-100/80 hover:bg-blue-200 text-blue-800 border border-blue-200 transition cursor-pointer"
                                      title={`Click to review ${cite.document} at page ${cite.page} in the in-app viewer`}
                                    >
                                      <ExternalLink className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                      <span>{cite.label}</span>
                                      {cite.title && (
                                        <span className="opacity-70 font-normal max-w-[130px] truncate hidden sm:inline">
                                          • {cite.title}
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : null}

                          {/* Literature Addition */}
                          {alt.RR_addition ? (
                            <div className="border-l-3 border-[#e65100] pl-3 py-1.5 bg-amber-50/30 rounded-r">
                              <div className="text-[0.68rem] uppercase font-bold text-amber-800 tracking-wider mb-1 flex items-center justify-between">
                                <span>Literature Addition &amp; Deep Systems Insight</span>
                              </div>
                              <div className="text-slate-800">
                                <RichContent content={alt.RR_addition} />
                              </div>

                              {alt.literature_citations && alt.literature_citations.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-amber-100/60">
                                  <span className="text-[0.65rem] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1 mr-1">
                                    <BookOpen className="w-3 h-3 text-amber-600" /> Literature Source(s):
                                  </span>
                                  {alt.literature_citations.map((cite, cIdx) => (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenCitation(cite);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.7rem] font-semibold bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-200 transition cursor-pointer"
                                      title={`Click to review ${cite.document} at page ${cite.page} in the in-app viewer`}
                                    >
                                      <ExternalLink className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                                      <span>{cite.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
