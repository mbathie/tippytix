'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(u => { setUser(u); setLoading(false); });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          organizationName: user.organizationName,
          phone: user.phone,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={user?.name || ''} onChange={e => setUser({ ...user, name: e.target.value })} />
          </div>
          <div>
            <Label>Organization Name</Label>
            <Input value={user?.organizationName || ''} onChange={e => setUser({ ...user, organizationName: e.target.value })} placeholder="Your organization or company name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={user?.phone || ''} onChange={e => setUser({ ...user, phone: e.target.value })} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
