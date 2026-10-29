import React, { useMemo } from 'react';
import { X, BookOpen, FileText, GraduationCap, ArrowUpRight } from 'lucide-react';
import { Citation } from '../types';

interface SourcesLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCitation: (citation: Citation) => void;
}

interface SlideEntry {
  document?: string;
  slide?: number;
  page?: number;
  title?: string;
  section?: string;
}

interface RrEntry {
  title?: string;
  author?: string;
  description?: string;
  pages?: number;
  pageMap?: Array<{ page: number; headings?: string[] }>;
}

// Safely load index JSON files from src/data/ if available
const slideModules = import.meta.glob<{ default: Record<string, SlideEntry> }>(
  '../data/slides_index.json',
  { eager: true }
);
const rawSlidesIndex = Object.values(slideModules)[0]?.default || {};

const rrModules = import.meta.glob<{ default: Record<string, RrEntry> }>(
  '../data/rr_index.json',
  { eager: true }
);
const rawRrIndex = Object.values(rrModules)[0]?.default || {};

export const SourcesLibraryModal: React.FC<SourcesLibraryModalProps> = ({
  isOpen,
  onClose,
  onOpenCitation,
}) => {
  if (!isOpen) return null;

  const lectures = useMemo(() => {
    const slidesRecord = (rawSlidesIndex || {}) as Record<string, SlideEntry>;
    const docMap = new Map<
      string,
      {
        document: string;
        minSlide: number;
        maxSlide: number;
        minPage: number;
        titles: string[];
        count: number;
      }
    >();

    Object.values(slidesRecord).forEach((entry) => {
      if (!entry || !entry.document) return;
      const docName = entry.document;
      const existing = docMap.get(docName);
      if (!existing) {
        docMap.set(docName, {
          document: docName,
          minSlide: entry.slide ?? 1,
          maxSlide: entry.slide ?? 1,
          minPage: entry.page ?? 1,
          titles: entry.title ? [entry.title] : [],
          count: 1,
        });
      } else {
        existing.minSlide = Math.min(existing.minSlide, entry.slide ?? existing.minSlide);
        existing.maxSlide = Math.max(existing.maxSlide, entry.slide ?? existing.maxSlide);
        existing.minPage = Math.min(existing.minPage, entry.page ?? existing.minPage);
        if (entry.title && existing.titles.length < 5 && !existing.titles.includes(entry.title)) {
          existing.titles.push(entry.title);
        }
        existing.count += 1;
      }
    });

    return Array.from(docMap.values()).map((doc) => {
      const cleanTitle = doc.document
        .replace(/\.pdf$/i, '')
        .replace(/^Lectures_/i, 'Course Lectures: ')
        .replace(/_/g, ' ');

      const topicPreview =
        doc.titles.length > 0
          ? `Topics: ${doc.titles.slice(0, 3).join(', ')}${doc.titles.length > 3 ? '...' : ''}`
          : 'Course lecture slides';

      return {
        title: cleanTitle,
        document: doc.document,
        description: `Slides ${doc.minSlide}–${doc.maxSlide} (${doc.count} slides indexed). ${topicPreview}`,
        page: doc.minPage,
        type: 'lecture' as const,
      };
    });
  }, []);

  const readings = useMemo(() => {
    const rrRecord = (rawRrIndex || {}) as Record<string, RrEntry>;
    return Object.entries(rrRecord).map(([fileName, data]) => {
      const cleanTitle =
        data.title ||
        fileName
          .replace(/^RR_/i, '')
          .replace(/\.pdf$/i, '')
          .replace(/_/g, ' ');

      const docPath =
        fileName.startsWith('Recommended_Readings/') || fileName.includes('/')
          ? fileName
          : `Recommended_Readings/${fileName}`;

      const firstHeadings: string[] = [];
      if (Array.isArray(data?.pageMap)) {
        for (const pm of data.pageMap) {
          if (pm.headings && pm.headings.length > 0) {
            for (const h of pm.headings) {
              if (h && !firstHeadings.includes(h) && firstHeadings.length < 4) {
                firstHeadings.push(h);
              }
            }
          }
        }
      }

      const description =
        data.description ||
        (firstHeadings.length > 0
          ? `Key sections: ${firstHeadings.join(', ')}`
          : `${data.pages || 0} pages reference material`);

      return {
        title: cleanTitle,
        author: data.author || 'Recommended Literature',
        document: docPath,
        description,
        page: 1,
        type: 'literature' as const,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh] border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Course Sources & Literature Library</h2>
              <p className="text-xs text-slate-500">
                Course lecture slide decks and supplementary research readings cited throughout exam questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Sources */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Lecture Slides Section */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-blue-700 mb-3 pb-1 border-b border-blue-100">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Course Lectures</span>
            </div>
            {lectures.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-500 bg-slate-50">
                No lecture slide decks indexed yet. Add entries to slides_index.json to populate lecture references.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lectures.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition flex flex-col justify-between group"
                  >
                    <div>
                      <h3 className="font-semibold text-xs text-slate-900 group-hover:text-blue-700 mb-1 flex items-start justify-between gap-2">
                        <span>{item.title}</span>
                        <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      </h3>
                      <p className="text-[0.75rem] text-slate-600 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenCitation({
                            document: item.document,
                            page: item.page,
                            label: item.title,
                            title: item.title,
                            type: item.type,
                          });
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[0.72rem] font-semibold transition cursor-pointer"
                      >
                        View in App
                      </button>
                      <a
                        href={`sources/${item.document}#page=${item.page}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[0.72rem] text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>New Tab</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Readings Section */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-700 mb-3 pb-1 border-b border-amber-100">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Recommended Readings & Literature</span>
            </div>
            {readings.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-500 bg-slate-50">
                No supplementary literature or recommended readings are configured for this course. Primary study materials come from the lecture decks.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {readings.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="text-[0.7rem] font-semibold text-amber-800 mb-0.5">
                        {item.author}
                      </div>
                      <h3 className="font-semibold text-xs text-slate-900 group-hover:text-amber-800 mb-1 flex items-start justify-between gap-2">
                        <span>{item.title}</span>
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      </h3>
                      <p className="text-[0.75rem] text-slate-600 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenCitation({
                            document: item.document,
                            page: item.page,
                            label: item.title,
                            title: item.title,
                            type: item.type,
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[0.72rem] font-semibold transition cursor-pointer"
                      >
                        View in App
                      </button>
                      <a
                        href={`sources/${item.document}#page=${item.page}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[0.72rem] text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>New Tab</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
