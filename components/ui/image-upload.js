'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  aspectRatio = 'video',
  maxSize = 5,
  placeholder = 'Drag and drop a banner image, or click to browse',
  isUploading = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Image must be less than ${maxSize}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    } else {
      onChange(null);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const aspectClass = aspectClasses[aspectRatio] || '';
  const aspectStyle = !aspectClasses[aspectRatio] ? { aspectRatio } : {};

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer overflow-hidden',
          aspectClass,
          isDragging
            ? 'border-primary bg-primary/5'
            : value
            ? 'border-transparent'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
        style={aspectStyle}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 transition-opacity flex items-center justify-center gap-2 bg-black/40 opacity-0 hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{placeholder}</p>
                <p className="text-xs text-muted-foreground/60">Recommended: 1200 x 400px. Max {maxSize}MB</p>
              </>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
