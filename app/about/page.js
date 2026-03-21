import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ticket, ArrowRight } from 'lucide-react';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-black/[0.04]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d28d9] to-[#ec4899] flex items-center justify-center">
              <Ticket className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[1.1rem] font-semibold tracking-[-0.02em]">TippyTix</span>
          </Link>
          <Link href="/login">
            <Button className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] text-[0.84rem] font-medium rounded-full px-5 h-9">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] mb-8">
          Simple ticketing for{' '}
          <span className="bg-gradient-to-r from-[#6d28d9] to-[#ec4899] bg-clip-text text-transparent">
            real events
          </span>
        </h1>

        <div className="prose prose-lg prose-gray max-w-none">
          <p>
            TippyTix was built in Brunswick Heads, Australia, out of a simple frustration: selling tickets to local events shouldn&apos;t require enterprise software, high fees, or a PhD in platform configuration.
          </p>
          <p>
            Whether you&apos;re organising a local concert, a theatre performance, a comedy night, a fundraiser, or a festival — you should be able to create an event page, set your prices, share a link, and start selling in minutes.
          </p>
          <p>
            We built TippyTix to be the simplest path from &quot;I have an event&quot; to &quot;I&apos;m scanning tickets at the door.&quot; No app downloads for your attendees. No monthly subscriptions for you. Just straightforward ticketing with transparent fees.
          </p>

          <h2>What makes us different</h2>
          <ul>
            <li><strong>No monthly fees.</strong> You only pay when you sell tickets: 5% + $1 per ticket.</li>
            <li><strong>Direct payouts.</strong> Stripe sends your money directly to your bank account.</li>
            <li><strong>Your data.</strong> Download patron lists as CSV anytime. Your attendees, your data.</li>
            <li><strong>Mobile check-in.</strong> Scan QR codes with your phone&apos;s camera. No extra hardware.</li>
            <li><strong>Organiser control.</strong> Set your own refund policies, ticket tiers, and pricing.</li>
          </ul>

          <h2>Get in touch</h2>
          <p>
            Have questions or feedback? We&apos;d love to hear from you. <Link href="/contact" className="text-violet-600 font-medium">Drop us a message</Link>.
          </p>
        </div>

        <div className="mt-12">
          <Link href="/login">
            <Button className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-full px-7 h-11">
              Start selling tickets <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
