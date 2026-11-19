export type EmailCategory = 'spam' | 'promotions' | 'other';

export type SystemFolder = 'inbox' | 'starred' | 'archive' | 'trash';

export type SensitivityLevel = 'relaxed' | 'balanced' | 'aggressive';

export interface ClassificationSignal {
  id: string;
  name: string;
  type: 'spam_signal' | 'promo_signal' | 'safe_signal' | 'neutral';
  weight: number; // e.g., +35 or -20
  description: string;
  matchedText?: string;
}

export interface ClassificationDetail {
  category: EmailCategory;
  confidence: number; // 0 - 100 percentage
  primaryReason: string;
  detailedExplanation: string;
  signals: ClassificationSignal[];
  categoryProbabilities: {
    spam: number;
    promotions: number;
    other: number;
  };
  detectedKeywords: string[];
  senderReputation: 'high_trust' | 'verified_business' | 'suspicious' | 'unknown';
  authResults: {
    spf: 'pass' | 'fail' | 'none';
    dkim: 'pass' | 'fail' | 'none';
    dmarc: 'pass' | 'fail' | 'none';
  };
  matchedRuleId?: string;
  userOverridden?: boolean;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  iconType: 'document' | 'image' | 'archive' | 'code';
}

export interface Email {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  recipient: {
    name: string;
    email: string;
  };
  subject: string;
  snippet: string;
  bodyHtml: string;
  bodyText: string;
  rawHeaders: string;
  date: string; // ISO string
  category: EmailCategory;
  originalCategory: EmailCategory;
  classification: ClassificationDetail;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  tags: string[];
}

export interface ClassifierRule {
  id: string;
  name: string;
  field: 'sender' | 'subject' | 'body' | 'domain';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with';
  value: string;
  targetCategory: EmailCategory;
  enabled: boolean;
  createdAt: string;
}

export interface ClassifierSettings {
  spamSensitivity: SensitivityLevel;
  promoSensitivity: SensitivityLevel;
  autoArchiveHighConfidenceSpam: boolean;
  autoBlockPhishingSenders: boolean;
  explainabilityLevel: 'concise' | 'detailed' | 'debug';
  blockedSenders: string[];
  allowlistedSenders: string[];
  notificationSounds: boolean;
  highConfidenceAlerts: boolean;
  dailyDigest: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UndoAction {
  id: string;
  message: string;
  timestamp: number;
  actionType: 'move' | 'archive' | 'delete' | 'mark_spam' | 'mark_read' | 'bulk_move';
  previousState: {
    emails: Email[];
  };
}
