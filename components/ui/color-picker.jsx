'use client'
import React, { useState, useRef, useEffect } from 'react';
import colors from '@/lib/tailwind-colors';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const tailwindColors = [
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose', 'slate', 'gray', 'zinc',
  'neutral', 'stone'
];

const shades = [100, 200, 300, 400, 500, 600, 700, 800, 900];

export default function ColorPicker({ value, onChange }) {
  const [selected, setSelected] = useState(value || "violet-500");
  const [open, setOpen] = useState(false);
  const selectedRef = useRef(null);

  useEffect(() => {
    setSelected(value || 'violet-500');
  }, [value]);

  useEffect(() => {
    if (open && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
    }
  }, [open]);

  const selectedHex = getColorHex(selected);

  return (
    <div className="flex items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-44 justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded border border-border"
                style={{ backgroundColor: selectedHex }}
              />
              <span className="text-sm">{selected}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-card" align="start">
        <div className="overflow-auto max-h-48">
          <div className="min-w-max">
            <div className="flex flex-col">
              {tailwindColors.map((color) => (
                <div key={color} className="flex">
                  {shades.map((shade) => (
                    <div
                      key={shade}
                      ref={selected === `${color}-${shade}` ? selectedRef : null}
                      onClick={() => {
                        const colorKey = `${color}-${shade}`;
                        setSelected(colorKey);
                        onChange(colorKey);
                        setOpen(false);
                      }}
                      className={`w-6 h-6 cursor-pointer transition-transform hover:scale-110 ${selected === `${color}-${shade}` ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110 z-10' : ''}`}
                      style={{ backgroundColor: colors[color]?.[shade] }}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* White and Black */}
            <div className="flex gap-1 mt-2 pt-2 border-t border-border">
              <div
                ref={selected === 'white' ? selectedRef : null}
                onClick={() => {
                  setSelected('white');
                  onChange('white');
                  setOpen(false);
                }}
                className={`w-6 h-6 cursor-pointer transition-transform hover:scale-110 border border-border ${selected === 'white' ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110 z-10' : ''}`}
                style={{ backgroundColor: '#ffffff' }}
              />
              <div
                ref={selected === 'black' ? selectedRef : null}
                onClick={() => {
                  setSelected('black');
                  onChange('black');
                  setOpen(false);
                }}
                className={`w-6 h-6 cursor-pointer transition-transform hover:scale-110 ${selected === 'black' ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110 z-10' : ''}`}
                style={{ backgroundColor: '#000000' }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
      </Popover>
    </div>
  );
}

// Helper to get the hex value from a color key like "violet-500"
export function getColorHex(colorKey) {
  if (!colorKey) return '#8b5cf6';
  // Handle special cases
  if (colorKey === 'white') return '#ffffff';
  if (colorKey === 'black') return '#000000';
  // Handle old format (just color name like "violet")
  if (!colorKey.includes('-')) {
    return colors[colorKey]?.[500] || '#8b5cf6';
  }
  const [color, shade] = colorKey.split('-');
  return colors[color]?.[shade] || '#8b5cf6';
}
