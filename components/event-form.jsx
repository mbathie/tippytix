'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';
import { DateTimePicker } from '@/components/date-time-picker';
import ImageUpload from '@/components/ui/image-upload';

export function EventForm({ event }) {
  const router = useRouter();
  const isEditing = !!event;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: event?.name || '',
    slug: event?.slug || '',
    description: event?.description || '',
    venue: event?.venue || '',
    address: event?.address || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    primaryColor: event?.primaryColor || '#6d28d9',
    secondaryColor: event?.secondaryColor || '#ec4899',
    bannerImage: event?.bannerImage || '',
    status: event?.status || 'draft',
    ogDescription: event?.ogDescription || '',
    ticketCategories: event?.ticketCategories?.length ? event.ticketCategories.map(c => ({
      _id: c._id,
      name: c.name,
      description: c.description || '',
      price: (c.price / 100).toFixed(2),
      quantity: c.quantity,
      sortOrder: c.sortOrder || 0,
      sequential: c.sequential || false,
    })) : [{ name: 'General Admission', description: '', price: '25.00', quantity: 100, sortOrder: 0, sequential: false }],
    refundPolicy: event?.refundPolicy?.length ? event.refundPolicy : [
      { daysBeforeEvent: 7, refundPercentage: 100 },
      { daysBeforeEvent: 3, refundPercentage: 50 },
      { daysBeforeEvent: 1, refundPercentage: 0 },
    ],
  });

  function updateField(field, value) {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && !isEditing) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }

  function addCategory() {
    setForm(prev => ({
      ...prev,
      ticketCategories: [...prev.ticketCategories, {
        name: '',
        description: '',
        price: '0.00',
        quantity: 0,
        sortOrder: prev.ticketCategories.length,
        sequential: false,
      }],
    }));
  }

  function removeCategory(index) {
    setForm(prev => ({
      ...prev,
      ticketCategories: prev.ticketCategories.filter((_, i) => i !== index),
    }));
  }

  function updateCategory(index, field, value) {
    setForm(prev => ({
      ...prev,
      ticketCategories: prev.ticketCategories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      ),
    }));
  }

  function addRefundTier() {
    setForm(prev => ({
      ...prev,
      refundPolicy: [...prev.refundPolicy, { daysBeforeEvent: 0, refundPercentage: 0 }],
    }));
  }

  function removeRefundTier(index) {
    setForm(prev => ({
      ...prev,
      refundPolicy: prev.refundPolicy.filter((_, i) => i !== index),
    }));
  }

  function updateRefundTier(index, field, value) {
    setForm(prev => ({
      ...prev,
      refundPolicy: prev.refundPolicy.map((tier, i) =>
        i === index ? { ...tier, [field]: Number(value) } : tier
      ),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.slug || !form.startDate) {
      toast.error('Please fill in name, URL slug, and start date');
      return;
    }
    if (form.ticketCategories.length === 0) {
      toast.error('Add at least one ticket category');
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      ticketCategories: form.ticketCategories.map((cat, i) => ({
        ...(cat._id ? { _id: cat._id } : {}),
        name: cat.name,
        description: cat.description,
        price: Math.round(parseFloat(cat.price) * 100),
        quantity: parseInt(cat.quantity),
        sortOrder: i,
        sequential: cat.sequential,
      })),
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    };

    try {
      const url = isEditing ? `/api/events/${event._id}` : '/api/events';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save event');
      }

      const saved = await res.json();
      toast.success(isEditing ? 'Event updated!' : 'Event created!');
      router.push(`/dashboard/events/${saved._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input id="name" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="My Awesome Concert" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">tippytix.app/events/</span>
                <Input id="slug" value={form.slug} onChange={e => updateField('slug', e.target.value)} placeholder="my-awesome-concert" required />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={e => updateField('description', e.target.value)} rows={4} placeholder="Tell people about your event..." />
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" value={form.venue} onChange={e => updateField('venue', e.target.value)} placeholder="The Grand Hall" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="123 Main St" />
            </div>
            <div>
              <Label>Start Date & Time *</Label>
              <DateTimePicker value={form.startDate} onChange={v => updateField('startDate', v)} placeholder="Pick start date & time" required />
            </div>
            <div>
              <Label>End Date & Time</Label>
              <DateTimePicker value={form.endDate} onChange={v => updateField('endDate', v)} placeholder="Pick end date & time" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" id="primaryColor" value={form.primaryColor} onChange={e => updateField('primaryColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                <Input value={form.primaryColor} onChange={e => updateField('primaryColor', e.target.value)} className="flex-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" id="secondaryColor" value={form.secondaryColor} onChange={e => updateField('secondaryColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                <Input value={form.secondaryColor} onChange={e => updateField('secondaryColor', e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Banner Image</Label>
              <ImageUpload
                value={form.bannerImage}
                onChange={v => updateField('bannerImage', v)}
                aspectRatio="3/1"
                placeholder="Drag and drop a banner image, or click to browse"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ogDescription">Share Description (for social media previews)</Label>
              <Textarea id="ogDescription" value={form.ogDescription} onChange={e => updateField('ogDescription', e.target.value)} rows={2} placeholder="Brief description for when this link is shared..." />
            </div>
          </div>
          <div className="rounded-lg p-4 mt-4" style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }}>
            <p className="text-white text-sm font-medium text-center">Color Preview</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ticket Categories</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addCategory}>
              <Plus className="w-4 h-4 mr-1" /> Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.ticketCategories.map((cat, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Category {i + 1}</span>
                </div>
                {form.ticketCategories.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeCategory(i)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>Name *</Label>
                  <Input value={cat.name} onChange={e => updateCategory(i, 'name', e.target.value)} placeholder="Early Bird" required />
                </div>
                <div>
                  <Label>Price ($) *</Label>
                  <Input type="number" step="0.01" min="0" value={cat.price} onChange={e => updateCategory(i, 'price', e.target.value)} required />
                </div>
                <div>
                  <Label>Quantity *</Label>
                  <Input type="number" min="1" value={cat.quantity} onChange={e => updateCategory(i, 'quantity', e.target.value)} required />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={cat.description} onChange={e => updateCategory(i, 'description', e.target.value)} placeholder="Limited early pricing" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={cat.sequential} onChange={e => updateCategory(i, 'sequential', e.target.checked)} className="rounded" />
                Sequential: only available after previous category sells out
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Refund Policy</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRefundTier}>
              <Plus className="w-4 h-4 mr-1" /> Add Tier
            </Button>
          </div>
          <p className="text-sm text-gray-500">Configure refund windows. A $2 handling fee applies to all refunds.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.refundPolicy.map((tier, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Days before event</Label>
                  <Input type="number" min="0" value={tier.daysBeforeEvent} onChange={e => updateRefundTier(i, 'daysBeforeEvent', e.target.value)} />
                </div>
                <div>
                  <Label>Refund %</Label>
                  <Input type="number" min="0" max="100" value={tier.refundPercentage} onChange={e => updateRefundTier(i, 'refundPercentage', e.target.value)} />
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeRefundTier(i)} className="text-red-500 mt-5">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {form.refundPolicy.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No refund policy - refunds will not be available</p>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Event Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={form.status} onValueChange={v => updateField('status', v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Create Event'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
