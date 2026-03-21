'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, Mail, Loader2, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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

      <main className="max-w-lg mx-auto px-6 py-20">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[-0.02em] mb-2">Get in touch</h1>
        <p className="text-gray-500 mb-8">Have a question, feedback, or need help? We&apos;d love to hear from you.</p>

        {sent ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Message sent!</h2>
              <p className="text-gray-500">We&apos;ll get back to you as soon as possible.</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] rounded-full h-11">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Message
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
