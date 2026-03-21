import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Shield, Lock, CreditCard, Server, Eye, UserCheck, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Security & Privacy | TippyTix',
  description: 'Learn how TippyTix protects your data and keeps payments secure. All transactions processed through Stripe with bank-level encryption.',
};

const securityTopics = [
  {
    icon: CreditCard,
    title: 'Payment Security',
    description: 'All payments are processed through Stripe, a globally trusted payment platform. Stripe is PCI DSS Level 1 certified — the highest level of security certification in the payments industry. Your card details are encrypted and transmitted directly to Stripe; we never see or store your full card numbers.',
  },
  {
    icon: Lock,
    title: 'Data Encryption',
    description: 'All data transmitted between your browser and our servers is encrypted using TLS (Transport Layer Security). Your banking information is encrypted at rest and stored securely by Stripe, not on our servers.',
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'TippyTix runs on secure, modern cloud infrastructure with automatic security updates. We regularly review and update our security practices to protect your data.',
  },
  {
    icon: Eye,
    title: 'What We Collect',
    description: 'We collect only the information necessary to provide our service: your name, email, and event information. For payment processing, Stripe collects your payment details directly — this sensitive financial data never touches our servers.',
  },
  {
    icon: UserCheck,
    title: 'Account Security',
    description: 'We offer secure authentication via Google OAuth and magic link email login. There are no passwords to steal or forget — every login is verified through a trusted provider or a one-time secure link sent to your email.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'We never sell your data to third parties. Your information is only used to provide and improve our ticketing service. Patron details are shared only with the event organiser they purchased tickets from.',
  },
];

export default function SecurityPage() {
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6d28d9]/[0.08] to-[#ec4899]/[0.06] mb-6">
            <Shield className="h-7 w-7 text-[#6d28d9]" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] mb-4">
            Security &{' '}
            <span className="bg-gradient-to-r from-[#6d28d9] to-[#ec4899] bg-clip-text text-transparent">
              Privacy
            </span>
          </h1>
          <p className="text-[1.05rem] text-[#6b7280] max-w-xl mx-auto leading-relaxed">
            Your trust is our priority. Here&apos;s how we protect your data and keep your payments secure.
          </p>
        </div>

        <div className="space-y-4">
          {securityTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Card key={topic.title} className="bg-white border-black/[0.04] rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-[1.02rem] font-semibold tracking-[-0.01em]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6d28d9]/[0.08] to-[#ec4899]/[0.06] flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-[#6d28d9]" />
                    </div>
                    {topic.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[0.88rem] leading-[1.65] text-[#6b7280] pl-[52px]">
                    {topic.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stripe badge */}
        <Card className="mt-8 bg-white border-black/[0.04] rounded-2xl shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <img src="/stripe-logo.svg" alt="Stripe" className="h-12 w-auto" />
              </div>
              <div>
                <h3 className="text-[1.05rem] font-semibold mb-2 tracking-[-0.01em]">Powered by Stripe</h3>
                <p className="text-[0.88rem] leading-[1.65] text-[#6b7280]">
                  TippyTix partners with Stripe for secure payment processing. Stripe processes billions of dollars annually and is trusted by companies like Amazon, Google, and Shopify. Funds go directly to your bank account — no holding period.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-[#6b7280] mb-4">Have security questions?</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact">
              <Button variant="outline" className="rounded-full px-6 h-10 text-[0.88rem]">
                Contact us
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-full px-6 h-10 text-[0.88rem]">
                Get started free <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
