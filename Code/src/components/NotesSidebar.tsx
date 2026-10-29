import React, { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle2, Clock } from 'lucide-react';

interface NotesSidebarProps {
  questionKey: string;
  notes: Record<string, string>;
  onSaveNote: (key: string, noteText: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({
  questionKey,
  notes,
  onSaveNote,
  isOpen,
  onToggle,
}) => {
  const [currentText, setCurrentText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentText(notes[questionKey] || '');
    setSaveStatus('idle');
  }, [questionKey, notes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCurrentText(newText);
    setSaveStatus('saving');

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSaveNote(questionKey, newText);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1800);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 shrink-0 border-r border-[#e0e0e0] bg-white flex flex-col h-full shadow-sm z-10 transition-all">
      <div className="p-4 border-b border-[#e0e0e0] flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <FileText className="w-4 h-4 text-purple-600" />
          <span>Question Notes</span>
        </div>
        <button
          onClick={onToggle}
          title="Close Notes Pane"
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 text-sm font-semibold transition"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2">
        <textarea
          value={currentText}
          onChange={handleChange}
          placeholder="Write persistent notes, mnemonics, or lecture cross-references for this question..."
          className="w-full flex-1 p-3 border border-[#e0e0e0] rounded-md resize-none text-[0.92rem] font-sans focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 bg-slate-50/40 text-slate-800 leading-relaxed"
        />

        <div className="h-5 flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-1.5">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="w-3 h-3 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {saveStatus === 'idle' && (
              <span className="text-slate-400">
                {currentText.trim() ? 'Notes saved locally' : 'No notes entered'}
              </span>
            )}
          </div>
          <span className="text-slate-400">{currentText.length} chars</span>
        </div>
      </div>
    </aside>
  );
};
