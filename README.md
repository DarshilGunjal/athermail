# AetherMail — Intelligent Email Classifier

A responsive, production-minded email classification application inspired by the conversational clarity and visual simplicity of Google Gemini. It automatically categorizes inbound messages into **Spam**, **Promotions**, and **Other**, providing transparent AI confidence scoring, explainability breakdowns, custom rule engines, and instant undo actions.

---

## 🌟 Key Highlights

### 1. Intelligent Tri-Category Organization
- **Spam**: High-risk phishing lures, advance-fee scams, crypto solicitations, brand impersonation, and SPF/DKIM authentication failures.
- **Promotions**: Retail discount campaigns, marketing newsletters, product release digests, coupon codes, and bulk unsubscribe headers.
- **Other (Primary / Direct)**: Transactional receipts, calendar invitations, developer alerts, medical appointments, and direct personal/work correspondence.

### 2. Conversational Gemini-Inspired Explainability
- **Confidence Score Gauge**: Accurate neural confidence metrics (e.g., `96% Spam`, `92% Promo`, `98% Other`).
- **Plain-English Reasoning**: Gemini-style conversational explanations detailing why an email was classified into its category.
- **Signal Breakdown Tags**: Visual point-impact indicators displaying detected triggers (e.g., `+35 Cryptographic Phishing Marker`, `+30 Urgency Panic Language`, `-10 DMARC Validated`).
- **One-Click Teach & Rule Creation**: Directly converts feedback into persistent custom rules for a sender or domain.

### 3. Complete Mailbox Experience
- **Search & Filters**: Instant full-text search across senders, subjects, bodies, and AI signals, with filter chips (`Unread only`, `Files`, `≥ 90% Confidence`) and sorting.
- **Bulk Selection & Actions**: Multi-select support with floating bulk action toolbar (Move to Spam/Promo/Other, Mark Read/Unread, Star, Archive, Delete).
- **Detail View**: Full email header, security indicators (SPF, DKIM, DMARC), tabbed content viewer (**Rendered HTML**, **Plain Text**, and **Raw MIME Headers**), attachment downloads, and interactive quick-reply box.
- **Instant Undo System**: Floating toast with animated 6-second countdown bar allowing immediate reversal of moves, archives, deletes, and category changes.

### 4. Custom Rules & Sensitivity Controls
- **Sensitivity Sliders**: Tune Spam and Promotions thresholds between *Relaxed*, *Balanced*, and *Aggressive*.
- **Rules Engine**: Create user-defined rules on `Sender`, `Subject`, `Body`, or `Domain` with operators `contains`, `equals`, `starts_with`, and `ends_with`.
- **Blocked & Allowlisted Senders**: Instant routing override for blacklisted spam domains or allowlisted VIPs.
- **Real-Time AI Playground**: Test arbitrary email text in real time to observe live categorization and signal weights.
- **Simulate Inbound Email**: Inject custom or preset messages (Phishing, Flash Sale, Work Brief) to watch live automated triage.

### 5. Production-Minded Security Architecture
- **Client-Side Privacy**: Runs Bayesian & heuristic multi-signal analysis locally in the browser. Zero email content or recipient metadata is transmitted to external servers.
- **Clear Demo Separation**: Distinguishes the interactive offline demo from live OAuth (Google Workspace `gmail.modify`, Microsoft Graph `Mail.ReadWrite`) and IMAP/SMTP TLS integrations.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (tested on v24.16.0)
- **npm** v9+

### Installation & Running Locally

1. **Clone or navigate to the project directory:**
   ```bash
   cd /Users/darshilsachingunjal/mail
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Or run the optimized production preview:
   ```bash
   npm run build
   npm run preview -- --port 5173
   ```

4. **Open in your browser:**
   ```
   http://localhost:5173/
   ```

---

## ⌨️ Keyboard Shortcuts

Speed through your inbox with Gmail/Linear-style hotkeys:

| Key | Action |
| --- | --- |
| `j` / `↓` | Navigate to next message |
| `k` / `↑` | Navigate to previous message |
| `Enter` / `o` | Open selected email detail view |
| `x` | Toggle bulk select checkbox |
| `e` | Archive selected message(s) |
| `#` / `Delete` | Move selected message(s) to Trash |
| `s` | Toggle Star |
| `!` | Mark as Spam |
| `u` | Toggle Read / Unread |
| `/` | Focus search bar |
| `z` | Undo last action |
| `?` | Open keyboard shortcuts cheat sheet |
| `Esc` | Return to list / close modals |

---

## 📁 Architecture Overview

```
src/
├── types/                  # TypeScript data models and interfaces
│   └── index.ts            # Email, ClassificationDetail, Rules, Settings, Undo
├── utils/
│   ├── classifierEngine.ts # Multi-signal classification & explainability engine
│   └── storage.ts          # LocalStorage persistence & reset utilities
├── data/
│   └── mockEmails.ts       # 18+ diverse, realistic sample emails
├── components/
│   ├── Navbar.tsx          # Top bar with search, quick actions, theme toggle
│   ├── Sidebar.tsx         # Category folders, unread badges, engine status
│   ├── EmailList.tsx       # Filterable message list, bulk bar, empty/loading states
│   ├── EmailDetail.tsx     # Message header, Gemini explanation card, tabs, quick reply
│   ├── SettingsModal.tsx   # Sensitivity sliders, custom rules, playground, blocklist
│   ├── ConnectAccountModal.tsx # OAuth scopes & integration architecture modal
│   ├── NewEmailModal.tsx   # Inbound email injection & preset simulation
│   ├── ShortcutsModal.tsx  # Keyboard shortcuts modal
│   └── UndoToast.tsx       # Floating undo confirmation toast with countdown
├── App.tsx                 # Core app state orchestrator & hotkey listeners
├── main.tsx                # React DOM entry point
└── index.css               # Tailwind CSS, custom scrollbars, reduced motion queries
```

---

## 🔒 Production Setup & Real Email Integrations

To connect to live mailbox providers, the following backend endpoints and credentials are recommended:

1. **Google Workspace (Gmail API)**:
   - Create a project in Google Cloud Console with the **Gmail API** enabled.
   - Configure OAuth 2.0 Client ID with scope `https://www.googleapis.com/auth/gmail.modify`.
   - Implement authorization code exchange on your secure backend server and store refresh tokens in encrypted storage.

2. **Microsoft 365 (Microsoft Graph API)**:
   - Register an application in Azure Active Directory (Entra ID).
   - Add Microsoft Graph delegated permissions: `Mail.ReadWrite`, `User.Read`.
   - Handle OAuth 2.0 PKCE flow on the authentication gateway.

3. **Custom IMAP / SMTP over TLS**:
   - Connect via port 993 (IMAP with SSL/TLS) and port 587 (SMTP with STARTTLS).
   - Use Node.js libraries such as `node-imap` or `emailjs-imap-client` wrapped behind an authenticated WebSocket or SSE stream.
