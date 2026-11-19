import React, { useState } from 'react';
import {
  Email,
  EmailCategory,
  SystemFolder
} from '../types';
import {
  Star,
  Paperclip,
  ShieldAlert,
  Tag,
  FolderDot,
  CheckSquare,
  Square,
  MinusSquare,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  ArrowRightLeft,
  Filter,
  CheckCircle2,
  Inbox,
  AlertCircle
} from 'lucide-react';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  currentCategory: EmailCategory | 'all';
  currentFolder: SystemFolder | null;
  onSelectCategory: (cat: EmailCategory | 'all') => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkMoveCategory: (category: EmailCategory) => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onBulkMarkRead: (read: boolean) => void;
  onBulkStar: () => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onQuickArchive: (id: string, e: React.MouseEvent) => void;
  onQuickDelete: (id: string, e: React.MouseEvent) => void;
  onQuickToggleRead: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  isLoading?: boolean;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  currentCategory,
  currentFolder,
  onSelectCategory,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onBulkMoveCategory,
  onBulkArchive,
  onBulkDelete,
  onBulkMarkRead,
  onBulkStar,
  onToggleStar,
  onQuickArchive,
  onQuickDelete,
  onQuickToggleRead,
  searchQuery,
  isLoading = false
}) => {
  // Filter bar states
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [filterHasAttachment, setFilterHasAttachment] = useState(false);
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'date' | 'confidence'>('date');

  // Filter application
  let displayedEmails = [...emails];

  if (filterUnreadOnly) {
    displayedEmails = displayedEmails.filter(e => !e.isRead);
  }

  if (filterHasAttachment) {
    displayedEmails = displayedEmails.filter(e => e.hasAttachments);
  }

  if (minConfidence > 0) {
    displayedEmails = displayedEmails.filter(e => e.classification.confidence >= minConfidence);
  }

  if (sortBy === 'confidence') {
    displayedEmails.sort((a, b) => b.classification.confidence - a.classification.confidence);
  } else {
    displayedEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const allSelected = displayedEmails.length > 0 && selectedIds.length === displayedEmails.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < displayedEmails.length;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getCategoryBadge = (category: EmailCategory, confidence: number) => {
    if (category === 'spam') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
          <ShieldAlert className="w-3 h-3 text-rose-500" />
          <span>{confidence}% Spam</span>
        </span>
      );
    }
    if (category === 'promotions') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
          <Tag className="w-3 h-3 text-amber-500" />
          <span>{confidence}% Promo</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
        <FolderDot className="w-3 h-3 text-emerald-500" />
        <span>{confidence}% Other</span>
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#131314] select-none">
      {/* Category Tabs (Desktop & Tablet Quick Navigation) */}
      <div className="border-b border-slate-200/80 dark:border-[#2b2c2e] bg-slate-50/50 dark:bg-[#18191a] px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentCategory === 'all' && currentFolder === null
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-[#282a2c]'
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => onSelectCategory('spam')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentCategory === 'spam' && currentFolder === null
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-[#282a2c]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Spam</span>
          </button>
          <button
            onClick={() => onSelectCategory('promotions')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentCategory === 'promotions' && currentFolder === null
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-[#282a2c]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Promotions</span>
          </button>
          <button
            onClick={() => onSelectCategory('other')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentCategory === 'other' && currentFolder === null
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-[#282a2c]'
            }`}
          >
            <FolderDot className="w-3.5 h-3.5" />
            <span>Other</span>
          </button>
        </div>

        {/* List Count Indicator */}
        <div className="text-xs text-slate-400 dark:text-slate-500 shrink-0 font-medium">
          {displayedEmails.length} {displayedEmails.length === 1 ? 'message' : 'messages'}
        </div>
      </div>

      {/* Filter Chips & Bulk Action Toolbar */}
      <div className="px-4 py-2 border-b border-slate-200/60 dark:border-[#2b2c2e] bg-white dark:bg-[#131314] flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Select all checkbox and Bulk Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={allSelected ? onClearSelection : onSelectAll}
            className="p-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            title={allSelected ? 'Deselect all' : 'Select all'}
            aria-label="Select all emails"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : someSelected ? (
              <MinusSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          {selectedIds.length > 0 ? (
            /* Bulk Actions Active Bar */
            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/60 animate-fade-in">
              <span className="font-semibold text-[11px] mr-1">
                {selectedIds.length} selected
              </span>

              {/* Move to Spam */}
              <button
                onClick={() => onBulkMoveCategory('spam')}
                className="px-2 py-0.5 rounded-full hover:bg-rose-200/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-medium transition-colors"
                title="Mark selected as Spam"
              >
                Spam
              </button>

              {/* Move to Promotions */}
              <button
                onClick={() => onBulkMoveCategory('promotions')}
                className="px-2 py-0.5 rounded-full hover:bg-amber-200/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-medium transition-colors"
                title="Move selected to Promotions"
              >
                Promo
              </button>

              {/* Move to Other */}
              <button
                onClick={() => onBulkMoveCategory('other')}
                className="px-2 py-0.5 rounded-full hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium transition-colors"
                title="Move selected to Other"
              >
                Other
              </button>

              <span className="text-slate-300 dark:text-slate-700">|</span>

              {/* Mark Read */}
              <button
                onClick={() => onBulkMarkRead(true)}
                className="p-1 hover:bg-indigo-200/50 dark:hover:bg-indigo-900/50 rounded-full"
                title="Mark as Read"
              >
                <MailOpen className="w-3.5 h-3.5" />
              </button>

              {/* Mark Unread */}
              <button
                onClick={() => onBulkMarkRead(false)}
                className="p-1 hover:bg-indigo-200/50 dark:hover:bg-indigo-900/50 rounded-full"
                title="Mark as Unread"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>

              {/* Archive */}
              <button
                onClick={onBulkArchive}
                className="p-1 hover:bg-indigo-200/50 dark:hover:bg-indigo-900/50 rounded-full"
                title="Archive selected"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                onClick={onBulkDelete}
                className="p-1 hover:bg-rose-200/60 dark:hover:bg-rose-900/60 text-rose-600 rounded-full"
                title="Delete selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Filter Chips */
            <div className="flex items-center gap-1.5 text-slate-500">
              <button
                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-all ${
                  filterUnreadOnly
                    ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-100 dark:bg-[#1e1f20] hover:bg-slate-200 dark:hover:bg-[#282a2c] text-slate-600 dark:text-slate-400'
                }`}
              >
                Unread only
              </button>

              <button
                onClick={() => setFilterHasAttachment(!filterHasAttachment)}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium transition-all ${
                  filterHasAttachment
                    ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-100 dark:bg-[#1e1f20] hover:bg-slate-200 dark:hover:bg-[#282a2c] text-slate-600 dark:text-slate-400'
                }`}
              >
                <Paperclip className="w-3 h-3" />
                <span>Files</span>
              </button>

              <button
                onClick={() => setMinConfidence(minConfidence === 90 ? 0 : 90)}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-all ${
                  minConfidence >= 90
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                    : 'bg-slate-100 dark:bg-[#1e1f20] hover:bg-slate-200 dark:hover:bg-[#282a2c] text-slate-600 dark:text-slate-400'
                }`}
                title="Show only high-confidence classifications (>= 90%)"
              >
                ≥ 90% Confidence
              </button>
            </div>
          )}
        </div>

        {/* Right: Sort controls */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'confidence')}
            className="bg-transparent text-slate-700 dark:text-slate-300 font-medium outline-none cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 text-xs"
          >
            <option value="date" className="dark:bg-[#1e1f20]">Date (Newest)</option>
            <option value="confidence" className="dark:bg-[#1e1f20]">Confidence (Highest)</option>
          </select>
        </div>
      </div>

      {/* Email Items Scrollable Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#252628] focus:outline-none">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-start gap-3 animate-pulse">
                <div className="w-4 h-4 bg-slate-200 dark:bg-[#282a2c] rounded mt-1" />
                <div className="w-9 h-9 bg-slate-200 dark:bg-[#282a2c] rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-[#282a2c] rounded w-1/4" />
                  <div className="h-3.5 bg-slate-200 dark:bg-[#282a2c] rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-[#282a2c] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedEmails.length === 0 ? (
          /* Thoughtful Empty State */
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1e1f20] flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
              <Inbox className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
              No messages found
            </h3>
            <p className="text-xs max-w-sm text-slate-500 dark:text-slate-400 mb-4">
              {searchQuery
                ? `No emails match the query "${searchQuery}". Try refining your keywords.`
                : filterUnreadOnly || filterHasAttachment || minConfidence > 0
                ? 'No messages match the active filters. Try resetting the filter chips above.'
                : 'This category folder is currently clean and clear.'}
            </p>
            {(filterUnreadOnly || filterHasAttachment || minConfidence > 0) && (
              <button
                onClick={() => {
                  setFilterUnreadOnly(false);
                  setFilterHasAttachment(false);
                  setMinConfidence(0);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#282a2c] hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Email List Items */
          displayedEmails.map((email) => {
            const isSelected = selectedIds.includes(email.id);
            const isActive = selectedEmailId === email.id;

            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email.id)}
                className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-indigo-600 dark:border-indigo-500'
                    : isSelected
                    ? 'bg-slate-100/70 dark:bg-[#222325]'
                    : !email.isRead
                    ? 'bg-white dark:bg-[#161718] hover:bg-slate-50 dark:hover:bg-[#1c1d1f]'
                    : 'bg-slate-50/40 dark:bg-[#131314] hover:bg-slate-100/60 dark:hover:bg-[#1a1b1d]'
                }`}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectEmail(email.id);
                }}
              >
                {/* Checkbox */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(email.id);
                  }}
                  className="mt-1 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 p-0.5"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </div>

                {/* Star Toggle */}
                <button
                  onClick={(e) => onToggleStar(email.id, e)}
                  className={`mt-1 p-0.5 transition-colors ${
                    email.isStarred
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                  }`}
                  title={email.isStarred ? 'Unstar' : 'Star message'}
                  aria-label="Star message"
                >
                  <Star className={`w-4 h-4 ${email.isStarred ? 'fill-amber-400' : ''}`} />
                </button>

                {/* Avatar Initials */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-[#2a2b2e] dark:to-[#1e1f20] border border-slate-200 dark:border-[#383a3d] flex items-center justify-center font-semibold text-xs text-slate-700 dark:text-slate-300 shrink-0 select-none">
                  {email.sender.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0 pr-2">
                  {/* Top line: Sender name, Category pill, Confidence, Date */}
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`truncate text-xs sm:text-sm ${
                          !email.isRead
                            ? 'font-bold text-slate-900 dark:text-white'
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {email.sender.name}
                      </span>

                      {/* Category Badge & Confidence */}
                      {getCategoryBadge(email.category, email.classification.confidence)}

                      {/* Unread dot */}
                      {!email.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" title="Unread" />
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-medium">
                      {formatDate(email.date)}
                    </span>
                  </div>

                  {/* Subject */}
                  <h4
                    className={`text-xs sm:text-sm truncate mb-0.5 ${
                      !email.isRead
                        ? 'font-semibold text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {email.subject}
                  </h4>

                  {/* Snippet */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                    {email.snippet}
                  </p>

                  {/* Bottom tags & attachments */}
                  <div className="flex items-center gap-2 mt-1.5">
                    {email.hasAttachments && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#202123] px-1.5 py-0.5 rounded font-medium">
                        <Paperclip className="w-3 h-3" />
                        {email.attachments?.length || 1} file
                      </span>
                    )}

                    {email.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100/70 dark:bg-[#1a1b1d] px-1.5 py-0.2 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Quick Actions */}
                <div
                  className="absolute right-3 top-3 hidden group-hover:flex items-center gap-1 bg-white/95 dark:bg-[#1e1f20]/95 backdrop-blur-sm shadow-md border border-slate-200/80 dark:border-[#383a3d] rounded-lg p-1 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => onQuickToggleRead(email.id, e)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-[#282a2c] rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    title={email.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    {email.isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => onQuickArchive(email.id, e)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-[#282a2c] rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    title="Archive message"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => onQuickDelete(email.id, e)}
                    className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                    title="Move to trash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
