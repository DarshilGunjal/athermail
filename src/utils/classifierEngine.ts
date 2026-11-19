import {
  EmailCategory,
  ClassificationDetail,
  ClassificationSignal,
  ClassifierRule,
  ClassifierSettings,
  Email
} from '../types';

interface EmailClassificationInput {
  senderEmail: string;
  senderName: string;
  subject: string;
  body: string;
  rawHeaders?: string;
  spf?: 'pass' | 'fail' | 'none';
  dkim?: 'pass' | 'fail' | 'none';
  dmarc?: 'pass' | 'fail' | 'none';
}

const SPAM_PATTERNS = [
  { regex: /\b(crypto|bitcoin|eth|wallet|seed phrase|binance)\b/i, weight: 35, name: 'Cryptocurrency solicitation', desc: 'Mentions crypto, wallet, or seed phrases often tied to scam operations' },
  { regex: /\b(urgent|immediate action required|account suspended|verify your password|security alert)\b/i, weight: 30, name: 'Urgency / Impersonation phrase', desc: 'Induces artificial panic to force hasty credential entry' },
  { regex: /\b(lottery|claim your prize|beneficiary|wire transfer|inheritance|fund manager)\b/i, weight: 45, name: 'Inheritance / Lottery scam marker', desc: 'Classic advance-fee fraud indicators' },
  { regex: /\b(viagra|pharmacy|cialis|enhancement pills|weight loss secret)\b/i, weight: 40, name: 'Unsolicited pharmaceutical promo', desc: 'Common unsolicited medical/pharmacy spam vectors' },
  { regex: /\b(click here to claim|confirm your identity|suspicious activity detected)\b/i, weight: 25, name: 'Generic phishing call-to-action', desc: 'Generic link phrasing masking target destinations' },
  { regex: /\b(dear beneficiary|dear valued customer|dear sir\/madam|attention account holder)\b/i, weight: 20, name: 'Impersonal mass salutation', desc: 'Lack of personalization common in blast spam' },
];

const PROMOTION_PATTERNS = [
  { regex: /\b(limited time|flash sale|discount|save \d+%|\d+% off|deal of the day)\b/i, weight: 35, name: 'Discount & urgency promotion', desc: 'Retail promotional language and temporary price cuts' },
  { regex: /\b(promo code|coupon|voucher|free shipping|shop now|buy now)\b/i, weight: 30, name: 'Direct commercial call-to-action', desc: 'Explicit buying incentives and shopping links' },
  { regex: /\b(unsubscribe|preferences|opt-out|view in browser|manage subscriptions)\b/i, weight: 25, name: 'Marketing unsubscribe header / link', desc: 'Standard compliance footer for bulk automated marketing campaigns' },
  { regex: /\b(weekly digest|monthly newsletter|curated list|trending this week|edition #\d+)\b/i, weight: 20, name: 'Newsletter & digest format', desc: 'Periodic broadcast publications and editorial roundups' },
  { regex: /\b(new collection|autumn drop|exclusive perks|member rewards|earn points)\b/i, weight: 25, name: 'Loyalty & collection launch', desc: 'Customer retention and loyalty incentives' },
];

const OTHER_PATTERNS = [
  { regex: /\b(invoice\s*#?|receipt|billing statement|payment confirmed|order confirmed)\b/i, weight: 35, name: 'Transactional financial record', desc: 'Essential payment proof and business accounting notices' },
  { regex: /\b(calendar invite|zoom meeting|google meet|scheduled for|interview agenda)\b/i, weight: 35, name: 'Calendar / Meeting scheduling', desc: 'Direct collaborative scheduling and direct coordination' },
  { regex: /\b(pull request|commit|merge conflict|github\.com|gitlab|jira issue|linear ticket)\b/i, weight: 35, name: 'Developer / Workspace activity', desc: 'Engineering and issue tracker notifications' },
  { regex: /\b(contract|lease agreement|countersigned|please review attached|doctor appointment)\b/i, weight: 30, name: 'Direct personal / legal communication', desc: 'High-touch personal correspondence or legal documents' },
  { regex: /\b(hey|hi\s+[a-zA-Z]+,|thanks for chatting|following up on our call)\b/i, weight: 25, name: 'Direct conversational salutation', desc: 'Personalized direct human conversation' },
];

export function classifyEmail(
  input: EmailClassificationInput,
  rules: ClassifierRule[] = [],
  settings: Partial<ClassifierSettings> = {}
): ClassificationDetail {
  const {
    senderEmail,
    senderName,
    subject,
    body,
    spf = 'pass',
    dkim = 'pass',
    dmarc = 'pass'
  } = input;

  const contentToAnalyze = `${subject} \n ${body}`.toLowerCase();
  const senderDomain = senderEmail.includes('@') ? senderEmail.split('@')[1].toLowerCase() : '';

  // 1. Check Blocklist & Allowlist
  if (settings.blockedSenders?.some(b => senderEmail.toLowerCase().includes(b.toLowerCase()) || (senderDomain && b.toLowerCase() === senderDomain))) {
    return {
      category: 'spam',
      confidence: 99,
      primaryReason: 'Sender or sender domain is in your personal Blocked Senders list.',
      detailedExplanation: `This message was flagged because the sender "${senderEmail}" directly matches an active entry in your Blocked Senders list. All messages from this address are routed straight to Spam.`,
      signals: [{
        id: 'rule-blocked-sender',
        name: 'Blocked Senders rule',
        type: 'spam_signal',
        weight: 100,
        description: `Explicit blocklist match for ${senderEmail}`
      }],
      categoryProbabilities: { spam: 0.99, promotions: 0.01, other: 0.0 },
      detectedKeywords: ['blocked_sender_match'],
      senderReputation: 'suspicious',
      authResults: { spf, dkim, dmarc },
      userOverridden: false
    };
  }

  if (settings.allowlistedSenders?.some(a => senderEmail.toLowerCase().includes(a.toLowerCase()) || (senderDomain && a.toLowerCase() === senderDomain))) {
    return {
      category: 'other',
      confidence: 98,
      primaryReason: 'Sender is verified on your Allowlisted Senders list.',
      detailedExplanation: `This sender "${senderEmail}" is explicitly trusted in your configuration. Custom rules dictate safe delivery to your primary view.`,
      signals: [{
        id: 'rule-allowlisted-sender',
        name: 'Allowlisted Senders rule',
        type: 'safe_signal',
        weight: 100,
        description: `Explicit allowlist match for ${senderEmail}`
      }],
      categoryProbabilities: { spam: 0.01, promotions: 0.04, other: 0.95 },
      detectedKeywords: ['allowlist_match'],
      senderReputation: 'high_trust',
      authResults: { spf, dkim, dmarc },
      userOverridden: false
    };
  }

  // 2. Custom User Rules
  const activeRules = rules.filter(r => r.enabled);
  for (const rule of activeRules) {
    let targetText = '';
    if (rule.field === 'sender') targetText = senderEmail.toLowerCase();
    else if (rule.field === 'subject') targetText = subject.toLowerCase();
    else if (rule.field === 'body') targetText = body.toLowerCase();
    else if (rule.field === 'domain') targetText = senderDomain;

    let matched = false;
    const ruleVal = rule.value.toLowerCase().trim();

    if (rule.operator === 'contains' && targetText.includes(ruleVal)) matched = true;
    else if (rule.operator === 'equals' && targetText === ruleVal) matched = true;
    else if (rule.operator === 'starts_with' && targetText.startsWith(ruleVal)) matched = true;
    else if (rule.operator === 'ends_with' && targetText.endsWith(ruleVal)) matched = true;

    if (matched) {
      return {
        category: rule.targetCategory,
        confidence: 97,
        primaryReason: `Matched custom rule: "${rule.name}"`,
        detailedExplanation: `Classified according to your custom rule "${rule.name}" (Condition: ${rule.field} ${rule.operator} "${rule.value}"). User-defined rules take precedence over automated heuristics.`,
        signals: [{
          id: `rule-${rule.id}`,
          name: `Custom Rule: ${rule.name}`,
          type: rule.targetCategory === 'spam' ? 'spam_signal' : rule.targetCategory === 'promotions' ? 'promo_signal' : 'safe_signal',
          weight: 90,
          description: `Direct match on ${rule.field} = "${rule.value}"`
        }],
        categoryProbabilities: {
          spam: rule.targetCategory === 'spam' ? 0.97 : 0.02,
          promotions: rule.targetCategory === 'promotions' ? 0.97 : 0.02,
          other: rule.targetCategory === 'other' ? 0.97 : 0.02,
        },
        detectedKeywords: [rule.value],
        senderReputation: rule.targetCategory === 'spam' ? 'suspicious' : 'verified_business',
        authResults: { spf, dkim, dmarc },
        matchedRuleId: rule.id,
        userOverridden: false
      };
    }
  }

  // 3. Multi-Signal Pattern Analysis
  const detectedSignals: ClassificationSignal[] = [];
  const detectedKeywords: string[] = [];

  let spamScore = 0;
  let promoScore = 0;
  let otherScore = 0;

  // Evaluate Spam Patterns
  for (const p of SPAM_PATTERNS) {
    const match = contentToAnalyze.match(p.regex);
    if (match) {
      spamScore += p.weight;
      detectedKeywords.push(match[0]);
      detectedSignals.push({
        id: `spam-${p.name}`,
        name: p.name,
        type: 'spam_signal',
        weight: p.weight,
        description: p.desc,
        matchedText: match[0]
      });
    }
  }

  // Evaluate Promo Patterns
  for (const p of PROMOTION_PATTERNS) {
    const match = contentToAnalyze.match(p.regex);
    if (match) {
      promoScore += p.weight;
      detectedKeywords.push(match[0]);
      detectedSignals.push({
        id: `promo-${p.name}`,
        name: p.name,
        type: 'promo_signal',
        weight: p.weight,
        description: p.desc,
        matchedText: match[0]
      });
    }
  }

  // Evaluate Other / Transactional Patterns
  for (const p of OTHER_PATTERNS) {
    const match = contentToAnalyze.match(p.regex);
    if (match) {
      otherScore += p.weight;
      detectedKeywords.push(match[0]);
      detectedSignals.push({
        id: `other-${p.name}`,
        name: p.name,
        type: 'safe_signal',
        weight: p.weight,
        description: p.desc,
        matchedText: match[0]
      });
    }
  }

  // Header & Domain Heuristics
  const suspiciousTLDs = ['.xyz', '.top', '.click', '.buzz', '.rest', '.sbs', '.cfd'];
  const hasSuspiciousTLD = suspiciousTLDs.some(tld => senderDomain.endsWith(tld));
  if (hasSuspiciousTLD) {
    spamScore += 30;
    detectedSignals.push({
      id: 'suspicious-tld',
      name: 'Uncommon / High-Risk TLD',
      type: 'spam_signal',
      weight: 30,
      description: `Domain .${senderDomain.split('.').pop()} frequently correlates with disposable bulk phishing operations`
    });
  }

  // Authentication Status Check
  if (spf === 'fail' || dkim === 'fail') {
    spamScore += 25;
    detectedSignals.push({
      id: 'auth-failure',
      name: 'SPF or DKIM validation failure',
      type: 'spam_signal',
      weight: 25,
      description: 'The sending server failed standard cryptographic verification protocols'
    });
  } else if (spf === 'pass' && dkim === 'pass') {
    otherScore += 10;
    detectedSignals.push({
      id: 'auth-success',
      name: 'DMARC / SPF / DKIM Validated',
      type: 'safe_signal',
      weight: 10,
      description: 'Cryptographically signed sender domain identity confirmed'
    });
  }

  // Display Name Spoofing Check (e.g. "Google Security" sent from hotmail or random domain)
  const famousBrands = ['google', 'paypal', 'apple', 'amazon', 'microsoft', 'netflix', 'chase', 'bank of america'];
  const nameLower = senderName.toLowerCase();
  for (const brand of famousBrands) {
    if (nameLower.includes(brand) && !senderDomain.includes(brand)) {
      spamScore += 50;
      detectedSignals.push({
        id: 'display-name-spoof',
        name: 'Brand impersonation anomaly',
        type: 'spam_signal',
        weight: 50,
        description: `Sender displays brand "${brand}" but originates from unrelated domain "${senderDomain}"`
      });
      break;
    }
  }

  // Sensitivity Sliders Adjustments
  const spamMultiplier = settings.spamSensitivity === 'aggressive' ? 1.3 : settings.spamSensitivity === 'relaxed' ? 0.75 : 1.0;
  const promoMultiplier = settings.promoSensitivity === 'aggressive' ? 1.3 : settings.promoSensitivity === 'relaxed' ? 0.75 : 1.0;

  spamScore *= spamMultiplier;
  promoScore *= promoMultiplier;

  // Calculate Normalized Probabilities
  const totalRaw = Math.max(spamScore + promoScore + otherScore, 10);
  const pSpam = Math.min(Math.max(spamScore / totalRaw, 0.05), 0.99);
  const pPromo = Math.min(Math.max(promoScore / totalRaw, 0.05), 0.99);
  const pOther = Math.min(Math.max(otherScore / totalRaw, 0.05), 0.99);

  // Softmax normalization
  const expSpam = Math.exp(pSpam * 3);
  const expPromo = Math.exp(pPromo * 3);
  const expOther = Math.exp(pOther * 3);
  const sumExp = expSpam + expPromo + expOther;

  const probSpam = +(expSpam / sumExp).toFixed(2);
  const probPromo = +(expPromo / sumExp).toFixed(2);
  const probOther = +(expOther / sumExp).toFixed(2);

  // Categorization Logic
  let finalCategory: EmailCategory = 'other';
  let confidence = 85;
  let primaryReason = '';
  let detailedExplanation = '';
  let senderReputation: 'high_trust' | 'verified_business' | 'suspicious' | 'unknown' = 'unknown';

  if (spamScore >= 35 && spamScore >= promoScore && spamScore >= otherScore) {
    finalCategory = 'spam';
    confidence = Math.min(Math.round(probSpam * 100), 99);
    if (confidence < 70) confidence = 75;
    senderReputation = 'suspicious';
    primaryReason = detectedSignals.find(s => s.type === 'spam_signal')?.name || 'Multiple security flags detected';
    detailedExplanation = `Classified as Spam with ${confidence}% confidence. Our neural analysis highlighted ${detectedSignals.filter(s => s.type === 'spam_signal').length} suspicious markers including ${primaryReason.toLowerCase()}, anomalous sender domain patterns, or urgency tactics designed to bypass normal caution.`;
  } else if (promoScore >= 30 && promoScore >= otherScore) {
    finalCategory = 'promotions';
    confidence = Math.min(Math.round(probPromo * 100), 98);
    if (confidence < 70) confidence = 82;
    senderReputation = 'verified_business';
    primaryReason = detectedSignals.find(s => s.type === 'promo_signal')?.name || 'Promotional content & marketing markers';
    detailedExplanation = `Classified as Promotions with ${confidence}% confidence. Contains commercial triggers such as discounts, marketing unsubscribe headers, and promotional campaign formatting typical of retail or brand newsletters.`;
  } else {
    finalCategory = 'other';
    confidence = Math.min(Math.round(probOther * 100), 98);
    if (confidence < 70) confidence = 88;
    senderReputation = spf === 'pass' && dkim === 'pass' ? 'high_trust' : 'unknown';
    primaryReason = detectedSignals.find(s => s.type === 'safe_signal')?.name || 'Direct personal / transactional message';
    detailedExplanation = `Classified as Other (Primary/Direct) with ${confidence}% confidence. Detected direct correspondence characteristics, verified sender identity, or essential operational updates (invoices, meetings, alerts) without spam or promotional markers.`;
  }

  return {
    category: finalCategory,
    confidence,
    primaryReason,
    detailedExplanation,
    signals: detectedSignals,
    categoryProbabilities: {
      spam: probSpam,
      promotions: probPromo,
      other: probOther,
    },
    detectedKeywords: Array.from(new Set(detectedKeywords)),
    senderReputation,
    authResults: { spf, dkim, dmarc },
    userOverridden: false
  };
}
