import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'j / k', desc: 'Navigate down / up in email list' },
  { key: 'Enter / o', desc: 'Open selected email details' },
  { key: 'x', desc: 'Toggle select checkbox for bulk actions' },
  { key: 'e', desc: 'Archive selected message(s)' },
  { key: '# / Del', desc: 'Move selected message(s) to Trash' },
  { key: 's', desc: 'Toggle star on selected message' },
  { key: '!', desc: 'Mark selected message as Spam' },
  { key: 'u', desc: 'Toggle read / unread' },
  { key: '/', desc: 'Focus global search bar' },
  { key: 'z', desc: 'Undo last action' },
  { key: 'Esc', desc: 'Close dialogs / return to list' },
  { key: '?', desc: 'Show this keyboard shortcuts guide' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a1b1d] border border-slate-200 dark:border-[#333538] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-[#2b2c2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speed through your inbox with keyboard navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#282a2c] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 divide-y divide-slate-100 dark:divide-[#252628] text-xs max-h-[70vh] overflow-y-auto">
          {SHORTCUTS.map((sc) => (
            <div key={sc.key} className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {sc.desc}
              </span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#252628] border border-slate-200 dark:border-[#383a3d] font-mono text-slate-800 dark:text-slate-200 font-semibold shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200/80 dark:border-[#2b2c2e] bg-slate-50 dark:bg-[#151617] flex justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
