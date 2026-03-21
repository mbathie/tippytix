'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Format a Date to local datetime-local string (YYYY-MM-DDTHH:MM)
function toLocalDateTimeString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function DateTimePicker({ value, onChange, placeholder = 'Pick date & time', required = false }) {
  const [open, setOpen] = useState(false);

  const date = value ? new Date(value) : null;
  const hours = date ? date.getHours() : 19;
  const minutes = date ? date.getMinutes() : 0;

  function handleDateSelect(selectedDate) {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    onChange(toLocalDateTimeString(newDate));
  }

  function handleTimeChange(type, val) {
    const d = date ? new Date(date) : new Date();
    if (type === 'hour') d.setHours(parseInt(val));
    if (type === 'minute') d.setMinutes(parseInt(val));
    d.setSeconds(0);
    onChange(toLocalDateTimeString(d));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-10',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP p') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={{ before: new Date() }}
          initialFocus
        />
        <div className="border-t p-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time:</span>
          <Select value={String(hours)} onValueChange={(v) => handleTimeChange('hour', v)}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {String(i).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select value={String(minutes)} onValueChange={(v) => handleTimeChange('minute', v)}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {String(m).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
