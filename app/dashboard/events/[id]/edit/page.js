'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EventForm } from '@/components/event-form';
import { Loader2 } from 'lucide-react';

export default function EditEventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(r => r.json())
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!event) {
    return <p className="text-center py-20 text-gray-500">Event not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Event</h1>
      <EventForm event={event} />
    </div>
  );
}
