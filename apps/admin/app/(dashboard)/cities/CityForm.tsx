'use client';

import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

interface CityFormProps {
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    cityName: string;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    aliases?: string[];
  };
}

export default function CityForm({ action, initialData }: CityFormProps) {
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  
  // Check if initial state is in the pre-defined standard list
  const isInitialStateStandard = !initialData?.state || INDIAN_STATES.includes(initialData.state);
  
  const [isCustomState, setIsCustomState] = useState(!isInitialStateStandard);
  const [stateValue, setStateValue] = useState(initialData?.state || '');

  return (
    <form action={action} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 font-jakarta">
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-sora">
            City Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City Name *
              </label>
              <input
                type="text"
                name="cityName"
                defaultValue={initialData?.cityName}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g. Bengaluru"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State / Province
              </label>
              <select
                name="stateSelect"
                value={isCustomState ? 'custom' : stateValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setIsCustomState(true);
                    setStateValue('');
                  } else {
                    setIsCustomState(false);
                    setStateValue(val);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">Select State / UT...</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="custom">Other / Custom State...</option>
              </select>

              {/* Submit standard state value */}
              {!isCustomState && (
                <input type="hidden" name="state" value={stateValue} />
              )}

              {/* Input for custom state value */}
              {isCustomState && (
                <input
                  type="text"
                  name="state"
                  value={stateValue}
                  onChange={(e) => setStateValue(e.target.value)}
                  required
                  className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Type custom state/province name..."
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Latitude (Optional, for map)
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                defaultValue={initialData?.latitude ?? ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g. 12.9716"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Longitude (Optional, for map)
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                defaultValue={initialData?.longitude ?? ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g. 77.5946"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aliases (comma-separated, e.g. &quot;bangalore, blr, benguluru&quot;)
            </label>
            <input
              type="text"
              name="aliases"
              defaultValue={initialData?.aliases?.join(', ') || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="e.g. bangalore, blr, benguluru"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active in dropdown selector and maps
              </span>
            </label>
          </div>
        </div>

      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/cities"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          <Save className="w-4 h-4" />
          Save City
        </button>
      </div>
    </form>
  );
}
