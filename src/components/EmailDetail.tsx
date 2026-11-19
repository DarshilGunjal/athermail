import React, { useState } from 'react';
import {
  Email,
  EmailCategory
} from '../types';
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  ShieldAlert,
  ShieldCheck,
  Tag,
  FolderDot,
  Sparkles,
  Download,
  Paperclip,
  CheckCircle,
  AlertTriangle,
  Send,
  Sliders,
  ChevronDown,
  Info,
  CornerUpLeft,
  Forward,
  Terminal,
  FileText
} from 'lucide-react';

interface EmailDetailProps {
  email: Email | null;
  onBack: () => void;
  onMoveCategory: (id: string, newCategory: EmailCategory) => void;
  onToggleStar: (id: string) => void;
  onToggleRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateRuleForSender: (senderEmail: string, category: EmailCategory) => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  onBack,
  onMoveCategory,
  onToggleStar,
  onToggleRead,
  onArchive,
  onDelete,
  onCreateRuleForSender
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'text' | 'headers'>('html');
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50/30 dark:bg-[#131314]">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1e1f20] flex items-center justify-center mb-4">
          <MailOpen className="w-8 h-8 stroke-[1.5] text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Select an email to inspect
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Explore automated categorization, neural confidence scores, and multi-signal explainability breakdown.
        </p>
      </div>
    );
  }

  const { classification } = email;

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setReplySent(true);
    setTimeout(() => {
      setReplySent(false);
      setReplyText('');
    }, 2500);
  };

  const getConfidenceColor = (category: EmailCategory) => {
    if (category === 'spam') return 'text-rose-600 dark:text-rose-400';
    if (category === 'promotions') return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getConfidenceBg = (category: EmailCategory) => {
    if (category === 'spam') return 'bg-rose-500';
    if (category === 'promotions') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#131314]">
      {/* Top Action Bar */}
      <div className="border-b border-slate-200/80 dark:border-[#2b2c2e] bg-slate-50/50 dark:bg-[#18191a] px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Back button & Category Quick Changers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-[#282a2c] text-slate-600 dark:text-slate-300 md:hidden"
            title="Back to email list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Quick Mark as Spam / Not Spam */}
          {email.category === 'spam' ? (
            <button
              onClick={() => onMoveCategory(email.id, 'other')}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
              title="Re-classify as Not Spam"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Not Spam</span>
            </button>
          ) : (
            <button
              onClick={() => onMoveCategory(email.id, 'spam')}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800 hover:bg-rose-100 transition-colors"
              title="Flag message as Spam"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Mark as Spam</span>
            </button>
          )}

          {/* Move Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border border-slate-200 dark:border-[#383a3d] hover:bg-slate-100 dark:hover:bg-[#282a2c] text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span>Move Category</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCategoryMenu && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#383a3d] rounded-xl shadow-lg p-1 z-20 animate-fade-in text-xs">
                <button
                  onClick={() => {
                    onMoveCategory(email.id, 'spam');
                    setShowCategoryMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Spam</span>
                </button>
                <button
                  onClick={() => {
                    onMoveCategory(email.id, 'promotions');
                    setShowCategoryMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Promotions</span>
                </button>
                <button
                  onClick={() => {
                    onMoveCategory(email.id, 'other');
                    setShowCategoryMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600"
                >
                  <FolderDot className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Other (Primary)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Star, Read, Archive, Delete */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleStar(email.id)}
            className={`p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-[#282a2c] transition-colors ${
              email.isStarred ? 'text-amber-400' : 'text-slate-500 dark:text-slate-400'
            }`}
            title={email.isStarred ? 'Unstar' : 'Star message'}
          >
            <Star className={`w-4 h-4 ${email.isStarred ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => onToggleRead(email.id)}
            className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-[#282a2c] text-slate-500 dark:text-slate-400"
            title={email.isRead ? 'Mark as unread' : 'Mark as read'}
          >
            {email.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onArchive(email.id)}
            className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-[#282a2c] text-slate-500 dark:text-slate-400"
            title="Archive message"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(email.id)}
            className="p-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
            title="Delete message"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Gemini-Inspired AI Classification Explanation Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-[#1b1c20] dark:via-[#1e1f20] dark:to-[#17181c] border border-indigo-200/70 dark:border-indigo-900/50 p-5 shadow-sm">
          {/* Top Row: AI Badge & Confidence Score Meter */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-600 text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                    Gemini Neural Classifier Breakdown
                  </h4>
                  {classification.userOverridden && (
                    <span className="text-[10px] bg-slate-200 dark:bg-[#333] text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                      Manually Overridden
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automated reasoning & key signal detection
                </p>
              </div>
            </div>

            {/* Confidence Gauge Badge */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={`text-base font-bold ${getConfidenceColor(email.category)}`}>
                  {classification.confidence}% Confidence
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium capitalize">
                  Classified as {email.category}
                </div>
              </div>

              {/* Mini visual progress ring/bar */}
              <div className="w-14 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getConfidenceBg(email.category)}`}
                  style={{ width: `${classification.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Conversational Explanation */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#252629]/80 border border-indigo-100 dark:border-indigo-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3">
            <p className="font-medium text-slate-900 dark:text-white mb-1">
              Why this was classified:
            </p>
            <p>{classification.detailedExplanation}</p>
          </div>

          {/* Detected Signal Tags */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Detected Signals & Weighted Influence
            </div>
            <div className="flex flex-wrap gap-2">
              {classification.signals.map((sig) => (
                <div
                  key={sig.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    sig.type === 'spam_signal'
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/40'
                      : sig.type === 'promo_signal'
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/40'
                      : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/40'
                  }`}
                  title={sig.description}
                >
                  <span className="font-bold">
                    {sig.weight > 0 ? `+${sig.weight}` : sig.weight}
                  </span>
                  <span>{sig.name}</span>
                </div>
              ))}

              {/* Keywords Tag */}
              {classification.detectedKeywords.length > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-[#2a2b2e] text-slate-600 dark:text-slate-400 font-mono">
                  <span>Triggers: {classification.detectedKeywords.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Rule Shortcut */}
          <div className="mt-4 pt-3 border-t border-indigo-100/60 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Incorrect classification? Teach the system:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCreateRuleForSender(email.sender.email, email.category)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-medium transition-colors"
              >
                <Sliders className="w-3 h-3" />
                <span>Create Rule for {email.sender.email}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Email Header Info */}
        <div className="border-b border-slate-200/80 dark:border-[#2b2c2e] pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3">
            {email.subject}
          </h2>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-[#2c2d30] dark:to-[#1e1f20] border border-slate-200 dark:border-[#383a3d] flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 select-none">
                {email.sender.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {email.sender.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    &lt;{email.sender.email}&gt;
                  </span>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  to {email.recipient.name} &lt;{email.recipient.email}&gt;
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {new Date(email.date).toLocaleDateString([], {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="text-[11px] text-slate-400">
                {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Security Headers Indicator */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-[#252628] text-[11px]">
            <span className="text-slate-400">Authentication:</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
              <ShieldCheck className="w-3 h-3" /> SPF: {classification.authResults.spf.toUpperCase()}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
              DKIM: {classification.authResults.dkim.toUpperCase()}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
              TLS 1.3 Verified
            </span>
          </div>
        </div>

        {/* View Mode Tabs: Rendered HTML vs Plain Text vs Raw Headers */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#2b2c2e] text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('html')}
              className={`pb-2 font-medium border-b-2 transition-colors ${
                activeTab === 'html'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Rendered View
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`pb-2 font-medium border-b-2 transition-colors ${
                activeTab === 'text'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Plain Text
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`inline-flex items-center gap-1 pb-2 font-medium border-b-2 transition-colors ${
                activeTab === 'headers'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>MIME Headers</span>
            </button>
          </div>
        </div>

        {/* Email Body Content */}
        <div className="min-h-[160px]">
          {activeTab === 'html' && (
            <div
              className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-sm bg-white dark:bg-[#161718] p-4 rounded-xl border border-slate-100 dark:border-[#252628]"
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
            />
          )}

          {activeTab === 'text' && (
            <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#18191b] p-4 rounded-xl border border-slate-200 dark:border-[#2b2c2e] whitespace-pre-wrap leading-relaxed">
              {email.bodyText}
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto whitespace-pre leading-relaxed">
              {email.rawHeaders}
            </div>
          )}
        </div>

        {/* Attachments Section */}
        {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
          <div className="border-t border-slate-200/80 dark:border-[#2b2c2e] pt-4">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attachments ({email.attachments.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {email.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-[#2b2c2e] bg-slate-50/50 dark:bg-[#1a1b1d] hover:bg-slate-100 dark:hover:bg-[#202124] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {att.size} • {att.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Simulated secure download for "${att.name}"`)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
                    title="Download attachment"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Reply & Interactive Composer Simulation */}
        <div className="border-t border-slate-200/80 dark:border-[#2b2c2e] pt-4">
          <div className="rounded-2xl border border-slate-200 dark:border-[#2b2c2e] bg-slate-50/40 dark:bg-[#18191b] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CornerUpLeft className="w-3.5 h-3.5 text-slate-400" />
                <span>Quick Reply to {email.sender.name}</span>
              </span>

              {/* AI Quick Response Suggestions */}
              <div className="hidden sm:flex items-center gap-1.5">
                {['Sounds good!', 'Thanks for the update', 'Please unsubscribe me'].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setReplyText(prompt)}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#282a2c] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Write a reply to ${email.sender.name}...`}
              rows={2}
              className="w-full text-xs sm:text-sm bg-white dark:bg-[#1e1f20] rounded-xl p-3 border border-slate-200 dark:border-[#383a3d] focus:border-indigo-400 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none transition-colors"
            />

            <div className="flex items-center justify-between mt-2 pt-2">
              <div className="text-[11px] text-slate-400">
                {replySent && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                    ✓ Simulated reply sent successfully!
                  </span>
                )}
              </div>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || replySent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-sm transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Send Reply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
