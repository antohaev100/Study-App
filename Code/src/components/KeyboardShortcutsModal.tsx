import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'V', desc: 'Toggle View (Topic Guide vs Exam Mode)' },
    { key: '← / →', desc: 'Previous or Next question' },
    { key: 'S', desc: 'Toggle Study Mode / Browse Mode' },
    { key: 'Q or M', desc: 'Toggle Questions Drawer' },
    { key: 'N', desc: 'Toggle Notes Sidebar' },
    { key: 'R', desc: 'Reroll / Shuffle Questions in Study Mode' },
    { key: '1, 2, 3...', desc: 'Reveal alternative (A, B, C...)' },
    { key: 'A', desc: 'Reveal all alternatives' },
    { key: 'C', desc: 'Copy current question to clipboard' },
    { key: 'Esc', desc: 'Close drawer or modal' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Keyboard className="w-4 h-4 text-purple-600" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-bold border border-slate-200 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
