import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  ShieldAlert,
  Tag,
  FolderDot,
  Send
} from 'lucide-react';
import { Email } from '../types';

interface NewEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiveEmail: (email: Omit<Email, 'id' | 'originalCategory' | 'classification' | 'isArchived' | 'isDeleted'>) => void;
}

const PRESETS = [
  {
    name: 'Suspicious Crypto Phishing',
    senderName: 'Coinbase Security Alert',
    senderEmail: 'support-verify@coinbase-wallet-security.xyz',
    subject: 'URGENT: Wallet migration required within 12 hours or funds locked',
    bodyText: 'Dear customer, suspicious activity detected on your Ethereum wallet address. Connect your 12-word seed phrase immediately to complete verification and prevent fund liquidation: https://coinbase-wallet-security.xyz/claim',
    type: 'spam' as const
  },
  {
    name: 'Retail Flash Sale & Coupon',
    senderName: 'Nordstrom Rewards',
    senderEmail: 'offers@nordstrom-promo.com',
    subject: 'Exclusive 40% Off Designer Shoes + Free Shipping Promo Code',
    bodyText: 'Hi Darshil, enjoy 40% off top footwear styles with promo code SHOE40 at checkout. Limited time weekend flash sale. Free shipping on all orders over $50. Unsubscribe from promotional updates here.',
    type: 'promotions' as const
  },
  {
    name: 'Direct Team Project Update',
    senderName: 'Marcus Vance',
    senderEmail: 'marcus.vance@techcorp.io',
    subject: 'Architecture review notes for Q1 microservices migration',
    bodyText: 'Hey Darshil, following up on our sync earlier today. I updated the API contract diagrams and database connection pooling settings in the shared repo. Let me know if you have time for a quick 10-minute review before the sprint ends.',
    type: 'other' as const
  }
];

export const NewEmailModal: React.FC<NewEmailModalProps> = ({
  isOpen,
  onClose,
  onReceiveEmail
}) => {
  const [senderName, setSenderName] = useState('Marcus Vance');
  const [senderEmail, setSenderEmail] = useState('marcus.vance@techcorp.io');
  const [subject, setSubject] = useState('Architecture review notes for Q1 microservices migration');
  const [bodyText, setBodyText] = useState('Hey Darshil, following up on our sync earlier today. I updated the API contract diagrams and database connection pooling settings in the shared repo. Let me know if you have time for a quick 10-minute review before the sprint ends.');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setSenderName(preset.senderName);
    setSenderEmail(preset.senderEmail);
    setSubject(preset.subject);
    setBodyText(preset.bodyText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderEmail.trim() || !subject.trim()) return;

    onReceiveEmail({
      sender: {
        name: senderName.trim() || senderEmail.split('@')[0],
        email: senderEmail.trim(),
      },
      recipient: {
        name: 'Darshil Gunjal',
        email: 'darshil@example.com'
      },
      subject: subject.trim(),
      snippet: bodyText.slice(0, 120) + '...',
      bodyHtml: `<div style="font-family: sans-serif; line-height: 1.6;"><p>${bodyText.replace(/\n/g, '<br/>')}</p></div>`,
      bodyText: bodyText.trim(),
      rawHeaders: `From: "${senderName}" <${senderEmail}>\nSubject: ${subject}\nDate: ${new Date().toISOString()}`,
      date: new Date().toISOString(),
      category: 'other', // Will be classified automatically!
      isRead: false,
      isStarred: false,
      hasAttachments: false,
      tags: ['simulated', 'inbound']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a1b1d] border border-slate-200 dark:border-[#333538] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-[#2b2c2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Simulate Inbound Email
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inject a message to test real-time classification & categorization
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Quick Test Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-[#2f3134] hover:border-indigo-400 dark:hover:border-indigo-500/60 bg-slate-50/50 dark:bg-[#202124] text-left transition-colors flex flex-col justify-between"
                >
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 mb-1">
                    {p.name}
                  </span>
                  <span className={`text-[10px] font-medium uppercase ${
                    p.type === 'spam'
                      ? 'text-rose-600 dark:text-rose-400'
                      : p.type === 'promotions'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {p.type} preset
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sender info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#151617] text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sender Email</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#151617] text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#151617] text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Body Text</label>
            <textarea
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#151617] text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Auto-categorized upon delivery
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#383a3d] text-slate-600 dark:text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Inject to Inbox</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
