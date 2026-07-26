"use client";

import { useCallback } from "react";
import { checkSlugAction } from "../../actions";

interface Props {
  formData: any;
  updateFormData: (updates: any) => void;
}

const CATEGORIES = [
  { value: "CONFERENCE", label: "Conference" },
  { value: "HACKATHON", label: "Hackathon" },
  { value: "SUMMIT", label: "Summit" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "MEETUP", label: "Meetup" },
  { value: "DEMO_DAY", label: "Demo Day" },
  { value: "WEBINAR", label: "Webinar" },
  { value: "NETWORKING", label: "Networking" },
];

const FORMATS = [
  { value: "IN_PERSON", label: "In Person", desc: "Physical venue" },
  { value: "VIRTUAL", label: "Virtual", desc: "Online only" },
  { value: "HYBRID", label: "Hybrid", desc: "In person + virtual" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export default function StepBasics({ formData, updateFormData }: Props) {
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      const updates: any = { title };
      // Auto-generate slug if user hasn't manually edited it
      if (!formData.slug || formData.slug === slugify(formData.title)) {
        updates.slug = slugify(title);
      }
      updateFormData(updates);
    },
    [formData.slug, formData.title, updateFormData]
  );

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ slug: slugify(e.target.value) });
  };

  const handleSlugBlur = async () => {
    if (formData.slug) {
      const result = await checkSlugAction(formData.slug);
      if (!result.available) {
        // Append a random suffix
        updateFormData({ slug: `${formData.slug}-${Date.now().toString(36).slice(-4)}` });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-sora font-bold text-gray-900 dark:text-white">
          Event Basics
        </h2>
        <p className="mt-1 text-sm text-gray-500 font-jakarta">
          Start with the essential information about your event.
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
          Event Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={handleTitleChange}
          placeholder="e.g. AI Builders Hackathon 2025"
          className="input-field"
          maxLength={200}
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
          Subtitle / Tagline
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => updateFormData({ subtitle: e.target.value })}
          placeholder="e.g. Build the future of AI in 48 hours"
          className="input-field"
          maxLength={300}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
          URL Slug *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-jakarta">/events/</span>
          <input
            type="text"
            value={formData.slug}
            onChange={handleSlugChange}
            onBlur={handleSlugBlur}
            placeholder="ai-builders-hackathon-2025"
            className="input-field flex-1"
            maxLength={200}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
          Category *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateFormData({ category: cat.value })}
              className={`px-3 py-2.5 rounded-xl text-sm font-jakarta font-medium border transition-all ${
                formData.category === cat.value
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
          Format *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {FORMATS.map((fmt) => (
            <button
              key={fmt.value}
              type="button"
              onClick={() => updateFormData({ format: fmt.value })}
              className={`px-4 py-3 rounded-xl text-center border transition-all ${
                formData.format === fmt.value
                  ? "border-brand bg-brand/5"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <p
                className={`text-sm font-medium font-jakarta ${
                  formData.format === fmt.value
                    ? "text-brand"
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {fmt.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{fmt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
