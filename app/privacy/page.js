import Link from 'next/link';
import { Ticket } from 'lucide-react';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-black/[0.04]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d28d9] to-[#ec4899] flex items-center justify-center">
              <Ticket className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[1.1rem] font-semibold tracking-[-0.02em]">TippyTix</span>
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-16 prose prose-gray">
        <h1>Privacy Policy</h1>
        <p className="text-gray-500">Last updated: March 2026</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly: name, email address, phone number, and postal address when purchasing tickets or creating an account. For event organisers, we collect additional information required for payment processing (via Stripe).</p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Process ticket purchases and send confirmation emails</li>
          <li>Facilitate event check-in via QR codes</li>
          <li>Provide event organisers with attendee information for their events</li>
          <li>Process payments and payouts via Stripe</li>
          <li>Send transactional emails (ticket confirmations, refund notices)</li>
          <li>Improve and maintain the Platform</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We share your information with:</p>
        <ul>
          <li><strong>Event organisers</strong>: Name, email, phone, and address of ticket purchasers for their events</li>
          <li><strong>Stripe</strong>: Payment information for transaction processing</li>
          <li><strong>Brevo</strong>: Email addresses for transactional email delivery</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>

        <h2>4. Data Retention</h2>
        <p>We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us.</p>

        <h2>5. Security</h2>
        <p>We use industry-standard security measures to protect your information. Payment data is handled by Stripe and never stored on our servers. Bank account details for event organisers are transmitted to Stripe and immediately cleared from our database.</p>

        <h2>6. Cookies</h2>
        <p>We use essential cookies for authentication and session management. No third-party tracking cookies are used.</p>

        <h2>7. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal information. Australian residents have additional rights under the Privacy Act 1988.</p>

        <h2>8. Children</h2>
        <p>TippyTix is not intended for children under 16. We do not knowingly collect information from children.</p>

        <h2>9. Changes</h2>
        <p>We may update this policy from time to time. We will notify you of significant changes via email.</p>

        <h2>10. Contact</h2>
        <p>For privacy inquiries, <Link href="/contact" className="text-violet-600">contact us</Link>.</p>
      </main>
    </div>
  );
}
