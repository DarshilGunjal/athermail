import React from 'react';
import {
  Inbox,
  ShieldAlert,
  Tag,
  FolderDot,
  Star,
  Archive,
  Trash2,
  SlidersHorizontal,
  Bot,
  Zap,
  Plus
} from 'lucide-react';
import { EmailCategory, SystemFolder } from '../types';

interface SidebarProps {
  currentCategory: EmailCategory | 'all';
  currentFolder: SystemFolder | null;
  onSelectCategory: (cat: EmailCategory | 'all') => void;
  onSelectFolder: (folder: SystemFolder) => void;
  counts: {
    all: number;
    allUnread: number;
    spam: number;
    spamUnread: number;
    promotions: number;
    promotionsUnread: number;
    other: number;
    otherUnread: number;
    starred: number;
    archive: number;
    trash: number;
  };
  rulesCount: number;
  onOpenSettings: () => void;
  onOpenCompose: () => void;
  onOpenPlayground: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  currentFolder,
  onSelectCategory,
  onSelectFolder,
  counts,
  rulesCount,
  onOpenSettings,
  onOpenCompose,
  onOpenPlayground,
}) => {
  const isCategoryActive = (cat: EmailCategory | 'all') => currentFolder === null && currentCategory === cat;
  const isFolderActive = (f: SystemFolder) => currentFolder === f;

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-slate-200/80 dark:border-[#2b2c2e] bg-slate-50/60 dark:bg-[#131314] p-3 select-none">
      <div className="space-y-6">
        {/* Quick Action Button */}
        <div>
          <button
            onClick={onOpenCompose}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Inbound Email</span>
          </button>
        </div>

        {/* AI Classified Categories */}
        <div>
          <div className="px-3 pb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              AI Classified Categories
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              Auto-Organized
            </span>
          </div>

          <nav className="space-y-1 mt-1" aria-label="Email Categories">
            {/* All Mail / Unified Inbox */}
            <button
              onClick={() => {
                onSelectCategory('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isCategoryActive('all')
                  ? 'bg-slate-200/70 dark:bg-[#282a2c] text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/40 dark:hover:bg-[#1e1f20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>All Inbound</span>
              </div>
              <div className="flex items-center gap-1.5">
                {counts.allUnread > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-600 text-white">
                    {counts.allUnread}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {counts.all}
                </span>
              </div>
            </button>

            {/* Spam */}
            <button
              onClick={() => {
                onSelectCategory('spam');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isCategoryActive('spam')
                  ? 'bg-rose-100/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/40 dark:hover:bg-[#1e1f20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Spam</span>
              </div>
              <div className="flex items-center gap-1.5">
                {counts.spamUnread > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-rose-600 text-white">
                    {counts.spamUnread}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {counts.spam}
                </span>
              </div>
            </button>

            {/* Promotions */}
            <button
              onClick={() => {
                onSelectCategory('promotions');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isCategoryActive('promotions')
                  ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/40 dark:hover:bg-[#1e1f20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Promotions</span>
              </div>
              <div className="flex items-center gap-1.5">
                {counts.promotionsUnread > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-600 text-white">
                    {counts.promotionsUnread}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {counts.promotions}
                </span>
              </div>
            </button>

            {/* Other / Primary */}
            <button
              onClick={() => {
                onSelectCategory('other');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isCategoryActive('other')
                  ? 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/40 dark:hover:bg-[#1e1f20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderDot className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Other (Direct / Alerts)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {counts.otherUnread > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-600 text-white">
                    {counts.otherUnread}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {counts.other}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* System Folders */}
        <div>
          <div className="px-3 pb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Views
            </span>
          </div>

          <nav className="space-y-1 mt-1" aria-label="System Folders">
            {/* Starred */}
            <button
              onClick={() => onSelectFolder('starred')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isFolderActive('starred')
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-[#1e1f20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>Starred</span>
              </div>
              <span className="text-[11px] text-slate-400">{counts.starred}</span>
            </button>

            {/* Archive */}
            <button
              onClick={() => onSelectFolder('archive')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isFolderActive('archive')
                  ? 'bg-slate-200/70 dark:bg-[#282a2c] text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-[#1e1f20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Archive className="w-4 h-4 text-slate-400" />
                <span>Archived</span>
              </div>
              <span className="text-[11px] text-slate-400">{counts.archive}</span>
            </button>

            {/* Trash */}
            <button
              onClick={() => onSelectFolder('trash')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isFolderActive('trash')
                  ? 'bg-slate-200/70 dark:bg-[#282a2c] text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-[#1e1f20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>Trash</span>
              </div>
              <span className="text-[11px] text-slate-400">{counts.trash}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom AI Status & Rule Engine Info Card */}
      <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-[#2b2c2e] space-y-3">
        {/* Gemini Engine Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/40 dark:from-[#1b1c20] dark:via-[#1e1f20] dark:to-[#17181c] border border-indigo-100/80 dark:border-indigo-900/40 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Neural Classifier
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Client-side Bayesian & multi-signal analysis. Zero data leaves your device.
          </p>

          <div className="mt-2.5 pt-2 border-t border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {rulesCount} active rule{rulesCount === 1 ? '' : 's'}
            </span>
            <button
              onClick={onOpenPlayground}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Test Engine
            </button>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#1e1f20] transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span>Rules & Sensitivity Settings</span>
        </button>
      </div>
    </aside>
  );
};
