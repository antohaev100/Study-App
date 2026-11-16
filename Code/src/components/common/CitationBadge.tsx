import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Citation } from '../../types';
import { resolveCitation } from '../../utils/citationResolver';

interface CitationBadgeProps {
  citation: Citation;
  onOpenCitation: (citation: Citation) => void;
  className?: string;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({
  citation: rawCite,
  onOpenCitation,
  className = '',
}) => {
  const cite = resolveCitation(rawCite);
  const isLecture = cite.type === 'lecture';
  const isLab = cite.type === 'lab';

  const badgeColorClass = isLecture
    ? 'bg-blue-100/80 hover:bg-blue-200 text-blue-800 border-blue-200'
    : isLab
      ? 'bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
      : 'bg-amber-100/80 hover:bg-amber-200 text-amber-900 border-amber-300';

  const iconColorClass = isLecture
    ? 'text-blue-600'
    : isLab
      ? 'text-emerald-700'
      : 'text-amber-700';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenCitation(cite);
      }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.7rem] font-semibold transition cursor-pointer border ${badgeColorClass} ${className}`}
      title={`Click to review ${cite.document} at page ${cite.page} in the in-app viewer`}
    >
      <ExternalLink className={`w-2.5 h-2.5 shrink-0 ${iconColorClass}`} />
      <span>{cite.label}</span>
      {(isLecture || isLab) && cite.title && (
        <span className="opacity-70 font-normal max-w-[130px] truncate hidden sm:inline">
          • {cite.title}
        </span>
      )}
      {!isLecture && !isLab && cite.section && (
        <span className="opacity-70 font-normal max-w-[130px] truncate hidden sm:inline">
          • {cite.section}
        </span>
      )}
    </button>
  );
};
