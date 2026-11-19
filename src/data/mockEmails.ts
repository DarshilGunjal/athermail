import { Email } from '../types';
import { classifyEmail } from '../utils/classifierEngine';

interface RawEmailData {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  snippet: string;
  bodyHtml: string;
  bodyText: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  attachments?: Array<{ id: string; name: string; size: string; type: string; iconType: 'document' | 'image' | 'archive' | 'code' }>;
  tags: string[];
  spf?: 'pass' | 'fail' | 'none';
  dkim?: 'pass' | 'fail' | 'none';
  dmarc?: 'pass' | 'fail' | 'none';
}

const rawEmails: RawEmailData[] = [
  // --- SPAM EXAMPLES ---
  {
    id: 'msg-spam-01',
    senderName: 'Meta Security Desk',
    senderEmail: 'security-alert@metasupport-auth99.xyz',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'URGENT: Immediate Action Required - Account Suspended Within 24h',
    snippet: 'Suspicious activity detected on your account. Immediate action required to verify your password and identity before permanent deletion...',
    bodyHtml: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="color: #dc2626; margin-top: 0;">⚠️ Security Notice: Immediate Action Required</h2>
        <p>Dear Valued Customer,</p>
        <p>Our automated fraud detection network has flagged unauthorized access attempts originating from a foreign IP address (194.26.29.112 - Moscow, RU).</p>
        <p>To prevent immediate suspension of all linked cloud assets, you must verify your identity within <strong>24 hours</strong>.</p>
        <div style="margin: 25px 0;">
          <a href="#demo-phish-link" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Verify Your Password & Identity
          </a>
        </div>
        <p style="font-size: 13px; color: #6b7280;">Failure to confirm your credentials will result in permanent asset liquidation.</p>
        <p style="font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px;">Ref Code: SEC-9941-SUSP</p>
      </div>
    `,
    bodyText: 'Security Notice: Immediate Action Required. Dear Valued Customer, Our automated fraud detection network has flagged unauthorized access attempts. Verify your password and identity within 24 hours: https://metasupport-auth99.xyz/verify',
    date: '2026-11-18T10:15:00.000Z',
    isRead: false,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['phishing', 'urgent', 'suspicious-domain'],
    spf: 'fail',
    dkim: 'fail',
    dmarc: 'fail'
  },
  {
    id: 'msg-spam-02',
    senderName: 'Apex Binance Wealth Desk',
    senderEmail: 'claims@binance-eth-prizes.click',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Claim Your 0.45 BTC Wallet Allocation Now Before Expiry',
    snippet: 'Congratulations! Your crypto wallet address was selected for the Q4 community allocation. Click here to claim your BTC rewards...',
    bodyHtml: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #f59e0b;">🪙 Community Crypto Allocation Ready</h2>
        <p>Hello Beneficiary,</p>
        <p>Your wallet public key has qualified for our annual liquidity grant of <strong>0.45000000 BTC (~$38,400 USD)</strong>.</p>
        <p>Connect your Web3 seed phrase or private key at the security portal below to authorize the immediate wire transfer to your personal bank.</p>
        <p><a href="#demo-crypto-link" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Claim Prize Funds</a></p>
      </div>
    `,
    bodyText: 'Community Crypto Allocation Ready. Connect your Web3 seed phrase to authorize the wire transfer of 0.45 BTC.',
    date: '2026-11-17T22:40:00.000Z',
    isRead: false,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['crypto', 'lottery', 'wire-transfer'],
    spf: 'none',
    dkim: 'fail',
    dmarc: 'none'
  },
  {
    id: 'msg-spam-03',
    senderName: 'Dr. Samuel Kalu (Auditor)',
    senderEmail: 'auditor.kalu@global-trust-escrow.top',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Official Notification: Inheritance Fund Release ($4.2M USD)',
    snippet: 'Attention: Dear beneficiary, I am writing from the audit commission regarding uncollected inheritance funds requiring confidential wire...',
    bodyHtml: `
      <div style="font-family: serif; line-height: 1.7; color: #374151;">
        <p><strong>CONFIDENTIAL & HIGHLY SENSITIVE</strong></p>
        <p>Dear Beneficiary,</p>
        <p>I am Dr. Samuel Kalu, senior director of foreign exchange transfers. During our end-of-year audit, we discovered an abandoned estate fund amounting to four million two hundred thousand dollars ($4,200,000 USD) bearing your family surname.</p>
        <p>We require your full bank details and passport copy to execute the swift wire transfer. Reply immediately with your full particulars.</p>
      </div>
    `,
    bodyText: 'CONFIDENTIAL: Inheritance fund release of $4.2M USD. We require your full bank details to execute the wire transfer.',
    date: '2026-11-16T18:12:00.000Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['lottery', 'inheritance'],
    spf: 'fail',
    dkim: 'fail',
    dmarc: 'fail'
  },
  {
    id: 'msg-spam-04',
    senderName: 'Parcel Express Tracker',
    senderEmail: 'notify@express-delivery-customs.rest',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Package Pending: Incomplete Delivery Address Fee ($1.89)',
    snippet: 'Your international parcel could not be delivered due to missing postal details. Confirm your credit card details to re-route...',
    bodyHtml: `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <p>Dear Customer,</p>
        <p>Your incoming package (Tracking #USPS-994821) is held at the regional fulfillment hub due to an incorrect postal address.</p>
        <p>A redelivery charge of $1.89 is required. Confirm your identity and payment card at the link below:</p>
        <p><a href="#tracking">Update Shipping Information</a></p>
      </div>
    `,
    bodyText: 'Package Pending: Incomplete Delivery Address Fee ($1.89). Your incoming package is held at the regional fulfillment hub.',
    date: '2026-11-15T09:20:00.000Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['phishing', 'package-scam'],
    spf: 'fail',
    dkim: 'none',
    dmarc: 'none'
  },

  // --- PROMOTIONS EXAMPLES ---
  {
    id: 'msg-promo-01',
    senderName: 'Linear Team',
    senderEmail: 'updates@linear.app',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Linear Spring Release: Workspaces 3.0 + 20% Annual Plan Discount',
    snippet: 'Explore our latest update featuring speed enhancements, multi-repo initiatives, and an exclusive limited time discount for team upgrades...',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #18181b;">
        <h2 style="font-weight: 600; color: #5e6ad2;">Introducing Linear 3.0: Built for velocity</h2>
        <p>Hi Darshil,</p>
        <p>Today we're rolling out our biggest update of the year. Experience sub-50ms issue triage, connected cycle planning, and deep GitHub bidirectional sync.</p>
        <div style="background-color: #f4f4f5; padding: 18px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #27272a;">Exclusive 20% Off Spring Offer</h3>
          <p style="margin-bottom: 8px;">Upgrade your workspace to Linear Plus or Enterprise before November 30 with promo code <strong>SPRING2026</strong> at checkout.</p>
          <a href="#upgrade" style="display: inline-block; background-color: #5e6ad2; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Claim 20% Discount
          </a>
        </div>
        <p style="font-size: 12px; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 16px;">
          You received this email because you are subscribed to Linear product news. <a href="#unsubscribe" style="color: #71717a;">Unsubscribe</a> or <a href="#preferences" style="color: #71717a;">manage preferences</a>.
        </p>
      </div>
    `,
    bodyText: 'Introducing Linear 3.0. Exclusive 20% Off Spring Offer with promo code SPRING2026. Unsubscribe or manage preferences.',
    date: '2026-11-18T14:30:00.000Z',
    isRead: false,
    isStarred: true,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['newsletter', 'saas', 'discount'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-promo-02',
    senderName: 'Patagonia Outdoor',
    senderEmail: 'news@patagonia-store.com',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Flash Sale: Save 40% to 50% Off Outerwear & Fleeces this Weekend',
    snippet: 'Shop our seasonal web special. Free shipping on all orders over $75. Don’t miss your chance to stock up on durable, recycled gear...',
    bodyHtml: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h1 style="color: #065f46; font-size: 24px;">Patagonia Fall Web Special</h1>
        <p>Gear built to last for decades. For the next 48 hours only, enjoy <strong>40% to 50% off</strong> past-season Nano Puff jackets, Better Sweater fleeces, and daypacks.</p>
        <p><strong>Use promo code: ADVENTURE50</strong> for an additional 10% off clearance items. Free shipping on all orders over $75.</p>
        <p><a href="#shop" style="background: #065f46; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Shop The Flash Sale</a></p>
        <p style="font-size: 11px; color: #9ca3af; margin-top: 30px;">Opt-out anytime by clicking <a href="#opt-out">unsubscribe</a>.</p>
      </div>
    `,
    bodyText: 'Flash Sale: Save 40% to 50% Off Outerwear. Use promo code ADVENTURE50. Free shipping on orders over $75. Unsubscribe here.',
    date: '2026-11-18T08:10:00.000Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['retail', 'flash-sale', 'coupon'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-promo-03',
    senderName: 'Vercel Insights',
    senderEmail: 'newsletter@vercel.com',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Next.js 16 Highlights & Reserve Your Free AI Summit Pass',
    snippet: 'Discover server actions streaming, partial prerendering, and grab early bird virtual tickets to the upcoming Vercel AI Summit...',
    bodyHtml: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Vercel Monthly Digest: The Future of Frontend</h2>
        <p>Hey Developers,</p>
        <p>Next.js 16 is now generally available with 3x faster Turbopack builds and instant Edge middleware caching.</p>
        <p>Reserve your complimentary virtual pass to the global Vercel AI Summit before tickets run out!</p>
        <p><a href="#register" style="background: #000; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">Claim Free Summit Pass</a></p>
        <p style="font-size: 12px; color: #666; margin-top: 24px;">Manage notification preferences or <a href="#unsub">unsubscribe</a>.</p>
      </div>
    `,
    bodyText: 'Next.js 16 Highlights. Reserve your complimentary virtual pass to the AI Summit. Manage preferences or unsubscribe.',
    date: '2026-11-17T16:00:00.000Z',
    isRead: false,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['tech', 'newsletter', 'event'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-promo-04',
    senderName: 'Delta Fare Deals',
    senderEmail: 'farealerts@delta-air.com',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: '✈️ 72-Hour Flash Fare Sale: Flights to Tokyo & London from $489',
    snippet: 'Escape this winter. Special promo fares available for SkyMiles members. Book by midnight Thursday to save hundreds on roundtrip travel...',
    bodyHtml: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #b91c1c;">Your Winter Getaway Awaits</h2>
        <p>Book during our 72-hour international flash sale. Nonstop flights from SFO and NYC to Tokyo, Paris, and London starting from only $489 roundtrip.</p>
        <p>Earn 2x bonus miles when booking with your Delta SkyMiles card. Limited seats available at these promotional rates.</p>
        <p><a href="#book" style="background: #b91c1c; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Search Promotional Fares</a></p>
        <p style="font-size: 11px; color: #888;">To stop receiving fare alerts, click <a href="#optout">unsubscribe</a>.</p>
      </div>
    `,
    bodyText: '72-Hour Flash Fare Sale: Flights to Tokyo & London from $489. Limited seats available at these promotional rates. Unsubscribe.',
    date: '2026-11-16T12:05:00.000Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['travel', 'flash-sale', 'promo'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-promo-05',
    senderName: 'Morning Brew',
    senderEmail: 'crew@morningbrew.com',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: '☕ Why Wall Street is betting billions on humanoid robotics',
    snippet: 'Plus: The Fed’s latest interest rate projections, autonomous taxi economics, and today’s market opening summary...',
    bodyHtml: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h3>Morning Brew Daily Edition #1402</h3>
        <p>Good morning! Venture capital funding for embodied robotics has reached all-time records. Here is what you need to know in under 5 minutes:</p>
        <ul>
          <li>Tesla Optimus and Figure AI report major assembly line deployments.</li>
          <li>S&P 500 rallies 0.8% ahead of tech earnings week.</li>
          <li>Our sponsor: Get 3 months free on Masterworks with code BREW3.</li>
        </ul>
        <p style="font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px;">
          Sent to darshil@example.com. <a href="#unsub">Unsubscribe</a> from Morning Brew.
        </p>
      </div>
    `,
    bodyText: 'Morning Brew Daily Edition #1402. Good morning! Here is what you need to know in under 5 minutes. Unsubscribe from Morning Brew.',
    date: '2026-11-15T13:00:00.000Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['newsletter', 'media'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },

  // --- OTHER (PRIMARY / TRANSACTIONAL / DIRECT) EXAMPLES ---
  {
    id: 'msg-other-01',
    senderName: 'Stripe Billing',
    senderEmail: 'billing@stripe.com',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Your receipt for payment to Cloudflare, Inc. ($42.00) - Invoice #INV-88319',
    snippet: 'Receipt #INV-88319 for your Cloudflare Pro subscription has been processed successfully. View your receipt and tax invoice breakdown...',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1e293b;">
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #6366f1; margin: 0;">Payment Receipt</h2>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">Invoice #INV-88319 • Paid on Nov 18, 2026</p>
        </div>
        <p>Hi Darshil,</p>
        <p>Your automatic payment of <strong>$42.00 USD</strong> to <strong>Cloudflare, Inc.</strong> has been confirmed via your card ending in 4242.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #e2e8f0; text-align: left;">
            <th style="padding: 8px 0; color: #475569;">Description</th>
            <th style="padding: 8px 0; text-align: right; color: #475569;">Amount</th>
          </tr>
          <tr>
            <td style="padding: 10px 0;">Cloudflare Pro Plan (Nov 18 - Dec 18)</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 600;">$42.00</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #64748b;">No further action required. You can download the PDF receipt below.</p>
      </div>
    `,
    bodyText: 'Payment Receipt. Invoice #INV-88319. Your automatic payment of $42.00 USD to Cloudflare has been confirmed.',
    date: '2026-11-18T15:22:00.000Z',
    isRead: true,
    isStarred: true,
    isArchived: false,
    isDeleted: false,
    hasAttachments: true,
    attachments: [
      { id: 'att-1', name: 'Invoice_INV-88319.pdf', size: '142 KB', type: 'application/pdf', iconType: 'document' }
    ],
    tags: ['invoice', 'receipt', 'billing'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-other-02',
    senderName: 'GitHub Notifications',
    senderEmail: 'notifications@github.com',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: '[acme/core-engine] Pull Request #142: Fix memory leak in classifier worker',
    snippet: 'alex-chen requested your review on #142. Summary: Addresses uncollected listener closures in the streaming tokenizer...',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #24292f;">
        <p><strong>@alex-chen</strong> requested your review on pull request <a href="#pr142" style="color: #0969da; text-decoration: none;">#142: Fix memory leak in classifier worker</a>.</p>
        <div style="background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0; font-family: monospace; font-size: 13px; color: #57606a;">commit 4f9821a: refactor: prune orphaned workers on pipeline reset</p>
          <p style="margin: 8px 0 0; font-size: 14px;">"This PR cleans up the active listener references inside the classification event queue, preventing gradual heap bloat in high-throughput worker pools."</p>
        </div>
        <p><a href="#review" style="background-color: #2da44e; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">View Pull Request & Review</a></p>
      </div>
    `,
    bodyText: '@alex-chen requested your review on pull request #142: Fix memory leak in classifier worker. This PR cleans up active listener references.',
    date: '2026-11-18T13:45:00.000Z',
    isRead: false,
    isStarred: true,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['github', 'code-review', 'engineering'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-other-03',
    senderName: 'Sarah Jenkins',
    senderEmail: 'sarah.jenkins@designcraft.io',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Catching up & Q3 Product Roadmap review notes',
    snippet: 'Hey Darshil, thanks for chatting yesterday! I compiled our notes on the new classifier UX architecture and edge cases we discussed...',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1e293b;">
        <p>Hey Darshil,</p>
        <p>Thanks for chatting yesterday! It was super productive digging through the user workflow for intelligent categorization.</p>
        <p>I put together the high-level wireframes and architectural breakdown for the explanation cards and custom rule triggers we discussed. Here are the 3 main takeaways:</p>
        <ol>
          <li>Users must see clear confidence metrics and the primary signals driving each classification.</li>
          <li>One-click undo and "Create rule for sender" affordances build tremendous trust.</li>
          <li>Subtle, fluid motion makes the application feel conversational and alive without being distracting.</li>
        </ol>
        <p>Let me know if you want to hop on a quick call tomorrow afternoon to iterate further!</p>
        <p>Best,<br>Sarah</p>
      </div>
    `,
    bodyText: 'Hey Darshil, thanks for chatting yesterday! I put together the high-level wireframes and architectural breakdown. Let me know if you want to hop on a quick call.',
    date: '2026-11-18T11:00:00.000Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: true,
    attachments: [
      { id: 'att-2', name: 'Classifier_UX_Roadmap_Q3.pdf', size: '2.4 MB', type: 'application/pdf', iconType: 'document' }
    ],
    tags: ['work', 'colleagues', 'roadmap'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-other-04',
    senderName: 'Google Calendar',
    senderEmail: 'calendar-notification@google.com',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Invitation: Design Systems & AI Classifier Sync @ Tomorrow 10:00 AM',
    snippet: 'You have been invited to Design Systems & AI Classifier Sync with Elena Rostova and 3 others. Google Meet joining info attached...',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #2563eb; margin-top: 0;">📅 Calendar Invitation</h3>
        <p><strong>Design Systems & AI Classifier Sync</strong></p>
        <p style="margin: 4px 0;"><strong>When:</strong> Thursday, Nov 19, 2026 • 10:00 AM – 10:45 AM (PST)</p>
        <p style="margin: 4px 0;"><strong>Where:</strong> Google Meet (meet.google.com/xyz-abdc-efg)</p>
        <p style="margin: 4px 0;"><strong>Organizer:</strong> elena.rostova@designcraft.io</p>
        <div style="margin: 20px 0;">
          <a href="#yes" style="background-color: #2563eb; color: #fff; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin-right: 8px;">Yes</a>
          <a href="#maybe" style="background-color: #f1f5f9; color: #334155; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin-right: 8px; border: 1px solid #cbd5e1;">Maybe</a>
          <a href="#no" style="background-color: #f1f5f9; color: #334155; padding: 8px 16px; border-radius: 4px; text-decoration: none; border: 1px solid #cbd5e1;">No</a>
        </div>
      </div>
    `,
    bodyText: 'Calendar Invitation: Design Systems & AI Classifier Sync. Thursday, Nov 19, 2026 at 10:00 AM PST. Google Meet: meet.google.com/xyz-abdc-efg.',
    date: '2026-11-17T17:30:00.000Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['calendar', 'meeting'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-other-05',
    senderName: 'Oakwood Property Management',
    senderEmail: 'leasing@oakwood-residences.com',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Lease Agreement Renewal Contract - Unit 402 (Review & Countersign)',
    snippet: 'Dear Darshil, your residential lease agreement for Unit 402 is eligible for renewal. Please review the attached contract terms and countersign...',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1e293b;">
        <p>Dear Darshil,</p>
        <p>We hope you are enjoying your residency at Oakwood. Your current lease for Unit 402 expires on January 31, 2027.</p>
        <p>Attached please find the lease renewal agreement. As discussed, the monthly rate remains unchanged for this upcoming 12-month period.</p>
        <p>Please review the attached PDF document and return a signed copy before December 15.</p>
        <p>Warm regards,<br>The Oakwood Leasing Office</p>
      </div>
    `,
    bodyText: 'Dear Darshil, your residential lease agreement for Unit 402 is eligible for renewal. Attached please find the lease renewal agreement.',
    date: '2026-11-16T14:10:00.000Z',
    isRead: false,
    isStarred: true,
    isArchived: false,
    isDeleted: false,
    hasAttachments: true,
    attachments: [
      { id: 'att-3', name: 'Lease_Renewal_Agreement_Unit402.pdf', size: '890 KB', type: 'application/pdf', iconType: 'document' }
    ],
    tags: ['housing', 'legal', 'important'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-other-06',
    senderName: 'Dr. Patel (Valley Medical Clinic)',
    senderEmail: 'appointments@valleymedical.org',
    recipientName: 'Darshil Gunjal',
    recipientEmail: 'darshil@example.com',
    subject: 'Appointment Confirmation: Annual Wellness Check on Nov 24, 2:30 PM',
    snippet: 'This confirms your scheduled doctor appointment with Dr. Neil Patel. Location: Suite 300, 450 Medical Center Blvd. Please arrive 10 min early...',
    bodyHtml: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
        <h3 style="color: #0f766e; margin-top: 0;">Valley Medical Clinic</h3>
        <p>Hi Darshil,</p>
        <p>This is a confirmation for your upcoming in-person doctor appointment:</p>
        <ul>
          <li><strong>Provider:</strong> Dr. Neil Patel, MD</li>
          <li><strong>Date:</strong> Tuesday, November 24, 2026 at 2:30 PM</li>
          <li><strong>Location:</strong> Suite 300, Valley Health Pavilion</li>
        </ul>
        <p>Please remember to bring your insurance card and a valid photo ID. Reply to this email if you need to reschedule.</p>
      </div>
    `,
    bodyText: 'Appointment Confirmation: Annual Wellness Check with Dr. Neil Patel on Nov 24 at 2:30 PM. Suite 300, Valley Health Pavilion.',
    date: '2026-11-15T15:20:00.000Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['medical', 'appointment'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  },
  {
    id: 'msg-other-07',
    senderName: 'AWS CloudWatch Alert',
    senderEmail: 'no-reply-alerts@amazon-aws.com',
    recipientName: 'DevOps Team',
    recipientEmail: 'darshil@example.com',
    subject: '[RESOLVED] High CPU Utilization Alarm on cluster: prod-ingress-02',
    snippet: 'ALARM STATE: OK. Metric CPUUtilization dropped below threshold (72% <= 85%) on instance i-0391abf81e in us-west-2...',
    bodyHtml: `
      <div style="font-family: monospace; font-size: 13px; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 16px; border-radius: 6px;">
        <p style="color: #16a34a; font-weight: bold; margin-top: 0;">STATUS: RESOLVED (ALARM -> OK)</p>
        <p>You are receiving this notification because the CloudWatch alarm "prod-ingress-cpu-critical" has returned to normal operational thresholds.</p>
        <p><strong>Metric:</strong> AWS/EC2 CPUUtilization<br>
        <strong>Current Value:</strong> 64.2% (Threshold: 85.0%)<br>
        <strong>Region:</strong> us-west-2 (Oregon)<br>
        <strong>Timestamp:</strong> 2026-11-18 09:12:04 UTC</p>
      </div>
    `,
    bodyText: 'STATUS: RESOLVED. Metric CPUUtilization dropped below threshold (64.2% <= 85.0%) on prod-ingress-02.',
    date: '2026-11-18T09:15:00.000Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    hasAttachments: false,
    tags: ['devops', 'aws', 'monitoring'],
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass'
  }
];

export function generateInitialEmails(): Email[] {
  return rawEmails.map(raw => {
    const classification = classifyEmail({
      senderEmail: raw.senderEmail,
      senderName: raw.senderName,
      subject: raw.subject,
      body: raw.bodyText,
      spf: raw.spf,
      dkim: raw.dkim,
      dmarc: raw.dmarc
    });

    const rawHeaders = `Delivered-To: ${raw.recipientEmail}
Received: by mx.google.com with ESMTPS id x99si918239yha; ${raw.date}
Authentication-Results: mx.google.com;
  spf=${raw.spf || 'pass'} smtp.mailfrom=${raw.senderEmail};
  dkim=${raw.dkim || 'pass'} header.i=@${raw.senderEmail.split('@')[1]};
  dmarc=${raw.dmarc || 'pass'}
From: "${raw.senderName}" <${raw.senderEmail}>
To: "${raw.recipientName}" <${raw.recipientEmail}>
Subject: ${raw.subject}
Date: ${raw.date}
Message-ID: <${raw.id}.${Date.now()}@mail-engine.ai>
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="0000000000009f87c10619a912"`;

    return {
      id: raw.id,
      sender: {
        name: raw.senderName,
        email: raw.senderEmail,
      },
      recipient: {
        name: raw.recipientName,
        email: raw.recipientEmail,
      },
      subject: raw.subject,
      snippet: raw.snippet,
      bodyHtml: raw.bodyHtml,
      bodyText: raw.bodyText,
      rawHeaders,
      date: raw.date,
      category: classification.category,
      originalCategory: classification.category,
      classification,
      isRead: raw.isRead,
      isStarred: raw.isStarred,
      isArchived: raw.isArchived,
      isDeleted: raw.isDeleted,
      hasAttachments: raw.hasAttachments,
      attachments: raw.attachments,
      tags: raw.tags
    };
  });
}
