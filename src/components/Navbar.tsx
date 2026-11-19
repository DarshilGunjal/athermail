import React from 'react';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Moon,
  Sun,
  ShieldCheck,
  Keyboard,
  RotateCcw,
  Plus
} from 'lucide-react';
import { EmailCategory } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: EmailCategory | 'all';
  onSelectCategory: (cat: EmailCategory | 'all') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenConnect: () => void;
  onOpenShortcuts: () => void;
  onOpenPlayground: () => void;
  onOpenCompose: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleTheme,
  onOpenSettings,
  onOpenConnect,
  onOpenShortcuts,
  onOpenPlayground,
  onOpenCompose,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-[#2b2c2e] bg-white/80 dark:bg-[#131314]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Branding & Tagline */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-md shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse-subtle" />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#131314] rounded-full" title="Classifier Active" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              AetherMail
            </h1>
            <span className="text-[11px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
              AI Classifier
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
            Spam • Promotions • Other
          </p>
        </div>
      </div>

      {/* Middle: Conversational Search / Query Bar */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 dark:text-slate-500 dark:group-focus-within:text-indigo-400 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search senders, subjects, signals or ask a query..."
            className="w-full pl-10 pr-10 py-2 text-sm bg-slate-100/80 dark:bg-[#1e1f20] hover:bg-slate-200/60 dark:hover:bg-[#282a2c] focus:bg-white dark:focus:bg-[#1e1f20] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-full border border-transparent focus:border-indigo-400 dark:focus:border-indigo-500/60 outline-none ring-2 ring-transparent focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all shadow-inner"
            aria-label="Search emails"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Actions: Test AI, New Email, Shortcuts, Settings, Theme, Connect */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Test AI / Sandbox Button */}
        <button
          onClick={onOpenPlayground}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-sky-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-all shadow-sm"
          title="Test real-time classifier on any custom text"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
          <span>Test Classifier</span>
        </button>

        {/* Simulate Inbound Email */}
        <button
          onClick={onOpenCompose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30 transition-all active:scale-95"
          title="Simulate inbound message to test classification"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Simulate Inbound</span>
        </button>

        {/* Account / Connect Status Button */}
        <button
          onClick={onOpenConnect}
          className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full border border-slate-200 dark:border-[#333538] hover:bg-slate-100 dark:hover:bg-[#282a2c] text-slate-700 dark:text-slate-300 transition-colors"
          title="Connect email account or view demo mode"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Interactive Demo</span>
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#282a2c] rounded-full transition-colors hidden sm:inline-flex"
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#282a2c] rounded-full transition-colors"
          title="Classifier Settings & Custom Rules"
          aria-label="Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#282a2c] rounded-full transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={onResetData}
          className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#282a2c] rounded-full transition-colors"
          title="Reset demo data to default sample emails"
          aria-label="Reset demo data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
