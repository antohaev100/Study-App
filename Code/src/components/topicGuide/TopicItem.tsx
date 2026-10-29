import React, { useState } from 'react';
import { QuestionTopicDef } from '../../utils/topicStructure';
import { QuestionEntry, Citation } from '../../types';
import { RichContent } from '../RichContent';
import { TopicQuestionItem } from './TopicQuestionItem';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  HelpCircle,
  Eye,
  RotateCcw,
  Sparkles,
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
  const [globalRevealTrigger, setGlobalRevealTrigger] = useState(0);
  const [globalResetTrigger, setGlobalResetTrigger] = useState(0);
  const [allAnswersRevealed, setAllAnswersRevealed] = useState(false);

  const revealAllForTopic = () => {
    setGlobalRevealTrigger((prev) => prev + 1);
    setAllAnswersRevealed(true);
  };

  const hideAllForTopic = () => {
    setGlobalResetTrigger((prev) => prev + 1);
    setAllAnswersRevealed(false);
  };

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
                    <span>{allAnswersRevealed ? 'Reset All (Collapse)' : 'Reveal All Questions'}</span>
                  </button>
                )}
              </div>

              {/* Level 4: Exam Question Cards */}
              {showExamExamples && (
                <div className="space-y-4 mt-3">
                  {associatedQuestions.map((q) => (
                    <TopicQuestionItem
                      key={q.id}
                      question={q}
                      onOpenCitation={onOpenCitation}
                      globalRevealTrigger={globalRevealTrigger}
                      globalResetTrigger={globalResetTrigger}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
