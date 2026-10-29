import React, { useState, useEffect } from 'react';
import { QuestionEntry, Alternative, SubQuestion, Citation } from '../types';
import { RichContent } from './RichContent';
import { resolveSourceUrl } from '../utils/sourceUrls';
import {
  Copy,
  Check,
  Eye,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookOpen,
  ExternalLink,
  Volume2,
  X,
  FileEdit,
  Award,
} from 'lucide-react';

interface QuestionCardProps {
  question: QuestionEntry;
  revealedStates: Record<number, boolean>;
  onToggleAlternative: (altIndex: number) => void;
  onRevealAll: () => void;
  onResetRevealed: () => void;
  onOpenCitation: (citation: Citation) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  revealedStates,
  onToggleAlternative,
  onRevealAll,
  onResetRevealed,
  onOpenCitation,
}) => {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  const [showAbbreviations, setShowAbbreviations] = useState(false);

  // Reset abbreviations toggle on question navigation
  useEffect(() => {
    setShowAbbreviations(false);
  }, [question.id]);

  const formatCopyText = (item: QuestionEntry): string => {
    const sections: string[] = [];
    let headerText = `Exam: ${item.exam} — Question ${item.number}`;
    if (typeof item.points === 'number' && !isNaN(item.points)) {
      headerText += ` (${item.points} ${item.points === 1 ? 'Point' : 'Points'})`;
    }
    if (item.type === 'written') {
      headerText += ` [Written Question]`;
    }
    sections.push(headerText);

    if (item.context && item.context.trim()) {
      sections.push(`Context / Scenario:\n${item.context.trim()}`);
    }

    if (item.question && item.question.trim()) {
      sections.push(`Question Prompt:\n${item.question.trim()}`);
    }

    if (item.type === 'written' && item.sub_questions && item.sub_questions.length > 0) {
      const subLines: string[] = ['Subquestions & Model Answers:'];
      item.sub_questions.forEach((sub, idx) => {
        const lbl = sub.label ? `(${sub.label})` : `(${idx + 1})`;
        const pts = typeof sub.points === 'number' && !isNaN(sub.points) ? ` [${sub.points} pts]` : '';
        const entryParts = [`${lbl}${pts} ${sub.question.trim()}`];

        if (sub.lecture_explanation) {
          entryParts.push(`  Model Answer:\n  ${sub.lecture_explanation.trim()}`);
          if (sub.lecture_citations && sub.lecture_citations.length > 0) {
            const cites = sub.lecture_citations
              .map((c) => `[${c.label}](${resolveSourceUrl(c.document, c.page, c.type, c.slide)})`)
              .join(', ');
            entryParts.push(`  Citations: ${cites}`);
          }
        }

        if (sub.RR_addition) {
          entryParts.push(`  Literature Addition:\n  ${sub.RR_addition.trim()}`);
          if (sub.literature_citations && sub.literature_citations.length > 0) {
            const cites = sub.literature_citations
              .map((c) => `[${c.label}](${resolveSourceUrl(c.document, c.page, c.type, c.slide)})`)
              .join(', ');
            entryParts.push(`  Literature Citations: ${cites}`);
          }
        }

        subLines.push(entryParts.join('\n'));
      });
      sections.push(subLines.join('\n\n'));
    } else if (item.alternatives && item.alternatives.length > 0) {
      const altLines: string[] = ['Alternatives:'];
      item.alternatives.forEach((alt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const status = alt.is_correct ? 'True' : 'False';
        const entryParts = [`(${letter}) [${status}] ${alt.text.trim()}`];

        if (alt.lecture_explanation) {
          entryParts.push(`  Lecture Explanation:\n  ${alt.lecture_explanation.trim()}`);
          if (alt.lecture_citations && alt.lecture_citations.length > 0) {
            const cites = alt.lecture_citations
              .map((c) => `[${c.label}](${resolveSourceUrl(c.document, c.page, c.type, c.slide)})`)
              .join(', ');
            entryParts.push(`  Citations: ${cites}`);
          }
        }

        if (alt.RR_addition) {
          entryParts.push(`  Literature Addition:\n  ${alt.RR_addition.trim()}`);
          if (alt.literature_citations && alt.literature_citations.length > 0) {
            const cites = alt.literature_citations
              .map((c) => `[${c.label}](${resolveSourceUrl(c.document, c.page, c.type, c.slide)})`)
              .join(', ');
            entryParts.push(`  Literature Citations: ${cites}`);
          }
        }

        altLines.push(entryParts.join('\n'));
      });
      sections.push(altLines.join('\n\n'));
    }

    if (item.abbreviations && item.abbreviations.length > 0) {
      const abbrLines: string[] = ['Abbreviations & Pronunciations:'];
      item.abbreviations.forEach((abbr) => {
        abbrLines.push(`• ${abbr.abbreviation} (${abbr.pronunciation}): ${abbr.phrase}`);
      });
      sections.push(abbrLines.join('\n'));
    }

    return sections.join('\n\n---\n\n');
  };

  const handleCopy = async () => {
    const text = formatCopyText(question);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const toggleDetailExpansion = (altIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDetails((prev) => ({
      ...prev,
      [altIndex]: prev[altIndex] === undefined ? false : !prev[altIndex],
    }));
  };

  const isWritten = question.type === 'written';
  const itemCount = isWritten
    ? (question.sub_questions || []).length
    : (question.alternatives || []).length;

  const allRevealed =
    itemCount > 0 && Array.from({ length: itemCount }).every((_, i) => revealedStates[i]);

  const examPdfPath = `exams/${question.exam}.pdf`;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-5xl mx-auto w-full flex flex-col gap-5">
      {/* Question Card */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg p-5 md:p-6 shadow-xs transition">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-600">
              Exam {question.exam} — Question {question.number}
            </span>

            {/* Optional Points Badge */}
            {typeof question.points === 'number' && !isNaN(question.points) && (
              <span className="text-[0.7rem] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-700" />
                <span>{question.points} {question.points === 1 ? 'pt' : 'pts'}</span>
              </span>
            )}

            {/* Format Type Badge */}
            {isWritten ? (
              <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                Written Question
              </span>
            ) : (
              <span className="text-[0.68rem] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Multiple Choice
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {question.abbreviations && question.abbreviations.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAbbreviations(!showAbbreviations)}
                className={`text-xs flex items-center gap-1 font-semibold px-2 py-0.5 rounded border transition cursor-pointer ${
                  showAbbreviations
                    ? 'bg-purple-700 text-white border-purple-800'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                }`}
                title={showAbbreviations ? 'Hide abbreviations for this question' : 'Reveal abbreviations and pronunciation guide'}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{showAbbreviations ? 'Hide Abbreviations' : `Abbreviations (${question.abbreviations.length})`}</span>
              </button>
            )}

            <a
              href={examPdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium hover:underline bg-blue-50 px-2 py-0.5 rounded"
              title="Open clean exam PDF in new tab"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Exam PDF</span>
            </a>
          </div>
        </div>

        {/* Shared Context / Background Scenario for Written Questions */}
        {question.context && question.context.trim() && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 text-xs text-slate-800 leading-relaxed shadow-2xs">
            <span className="font-bold text-[0.68rem] uppercase tracking-wider text-slate-500 block mb-1">
              Background Context &amp; Scenario:
            </span>
            <RichContent content={question.context} />
          </div>
        )}

        {/* Question Prompt */}
        {question.question && question.question.trim() && (
          <div className="text-base text-slate-800 font-medium leading-relaxed">
            <RichContent content={question.question} />
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#616161] hover:bg-[#424242] text-white px-3 py-1.5 rounded-sm font-semibold text-xs transition cursor-pointer shadow-2xs"
            title="Copy question and all explanations with structured citations as Markdown"
          >
            {copyFeedback ? (
              <Check className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy All</span>
          </button>

          {question.abbreviations && question.abbreviations.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAbbreviations(!showAbbreviations)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold text-xs transition cursor-pointer border shadow-2xs ${
                showAbbreviations
                  ? 'bg-purple-700 text-white border-purple-800'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
              }`}
              title={
                showAbbreviations
                  ? 'Hide abbreviations for this question'
                  : 'Reveal abbreviations and pronunciation guide'
              }
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>
                {showAbbreviations
                  ? 'Hide Abbreviations'
                  : `Abbreviations (${question.abbreviations.length})`}
              </span>
              {showAbbreviations ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {copyFeedback && (
            <span className="text-xs font-semibold text-emerald-600 transition animate-pulse">
              ✓ Copied to clipboard!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={allRevealed ? onResetRevealed : onRevealAll}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded font-semibold transition border border-slate-300 cursor-pointer"
            title={allRevealed ? 'Hide all revealed answers' : 'Reveal all items at once'}
          >
            {allRevealed ? <RotateCcw className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{allRevealed ? 'Reset Answers' : 'Reveal All'}</span>
          </button>
        </div>
      </div>

      {/* Abbreviations & Pronunciation Guide Panel */}
      {showAbbreviations && question.abbreviations && question.abbreviations.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/70 border border-purple-200 rounded-lg p-4 md:p-5 shadow-xs transition animate-fadeIn">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-purple-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                A-Z
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-2">
                  <span>Abbreviations &amp; Pronunciation Guide</span>
                  <span className="text-[0.68rem] font-bold px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-900">
                    {question.abbreviations.length}
                  </span>
                </div>
                <p className="text-[0.7rem] text-purple-700">
                  Terms, phonetic pronunciations, and technical expansions for this question
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAbbreviations(false)}
              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100 transition cursor-pointer"
              title="Hide abbreviations"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {question.abbreviations.map((abbr, aIdx) => (
              <div
                key={aIdx}
                className="bg-white border border-purple-100/90 hover:border-purple-300 rounded-md p-2.5 shadow-2xs transition flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                    {abbr.abbreviation || abbr.term}
                  </span>
                  <span className="text-[0.7rem] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-200">
                    <span className="opacity-70 text-[0.65rem]">Say:</span>
                    <span className="font-semibold text-purple-800">{abbr.pronunciation}</span>
                  </span>
                </div>
                <div className="text-xs text-slate-700 leading-snug">
                  {abbr.phrase || abbr.expansion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Answers Section: Written Subquestions OR Multiple Choice Alternatives */}
      {isWritten ? (
        /* WRITTEN QUESTION SUBQUESTIONS LIST */
        <div>
          <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mb-2">
            Subquestions &amp; Model Answers (Click to self-test)
          </div>

          <div className="flex flex-col gap-4">
            {(question.sub_questions || []).map((subQ: SubQuestion, idx: number) => {
              const isRevealed = !!revealedStates[idx];
              const displayLabel = subQ.label ? `(${subQ.label})` : `(${idx + 1})`;

              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs transition"
                >
                  {/* Subquestion Prompt Header */}
                  <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 shrink-0 font-mono">
                        {displayLabel}
                      </span>
                      <div className="flex-1 text-slate-900 text-xs font-semibold leading-relaxed">
                        <RichContent content={subQ.question} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {typeof subQ.points === 'number' && !isNaN(subQ.points) && (
                        <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                          {subQ.points} {subQ.points === 1 ? 'pt' : 'pts'}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => onToggleAlternative(idx)}
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
                    <div className="p-4 bg-white text-xs leading-relaxed flex flex-col gap-3.5 animate-fadeIn">
                      {/* Lecture Technical Model Answer */}
                      {subQ.lecture_explanation && (
                        <div className="border-l-3 border-[#2196f3] pl-3 py-1.5 bg-blue-50/30 rounded-r">
                          <div className="text-[0.7rem] uppercase font-bold text-blue-700 tracking-wider mb-1 flex items-center justify-between">
                            <span>Comprehensive Model Answer</span>
                          </div>
                          <div className="text-slate-800">
                            <RichContent content={subQ.lecture_explanation} />
                          </div>

                          {/* Citations */}
                          {subQ.lecture_citations && subQ.lecture_citations.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-blue-100/60">
                              <span className="text-[0.68rem] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1 mr-1">
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
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.72rem] font-semibold bg-blue-100/80 hover:bg-blue-200 text-blue-800 border border-blue-200 transition cursor-pointer"
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
                          <div className="text-[0.7rem] uppercase font-bold text-amber-800 tracking-wider mb-1 flex items-center justify-between">
                            <span>Literature Addition &amp; Deep Systems Insight</span>
                          </div>
                          <div className="text-slate-800">
                            <RichContent content={subQ.RR_addition} />
                          </div>

                          {subQ.literature_citations && subQ.literature_citations.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-amber-100/60">
                              <span className="text-[0.68rem] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1 mr-1">
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
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.72rem] font-semibold bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-200 transition cursor-pointer"
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
        </div>
      ) : (
        /* MULTIPLE CHOICE ALTERNATIVES LIST */
        <div>
          <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mb-2">
            Alternatives (Click to test knowledge)
          </div>

          <div className="flex flex-col gap-3">
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
                    onClick={() => onToggleAlternative(idx)}
                    className={`w-full text-left p-3.5 transition flex items-start justify-between gap-3 cursor-pointer border-b ${buttonColor} ${
                      isRevealed ? '' : 'border-b-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-black/5 shrink-0 mt-0.5">
                        {letter}
                      </span>
                      <div className="flex-1">
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
                        <span className="text-[0.72rem] text-slate-400 font-semibold px-2 py-1 rounded bg-slate-100 group-hover:bg-slate-200">
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
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Explanations Details */}
                  {isRevealed && isDetailExpanded && (
                    <div className="p-4 bg-white text-xs leading-relaxed flex flex-col gap-3.5 border-t border-slate-100">
                      {/* Lecture Technical Explanation */}
                      {alt.lecture_explanation ? (
                        <div className="border-l-3 border-[#2196f3] pl-3 py-1.5 bg-blue-50/30 rounded-r">
                          <div className="text-[0.7rem] uppercase font-bold text-blue-700 tracking-wider mb-1 flex items-center justify-between">
                            <span>Technical Explanation</span>
                          </div>
                          <div className="text-slate-800">
                            <RichContent content={alt.lecture_explanation} />
                          </div>

                          {/* Lecture Citations Clickable Badges */}
                          {alt.lecture_citations && alt.lecture_citations.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-blue-100/60">
                              <span className="text-[0.68rem] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1 mr-1">
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
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.72rem] font-semibold bg-blue-100/80 hover:bg-blue-200 text-blue-800 border border-blue-200 transition cursor-pointer"
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
                          <div className="text-[0.7rem] uppercase font-bold text-amber-800 tracking-wider mb-1 flex items-center justify-between">
                            <span>Literature Addition &amp; Deep Context</span>
                          </div>
                          <div className="text-slate-800">
                            <RichContent content={alt.RR_addition} />
                          </div>

                          {/* Literature Citations Clickable Badges */}
                          {alt.literature_citations && alt.literature_citations.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-amber-100/60">
                              <span className="text-[0.68rem] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1 mr-1">
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
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.72rem] font-semibold bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-200 transition cursor-pointer"
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

                      {!alt.lecture_explanation && !alt.RR_addition && (
                        <div className="italic text-slate-400">
                          No additional explanation provided.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
