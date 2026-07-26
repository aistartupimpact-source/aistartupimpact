"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ChevronRight,
  ChevronLeft,
  Check,
  FileText,
  Calendar,
  Image as ImageIcon,
  Ticket,
  Settings,
  Eye,
} from "lucide-react";
import { saveEventAction, publishEventAction } from "../actions";
import StepBasics from "./steps/StepBasics";
import StepDateTime from "./steps/StepDateTime";
import StepDetails from "./steps/StepDetails";
import StepTickets from "./steps/StepTickets";
import StepSettings from "./steps/StepSettings";
import StepPreview from "./steps/StepPreview";

interface EventTag {
  id: string;
  name: string;
  canonicalName: string;
  category: string | null;
}

interface Props {
  tags: EventTag[];
}

const STEPS = [
  { id: 1, label: "Basics", icon: FileText },
  { id: 2, label: "Date & Location", icon: Calendar },
  { id: 3, label: "Details", icon: ImageIcon },
  { id: 4, label: "Tickets & Capacity", icon: Ticket },
  { id: 5, label: "Settings", icon: Settings },
  { id: 6, label: "Preview", icon: Eye },
];

export default function EventCreateForm({ tags }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);

  // ─── Form State ───
  const [formData, setFormData] = useState({
    // Step 1: Basics
    title: "",
    subtitle: "",
    category: "CONFERENCE" as string,
    format: "IN_PERSON" as string,
    slug: "",
    // Step 2: Date & Location
    startAt: "",
    endAt: "",
    timezone: "Asia/Kolkata",
    venueName: "",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
    meetingLink: "",
    revealLinkAfterRegistration: false,
    // Step 3: Details
    coverImageUrl: "",
    galleryImageUrls: [] as string[],
    description: null as any,
    speakers: [] as any[],
    agendaItems: [] as any[],
    // Step 4: Tickets
    ticketTiers: [] as any[],
    customQuestions: [] as any[],
    // Step 5: Settings
    visibility: "PUBLIC" as string,
    capacity: null as number | null,
    registrationDeadline: "",
    approvalRequired: false,
    metaTitle: "",
    metaDescription: "",
    socialImageUrl: "",
    publishAt: "",
    tags: [] as string[],
  });

  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // ─── Save Draft ───
  const handleSaveDraft = async () => {
    if (!formData.title || !formData.slug) {
      setSaveMessage("Title and slug are required to save.");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setSaving(true);
    setSaveMessage("");

    const result = await saveEventAction({
      id: eventId,
      ...formData,
      status: "DRAFT",
      startAt: formData.startAt || new Date().toISOString(),
      endAt: formData.endAt || new Date().toISOString(),
    });

    if (result.success && result.data) {
      setEventId(result.data.id);
      setSaveMessage("Draft saved");
    } else {
      setSaveMessage(result.error || "Save failed");
    }

    setSaving(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  // ─── Publish ───
  const handlePublish = async () => {
    // Save first, then publish
    setSaving(true);

    const saveResult = await saveEventAction({
      id: eventId,
      ...formData,
      status: "DRAFT",
      startAt: formData.startAt || new Date().toISOString(),
      endAt: formData.endAt || new Date().toISOString(),
    });

    if (!saveResult.success) {
      setSaveMessage(saveResult.error || "Save failed");
      setSaving(false);
      return;
    }

    const id = saveResult.data?.id || eventId;
    if (!id) {
      setSaveMessage("Failed to get event ID");
      setSaving(false);
      return;
    }

    const publishResult = await publishEventAction(id);
    if (publishResult.success) {
      router.push("/events");
    } else {
      setSaveMessage(publishResult.error || "Publish failed");
    }
    setSaving(false);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.title.length >= 3 && formData.slug.length >= 3;
      case 2:
        return formData.startAt && formData.endAt;
      default:
        return true;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] -m-6 flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <h1 className="text-lg font-sora font-bold text-gray-900 dark:text-white">
            Create Event
          </h1>
          {saveMessage && (
            <span
              className={`text-xs font-jakarta ${
                saveMessage.includes("failed") || saveMessage.includes("required")
                  ? "text-red-500"
                  : "text-green-600"
              }`}
            >
              {saveMessage}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-3 py-1.5 text-sm font-jakarta text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save Draft"}
          </button>
          {currentStep === 6 && (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-full transition-colors"
            >
              {saving ? "Publishing..." : "Publish"}
            </button>
          )}
        </div>
      </div>

      {/* ─── Step Indicator ─── */}
      <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1 max-w-4xl mx-auto">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-jakarta font-medium transition-all w-full ${
                    isActive
                      ? "bg-brand/10 text-brand border border-brand/20"
                      : isCompleted
                      ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden lg:inline">{step.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-gray-300 mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Form Content ─── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {currentStep === 1 && (
            <StepBasics formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <StepDateTime formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <StepDetails formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <StepTickets formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <StepSettings
              formData={formData}
              updateFormData={updateFormData}
              tags={tags}
            />
          )}
          {currentStep === 6 && <StepPreview formData={formData} tags={tags} />}
        </div>
      </div>

      {/* ─── Bottom Navigation ─── */}
      <div className="px-6 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-jakarta text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-xs text-gray-400 font-jakarta">
          Step {currentStep} of {STEPS.length}
        </span>
        <button
          onClick={() => setCurrentStep((s) => Math.min(STEPS.length, s + 1))}
          disabled={currentStep === STEPS.length || !canGoNext()}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-jakarta font-medium text-white bg-brand hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
