import Link from 'next/link';
import { Ticket } from 'lucide-react';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p className="text-gray-500">Last updated: March 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using TippyTix (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>

        <h2>2. Description of Service</h2>
        <p>TippyTix is an online event ticketing platform that enables event organisers to create events, sell tickets, and manage attendee check-in. Customers can purchase tickets and receive QR-code based entry passes.</p>

        <h2>3. Account Registration</h2>
        <p>To use certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

        <h2>4. Event Organisers</h2>
        <p>Event organisers are responsible for the accuracy of event information, fulfilling their obligations to ticket holders, and complying with all applicable laws. TippyTix is not the organiser of any event listed on the platform.</p>

        <h2>5. Ticket Purchases</h2>
        <p>All ticket purchases are final, subject to the refund policy set by the event organiser. TippyTix facilitates the transaction but is not responsible for the event itself.</p>

        <h2>6. Fees</h2>
        <p>TippyTix charges a platform fee of 5% of the ticket price plus $1.00 AUD per ticket. These fees are included in the total price shown to the customer at checkout. A $2.00 AUD handling fee applies to all refunds.</p>

        <h2>7. Payments & Payouts</h2>
        <p>Payments are processed through Stripe. Event organisers must connect a Stripe account to receive payouts. Payouts are subject to Stripe&apos;s terms and processing times.</p>

        <h2>8. Refunds</h2>
        <p>Refund eligibility is determined by the refund policy configured by each event organiser. All refunds are subject to a $2.00 AUD platform handling fee regardless of the refund percentage.</p>

        <h2>9. Prohibited Conduct</h2>
        <p>You may not use the Platform for any unlawful purpose, to sell fraudulent tickets, to engage in ticket scalping, or to interfere with the Platform&apos;s operation.</p>

        <h2>10. Intellectual Property</h2>
        <p>All content on TippyTix, excluding user-generated content, is owned by TippyTix. Event organisers retain ownership of their event content.</p>

        <h2>11. Limitation of Liability</h2>
        <p>TippyTix is provided &quot;as is&quot; without warranties. To the maximum extent permitted by law, TippyTix shall not be liable for any indirect, incidental, or consequential damages.</p>

        <h2>12. Modifications</h2>
        <p>We may modify these terms at any time. Continued use of the Platform constitutes acceptance of modified terms.</p>

        <h2>13. Governing Law</h2>
        <p>These terms are governed by the laws of New South Wales, Australia.</p>

        <h2>14. Contact</h2>
        <p>Questions about these terms? <Link href="/contact" className="text-violet-600">Contact us</Link>.</p>
      </main>
    </div>
  );
}
