'use client';

import { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, Upload, Trash2, Search, X, Copy, Check, Loader2 } from 'lucide-react';
import { listMediaAction, uploadMediaFileAction, deleteMediaAction } from './actions';

interface MediaFile { id: string; name: string; size: string; uploadedAt: string; url: string; }

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMediaAction();
      if (res.success) setFiles(res.data);
      else setError(res.error || 'Failed to load media');
    } catch (e) {
      setError('Failed to connect to media storage');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadMediaFileAction(formData);
      if (res.success && res.data) {
        setFiles(prev => [res.data as MediaFile, ...prev]);
      } else {
        alert(res.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteMediaAction(id);
      if (res.success) setFiles(prev => prev.filter(f => f.id !== id));
      else alert(res.error || 'Delete failed');
    } catch (e) {
      alert('Delete failed');
    } finally {
      setDeleteConfirm(null);
    }
  };

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
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            {loading ? 'Loading...' : `${files.length} files`}
          </p>
        </div>
        <div className="relative">
          <input type="file" onChange={handleUpload} id="media-upload" className="hidden" accept="image/*,video/*" disabled={uploading} />
          <label htmlFor="media-upload" className={`btn-brand text-sm flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload'}
          </label>
        </div>
      </div>

      {/* Drop zone */}
      <div className="relative">
        <input type="file" onChange={handleUpload} id="media-upload-lg" className="hidden" accept="image/*,video/*" disabled={uploading} />
        <label htmlFor="media-upload-lg" className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-brand transition-colors cursor-pointer bg-white dark:bg-gray-900">
          <Upload className={`w-8 h-8 mx-auto mb-2 ${uploading ? 'text-brand animate-bounce' : 'text-gray-300 dark:text-gray-600'}`} />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">{uploading ? 'Processing upload...' : 'Click to upload'}</p>
          <p className="text-xs text-gray-300 dark:text-gray-600 font-jakarta mt-1">PNG, JPG, WebP, SVG up to 20MB</p>
        </label>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400 font-jakarta">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-gray-400 font-jakarta">
              {files.length === 0 ? 'No media files yet. Upload your first file above.' : 'No files match your search.'}
            </div>
          )}
          {filtered.map((file) => (
            <div key={file.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden group hover:border-brand/30 transition-colors">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                {file.url ? (
                  <img src={file.url} alt={file.name} className="object-cover w-full h-full" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                )}
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
                <p className="font-jakarta text-xs font-medium text-navy dark:text-white truncate" title={file.name}>{file.name}</p>
                <p className="text-[10px] text-gray-400 font-jakarta mt-0.5">{file.size} · {new Date(file.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete File?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This file will be permanently removed from storage.</p>
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
