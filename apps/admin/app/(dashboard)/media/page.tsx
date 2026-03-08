'use client';

import { useState } from 'react';
import { Image, Upload, Trash2, Search, X, Copy, Check } from 'lucide-react';

interface MediaFile { id: string; name: string; size: string; type: string; uploadedAt: string; dimensions: string; url: string; }

const initialMedia: MediaFile[] = [
  { id: '1', name: 'sarvam-ai-cover.webp', size: '245 KB', type: 'image/webp', uploadedAt: 'Mar 7, 2025', dimensions: '1200×630', url: '/uploads/sarvam-ai-cover.webp' },
  { id: '2', name: 'gpt5-hero.webp', size: '380 KB', type: 'image/webp', uploadedAt: 'Mar 6, 2025', dimensions: '1920×1080', url: '/uploads/gpt5-hero.webp' },
  { id: '3', name: 'krutrim-logo.png', size: '42 KB', type: 'image/png', uploadedAt: 'Mar 5, 2025', dimensions: '512×512', url: '/uploads/krutrim-logo.png' },
  { id: '4', name: 'funding-chart-w10.webp', size: '180 KB', type: 'image/webp', uploadedAt: 'Mar 7, 2025', dimensions: '800×450', url: '/uploads/funding-chart-w10.webp' },
  { id: '5', name: 'cursor-review.webp', size: '320 KB', type: 'image/webp', uploadedAt: 'Mar 4, 2025', dimensions: '1200×675', url: '/uploads/cursor-review.webp' },
  { id: '6', name: 'priya-sharma-avatar.webp', size: '28 KB', type: 'image/webp', uploadedAt: 'Feb 28, 2025', dimensions: '256×256', url: '/uploads/priya-sharma-avatar.webp' },
];

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>(initialMedia);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      const newFile: MediaFile = {
        id: Date.now().toString(),
        name: `upload-${Date.now()}.webp`,
        size: `${Math.floor(Math.random() * 400 + 50)} KB`,
        type: 'image/webp',
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dimensions: '1200×630',
        url: `/uploads/upload-${Date.now()}.webp`,
      };
      setFiles([newFile, ...files]);
      setUploading(false);
    }, 1500);
  };

  const handleDelete = (id: string) => { setFiles(files.filter(f => f.id !== id)); setDeleteConfirm(null); };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Media Library</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">{files.length} files</p>
        </div>
        <button onClick={handleUpload} disabled={uploading} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50">
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <div onClick={handleUpload} className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-brand transition-colors cursor-pointer bg-white dark:bg-gray-900">
        <Upload className={`w-8 h-8 mx-auto mb-2 ${uploading ? 'text-brand animate-bounce' : 'text-gray-300 dark:text-gray-600'}`} />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">{uploading ? 'Processing upload...' : 'Drag & drop files or click to upload'}</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 font-jakarta mt-1">PNG, JPG, WebP, SVG up to 20MB</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filtered.map((file) => (
          <div key={file.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden group hover:border-brand/30 transition-colors">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
              <Image className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => copyUrl(file.id, file.url)} className="p-2 bg-white/20 rounded-lg hover:bg-white/40 transition-colors" title="Copy URL">
                  {copied === file.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                </button>
                <button onClick={() => setDeleteConfirm(file.id)} className="p-2 bg-white/20 rounded-lg hover:bg-red-500/50 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="font-jakarta text-xs font-medium text-navy dark:text-white truncate">{file.name}</p>
              <p className="text-[10px] text-gray-400 font-jakarta mt-0.5">{file.size} · {file.dimensions}</p>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete File?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This file will be permanently removed.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
