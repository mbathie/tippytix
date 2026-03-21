import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Ticket,
  QrCode,
  BarChart3,
  Shield,
  RotateCcw,
  Smartphone,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { HeroBackground } from '@/components/hero-background';

const features = [
  {
    icon: Sparkles,
    title: 'Beautiful Event Pages',
    description: 'Create stunning, branded event pages with custom colours, banners, and descriptions that look great when shared.',
  },
  {
    icon: QrCode,
    title: 'QR Code Tickets',
    description: 'Every ticket gets a unique, scannable QR code. Download event QR codes for your own promotional materials.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track ticket sales, revenue, check-ins, and patron data across all your events from one dashboard.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Powered by Stripe. PCI compliant. Funds go directly to your bank account — no holding period.',
  },
  {
    icon: RotateCcw,
    title: 'Flexible Refunds',
    description: 'Set custom refund tiers per event. Full refunds, partial, or none — your event, your rules.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Check-in',
    description: 'Scan QR codes at the door with your phone. Instant verification with duplicate-scan warnings.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create your event',
    description: 'Set up your event page with ticket categories, pricing tiers, custom branding, and refund policies.',
  },
  {
    number: '02',
    title: 'Share & sell tickets',
    description: 'Share your event link anywhere. Customers select tickets, enter details, and pay securely via Stripe.',
  },
  {
    number: '03',
    title: 'Scan at the door',
    description: 'Use your phone to scan QR codes. Each ticket validates once — duplicates trigger an instant warning.',
  },
];

function Logo({ className = '', size = 'default' }) {
  const iconSize = size === 'small' ? 'w-7 h-7' : 'w-8 h-8';
  const iconInner = size === 'small' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  const textSize = size === 'small' ? 'text-[1.2rem]' : 'text-[1.4rem]';
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className={`${iconSize} rounded-lg bg-gradient-to-br from-[#6d28d9] to-[#ec4899] flex items-center justify-center shadow-sm`}>
        <Ticket className={`${iconInner} text-white`} strokeWidth={2.5} />
      </span>
      <span className={`${textSize} font-bold font-[family-name:var(--font-logo)] bg-gradient-to-r from-[#6d28d9] to-[#ec4899] bg-clip-text text-transparent`}>
        TippyTix
      </span>
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0a0a0a]">
      {/* ─── NAV ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="group">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[0.84rem] font-medium text-[#6b7280]">
            <a href="#features" className="hover:text-[#0a0a0a] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#0a0a0a] transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-[#0a0a0a] transition-colors">How it Works</a>
            <Link href="/about" className="hover:text-[#0a0a0a] transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-[0.84rem] font-medium text-[#6b7280] hover:text-[#0a0a0a]">Log in</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] text-[0.84rem] font-medium rounded-full px-5 h-9 shadow-sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO WITH ROTATING BACKGROUND ─── */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <HeroBackground />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 z-[1]" />

        <div className="relative z-[2] max-w-6xl mx-auto px-6 py-24 sm:py-32 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-[0.78rem] font-medium mb-8 border border-white/20">
              <Zap className="w-3.5 h-3.5" />
              Simple ticketing for events of any size
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.8rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.025em] text-white">
              Sell tickets.{' '}
              <span className="bg-gradient-to-r from-[#c4b5fd] via-[#e879f9] to-[#f9a8d4] bg-clip-text text-transparent">
                Scan at the door.
              </span>{' '}
              That&apos;s it.
            </h1>

            <p className="mt-7 text-[1.15rem] leading-[1.7] text-white/70 max-w-xl">
              Create event pages, set ticket prices, share and sell. Access patron details for marketing.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-10">
              <Link href="/login">
                <Button className="bg-white text-[#0a0a0a] hover:bg-white/90 text-[0.92rem] font-medium rounded-full px-7 h-12 shadow-lg hover:shadow-xl transition-all">
                  Start selling tickets <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="ghost" className="text-[0.92rem] font-medium rounded-full px-7 h-12 text-white/70 hover:text-white hover:bg-white/10">
                  See how it works
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 mt-12 text-[0.82rem] text-white/50">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#34d399]" /> No monthly fees</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#34d399]" /> No lock-in</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#34d399]" /> Free to create events</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative bg-white border-y border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <div className="max-w-xl mb-16">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-[#6d28d9] mb-3">Features</p>
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.15] tracking-[-0.02em]">
              Everything you need to run ticketed events
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {features.map((feature) => (
              <div key={feature.title} className="group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6d28d9]/[0.08] to-[#ec4899]/[0.06] flex items-center justify-center mb-4 group-hover:from-[#6d28d9]/[0.14] group-hover:to-[#ec4899]/[0.10] transition-colors">
                  <feature.icon className="w-5 h-5 text-[#6d28d9]" />
                </div>
                <h3 className="text-[1.02rem] font-semibold mb-2 tracking-[-0.01em]">{feature.title}</h3>
                <p className="text-[0.88rem] leading-[1.65] text-[#6b7280]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <div className="max-w-xl mb-16">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-[#ec4899] mb-3">How it Works</p>
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.15] tracking-[-0.02em]">
              Three steps from setup to sold out
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative bg-white rounded-2xl border border-black/[0.04] p-8 hover:shadow-lg hover:shadow-black/[0.03] transition-shadow">
                <span className="font-[family-name:var(--font-display)] text-5xl text-[#6d28d9]/[0.08] absolute top-5 right-6 select-none">
                  {step.number}
                </span>
                <div className="relative">
                  <h3 className="text-[1.05rem] font-semibold mb-3 tracking-[-0.01em]">{step.title}</h3>
                  <p className="text-[0.88rem] leading-[1.65] text-[#6b7280]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="bg-[#0a0a0a] text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#6d28d9]/20 to-transparent blur-[100px] rounded-full" />

        <div className="relative max-w-6xl mx-auto px-6 py-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-[#8b5cf6] mb-3">Pricing</p>
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.15] tracking-[-0.02em]">
              No subscriptions. No hidden fees.
            </h2>
            <p className="mt-5 text-[1.05rem] text-white/50 max-w-lg mx-auto leading-relaxed">
              Free to create events. You only pay when you sell tickets. Simple, transparent, fair.
            </p>
          </div>

          <div className="max-w-md mx-auto mt-14 bg-white/[0.04] backdrop-blur-sm rounded-3xl border border-white/[0.06] p-10">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-[family-name:var(--font-display)] text-6xl tracking-[-0.02em]">5%</span>
                <span className="text-white/40 text-lg ml-1">+</span>
                <span className="font-[family-name:var(--font-display)] text-6xl tracking-[-0.02em] ml-1">$1</span>
              </div>
              <p className="text-white/40 text-[0.88rem] mt-2">per ticket sold</p>
            </div>

            <div className="mt-10 space-y-4 text-[0.88rem]">
              {[
                'Unlimited events',
                'Unlimited ticket categories',
                'Custom event branding',
                'QR code tickets with email delivery',
                'Real-time sales dashboard',
                'CSV patron exports',
                'Mobile QR scanner',
                'Configurable refund policies',
                'Direct Stripe payouts',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                  <span className="text-white/70">{item}</span>
                </div>
              ))}
            </div>

            <Link href="/login" className="block mt-10">
              <Button className="w-full bg-white text-[#0a0a0a] hover:bg-white/90 text-[0.92rem] font-medium rounded-full h-12">
                Start for free <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-white border-t border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.1] tracking-[-0.02em]">
              Ready to sell your first ticket?
            </h2>
            <p className="mt-5 text-[1.05rem] text-[#6b7280] max-w-md mx-auto leading-relaxed">
              Join event organisers who use TippyTix to sell tickets, manage check-ins, and grow their audience.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <Link href="/login">
                <Button className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-[0.92rem] font-medium rounded-full px-8 h-12 shadow-lg shadow-[#6d28d9]/20">
                  Get started — it&apos;s free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0a0a0a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <Logo size="small" />
              <p className="mt-4 text-[0.82rem] text-white/40 leading-relaxed">
                Simple event ticketing. Create, sell, scan.
              </p>
            </div>
            <div>
              <h4 className="text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-white/50 mb-4">Product</h4>
              <nav className="space-y-2.5 text-[0.85rem]">
                <a href="#features" className="block text-white/60 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="block text-white/60 hover:text-white transition-colors">Pricing</a>
                <a href="#how-it-works" className="block text-white/60 hover:text-white transition-colors">How it Works</a>
              </nav>
            </div>
            <div>
              <h4 className="text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-white/50 mb-4">Company</h4>
              <nav className="space-y-2.5 text-[0.85rem]">
                <Link href="/about" className="block text-white/60 hover:text-white transition-colors">About</Link>
                <Link href="/contact" className="block text-white/60 hover:text-white transition-colors">Contact</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-white/50 mb-4">Legal</h4>
              <nav className="space-y-2.5 text-[0.85rem]">
                <Link href="/terms" className="block text-white/60 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
              </nav>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.06] text-[0.78rem] text-white/30">
            &copy; {new Date().getFullYear()} TippyTix. Built in Brunswick Heads, Australia.
          </div>
        </div>
      </footer>
    </div>
  );
}
