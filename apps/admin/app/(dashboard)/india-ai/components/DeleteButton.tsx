'use client';

import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  itemId: string;
  itemName: string;
  deleteEndpoint: string;
}

export function DeleteButton({ itemId, itemName, deleteEndpoint }: DeleteButtonProps) {
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirm(`Are you sure you want to delete ${itemName}?`)) {
      return;
    }

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
    <form onSubmit={handleDelete}>
      <button
        type="submit"
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}
