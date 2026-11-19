import { Email, ClassifierRule, ClassifierSettings } from '../types';
import { generateInitialEmails } from '../data/mockEmails';

const EMAILS_KEY = 'aethermail_emails_v1';
const RULES_KEY = 'aethermail_rules_v1';
const SETTINGS_KEY = 'aethermail_settings_v1';

export const DEFAULT_RULES: ClassifierRule[] = [
  {
    id: 'rule-default-1',
    name: 'Auto-route GitHub to Other',
    field: 'domain',
    operator: 'contains',
    value: 'github.com',
    targetCategory: 'other',
    enabled: true,
    createdAt: '2026-11-01T00:00:00.000Z'
  },
  {
    id: 'rule-default-2',
    name: 'Auto-route Invoices to Other',
    field: 'subject',
    operator: 'contains',
    value: 'invoice',
    targetCategory: 'other',
    enabled: true,
    createdAt: '2026-11-01T00:00:00.000Z'
  },
  {
    id: 'rule-default-3',
    name: 'Auto-flag Suspicious Domains (.xyz)',
    field: 'domain',
    operator: 'ends_with',
    value: '.xyz',
    targetCategory: 'spam',
    enabled: true,
    createdAt: '2026-11-01T00:00:00.000Z'
  }
];

export const DEFAULT_SETTINGS: ClassifierSettings = {
  spamSensitivity: 'balanced',
  promoSensitivity: 'balanced',
  autoArchiveHighConfidenceSpam: false,
  autoBlockPhishingSenders: true,
  explainabilityLevel: 'detailed',
  blockedSenders: ['spammer-network@badactors.com', 'prizes@unsolicited-giveaway.top'],
  allowlistedSenders: ['boss@company.com', 'billing@stripe.com'],
  notificationSounds: true,
  highConfidenceAlerts: true,
  dailyDigest: false,
  theme: 'system'
};

export function loadEmails(): Email[] {
  try {
    const saved = localStorage.getItem(EMAILS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load emails from storage', err);
  }
  const initial = generateInitialEmails();
  saveEmails(initial);
  return initial;
}

export function saveEmails(emails: Email[]): void {
  try {
    localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
  } catch (err) {
    console.error('Failed to save emails to storage', err);
  }
}

export function loadRules(): ClassifierRule[] {
  try {
    const saved = localStorage.getItem(RULES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load rules from storage', err);
  }
  saveRules(DEFAULT_RULES);
  return DEFAULT_RULES;
}

export function saveRules(rules: ClassifierRule[]): void {
  try {
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to save rules to storage', err);
  }
}

export function loadSettings(): ClassifierSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to load settings from storage', err);
  }
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ClassifierSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to storage', err);
  }
}

export function resetAllData(): { emails: Email[]; rules: ClassifierRule[]; settings: ClassifierSettings } {
  localStorage.removeItem(EMAILS_KEY);
  localStorage.removeItem(RULES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  const emails = generateInitialEmails();
  saveEmails(emails);
  saveRules(DEFAULT_RULES);
  saveSettings(DEFAULT_SETTINGS);
  return { emails, rules: DEFAULT_RULES, settings: DEFAULT_SETTINGS };
}
