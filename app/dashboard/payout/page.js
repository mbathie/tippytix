'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function PayoutPage() {
  const [status, setStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/stripe/connect/status').then(r => r.json()),
      fetch('/api/user').then(r => r.json()),
    ]).then(([s, u]) => {
      setStatus(s);
      setUser(u);
      setLoading(false);
    });
  }, []);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function connectStripe() {
    setConnecting(true);
    try {
      const res = await fetch('/api/stripe/connect/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptedTerms: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Stripe account connected!');
      setStatus(prev => ({ ...prev, connected: true, onboardingComplete: true }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
  }

  if (status?.connected && status?.onboardingComplete) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Payouts</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Stripe Connected</h2>
            <p className="text-gray-500 mb-2">Your payouts are being processed automatically by Stripe.</p>
            <div className="flex gap-2 justify-center mt-4">
              <Badge variant="outline" className={status.chargesEnabled ? 'border-green-500 text-green-700' : ''}>
                {status.chargesEnabled ? 'Charges Enabled' : 'Charges Pending'}
              </Badge>
              <Badge variant="outline" className={status.payoutsEnabled ? 'border-green-500 text-green-700' : ''}>
                {status.payoutsEnabled ? 'Payouts Enabled' : 'Payouts Pending'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Set Up Payouts</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Personal Details</CardTitle>
          <CardDescription>Required for Stripe identity verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>First Name</Label>
              <Input value={user?.firstName || ''} onChange={e => setUser({ ...user, firstName: e.target.value })} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={user?.lastName || ''} onChange={e => setUser({ ...user, lastName: e.target.value })} />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''} onChange={e => setUser({ ...user, dateOfBirth: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={user?.phone || ''} onChange={e => setUser({ ...user, phone: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Address Line 1</Label>
              <Input value={user?.addressLine1 || ''} onChange={e => setUser({ ...user, addressLine1: e.target.value })} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={user?.addressCity || ''} onChange={e => setUser({ ...user, addressCity: e.target.value })} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={user?.addressState || ''} onChange={e => setUser({ ...user, addressState: e.target.value })} />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input value={user?.addressPostalCode || ''} onChange={e => setUser({ ...user, addressPostalCode: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account</CardTitle>
          <CardDescription>Where your ticket sales will be paid out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>BSB / Routing Number</Label>
              <Input value={user?.bankRoutingNumber || ''} onChange={e => setUser({ ...user, bankRoutingNumber: e.target.value })} />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input value={user?.bankAccountNumber || ''} onChange={e => setUser({ ...user, bankAccountNumber: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Account Name</Label>
              <Input value={user?.bankAccountName || ''} onChange={e => setUser({ ...user, bankAccountName: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={saveProfile} disabled={saving} variant="outline">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Details
        </Button>
        <Button onClick={connectStripe} disabled={connecting} className="bg-violet-600 hover:bg-violet-700">
          {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Connect Stripe
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        By connecting, you agree to Stripe&apos;s Terms of Service. Your bank details are sent directly to Stripe and are not stored on our servers after setup.
      </p>
    </div>
  );
}
