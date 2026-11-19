import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Server,
  Key,
  CheckCircle2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({ isOpen, onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState<'demo' | 'google' | 'microsoft' | 'imap'>('demo');
  const [imapHost, setImapHost] = useState('imap.mailserver.com');
  const [imapUser, setImapUser] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedNotice, setConnectedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateOAuth = (provider: string) => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setConnectedNotice(`OAuth Handshake simulated for ${provider}. For production deployment, configure client secrets in your environment.`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a1b1d] border border-slate-200 dark:border-[#333538] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-[#2b2c2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Account & Integration Architecture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive demo vs real OAuth & IMAP integration
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
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Active Demo Mode Badge */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
                Interactive Realistic Demo Mode is Currently Active
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                You are currently interacting with a realistic dataset and local ML heuristics running in your browser. All classification signals, confidence calculations, rule matching, and undo systems are completely live.
              </p>
            </div>
          </div>

          {/* Integration Options */}
          <div>
            <label className="block font-semibold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider text-slate-400">
              Production Integration Options
            </label>
            <div className="space-y-2.5">
              {/* Google Workspace */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#2f3134] hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#242528] flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                    G
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">Google Workspace / Gmail</div>
                    <div className="text-[11px] text-slate-500">Requires OAuth2 scopes: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">gmail.modify</code></div>
                  </div>
                </div>
                <button
                  onClick={() => handleSimulateOAuth('Google')}
                  disabled={isConnecting}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#383a3d] hover:bg-slate-100 dark:hover:bg-[#282a2c] font-medium text-xs text-slate-800 dark:text-slate-200"
                >
                  {isConnecting ? 'Verifying...' : 'Connect OAuth'}
                </button>
              </div>

              {/* Microsoft 365 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#2f3134] hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#242528] flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">Microsoft 365 / Outlook</div>
                    <div className="text-[11px] text-slate-500">Requires Azure AD App with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Mail.ReadWrite</code></div>
                  </div>
                </div>
                <button
                  onClick={() => handleSimulateOAuth('Microsoft')}
                  disabled={isConnecting}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#383a3d] hover:bg-slate-100 dark:hover:bg-[#282a2c] font-medium text-xs text-slate-800 dark:text-slate-200"
                >
                  Connect MS Graph
                </button>
              </div>

              {/* IMAP / SMTP */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#2f3134] hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#242528] flex items-center justify-center">
                      <Server className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">Custom IMAP / TLS</div>
                      <div className="text-[11px] text-slate-500">Direct mailbox protocol over TLS port 993</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">TLS 1.3</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="text"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    placeholder="Host (e.g. mail.domain.com)"
                    className="p-2 text-xs rounded-lg border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#151617] text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={imapUser}
                    onChange={(e) => setImapUser(e.target.value)}
                    placeholder="User (e.g. user@domain.com)"
                    className="p-2 text-xs rounded-lg border border-slate-200 dark:border-[#383a3d] bg-white dark:bg-[#151617] text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {connectedNotice && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs border border-indigo-200 dark:border-indigo-900">
              {connectedNotice}
            </div>
          )}

          {/* Privacy & Zero-Retention Security Architecture */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200 dark:border-[#2f3134] text-xs space-y-2">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Data Protection & Client-Side Inference Guarantee</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              When connected to live credentials, tokens are stored solely in secure HTTP-only cookies or encrypted local storage. Emails are parsed and classified locally on-device: <strong>no email bodies or recipient lists are logged, retained, or stored on remote classification servers.</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200/80 dark:border-[#2b2c2e] bg-slate-50 dark:bg-[#151617] flex justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
