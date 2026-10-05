'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, Plus, Loader2, GripVertical, ImagePlus } from 'lucide-react';

interface ScreenshotManagerProps {
  screenshots: string[];
  onChange: (screenshots: string[]) => void;
  onError?: (msg: string) => void;
  maxScreenshots?: number;
  uploadEndpoint?: string;
}

export default function ScreenshotManager({
  screenshots,
  onChange,
  onError,
  maxScreenshots = 5,
  uploadEndpoint = '/api/media/upload',
}: ScreenshotManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOverZone, setDragOverZone] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const reportError = (msg: string) => {
    if (onError) onError(msg);
    else console.error(msg);
  };

  const uploadFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    if (screenshots.length + imageFiles.length > maxScreenshots) {
      reportError(`Maximum ${maxScreenshots} screenshots allowed`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of imageFiles) {
      if (file.size > 5 * 1024 * 1024) {
        reportError('Each image must be less than 5MB');
        continue;
      }
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(uploadEndpoint, { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        if (data.url) newUrls.push(data.url);
      } catch (err) {
        reportError('Failed to upload screenshot');
        console.error(err);
      }
    }

    if (newUrls.length > 0) {
      onChange([...screenshots, ...newUrls]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [screenshots, onChange, maxScreenshots, uploadEndpoint]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(Array.from(e.target.files || []));
  };

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverZone(false);
    if (dragIndex !== null) return;
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOverZone = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex !== null) return;
    setDragOverZone(true);
  };

  const remove = (index: number) => {
    onChange(screenshots.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...screenshots];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Screenshots ({screenshots.length}/{maxScreenshots})
        </label>
        {screenshots.length > 1 && (
          <span className="text-xs text-gray-400">Drag to reorder</span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDropZone}
        onDragOver={handleDragOverZone}
        onDragLeave={() => setDragOverZone(false)}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          dragOverZone
            ? 'border-brand bg-brand/5 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 hover:border-brand/50'
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading || screenshots.length >= maxScreenshots}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="text-brand font-semibold">Click to upload</span> or drag & drop images here
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP — up to {maxScreenshots} screenshots</p>
          </div>
        )}
      </div>

      {/* Screenshots grid */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {screenshots.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 group cursor-grab active:cursor-grabbing transition-all ${
                dragIndex === index
                  ? 'opacity-40 scale-95 border-brand'
                  : dragOverIndex === index
                  ? 'border-brand shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Image
                src={url}
                alt={`Screenshot ${index + 1}`}
                width={400}
                height={225}
                unoptimized
                className="w-full h-full object-cover pointer-events-none"
              />
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {index + 1}
              </span>
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-black/50 p-0.5 rounded transition-opacity">
                <GripVertical className="w-3.5 h-3.5 text-white" />
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(index); }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-opacity z-10"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {screenshots.length < maxScreenshots && !uploading && (
            <label className="aspect-video border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand transition-colors">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              <Plus className="w-6 h-6 text-gray-400" />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
