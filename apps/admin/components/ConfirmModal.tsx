'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  requireTyping?: boolean;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  variant = 'danger',
  requireTyping = false,
  loading = false,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState('');

  if (!open) return null;

  const canConfirm = requireTyping ? typed === 'DELETE' : true;
  const isDanger = variant === 'danger';

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  const handleConfirm = () => {
    if (!canConfirm || loading) return;
    onConfirm();
    setTyped('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
        <div className="flex justify-end -mt-2 -mr-2">
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDanger ? (
          <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
        ) : (
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        )}

        <h3 className="font-sora font-bold text-lg text-navy dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 font-jakarta mt-2">{message}</p>

        {requireTyping && (
          <>
            <p className="text-xs text-gray-400 font-jakarta mt-3">
              Type <span className="font-bold text-red-500">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type DELETE"
              className="w-full mt-2 px-4 py-2 text-center text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono tracking-widest"
              autoFocus
            />
          </>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
