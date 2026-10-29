import React, { useState, useEffect } from 'react';
import { Citation } from '../types';
import { X, ExternalLink, ChevronLeft, ChevronRight, FileText, BookOpen } from 'lucide-react';
import { resolveSourceUrl, cleanDocumentName } from '../utils/sourceUrls';

interface CitationModalProps {
  citation: Citation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (citation) {
      setCurrentPage(citation.page);
    }
  }, [citation]);

  if (!isOpen || !citation) return null;

  const pdfUrl = resolveSourceUrl(citation.document, currentPage, citation.type, citation.slide);
  const fullWindowUrl = resolveSourceUrl(citation.document, currentPage, citation.type, citation.slide);

  const isLecture = citation.type === 'lecture';
  const docDisplayName = citation.title || cleanDocumentName(citation.document);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-5xl h-[92vh] border border-slate-200 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between gap-3 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {isLecture ? (
              <FileText className="w-5 h-5 text-blue-400 shrink-0" />
            ) : (
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-100 truncate">
                  {citation.title || docDisplayName}
                </span>
                <span
                  className={`text-[0.68rem] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isLecture
                      ? 'bg-blue-900 text-blue-200 border border-blue-700'
                      : 'bg-amber-900 text-amber-200 border border-amber-700'
                  }`}
                >
                  {isLecture ? 'Lecture Slide' : 'Literature Source'}
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate flex items-center gap-2 mt-0.5">
                <span>{citation.document}</span>
                {citation.section && (
                  <span className="text-slate-300 font-medium">• {citation.section}</span>
                )}
                {citation.slide && (
                  <span className="text-blue-300 font-medium">• Slide {citation.slide}</span>
                )}
              </div>
            </div>
          </div>

          {/* Controls: Page navigation and External Link */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-700 rounded-md p-0.5 text-xs">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-transparent rounded text-slate-200 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-slate-200 text-xs">
                Page {currentPage}
              </span>
              <button
                onClick={handleNextPage}
                className="p-1.5 hover:bg-slate-600 rounded text-slate-200 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <a
              href={fullWindowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold transition cursor-pointer"
              title="Open document in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition cursor-pointer"
              title="Close Viewer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF View */}
        <div className="flex-1 w-full bg-slate-200 relative overflow-hidden">
          <iframe
            key={`${citation.document}-${currentPage}`}
            src={pdfUrl}
            title={citation.title || citation.label}
            className="w-full h-full border-0 bg-white"
          />
        </div>

        {/* Bottom Context Banner */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between shrink-0">
          <span className="font-medium text-slate-700">
            Citation: <span className="font-semibold text-slate-900">{citation.label}</span>
          </span>
          <span className="text-[0.72rem] text-slate-500">
            Use standard PDF reader controls inside the frame to zoom, search, or navigate.
          </span>
        </div>
      </div>
    </div>
  );
};
