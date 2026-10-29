import React from 'react';
import { X, Zap, HelpCircle, Layers, Cpu, Hash } from 'lucide-react';
import { CHEAT_SHEET_DATA, COURSE_METADATA } from '../../utils/topicStructure';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { numericalLimits, whyQuestions, technologyTriads } = CHEAT_SHEET_DATA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {COURSE_METADATA.code} Quick-Access Cram Sheet
              </h2>
              <p className="text-xs text-purple-200">
                Critical numbers, standard limits, and 1-line answers to recurring exam questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
            title="Close Cheat Sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* Section: Critical Numerical Limits & Ports */}
          {numericalLimits && numericalLimits.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-900 mb-3">
                <Hash className="w-4 h-4 text-purple-700" />
                <span>Standard Limits, Constants &amp; Technical Parameters</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {numericalLimits.map((item, idx) => (
                  <div key={idx} className="bg-purple-50/70 border border-purple-200 rounded-lg p-3">
                    <span className="text-[0.7rem] uppercase font-bold text-purple-800 block">
                      {item.label}
                    </span>
                    <span className="text-base font-extrabold text-purple-950 font-mono">
                      {item.value}
                    </span>
                    <span className="text-[0.68rem] text-slate-600 block mt-0.5">
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: 1-Line Answers to Recurring "Why" Questions */}
          {whyQuestions && whyQuestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-900 mb-3">
                <HelpCircle className="w-4 h-4 text-purple-700" />
                <span>1-Line Answers to High-Frequency Exam Questions</span>
              </div>
              <div className="space-y-2.5">
                {whyQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      {q.question}
                    </span>
                    <span className="text-slate-700">
                      {q.answer}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Architectural Comparison Flash Table / Triads */}
          {technologyTriads && technologyTriads.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-900 mb-3">
                <Layers className="w-4 h-4 text-purple-700" />
                <span>Architectural Categorizations &amp; Hierarchies</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {technologyTriads.map((triad, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="font-bold text-purple-900 mb-1.5 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{triad.category}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-[0.72rem]">
                      {triad.items.map((item, iIdx) => (
                        <li key={iIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-mono text-[0.7rem]">Esc</kbd> to close
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-md transition cursor-pointer"
          >
            Done Studying
          </button>
        </div>
      </div>
    </div>
  );
};
