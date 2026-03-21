'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, GripVertical, Shuffle, Upload, X } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';
import { DateTimePicker } from '@/components/date-time-picker';
import ColorPicker, { getColorHex } from '@/components/ui/color-picker';
import PatternPicker from '@/components/ui/pattern-picker';
import colors from '@/lib/tailwind-colors';

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
    primaryColor: event?.primaryColor || 'violet-700',
    secondaryColor: event?.secondaryColor || 'pink-500',
    backgroundPattern: event?.backgroundPattern || 'none',
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

  const bannerInputRef = useState(null)[1];
  const bannerFileRef = { current: null };

  function handleBannerFile(file) {
    if (!file?.type?.startsWith('image/')) { toast.error('Please select an image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => updateField('bannerImage', reader.result);
    reader.readAsDataURL(file);
  }

  function randomizeColors() {
    const colorNames = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
    const shades = [500, 600, 700];
    const pick = () => {
      const name = colorNames[Math.floor(Math.random() * colorNames.length)];
      const shade = shades[Math.floor(Math.random() * shades.length)];
      return `${name}-${shade}`;
    };
    let primary = pick();
    let secondary = pick();
    while (secondary.split('-')[0] === primary.split('-')[0]) {
      secondary = pick();
    }
    setForm(prev => ({ ...prev, primaryColor: primary, secondaryColor: secondary }));
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

  // Auto-save every 3 seconds when editing
  const autoSaveTimer = useRef(null);
  const lastSaved = useRef(JSON.stringify(form));
  const [autoSaving, setAutoSaving] = useState(false);

  const doAutoSave = useCallback(async () => {
    if (!isEditing) return;
    const current = JSON.stringify(form);
    if (current === lastSaved.current) return;
    lastSaved.current = current;
    setAutoSaving(true);
    try {
      const payload = {
        ...form,
        ticketCategories: form.ticketCategories.map((cat, i) => ({
          ...(cat._id ? { _id: cat._id } : {}),
          name: cat.name,
          description: cat.description,
          price: Math.round(parseFloat(cat.price || 0) * 100),
          quantity: parseInt(cat.quantity || 0),
          sortOrder: i,
          sequential: cat.sequential,
        })),
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      };
      await fetch(`/api/events/${event._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}
    setAutoSaving(false);
  }, [form, isEditing, event]);

  useEffect(() => {
    if (!isEditing) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(doAutoSave, 3000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [form, doAutoSave, isEditing]);

  const actionButtons = (
    <div className="flex items-center gap-3">
      <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isEditing ? 'Save Changes' : 'Create Event'}
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      {autoSaving && <span className="text-xs text-gray-400">Saving...</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {actionButtons}
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
          <div className="sm:col-span-2">
            <Label>Banner Image</Label>
            {form.bannerImage ? (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden" style={{ aspectRatio: '3/1' }}>
                  <img src={form.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => bannerFileRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-1" /> Change
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => updateField('bannerImage', '')}>
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                  <input ref={el => bannerFileRef.current = el} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleBannerFile(e.target.files[0])} />
                </div>
              </div>
            ) : (
              <div
                onClick={() => bannerFileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.files?.[0] && handleBannerFile(e.dataTransfer.files[0]); }}
                className="rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 p-8 text-center"
                style={{ aspectRatio: '3/1' }}
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-500">Drag and drop a banner image, or click to browse</p>
                <p className="text-xs text-gray-400">Recommended: 1200 x 400px. Max 5MB</p>
                <input ref={el => bannerFileRef.current = el} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleBannerFile(e.target.files[0])} />
              </div>
            )}
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <Label>Primary Colour</Label>
              <ColorPicker value={form.primaryColor} onChange={v => updateField('primaryColor', v)} />
            </div>
            <div>
              <Label>Secondary Colour</Label>
              <ColorPicker value={form.secondaryColor} onChange={v => updateField('secondaryColor', v)} />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={randomizeColors} className="h-10">
              <Shuffle className="w-4 h-4 mr-1" /> Randomize
            </Button>
          </div>
          <div>
            <Label>Background Pattern</Label>
            <PatternPicker
              value={form.backgroundPattern}
              onChange={v => updateField('backgroundPattern', v)}
              previewColor={getColorHex(form.secondaryColor) || '#ec4899'}
              previewBg={`${getColorHex(form.secondaryColor) || '#ec4899'}15`}
            />
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

      {actionButtons}
    </form>
  );
}
