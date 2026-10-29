import React, { useState } from 'react';
import { QuestionTopicDef } from '../../utils/topicStructure';
import { QuestionEntry, Citation } from '../../types';
import { RichContent } from '../RichContent';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  HelpCircle,
  BookOpen,
  Eye,
  RotateCcw,
  Volume2,
  ExternalLink,
  Sparkles,
  Bookmark,
  Check,
  X as XIcon,
  Award,
} from 'lucide-react';

interface TopicItemProps {
  topic: QuestionTopicDef;
  associatedQuestions: QuestionEntry[];
  isReviewed: boolean;
  onToggleReviewed: (topicId: string) => void;
  onOpenCitation: (citation: Citation) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  searchQuery?: string;
}

export const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  associatedQuestions,
  isReviewed,
  onToggleReviewed,
  onOpenCitation,
  isOpen,
  onToggleOpen,
}) => {
  const [showExamExamples, setShowExamExamples] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const toggleAnswerReveal = (qId: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const revealAllForTopic = () => {
    const all: Record<string, boolean> = {};
    associatedQuestions.forEach((q) => {
      all[q.id] = true;
    });
    setRevealedAnswers(all);
  };

  const hideAllForTopic = () => {
    setRevealedAnswers({});
  };

  const allAnswersRevealed =
    associatedQuestions.length > 0 &&
    associatedQuestions.every((q) => revealedAnswers[q.id]);

  return (
    <div
      id={topic.id}
      className={`border rounded-lg transition-all duration-200 overflow-hidden ${
        isOpen
          ? 'bg-white border-purple-300 shadow-xs'
          : 'bg-slate-50/70 hover:bg-white border-slate-200'
      }`}
    >
      {/* Level 2: Topic Header */}
      <div
        onClick={onToggleOpen}
        className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer select-none transition"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Reviewed Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleReviewed(topic.id);
            }}
            className="text-slate-400 hover:text-purple-600 transition shrink-0 cursor-pointer"
            title={isReviewed ? 'Mark topic as unreviewed' : 'Mark topic as reviewed'}
          >
            {isReviewed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Academic Code Badge */}
          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-900 shrink-0">
            {topic.code}
          </span>

          {/* Topic Title & Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm font-bold truncate ${
                  isReviewed ? 'text-slate-500 line-through' : 'text-slate-900'
                }`}
              >
                {topic.title}
              </h4>
              {topic.badge && (
                <span className="text-[0.65rem] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  {topic.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">{topic.summary}</p>
          </div>
        </div>

        {/* Right side: Exam appearances & Chevron */}
        <div className="flex items-center gap-2.5 shrink-0">
          {associatedQuestions.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[0.7rem] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <HelpCircle className="w-3 h-3 text-purple-600" />
              <span>{associatedQuestions.length} Questions</span>
            </span>
          )}

          <div className="text-slate-400 p-1 hover:bg-slate-200/50 rounded">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Level 3: Expanded Topic Information */}
      {isOpen && (
        <div className="px-5 py-4 border-t border-purple-100 bg-white space-y-4 text-xs text-slate-800">
          {/* In Plain Words: Everyday Analogy & Mental Model */}
          {topic.plainWords && (
            <div className="bg-gradient-to-r from-amber-50/90 to-amber-100/50 border border-amber-200/80 rounded-lg p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>In Plain Words (Mental Model &amp; Analogy)</span>
              </div>
              <p className="text-amber-950 leading-relaxed font-medium">{topic.plainWords}</p>
            </div>
          )}

          {/* Core Knowledge Blocks (Rules, Mechanisms, Comparison Tables) */}
          {topic.infoNeeded && topic.infoNeeded.length > 0 && (
            <div className="space-y-3">
              {topic.infoNeeded.map((block, bIdx) => (
                <div key={bIdx} className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 space-y-2">
                  {block.title && (
                    <h5 className="font-bold text-xs text-purple-950 uppercase tracking-wide">
                      {block.title}
                    </h5>
                  )}

                  {block.points && block.points.length > 0 && (
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700 leading-relaxed">
                      {block.points.map((pt, pIdx) => (
                        <li key={pIdx}>
                          <span className="font-normal">{pt}</span>
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
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="border border-slate-200 px-2.5 py-1.5 text-slate-800">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {block.formula && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center font-mono text-purple-900 font-bold">
                      {block.formula}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* High-Yield Examiner Tip / Key Takeaway */}
          {topic.keyTakeaway && (
            <div className="border-l-4 border-indigo-500 pl-3 py-1.5 bg-indigo-50/50 rounded-r text-indigo-950">
              <span className="font-bold uppercase text-[0.68rem] tracking-wider text-indigo-800 block">
                Examiner Tip &amp; Common Pitfall
              </span>
              <p className="mt-0.5 leading-relaxed">{topic.keyTakeaway}</p>
            </div>
          )}

          {/* Level 4 Toggle: Reveal Past Exam Questions & Model Answers */}
          {associatedQuestions.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowExamExamples(!showExamExamples)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-bold text-xs transition cursor-pointer border ${
                    showExamExamples
                      ? 'bg-purple-700 text-white border-purple-800 shadow-2xs'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>
                    {showExamExamples
                      ? 'Hide Past Exam Questions'
                      : `Reveal Past Exam Questions (${associatedQuestions.length})`}
                  </span>
                  {showExamExamples ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showExamExamples && (
                  <button
                    type="button"
                    onClick={allAnswersRevealed ? hideAllForTopic : revealAllForTopic}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition cursor-pointer"
                  >
                    {allAnswersRevealed ? <RotateCcw className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{allAnswersRevealed ? 'Reset All Answers' : 'Reveal All Answers'}</span>
                  </button>
                )}
              </div>

              {/* Level 4: Exam Question Cards */}
              {showExamExamples && (
                <div className="space-y-4 mt-3">
                  {associatedQuestions.map((q) => {
                    const isAnswerRevealed = !!revealedAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 shadow-2xs"
                      >
                        {/* Question Banner */}
                        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold uppercase tracking-wider text-purple-300">
                              Exam {q.exam}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold text-slate-200">Question {q.number}</span>

                            {/* Optional Points Badge */}
                            {typeof q.points === 'number' && !isNaN(q.points) && (
                              <span className="text-[0.68rem] font-bold px-1.5 py-0.2 rounded bg-emerald-700/80 text-emerald-200 flex items-center gap-1 border border-emerald-600/40">
                                <Award className="w-3 h-3" />
                                <span>{q.points} {q.points === 1 ? 'pt' : 'pts'}</span>
                              </span>
                            )}

                            {q.type === 'written' && (
                              <span className="text-[0.65rem] font-bold px-1.5 py-0.2 rounded bg-indigo-700/80 text-indigo-200 border border-indigo-600/40">
                                Written
                              </span>
                            )}
                          </div>
                          <span className="text-[0.7rem] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                            ID: {q.id}
                          </span>
                        </div>

                        {/* Shared Context / Scenario if present */}
                        {q.context && q.context.trim() && (
                          <div className="p-3.5 bg-slate-100/90 border-b border-slate-200 text-xs text-slate-800 leading-relaxed">
                            <span className="font-bold text-[0.65rem] uppercase tracking-wider text-slate-500 block mb-1">
                              Context / Scenario:
                            </span>
                            <RichContent content={q.context} />
                          </div>
                        )}

                        {/* Question Prompt */}
                        {q.question && q.question.trim() && (
                          <div className="p-4 bg-white text-slate-900 font-medium text-xs leading-relaxed border-b border-slate-200">
                            <RichContent content={q.question} />
                          </div>
                        )}

                        {/* Flashcard Mask Button */}
                        <div className="p-3 bg-slate-50 flex items-center justify-between gap-2 border-b border-slate-200">
                          <button
                            type="button"
                            onClick={() => toggleAnswerReveal(q.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-xs transition cursor-pointer border ${
                              isAnswerRevealed
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-2xs'
                            }`}
                          >
                            {isAnswerRevealed ? <RotateCcw className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>
                              {isAnswerRevealed
                                ? 'Hide Model Answer (Self-Test Mask)'
                                : 'Reveal Model Answer & Analysis'}
                            </span>
                          </button>

                          <span className="text-[0.7rem] text-slate-500 font-medium italic">
                            {isAnswerRevealed ? 'Model Answer Visible' : 'Click to verify knowledge'}
                          </span>
                        </div>

                        {/* Revealed Model Answer & Detailed Breakdown */}
                        {isAnswerRevealed && (
                          <div className="p-4 bg-slate-50/90 space-y-3.5 border-t border-slate-200 animate-fadeIn text-xs">
                            {/* WRITTEN QUESTION SUBQUESTIONS */}
                            {q.type === 'written' ? (
                              <div className="space-y-3">
                                <span className="font-bold uppercase text-[0.68rem] tracking-wider text-slate-600 block">
                                  Subquestions &amp; Model Rubric:
                                </span>

                                {(q.sub_questions || []).map((subQ, sIdx) => {
                                  const displayLabel = subQ.label ? `(${subQ.label})` : `(${sIdx + 1})`;

                                  return (
                                    <div key={sIdx} className="p-3 rounded-md bg-white border border-slate-200 shadow-2xs space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                          <span className="font-bold text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-mono">
                                            {displayLabel}
                                          </span>
                                          <div className="font-semibold text-slate-900 text-xs">
                                            <RichContent content={subQ.question} />
                                          </div>
                                        </div>

                                        {typeof subQ.points === 'number' && !isNaN(subQ.points) && (
                                          <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 shrink-0">
                                            {subQ.points} {subQ.points === 1 ? 'pt' : 'pts'}
                                          </span>
                                        )}
                                      </div>

                                      {/* Model Answer */}
                                      {subQ.lecture_explanation && (
                                        <div className="mt-2 text-slate-700 bg-blue-50/40 p-2.5 rounded border border-blue-200/70 leading-relaxed">
                                          <div className="font-bold text-[0.68rem] text-blue-800 uppercase tracking-wide mb-1">
                                            Model Answer:
                                          </div>
                                          <RichContent content={subQ.lecture_explanation} />

                                          {subQ.lecture_citations && subQ.lecture_citations.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-blue-100">
                                              <span className="text-[0.65rem] font-bold text-blue-700 uppercase flex items-center gap-1">
                                                <Bookmark className="w-3 h-3" /> Cited:
                                              </span>
                                              {subQ.lecture_citations.map((cite, cIdx) => (
                                                <button
                                                  key={cIdx}
                                                  type="button"
                                                  onClick={() => onOpenCitation(cite)}
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.7rem] bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-200 transition cursor-pointer"
                                                  title={`View ${cite.document} at page ${cite.page}`}
                                                >
                                                  <ExternalLink className="w-2.5 h-2.5" />
                                                  <span>{cite.label}</span>
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Literature Addition */}
                                      {subQ.RR_addition && (
                                        <div className="mt-2 text-slate-700 bg-amber-50/50 p-2.5 rounded border border-amber-200/70 leading-relaxed">
                                          <div className="font-bold text-[0.68rem] text-amber-800 uppercase tracking-wide mb-1">
                                            Literature Addition:
                                          </div>
                                          <RichContent content={subQ.RR_addition} />

                                          {subQ.literature_citations && subQ.literature_citations.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-amber-100">
                                              <span className="text-[0.65rem] font-bold text-amber-800 uppercase flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> Literature Source:
                                              </span>
                                              {subQ.literature_citations.map((cite, cIdx) => (
                                                <button
                                                  key={cIdx}
                                                  type="button"
                                                  onClick={() => onOpenCitation(cite)}
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.7rem] bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200 transition cursor-pointer"
                                                  title={`View ${cite.document} at page ${cite.page}`}
                                                >
                                                  <ExternalLink className="w-2.5 h-2.5" />
                                                  <span>{cite.label}</span>
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              /* MULTIPLE CHOICE ALTERNATIVES */
                              <div className="space-y-2">
                                <span className="font-bold uppercase text-[0.68rem] tracking-wider text-slate-600 block">
                                  Alternative Statements &amp; Model Rubric:
                                </span>

                                {(q.alternatives || []).map((alt, altIdx) => {
                                  const letter = String.fromCharCode(65 + altIdx);

                                  return (
                                    <div
                                      key={altIdx}
                                    className={`p-3 rounded-md border ${
                                      alt.is_correct
                                        ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                                        : 'bg-rose-50/70 border-rose-200 text-slate-900'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                      <div className="flex items-start gap-2">
                                        <span className="font-bold px-1.5 py-0.5 rounded bg-black/5 font-mono">
                                          {letter}
                                        </span>
                                        <div className="font-semibold text-slate-900">
                                          <RichContent content={alt.text} />
                                        </div>
                                      </div>
                                      <span
                                        className={`shrink-0 text-[0.68rem] font-bold px-2 py-0.5 rounded ${
                                          alt.is_correct
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-rose-600 text-white'
                                        }`}
                                      >
                                        {alt.is_correct ? '✓ True' : '✗ False'}
                                      </span>
                                    </div>

                                    {/* Technical Explanation (Claim → Mechanism → Consequence) */}
                                    {alt.lecture_explanation && (
                                      <div className="mt-2 text-slate-700 bg-white/80 p-2.5 rounded border border-slate-200 leading-relaxed">
                                        <div className="font-bold text-[0.68rem] text-blue-800 uppercase tracking-wide mb-1">
                                          Technical Explanation &amp; Mechanism:
                                        </div>
                                        <RichContent content={alt.lecture_explanation} />

                                        {/* Lecture Citations */}
                                        {alt.lecture_citations && alt.lecture_citations.length > 0 && (
                                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                                            <span className="text-[0.65rem] font-bold text-blue-700 uppercase flex items-center gap-1">
                                              <Bookmark className="w-3 h-3" /> Cited:
                                            </span>
                                            {alt.lecture_citations.map((cite, cIdx) => (
                                              <button
                                                key={cIdx}
                                                type="button"
                                                onClick={() => onOpenCitation(cite)}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.7rem] bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-200 transition cursor-pointer"
                                                title={`View ${cite.document} at page ${cite.page}`}
                                              >
                                                <ExternalLink className="w-2.5 h-2.5" />
                                                <span>{cite.label}</span>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Literature Addition */}
                                    {alt.RR_addition && (
                                      <div className="mt-2 text-slate-700 bg-amber-50/60 p-2.5 rounded border border-amber-200/80 leading-relaxed">
                                        <div className="font-bold text-[0.68rem] text-amber-800 uppercase tracking-wide mb-1">
                                          Literature Addition &amp; Deep Systems Insight:
                                        </div>
                                        <RichContent content={alt.RR_addition} />

                                        {alt.literature_citations && alt.literature_citations.length > 0 && (
                                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-amber-100">
                                            <span className="text-[0.65rem] font-bold text-amber-800 uppercase flex items-center gap-1">
                                              <BookOpen className="w-3 h-3" /> Literature Source:
                                            </span>
                                            {alt.literature_citations.map((cite, cIdx) => (
                                              <button
                                                key={cIdx}
                                                type="button"
                                                onClick={() => onOpenCitation(cite)}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.7rem] bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200 transition cursor-pointer"
                                                title={`View ${cite.document} at page ${cite.page}`}
                                              >
                                                <ExternalLink className="w-2.5 h-2.5" />
                                                <span>{cite.label}</span>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            )}

                            {/* Question Abbreviations */}
                            {q.abbreviations && q.abbreviations.length > 0 && (
                              <div className="bg-white border border-purple-200 rounded p-3">
                                <div className="text-[0.68rem] font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Volume2 className="w-3.5 h-3.5 text-purple-700" />
                                  <span>Abbreviations in this Question:</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.abbreviations.map((abbr, aIdx) => (
                                    <div key={aIdx} className="bg-slate-50 p-2 rounded border border-slate-200">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-mono font-bold text-purple-900 bg-purple-100 px-1.5 py-0.2 rounded text-[0.7rem]">
                                          {abbr.abbreviation}
                                        </span>
                                        <span className="text-[0.68rem] text-slate-500 font-medium">
                                          Say: <strong className="text-purple-800">{abbr.pronunciation}</strong>
                                        </span>
                                      </div>
                                      <div className="text-[0.7rem] text-slate-700 mt-1">{abbr.phrase}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
