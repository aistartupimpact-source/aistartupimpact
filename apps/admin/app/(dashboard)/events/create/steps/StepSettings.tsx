"use client";

import { useState } from "react";
import { Tag } from "lucide-react";

interface EventTag {
  id: string;
  name: string;
  canonicalName: string;
  category: string | null;
}

interface Props {
  formData: any;
  updateFormData: (updates: any) => void;
  tags: EventTag[];
}

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Public", desc: "Visible to everyone, listed in search" },
  { value: "UNLISTED", label: "Unlisted", desc: "Accessible via link only" },
  { value: "INVITE_ONLY", label: "Invite Only", desc: "Only invited users can register" },
];

export default function StepSettings({ formData, updateFormData, tags }: Props) {
  const [tagSearch, setTagSearch] = useState("");

  const toggleTag = (tagId: string) => {
    const current = formData.tags as string[];
    if (current.includes(tagId)) {
      updateFormData({ tags: current.filter((id: string) => id !== tagId) });
    } else {
      updateFormData({ tags: [...current, tagId] });
    }
  };

  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(tagSearch.toLowerCase()) ||
      t.canonicalName.includes(tagSearch.toLowerCase())
  );

  // Group tags by category
  const groupedTags = filteredTags.reduce((acc, tag) => {
    const cat = tag.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tag);
    return acc;
  }, {} as Record<string, EventTag[]>);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-sora font-bold text-gray-900 dark:text-white">
          Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500 font-jakarta">
          Visibility, capacity, SEO, and topic tags.
        </p>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
          Visibility
        </label>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                formData.visibility === opt.value
                  ? "border-brand bg-brand/5"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={formData.visibility === opt.value}
                onChange={(e) => updateFormData({ visibility: e.target.value })}
                className="mt-0.5 w-4 h-4 text-brand focus:ring-brand"
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 font-jakarta">
                  {opt.label}
                </p>
                <p className="text-xs text-gray-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Capacity & Approval */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
            Capacity (max attendees)
          </label>
          <input
            type="number"
            min={1}
            value={formData.capacity ?? ""}
            onChange={(e) =>
              updateFormData({ capacity: e.target.value ? parseInt(e.target.value) : null })
            }
            placeholder="Unlimited"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
            Registration Deadline
          </label>
          <input
            type="datetime-local"
            value={formData.registrationDeadline ? formData.registrationDeadline.slice(0, 16) : ""}
            onChange={(e) =>
              updateFormData({
                registrationDeadline: e.target.value ? new Date(e.target.value).toISOString() : "",
              })
            }
            className="input-field"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.approvalRequired}
          onChange={(e) => updateFormData({ approvalRequired: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
        />
        <span className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">
          Require manual approval for each registration
        </span>
      </label>

      {/* Scheduled Publish */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
          Schedule Publish (optional)
        </label>
        <input
          type="datetime-local"
          value={formData.publishAt ? formData.publishAt.slice(0, 16) : ""}
          onChange={(e) =>
            updateFormData({
              publishAt: e.target.value ? new Date(e.target.value).toISOString() : "",
            })
          }
          className="input-field max-w-sm"
        />
        <p className="mt-1 text-xs text-gray-400 font-jakarta">
          Leave empty to publish immediately when you click Publish.
        </p>
      </div>

      {/* SEO */}
      <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-sora font-semibold text-gray-700 dark:text-gray-200">
          SEO Settings
        </h3>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
            Meta Title
          </label>
          <input
            type="text"
            value={formData.metaTitle}
            onChange={(e) => updateFormData({ metaTitle: e.target.value })}
            placeholder={formData.title || "Auto-generated from title"}
            className="input-field"
            maxLength={70}
          />
          <p className="mt-1 text-xs text-gray-400 font-jakarta">
            {(formData.metaTitle || formData.title).length}/70 characters
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
            Meta Description
          </label>
          <textarea
            value={formData.metaDescription}
            onChange={(e) => updateFormData({ metaDescription: e.target.value })}
            placeholder="Brief description for search engines..."
            rows={2}
            className="input-field resize-none"
            maxLength={160}
          />
          <p className="mt-1 text-xs text-gray-400 font-jakarta">
            {formData.metaDescription.length}/160 characters
          </p>
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-gray-400" />
          <label className="text-xs font-semibold text-gray-500 uppercase font-jakarta">
            Topic Tags
          </label>
          <span className="text-xs text-gray-400 font-jakarta">
            ({formData.tags.length} selected)
          </span>
        </div>
        <input
          type="text"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          placeholder="Search tags..."
          className="input-field mb-3"
        />
        <div className="max-h-60 overflow-y-auto space-y-4 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
          {Object.entries(groupedTags).map(([category, catTags]) => (
            <div key={category}>
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 font-jakarta">
                {category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {catTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium font-jakarta transition-all ${
                      formData.tags.includes(tag.id)
                        ? "bg-brand text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
