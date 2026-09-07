'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';

interface DeleteButtonProps {
  itemId: string;
  itemName: string;
  deleteEndpoint: string;
}

export function DeleteButton({ itemId, itemName, deleteEndpoint }: DeleteButtonProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await fetch(deleteEndpoint, {
        method: 'POST',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          handleDelete();
          setConfirmDelete(false);
        }}
        title="Delete Item"
        message={`Are you sure you want to delete ${itemName}?`}
        confirmLabel="Delete"
        variant="danger"
        requireTyping={true}
      />
    </>
  );
}
