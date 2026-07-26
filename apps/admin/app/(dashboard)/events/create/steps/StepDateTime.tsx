"use client";

interface Props {
  formData: any;
  updateFormData: (updates: any) => void;
}

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "IST (India)" },
  { value: "America/New_York", label: "EST (New York)" },
  { value: "America/Los_Angeles", label: "PST (Los Angeles)" },
  { value: "Europe/London", label: "GMT (London)" },
  { value: "Europe/Berlin", label: "CET (Berlin)" },
  { value: "Asia/Singapore", label: "SGT (Singapore)" },
  { value: "Asia/Tokyo", label: "JST (Tokyo)" },
  { value: "Australia/Sydney", label: "AEST (Sydney)" },
  { value: "UTC", label: "UTC" },
];

export default function StepDateTime({ formData, updateFormData }: Props) {
  const showPhysical = formData.format === "IN_PERSON" || formData.format === "HYBRID";
  const showVirtual = formData.format === "VIRTUAL" || formData.format === "HYBRID";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-sora font-bold text-gray-900 dark:text-white">
          Date & Location
        </h2>
        <p className="mt-1 text-sm text-gray-500 font-jakarta">
          When and where is your event happening?
        </p>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            value={formData.startAt ? formData.startAt.slice(0, 16) : ""}
            onChange={(e) =>
              updateFormData({ startAt: e.target.value ? new Date(e.target.value).toISOString() : "" })
            }
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
            End Date & Time *
          </label>
          <input
            type="datetime-local"
            value={formData.endAt ? formData.endAt.slice(0, 16) : ""}
            onChange={(e) =>
              updateFormData({ endAt: e.target.value ? new Date(e.target.value).toISOString() : "" })
            }
            className="input-field"
          />
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
          Timezone
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => updateFormData({ timezone: e.target.value })}
          className="input-field"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Physical Location */}
      {showPhysical && (
        <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-sora font-semibold text-gray-700 dark:text-gray-200">
            Venue Details
          </h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
              Venue Name
            </label>
            <input
              type="text"
              value={formData.venueName}
              onChange={(e) => updateFormData({ venueName: e.target.value })}
              placeholder="e.g. T-Hub, HITEC City"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
              Full Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              placeholder="e.g. Plot No 1/C, Sy No 83/1, Raidurgam"
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude ?? ""}
                onChange={(e) =>
                  updateFormData({
                    latitude: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="17.4435"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude ?? ""}
                onChange={(e) =>
                  updateFormData({
                    longitude: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="78.3772"
                className="input-field"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 font-jakarta">
            Tip: Right-click on Google Maps to copy coordinates.
          </p>
        </div>
      )}

      {/* Virtual Link */}
      {showVirtual && (
        <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-sora font-semibold text-gray-700 dark:text-gray-200">
            Virtual Meeting
          </h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">
              Meeting Link
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => updateFormData({ meetingLink: e.target.value })}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="input-field"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.revealLinkAfterRegistration}
              onChange={(e) =>
                updateFormData({ revealLinkAfterRegistration: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">
              Only reveal meeting link after registration
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
