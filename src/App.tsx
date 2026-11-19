import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Email,
  EmailCategory,
  SystemFolder,
  ClassifierRule,
  ClassifierSettings,
  UndoAction
} from './types';
import {
  loadEmails,
  saveEmails,
  loadRules,
  saveRules,
  loadSettings,
  saveSettings,
  resetAllData
} from './utils/storage';
import { classifyEmail } from './utils/classifierEngine';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import { SettingsModal } from './components/SettingsModal';
import { ConnectAccountModal } from './components/ConnectAccountModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { NewEmailModal } from './components/NewEmailModal';
import { UndoToast } from './components/UndoToast';

export function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aethermail_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aethermail_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aethermail_theme', 'light');
    }
  }, [isDarkMode]);

  // Data states
  const [emails, setEmails] = useState<Email[]>(() => loadEmails());
  const [rules, setRules] = useState<ClassifierRule[]>(() => loadRules());
  const [settings, setSettings] = useState<ClassifierSettings>(() => loadSettings());

  // Navigation & selection
  const [currentCategory, setCurrentCategory] = useState<EmailCategory | 'all'>('all');
  const [currentFolder, setCurrentFolder] = useState<SystemFolder | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'preferences' | 'rules' | 'blocked' | 'notifications' | 'playground'>('preferences');
  const [prefilledRule, setPrefilledRule] = useState<{ senderEmail: string; category: EmailCategory } | null>(null);

  // Undo state
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  // Save changes to persistence
  useEffect(() => {
    saveEmails(emails);
  }, [emails]);

  useEffect(() => {
    saveRules(rules);
  }, [rules]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Subtle Web Audio chime for sound notifications
  const playChime = useCallback((type: 'success' | 'alert') => {
    if (!settings.notificationSounds) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 0.2);
      }
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.26);
    } catch {
      // AudioContext muted/unsupported
    }
  }, [settings.notificationSounds]);

  // Push undo action helper
  const recordUndo = useCallback((message: string, actionType: UndoAction['actionType']) => {
    setUndoAction({
      id: Math.random().toString(),
      message,
      timestamp: Date.now(),
      actionType,
      previousState: { emails: JSON.parse(JSON.stringify(emails)) }
    });
  }, [emails]);

  const handleUndo = useCallback(() => {
    if (!undoAction) return;
    setEmails(undoAction.previousState.emails);
    setUndoAction(null);
    playChime('success');
  }, [undoAction, playChime]);

  // Re-classify all messages with current rules & settings
  const handleReclassifyAll = useCallback(() => {
    const updated = emails.map(email => {
      // If user explicitly manually marked, we respect their override unless re-evaluated
      const newClassification = classifyEmail(
        {
          senderEmail: email.sender.email,
          senderName: email.sender.name,
          subject: email.subject,
          body: email.bodyText,
          spf: email.classification.authResults.spf,
          dkim: email.classification.authResults.dkim,
          dmarc: email.classification.authResults.dmarc
        },
        rules,
        settings
      );
      return {
        ...email,
        category: newClassification.category,
        classification: newClassification
      };
    });
    setEmails(updated);
    playChime('success');
  }, [emails, rules, settings, playChime]);

  // Filtered emails computation
  const filteredEmails = useMemo(() => {
    let result = emails;

    // Filter by Folder first
    if (currentFolder === 'starred') {
      result = result.filter(e => e.isStarred && !e.isDeleted);
    } else if (currentFolder === 'archive') {
      result = result.filter(e => e.isArchived && !e.isDeleted);
    } else if (currentFolder === 'trash') {
      result = result.filter(e => e.isDeleted);
    } else {
      // Standard inbox views (not archived, not deleted)
      result = result.filter(e => !e.isArchived && !e.isDeleted);

      if (currentCategory !== 'all') {
        result = result.filter(e => e.category === currentCategory);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(e =>
        e.subject.toLowerCase().includes(q) ||
        e.sender.name.toLowerCase().includes(q) ||
        e.sender.email.toLowerCase().includes(q) ||
        e.snippet.toLowerCase().includes(q) ||
        e.classification.detectedKeywords.some(k => k.toLowerCase().includes(q)) ||
        e.classification.signals.some(s => s.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [emails, currentFolder, currentCategory, searchQuery]);

  // Counts calculation
  const counts = useMemo(() => {
    const active = emails.filter(e => !e.isArchived && !e.isDeleted);
    return {
      all: active.length,
      allUnread: active.filter(e => !e.isRead).length,
      spam: active.filter(e => e.category === 'spam').length,
      spamUnread: active.filter(e => e.category === 'spam' && !e.isRead).length,
      promotions: active.filter(e => e.category === 'promotions').length,
      promotionsUnread: active.filter(e => e.category === 'promotions' && !e.isRead).length,
      other: active.filter(e => e.category === 'other').length,
      otherUnread: active.filter(e => e.category === 'other' && !e.isRead).length,
      starred: emails.filter(e => e.isStarred && !e.isDeleted).length,
      archive: emails.filter(e => e.isArchived && !e.isDeleted).length,
      trash: emails.filter(e => e.isDeleted).length,
    };
  }, [emails]);

  // Selected email reference
  const selectedEmail = useMemo(() => {
    return emails.find(e => e.id === selectedEmailId) || null;
  }, [emails, selectedEmailId]);

  // Selection handlers
  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    // Auto-mark as read
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isRead: true } : e));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredEmails.map(e => e.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Move Category Action
  const handleMoveCategory = (id: string, newCategory: EmailCategory) => {
    recordUndo(`Moved message to ${newCategory}`, 'move');
    setEmails(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          category: newCategory,
          classification: {
            ...e.classification,
            category: newCategory,
            userOverridden: true,
            detailedExplanation: `Manually re-categorized as ${newCategory} by user.`
          }
        };
      }
      return e;
    }));
    playChime('success');
  };

  // Bulk Move Category Action
  const handleBulkMoveCategory = (newCategory: EmailCategory) => {
    if (selectedIds.length === 0) return;
    recordUndo(`Moved ${selectedIds.length} messages to ${newCategory}`, 'bulk_move');
    setEmails(prev => prev.map(e => {
      if (selectedIds.includes(e.id)) {
        return {
          ...e,
          category: newCategory,
          classification: {
            ...e.classification,
            category: newCategory,
            userOverridden: true
          }
        };
      }
      return e;
    }));
    setSelectedIds([]);
    playChime('success');
  };

  // Star Toggle
  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmails(prev => prev.map(item => item.id === id ? { ...item, isStarred: !item.isStarred } : item));
  };

  // Read Toggle
  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmails(prev => prev.map(item => item.id === id ? { ...item, isRead: !item.isRead } : item));
  };

  // Archive
  const handleArchive = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    recordUndo('Message archived', 'archive');
    setEmails(prev => prev.map(item => item.id === id ? { ...item, isArchived: true } : item));
    if (selectedEmailId === id) setSelectedEmailId(null);
    playChime('success');
  };

  // Bulk Archive
  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    recordUndo(`Archived ${selectedIds.length} messages`, 'archive');
    setEmails(prev => prev.map(item => selectedIds.includes(item.id) ? { ...item, isArchived: true } : item));
    setSelectedIds([]);
    playChime('success');
  };

  // Delete
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    recordUndo('Message moved to Trash', 'delete');
    setEmails(prev => prev.map(item => item.id === id ? { ...item, isDeleted: true } : item));
    if (selectedEmailId === id) setSelectedEmailId(null);
    playChime('alert');
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    recordUndo(`Moved ${selectedIds.length} messages to Trash`, 'delete');
    setEmails(prev => prev.map(item => selectedIds.includes(item.id) ? { ...item, isDeleted: true } : item));
    setSelectedIds([]);
    playChime('alert');
  };

  // Bulk Mark Read
  const handleBulkMarkRead = (read: boolean) => {
    if (selectedIds.length === 0) return;
    setEmails(prev => prev.map(item => selectedIds.includes(item.id) ? { ...item, isRead: read } : item));
    setSelectedIds([]);
  };

  // Bulk Star
  const handleBulkStar = () => {
    if (selectedIds.length === 0) return;
    setEmails(prev => prev.map(item => selectedIds.includes(item.id) ? { ...item, isStarred: true } : item));
    setSelectedIds([]);
  };

  // Receive simulated email
  const handleReceiveEmail = (newEmailData: Omit<Email, 'id' | 'originalCategory' | 'classification' | 'isArchived' | 'isDeleted'>) => {
    const classification = classifyEmail(
      {
        senderEmail: newEmailData.sender.email,
        senderName: newEmailData.sender.name,
        subject: newEmailData.subject,
        body: newEmailData.bodyText,
      },
      rules,
      settings
    );

    const newEmail: Email = {
      ...newEmailData,
      id: `msg-${Date.now()}`,
      category: classification.category,
      originalCategory: classification.category,
      classification,
      isArchived: settings.autoArchiveHighConfidenceSpam && classification.category === 'spam' && classification.confidence >= 95,
      isDeleted: false
    };

    setEmails(prev => [newEmail, ...prev]);
    setSelectedEmailId(newEmail.id);
    playChime(classification.category === 'spam' ? 'alert' : 'success');
  };

  // Create rule for sender shortcut
  const handleCreateRuleForSender = (senderEmail: string, category: EmailCategory) => {
    setPrefilledRule({ senderEmail, category });
    setIsSettingsOpen(true);
  };

  // Rule operations
  const handleAddRule = (ruleData: Omit<ClassifierRule, 'id' | 'createdAt'>) => {
    const newRule: ClassifierRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setRules(prev => [newRule, ...prev]);
    // Immediately re-run classifier with new rule
    setTimeout(() => handleReclassifyAll(), 50);
  };

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    setTimeout(() => handleReclassifyAll(), 50);
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    setTimeout(() => handleReclassifyAll(), 50);
  };

  // Reset demo data
  const handleResetData = () => {
    if (confirm('Reset all emails, rules, and settings to original demo dataset?')) {
      const reset = resetAllData();
      setEmails(reset.emails);
      setRules(reset.rules);
      setSettings(reset.settings);
      setSelectedEmailId(null);
      setSelectedIds([]);
      playChime('success');
    }
  };

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key === 'Escape') {
        if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isConnectOpen) setIsConnectOpen(false);
        else if (isShortcutsOpen) setIsShortcutsOpen(false);
        else if (isComposeOpen) setIsComposeOpen(false);
        else if (selectedEmailId) setSelectedEmailId(null);
        else if (selectedIds.length > 0) setSelectedIds([]);
      } else if (e.key === 'z' || (e.metaKey && e.key === 'z') || (e.ctrlKey && e.key === 'z')) {
        handleUndo();
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredEmails.length === 0) return;
        const currentIndex = filteredEmails.findIndex(m => m.id === selectedEmailId);
        const nextIndex = currentIndex < filteredEmails.length - 1 ? currentIndex + 1 : 0;
        handleSelectEmail(filteredEmails[nextIndex].id);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredEmails.length === 0) return;
        const currentIndex = filteredEmails.findIndex(m => m.id === selectedEmailId);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredEmails.length - 1;
        handleSelectEmail(filteredEmails[prevIndex].id);
      } else if (e.key === 'x') {
        if (selectedEmailId) {
          handleToggleSelect(selectedEmailId);
        }
      } else if (e.key === 'e') {
        if (selectedIds.length > 0) handleBulkArchive();
        else if (selectedEmailId) handleArchive(selectedEmailId);
      } else if (e.key === '#' || e.key === 'Delete') {
        if (selectedIds.length > 0) handleBulkDelete();
        else if (selectedEmailId) handleDelete(selectedEmailId);
      } else if (e.key === 's') {
        if (selectedEmailId) handleToggleStar(selectedEmailId);
      } else if (e.key === 'u') {
        if (selectedEmailId) handleToggleRead(selectedEmailId);
      } else if (e.key === '!') {
        if (selectedEmailId) handleMoveCategory(selectedEmailId, 'spam');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    filteredEmails,
    selectedEmailId,
    selectedIds,
    isSettingsOpen,
    isConnectOpen,
    isShortcutsOpen,
    isComposeOpen,
    handleUndo
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-[#131314] text-slate-800 dark:text-slate-100">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setCurrentFolder(null);
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenSettings={() => {
          setPrefilledRule(null);
          setSettingsInitialTab('preferences');
          setIsSettingsOpen(true);
        }}
        onOpenConnect={() => setIsConnectOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenPlayground={() => {
          setPrefilledRule(null);
          setSettingsInitialTab('playground');
          setIsSettingsOpen(true);
        }}
        onOpenCompose={() => setIsComposeOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentCategory={currentCategory}
          currentFolder={currentFolder}
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            setCurrentFolder(null);
            setSelectedEmailId(null);
          }}
          onSelectFolder={(f) => {
            setCurrentFolder(f);
            setSelectedEmailId(null);
          }}
          counts={counts}
          rulesCount={rules.filter(r => r.enabled).length}
          onOpenSettings={() => {
            setPrefilledRule(null);
            setSettingsInitialTab('rules');
            setIsSettingsOpen(true);
          }}
          onOpenCompose={() => setIsComposeOpen(true)}
          onOpenPlayground={() => {
            setPrefilledRule(null);
            setSettingsInitialTab('playground');
            setIsSettingsOpen(true);
          }}
        />

        {/* Email List Column */}
        <div className={`h-full flex flex-col border-r border-slate-200/80 dark:border-[#2b2c2e] transition-all ${
          selectedEmailId
            ? 'hidden md:flex md:w-5/12 lg:w-4/12'
            : 'flex w-full md:w-5/12 lg:w-4/12'
        }`}>
          <EmailList
            emails={filteredEmails}
            selectedEmailId={selectedEmailId}
            onSelectEmail={handleSelectEmail}
            currentCategory={currentCategory}
            currentFolder={currentFolder}
            onSelectCategory={(cat) => {
              setCurrentCategory(cat);
              setCurrentFolder(null);
            }}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onBulkMoveCategory={handleBulkMoveCategory}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
            onBulkMarkRead={handleBulkMarkRead}
            onBulkStar={handleBulkStar}
            onToggleStar={handleToggleStar}
            onQuickArchive={handleArchive}
            onQuickDelete={handleDelete}
            onQuickToggleRead={handleToggleRead}
            searchQuery={searchQuery}
          />
        </div>

        {/* Email Detail Column */}
        <div className={`h-full flex-1 flex flex-col overflow-hidden bg-slate-50/20 dark:bg-[#131314] ${
          selectedEmailId ? 'flex' : 'hidden md:flex'
        }`}>
          <EmailDetail
            email={selectedEmail}
            onBack={() => setSelectedEmailId(null)}
            onMoveCategory={handleMoveCategory}
            onToggleStar={(id) => handleToggleStar(id)}
            onToggleRead={(id) => handleToggleRead(id)}
            onArchive={(id) => handleArchive(id)}
            onDelete={(id) => handleDelete(id)}
            onCreateRuleForSender={handleCreateRuleForSender}
          />
        </div>
      </div>

      {/* Undo Action Toast */}
      <UndoToast
        action={undoAction}
        onUndo={handleUndo}
        onDismiss={() => setUndoAction(null)}
      />

      {/* Settings & Rules Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        rules={rules}
        onAddRule={handleAddRule}
        onToggleRule={handleToggleRule}
        onDeleteRule={handleDeleteRule}
        onReclassifyAll={handleReclassifyAll}
        initialTab={settingsInitialTab}
        prefilledRule={prefilledRule}
      />

      {/* Connect Account / Architecture Modal */}
      <ConnectAccountModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Simulate Inbound Email Modal */}
      <NewEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onReceiveEmail={handleReceiveEmail}
      />
    </div>
  );
}

export default App;
