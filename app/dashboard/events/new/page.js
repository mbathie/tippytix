'use client';

import { EventForm } from '@/components/event-form';

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Event</h1>
      <EventForm />
    </div>
  );
}
