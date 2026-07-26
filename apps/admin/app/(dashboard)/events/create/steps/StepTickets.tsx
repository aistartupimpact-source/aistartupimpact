"use client";

import { Plus, X, HelpCircle } from "lucide-react";

interface Props {
  formData: any;
  updateFormData: (updates: any) => void;
}

const TIER_TYPES = [
  { value: "EARLY_BIRD", label: "Early Bird" },
  { value: "REGULAR", label: "Regular" },
  { value: "VIP", label: "VIP" },
];

const QUESTION_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "SELECT", label: "Dropdown" },
  { value: "CHECKBOX", label: "Checkbox" },
];

export default function StepTickets({ formData, updateFormData }: Props) {
  // ─── Ticket Tiers ───
  const addTier = () => {
    updateFormData({
      ticketTiers: [
        ...formData.ticketTiers,
        { name: "General Admission", priceCents: 0, quantity: null, tierType: "REGULAR", description: "" },
      ],
    });
  };

  const updateTier = (index: number, field: string, value: any) => {
    const updated = [...formData.ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ ticketTiers: updated });
  };

  const removeTier = (index: number) => {
    updateFormData({
      ticketTiers: formData.ticketTiers.filter((_: any, i: number) => i !== index),
    });
  };

  // ─── Custom Questions ───
  const addQuestion = () => {
    updateFormData({
      customQuestions: [
        ...formData.customQuestions,
        { questionText: "", questionType: "TEXT", options: [], required: false },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...formData.customQuestions];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ customQuestions: updated });
  };

  const removeQuestion = (index: number) => {
    updateFormData({
      customQuestions: formData.customQuestions.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-sora font-bold text-gray-900 dark:text-white">
          Tickets & Registration
        </h2>
        <p className="mt-1 text-sm text-gray-500 font-jakarta">
          Configure ticket tiers and custom registration questions.
        </p>
      </div>

      {/* ─── Ticket Tiers ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase font-jakarta">
              Ticket Tiers
            </label>
            <p className="text-xs text-gray-400 font-jakarta mt-0.5">
              All events are free. Tiers can be used for capacity limits (e.g. VIP seating).
            </p>
          </div>
          <button
            onClick={addTier}
            className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-600 font-jakarta"
          >
            <Plus className="w-3.5 h-3.5" /> Add Tier
          </button>
        </div>

        {formData.ticketTiers.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <p className="text-sm text-gray-400 font-jakarta">
              No ticket tiers. Registrants will simply RSVP with no tier selection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.ticketTiers.map((tier: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 font-jakarta">
                    Tier {i + 1}
                  </span>
                  <button
                    onClick={() => removeTier(i)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(i, "name", e.target.value)}
                    placeholder="Tier name"
                    className="input-field"
                  />
                  <select
                    value={tier.tierType}
                    onChange={(e) => updateTier(i, "tierType", e.target.value)}
                    className="input-field"
                  >
                    {TIER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={tier.quantity ?? ""}
                    onChange={(e) =>
                      updateTier(i, "quantity", e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="Qty (unlimited)"
                    className="input-field"
                  />
                </div>
                <input
                  type="text"
                  value={tier.description || ""}
                  onChange={(e) => updateTier(i, "description", e.target.value)}
                  placeholder="Description (optional)"
                  className="input-field mt-3"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Custom Questions ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase font-jakarta">
              Custom Questions
            </label>
            <p className="text-xs text-gray-400 font-jakarta mt-0.5">
              Ask registrants additional questions (company, dietary, T-shirt size, etc.)
            </p>
          </div>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-600 font-jakarta"
          >
            <Plus className="w-3.5 h-3.5" /> Add Question
          </button>
        </div>

        {formData.customQuestions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-jakarta">
              No custom questions. Basic info (name, email) is always collected.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.customQuestions.map((q: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 font-jakarta">
                    Question {i + 1}
                  </span>
                  <button
                    onClick={() => removeQuestion(i)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => updateQuestion(i, "questionText", e.target.value)}
                      placeholder="Question text"
                      className="input-field"
                    />
                  </div>
                  <select
                    value={q.questionType}
                    onChange={(e) => updateQuestion(i, "questionType", e.target.value)}
                    className="input-field"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {q.questionType === "SELECT" && (
                  <input
                    type="text"
                    value={(q.options || []).join(", ")}
                    onChange={(e) =>
                      updateQuestion(
                        i,
                        "options",
                        e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="Options (comma-separated): Small, Medium, Large"
                    className="input-field mt-3"
                  />
                )}
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(i, "required", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">
                    Required
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
