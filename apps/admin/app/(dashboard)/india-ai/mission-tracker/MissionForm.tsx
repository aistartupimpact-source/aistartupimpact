'use client';

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    component?: string;
    budgetAllocated?: string | bigint | number;
    budgetDisbursed?: string | bigint | number | null;
    description?: string | null;
    keyInitiatives?: string[] | null;
    displayOrder?: number | null;
    isActive?: boolean | null;
  };
}

function toCrores(val: string | bigint | number | null | undefined): string {
  if (!val) return '';
  const n = Number(val);
  return (n / 10000000000).toString();
}

export default function MissionForm({ action, defaultValues }: Props) {
  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form action={action} className="max-w-2xl space-y-4">
      <div>
        <label className={labelClass}>Pillar / Component Name *</label>
        <input name="component" required className={inputClass} defaultValue={defaultValues?.component} placeholder="IndiaAI Compute Capacity" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Budget Allocated (₹ Cr) *</label>
          <input name="budgetAllocatedCr" required type="number" step="0.01" className={inputClass} defaultValue={toCrores(defaultValues?.budgetAllocated)} placeholder="4563.36" />
        </div>
        <div>
          <label className={labelClass}>Budget Disbursed (₹ Cr)</label>
          <input name="budgetDisbursedCr" type="number" step="0.01" className={inputClass} defaultValue={toCrores(defaultValues?.budgetDisbursed)} placeholder="0" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={3} className={inputClass} defaultValue={defaultValues?.description || ''} placeholder="AI compute infrastructure — key details..." />
      </div>

      <div>
        <label className={labelClass}>Key Initiatives (one per line)</label>
        <textarea name="keyInitiatives" rows={5} className={inputClass} defaultValue={defaultValues?.keyInitiatives?.join('\n') || ''} placeholder="15 compute service providers empaneled&#10;237 projects approved&#10;93.18 lakh GPU hours sanctioned" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Display Order</label>
          <input name="displayOrder" type="number" className={inputClass} defaultValue={defaultValues?.displayOrder || 0} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input name="isActive" type="checkbox" defaultChecked={defaultValues?.isActive !== false} className="w-4 h-4" />
          <label className="text-sm text-gray-700 dark:text-gray-300">Active</label>
        </div>
      </div>

      <div className="pt-4">
        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm">
          Save Pillar
        </button>
      </div>
    </form>
  );
}
