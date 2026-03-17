'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff, GripVertical } from 'lucide-react';
import {
  getSponsorsAction,
  createSponsorAction,
  updateSponsorAction,
  deleteSponsorAction,
  toggleSponsorStatusAction,
} from './actions';

interface Sponsor {
  id: string;
  brand: string;
  tagline: string;
  ctaUrl: string;
  logoUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    tagline: '',
    ctaUrl: '',
    logoUrl: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    setLoading(true);
    try {
      const result = await getSponsorsAction();
      
      if (result.success) {
        setSponsors(result.data as Sponsor[]);
      } else {
        console.error('Error loading sponsors:', result.error);
        alert(`Error loading sponsors: ${result.error}`);
      }
    } catch (error) {
      console.error('Unexpected error loading sponsors:', error);
      alert(`Unexpected error: ${(error as any).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    
    if (editingSponsor) {
      form.append('id', editingSponsor.id);
    }
    
    form.append('brand', formData.brand);
    form.append('tagline', formData.tagline);
    form.append('ctaUrl', formData.ctaUrl);
    form.append('logoUrl', formData.logoUrl);
    form.append('isActive', formData.isActive.toString());
    form.append('sortOrder', formData.sortOrder.toString());

    const result = editingSponsor 
      ? await updateSponsorAction(form)
      : await createSponsorAction(form);

    if (result.success) {
      setShowModal(false);
      setEditingSponsor(null);
      resetForm();
      loadSponsors();
    } else {
      alert(result.error);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      brand: sponsor.brand,
      tagline: sponsor.tagline,
      ctaUrl: sponsor.ctaUrl,
      logoUrl: sponsor.logoUrl || '',
      isActive: sponsor.isActive,
      sortOrder: sponsor.sortOrder,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;
    
    const form = new FormData();
    form.append('id', id);
    
    const result = await deleteSponsorAction(form);
    if (result.success) {
      loadSponsors();
    } else {
      alert(result.error);
    }
  };

  const handleToggleStatus = async (sponsor: Sponsor) => {
    const form = new FormData();
    form.append('id', sponsor.id);
    form.append('isActive', sponsor.isActive.toString());
    
    const result = await toggleSponsorStatusAction(form);
    if (result.success) {
      loadSponsors();
    } else {
      alert(result.error);
    }
  };

  const resetForm = () => {
    setFormData({
      brand: '',
      tagline: '',
      ctaUrl: '',
      logoUrl: '',
      isActive: true,
      sortOrder: 0,
    });
  };

  const openCreateModal = () => {
    setEditingSponsor(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sponsors</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage sponsor content for the homepage sponsor strip
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-brand hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Sponsor
        </button>
      </div>

      {/* Sponsors Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tagline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sponsors.map((sponsor, index) => (
                <tr key={sponsor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {sponsor.sortOrder}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {sponsor.logoUrl && (
                        <img
                          src={sponsor.logoUrl}
                          alt={sponsor.brand}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {sponsor.brand}
                        </div>
                        <a
                          href={sponsor.ctaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand hover:underline flex items-center gap-1"
                        >
                          {sponsor.ctaUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {sponsor.tagline}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(sponsor)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        sponsor.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {sponsor.isActive ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(sponsor)}
                        className="text-brand hover:text-brand-600 p-1 hover:bg-brand/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sponsor.id)}
                        className="text-red-600 hover:text-red-700 p-1 hover:bg-red/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="text-lg font-medium mb-2">No sponsors yet</p>
                      <p className="text-sm">Add your first sponsor to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tagline *
                  </label>
                  <textarea
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CTA URL *
                  </label>
                  <input
                    type="url"
                    value={formData.ctaUrl}
                    onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-brand bg-gray-100 border-gray-300 rounded focus:ring-brand dark:focus:ring-brand dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-brand hover:bg-brand-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {editingSponsor ? 'Update Sponsor' : 'Create Sponsor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}