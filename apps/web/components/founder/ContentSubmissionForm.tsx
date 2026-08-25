"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Save, Send, Image as ImageIcon, X, Clock } from "lucide-react";

interface Startup {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface ContentSubmissionFormProps {
  contentType: "STARTUP_UPDATE" | "FOUNDER_STORY";
  startups: Startup[];
  existingData?: any;
  onSuccess: (article: any) => void;
  onCancel?: () => void;
}

const STORY_CATEGORIES = [
  "Founding Story", "Lessons Learned", "Industry Insight",
  "Case Study", "Behind the Scenes", "Growth Story",
];

const UPDATE_TAGS = [
  "Product", "Engineering", "Growth", "Team", "General",
];

export default function ContentSubmissionForm({
  contentType, startups, existingData, onSuccess, onCancel,
}: ContentSubmissionFormProps) {
  const [title, setTitle] = useState(existingData?.title || "");
  const [body, setBody] = useState(existingData?.contentText || "");
  const [excerpt, setExcerpt] = useState(existingData?.excerpt || "");
  const [coverImage, setCoverImage] = useState(existingData?.coverImage || "");
  const [startupId, setStartupId] = useState(existingData?.startupId || startups[0]?.id || "");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("General");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [articleId, setArticleId] = useState(existingData?.id || null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const isStory = contentType === "FOUNDER_STORY";

  const showMsg = (text: string, type: "success" | "error") => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

  const saveDraft = useCallback(async (auto = false) => {
    if (!title.trim()) return;
    if (auto) {
      try {
        localStorage.setItem(`draft-${contentType}-${startupId}`, JSON.stringify({ title, body, excerpt, coverImage, category, tag, savedAt: new Date().toISOString() }));
        setLastSaved(new Date());
      } catch {}
      return;
    }

    setSaving(true);
    try {
      if (articleId) {
        const res = await fetch(`/api/founder/content/${articleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content: body, excerpt, coverImage, isAutoSave: false }),
        });
        const d = await res.json();
        if (d.success) { showMsg("Draft saved", "success"); setLastSaved(new Date()); }
        else showMsg(d.error || "Failed to save", "error");
      } else {
        const res = await fetch("/api/founder/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content: body, excerpt, type: contentType, startupId, coverImage, isDraft: true }),
        });
        const d = await res.json();
        if (d.success) { setArticleId(d.article.id); showMsg("Draft saved", "success"); setLastSaved(new Date()); }
        else showMsg(d.error || "Failed to save", "error");
      }
    } catch { showMsg("Failed to save", "error"); }
    setSaving(false);
  }, [title, body, excerpt, coverImage, contentType, startupId, articleId, category, tag]);

  useEffect(() => {
    if (!existingData && startupId) {
      try {
        const saved = localStorage.getItem(`draft-${contentType}-${startupId}`);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.title) setTitle(draft.title);
          if (draft.body) setBody(draft.body);
          if (draft.excerpt) setExcerpt(draft.excerpt);
          if (draft.coverImage) setCoverImage(draft.coverImage);
          if (draft.category) setCategory(draft.category);
          if (draft.tag) setTag(draft.tag);
          setLastSaved(new Date(draft.savedAt));
        }
      } catch {}
    }
  }, [contentType, startupId, existingData]);

  useEffect(() => {
    if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    autoSaveTimer.current = setInterval(() => { if (title.trim()) saveDraft(true); }, 10000);
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current); };
  }, [saveDraft, title]);

  const handleSubmit = async () => {
    if (!title.trim()) return showMsg("Title is required", "error");
    if (isStory && body.length < 100) return showMsg("Story must be at least 100 characters", "error");
    if (!startupId) return showMsg("Select a startup", "error");

    setSubmitting(true);
    try {
      if (articleId) {
        const res = await fetch(`/api/founder/content/${articleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content: body, excerpt, coverImage, submitForReview: isStory }),
        });
        const d = await res.json();
        if (d.success) {
          localStorage.removeItem(`draft-${contentType}-${startupId}`);
          onSuccess(d.article);
        } else showMsg(d.error || "Failed", "error");
      } else {
        const res = await fetch("/api/founder/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content: body, excerpt, type: contentType, startupId, coverImage, isDraft: false }),
        });
        const d = await res.json();
        if (d.success) {
          localStorage.removeItem(`draft-${contentType}-${startupId}`);
          onSuccess(d.article);
        } else showMsg(d.error || "Failed", "error");
      }
    } catch { showMsg("Something went wrong", "error"); }
    setSubmitting(false);
  };

  const wordCount = body.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {msg && (
        <p className={`text-xs font-jakarta px-3 py-2 rounded-lg ${msgType === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>{msg}</p>
      )}

      {existingData?.moderationNote && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase mb-1 font-jakarta">Admin Feedback</p>
          <p className="text-sm text-amber-800 dark:text-amber-300 font-jakarta">{existingData.moderationNote}</p>
        </div>
      )}

      {startups.length > 1 && (
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-jakarta">Startup</label>
          <select value={startupId} onChange={e => setStartupId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-jakarta text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20">
            {startups.filter(s => s.role !== "VIEWER").map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-jakarta">Title *</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder={isStory ? "Your story title..." : "What's new with your startup?"} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20" />
        <p className="text-xs text-gray-400 mt-1 font-jakarta text-right">{title.length}/200</p>
      </div>

      {isStory && (
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-jakarta">Excerpt</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} maxLength={500} rows={2} placeholder="A short summary for previews..." className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 resize-y" />
          <p className="text-xs text-gray-400 mt-1 font-jakarta text-right">{excerpt.length}/500</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-jakarta">
          {isStory ? "Story" : "Update"} *
        </label>
        <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={isStory ? 50000 : 5000} rows={isStory ? 16 : 6} placeholder={isStory ? "Tell your story..." : "Share your update..."} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 resize-y leading-relaxed" />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-400 font-jakarta">{wordCount} words</p>
          <p className="text-xs text-gray-400 font-jakarta">{body.length}/{isStory ? "50,000" : "5,000"}</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-jakarta">Cover Image URL</label>
        <div className="flex gap-2">
          <input type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20" />
          {coverImage && <button onClick={() => setCoverImage("")} className="p-2.5 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
        </div>
      </div>

      {isStory ? (
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-jakarta">Category</label>
          <div className="flex flex-wrap gap-2">
            {STORY_CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-medium transition-all ${category === c ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>{c}</button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-jakarta">Tag</label>
          <div className="flex flex-wrap gap-2">
            {UPDATE_TAGS.map(t => (
              <button key={t} type="button" onClick={() => setTag(t)} className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-medium transition-all ${tag === t ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>{t}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Saved {Math.round((Date.now() - lastSaved.getTime()) / 1000)}s ago
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button onClick={onCancel} className="px-4 py-2.5 text-sm font-jakarta font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
          )}
          <button onClick={() => saveDraft(false)} disabled={saving || !title.trim()} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-jakarta font-bold text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
          </button>
          <button onClick={handleSubmit} disabled={submitting || !title.trim()} className="px-4 py-2.5 bg-brand hover:bg-brand-600 text-white text-sm font-jakarta font-bold rounded-lg disabled:opacity-40 flex items-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isStory ? "Submit for Review" : "Publish Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
