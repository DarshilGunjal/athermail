import React, { useState } from 'react';
import {
  ClassifierSettings,
  ClassifierRule,
  EmailCategory,
  SensitivityLevel
} from '../types';
import {
  X,
  Sliders,
  ShieldAlert,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Bell,
  Ban,
  UserCheck,
  Play,
  RotateCw,
  FolderDot,
  Tag
} from 'lucide-react';
import { classifyEmail } from '../utils/classifierEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClassifierSettings;
  onUpdateSettings: (newSettings: ClassifierSettings) => void;
  rules: ClassifierRule[];
  onAddRule: (rule: Omit<ClassifierRule, 'id' | 'createdAt'>) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onReclassifyAll: () => void;
  initialTab?: 'preferences' | 'rules' | 'blocked' | 'notifications' | 'playground';
  prefilledRule?: { senderEmail: string; category: EmailCategory } | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  rules,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onReclassifyAll,
  initialTab = 'preferences',
  prefilledRule = null
}) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'rules' | 'blocked' | 'notifications' | 'playground'>(
    prefilledRule ? 'rules' : initialTab
  );

  // New Rule Form State
  const [newRuleName, setNewRuleName] = useState(
    prefilledRule ? `Always route ${prefilledRule.senderEmail} to ${prefilledRule.category}` : ''
  );
  const [newRuleField, setNewRuleField] = useState<'sender' | 'subject' | 'body' | 'domain'>('sender');
  const [newRuleOperator, setNewRuleOperator] = useState<'contains' | 'equals' | 'starts_with' | 'ends_with'>('contains');
  const [newRuleValue, setNewRuleValue] = useState(prefilledRule?.senderEmail || '');
  const [newRuleCategory, setNewRuleCategory] = useState<EmailCategory>(prefilledRule?.category || 'other');
  const [showAddRuleForm, setShowAddRuleForm] = useState(!!prefilledRule);

  // Blocked / Allowlisted state
  const [newBlockedInput, setNewBlockedInput] = useState('');
  const [newAllowlistInput, setNewAllowlistInput] = useState('');

  // Playground State
  const [testSender, setTestSender] = useState('sales@quickdeals-today.shop');
  const [testSubject, setTestSubject] = useState('Exclusive 70% Off Cyber Deal - Claim Your Free Gift');
  const [testBody, setTestBody] = useState('Dear customer, limited time coupon code CYBER70 expires tonight. Free shipping on all orders over $25. Unsubscribe here.');
  const [playgroundResult, setPlaygroundResult] = useState<ReturnType<typeof classifyEmail> | null>(null);

  if (!isOpen) return null;

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleValue.trim()) return;

    onAddRule({
      name: newRuleName.trim() || `Rule: ${newRuleField} ${newRuleOperator} ${newRuleValue}`,
      field: newRuleField,
      operator: newRuleOperator,
      value: newRuleValue.trim(),
      targetCategory: newRuleCategory,
      enabled: true
    });

    setNewRuleName('');
    setNewRuleValue('');
    setShowAddRuleForm(false);
  };

  const handleAddBlockedSender = () => {
    if (!newBlockedInput.trim()) return;
    const clean = newBlockedInput.trim().toLowerCase();
    if (!settings.blockedSenders.includes(clean)) {
      onUpdateSettings({
        ...settings,
        blockedSenders: [...settings.blockedSenders, clean]
      });
    }
    setNewBlockedInput('');
  };

  const handleRemoveBlockedSender = (sender: string) => {
    onUpdateSettings({
      ...settings,
      blockedSenders: settings.blockedSenders.filter(s => s !== sender)
    });
  };

  const handleAddAllowlistSender = () => {
    if (!newAllowlistInput.trim()) return;
    const clean = newAllowlistInput.trim().toLowerCase();
    if (!settings.allowlistedSenders.includes(clean)) {
      onUpdateSettings({
        ...settings,
        allowlistedSenders: [...settings.allowlistedSenders, clean]
      });
    }
    setNewAllowlistInput('');
  };

  const handleRemoveAllowlistSender = (sender: string) => {
    onUpdateSettings({
      ...settings,
      allowlistedSenders: settings.allowlistedSenders.filter(s => s !== sender)
    });
  };

  const handleRunPlaygroundTest = () => {
    const result = classifyEmail(
      {
        senderEmail: testSender,
        senderName: testSender.split('@')[0],
        subject: testSubject,
        body: testBody
      },
      rules,
      settings
    );
    setPlaygroundResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a1b1d] border border-slate-200 dark:border-[#333538] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-[#2b2c2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Classifier Settings & Rule Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tune sensitivity, manage custom rules, and inspect AI heuristics
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

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200/80 dark:border-[#2b2c2e] bg-slate-50/50 dark:bg-[#151617] flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sensitivity & AI
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Custom Rules</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
              {rules.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'blocked'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Blocked & Allowlisted
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1 text-purple-600 dark:text-purple-400 ${
              activeTab === 'playground'
                ? 'border-purple-600 font-semibold'
                : 'border-transparent hover:text-purple-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Sandbox</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 text-sm">
              {/* Spam Sensitivity Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200/80 dark:border-[#2f3134]">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Spam Detection Sensitivity</span>
                  </label>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 capitalize">
                    {settings.spamSensitivity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {settings.spamSensitivity === 'relaxed' && 'Relaxed: Requires overwhelming spam indicators before routing to Spam. Minimizes false positives.'}
                  {settings.spamSensitivity === 'balanced' && 'Balanced: Recommended for general use. Standard neural balance of heuristics and sender trust.'}
                  {settings.spamSensitivity === 'aggressive' && 'Aggressive: Aggressively routes potential marketing, cold outreach, and unverified domains to Spam.'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['relaxed', 'balanced', 'aggressive'] as SensitivityLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, spamSensitivity: level })}
                      className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                        settings.spamSensitivity === level
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-[#1a1b1d] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383a3d] hover:bg-slate-100 dark:hover:bg-[#282a2c]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promotions Sensitivity */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200/80 dark:border-[#2f3134]">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span>Promotions Filtering Sensitivity</span>
                  </label>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 capitalize">
                    {settings.promoSensitivity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Controls threshold for discount triggers, bulk campaign unsubscribe headers, and retail digests.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['relaxed', 'balanced', 'aggressive'] as SensitivityLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, promoSensitivity: level })}
                      className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                        settings.promoSensitivity === level
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white dark:bg-[#1a1b1d] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383a3d] hover:bg-slate-100 dark:hover:bg-[#282a2c]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#2f3134] bg-white dark:bg-[#1a1b1d] cursor-pointer">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Auto-Archive High Confidence Spam</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Skip inbox entirely when confidence exceeds 95%</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoArchiveHighConfidenceSpam}
                    onChange={(e) => onUpdateSettings({ ...settings, autoArchiveHighConfidenceSpam: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#2f3134] bg-white dark:bg-[#1a1b1d] cursor-pointer">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Auto-Block Known Phishing Vectors</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Instantly blacklist senders with failed SPF and brand impersonation</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoBlockPhishingSenders}
                    onChange={(e) => onUpdateSettings({ ...settings, autoBlockPhishingSenders: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Reclassify all emails CTA */}
              <div className="pt-2">
                <button
                  onClick={onReclassifyAll}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-medium text-xs transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Re-evaluate all current messages with these settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">User-Defined Rules</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Custom rules override automated heuristics</p>
                </div>
                <button
                  onClick={() => setShowAddRuleForm(!showAddRuleForm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
              </div>

              {/* Add Rule Form */}
              {showAddRuleForm && (
                <form onSubmit={handleCreateRule} className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-[#202124] border border-indigo-200/80 dark:border-indigo-900/60 space-y-3 animate-fade-in text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">New Classification Rule</div>
                  <div>
                    <label className="block text-slate-500 mb-1">Rule Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Always route Linear updates to Other"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#1a1b1d] text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-500 mb-1">Field</label>
                      <select
                        value={newRuleField}
                        onChange={(e) => setNewRuleField(e.target.value as any)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#1a1b1d] text-slate-900 dark:text-white outline-none"
                      >
                        <option value="sender">Sender Email</option>
                        <option value="subject">Subject</option>
                        <option value="body">Body</option>
                        <option value="domain">Sender Domain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">Operator</label>
                      <select
                        value={newRuleOperator}
                        onChange={(e) => setNewRuleOperator(e.target.value as any)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#1a1b1d] text-slate-900 dark:text-white outline-none"
                      >
                        <option value="contains">Contains</option>
                        <option value="equals">Equals</option>
                        <option value="starts_with">Starts with</option>
                        <option value="ends_with">Ends with</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">Match Value</label>
                      <input
                        type="text"
                        placeholder="e.g. newsletter.com"
                        value={newRuleValue}
                        onChange={(e) => setNewRuleValue(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#1a1b1d] text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Target Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewRuleCategory('spam')}
                        className={`p-2 rounded-lg font-medium border text-center ${
                          newRuleCategory === 'spam'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-[#1a1b1d] border-slate-200 dark:border-[#383a3d] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Spam
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewRuleCategory('promotions')}
                        className={`p-2 rounded-lg font-medium border text-center ${
                          newRuleCategory === 'promotions'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white dark:bg-[#1a1b1d] border-slate-200 dark:border-[#383a3d] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Promotions
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewRuleCategory('other')}
                        className={`p-2 rounded-lg font-medium border text-center ${
                          newRuleCategory === 'other'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-[#1a1b1d] border-slate-200 dark:border-[#383a3d] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Other (Direct)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRuleForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#383a3d] text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newRuleValue.trim()}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium disabled:opacity-50"
                    >
                      Save Rule
                    </button>
                  </div>
                </form>
              )}

              {/* Rules List */}
              <div className="space-y-2">
                {rules.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No custom rules yet. Click "Add Rule" above.</p>
                ) : (
                  rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#2f3134] bg-white dark:bg-[#1a1b1d] text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => onToggleRule(rule.id)}
                          className="w-4 h-4 rounded text-indigo-600"
                          title="Enable or disable rule"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{rule.name}</span>
                            <span className={`px-1.5 py-0.2 rounded font-mono uppercase text-[10px] ${
                              rule.targetCategory === 'spam'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : rule.targetCategory === 'promotions'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              -&gt; {rule.targetCategory}
                            </span>
                          </div>
                          <div className="text-slate-400 font-mono text-[11px]">
                            If {rule.field} {rule.operator} "{rule.value}"
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BLOCKED & ALLOWLISTED */}
          {activeTab === 'blocked' && (
            <div className="space-y-6 text-xs">
              {/* Blocked Senders */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-rose-500" />
                  <span>Blocked Senders & Domains</span>
                </h4>
                <p className="text-slate-500 mb-3">Messages from these senders are instantly marked as Spam with 99% confidence.</p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter email or domain (e.g. spammer.com)"
                    value={newBlockedInput}
                    onChange={(e) => setNewBlockedInput(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#1a1b1d] text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    onClick={handleAddBlockedSender}
                    disabled={!newBlockedInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-medium disabled:opacity-50"
                  >
                    Block
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {settings.blockedSenders.map((sender) => (
                    <span
                      key={sender}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-mono"
                    >
                      <span>{sender}</span>
                      <button onClick={() => handleRemoveBlockedSender(sender)} className="hover:text-rose-900">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Allowlisted Senders */}
              <div className="pt-4 border-t border-slate-200 dark:border-[#2b2c2e]">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Allowlisted Senders</span>
                </h4>
                <p className="text-slate-500 mb-3">These senders bypass spam filters and are routed straight to Other / Primary.</p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter trusted email or domain"
                    value={newAllowlistInput}
                    onChange={(e) => setNewAllowlistInput(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#1a1b1d] text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    onClick={handleAddAllowlistSender}
                    disabled={!newAllowlistInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50"
                  >
                    Allow
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {settings.allowlistedSenders.map((sender) => (
                    <span
                      key={sender}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-mono"
                    >
                      <span>{sender}</span>
                      <button onClick={() => handleRemoveAllowlistSender(sender)} className="hover:text-emerald-900">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 text-xs">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notification Controls</h4>
              <p className="text-slate-500">Configure audible chimes, alerts, and classification digests.</p>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#2f3134] bg-white dark:bg-[#1a1b1d] cursor-pointer">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Audible Feedback Chime</div>
                    <div className="text-slate-400">Play subtle sound when auto-organizing inbound emails</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationSounds}
                    onChange={(e) => onUpdateSettings({ ...settings, notificationSounds: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#2f3134] bg-white dark:bg-[#1a1b1d] cursor-pointer">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">High-Confidence Spam Alerts</div>
                    <div className="text-slate-400">Surface warning badges for suspected credential harvesters</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.highConfidenceAlerts}
                    onChange={(e) => onUpdateSettings({ ...settings, highConfidenceAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#2f3134] bg-white dark:bg-[#1a1b1d] cursor-pointer">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Daily Intelligence Digest</div>
                    <div className="text-slate-400">Summarize filtered spam and promotions every morning</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dailyDigest}
                    onChange={(e) => onUpdateSettings({ ...settings, dailyDigest: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: AI PLAYGROUND / LIVE CLASSIFIER SANDBOX */}
          {activeTab === 'playground' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Real-time Classifier Sandbox</span>
                  </h4>
                  <p className="text-slate-500">Test how any arbitrary email content will be classified by the neural model</p>
                </div>
                <button
                  type="button"
                  onClick={handleRunPlaygroundTest}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Analysis</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 mb-1">Sender Email</label>
                  <input
                    type="text"
                    value={testSender}
                    onChange={(e) => setTestSender(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#1a1b1d] text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Subject</label>
                  <input
                    type="text"
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#1a1b1d] text-slate-900 dark:text-white outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Body Text</label>
                  <textarea
                    rows={3}
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#1a1b1d] text-slate-900 dark:text-white outline-none resize-none font-sans"
                  />
                </div>
              </div>

              {/* Playground Results */}
              {playgroundResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-indigo-50/70 dark:from-[#241f2d] dark:to-[#1e1f28] border border-purple-200 dark:border-purple-900/50 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Prediction Result
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      playgroundResult.category === 'spam'
                        ? 'bg-rose-600 text-white'
                        : playgroundResult.category === 'promotions'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {playgroundResult.category.toUpperCase()} • {playgroundResult.confidence}% Confidence
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {playgroundResult.detailedExplanation}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {playgroundResult.signals.map((sig) => (
                      <span
                        key={sig.id}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1b1c20] text-[11px] font-medium border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300"
                      >
                        +{sig.weight} {sig.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200/80 dark:border-[#2b2c2e] bg-slate-50 dark:bg-[#151617] flex items-center justify-between text-xs">
          <span className="text-slate-400">Settings auto-saved to client storage</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
