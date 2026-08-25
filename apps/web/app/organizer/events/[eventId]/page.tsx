"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";

export default function EditEventPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [event, setEvent] = useState<any>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/organizer/events/${params.eventId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.event) {
          const e = d.event;
          setEvent(e);
          setTitle(e.title || "");
          setSubtitle(e.subtitle || "");
          setDescription(typeof e.description === "object" && e.description?.text ? e.description.text : (e.description || ""));
          setVenueName(e.venueName || "");
          setAddress(e.address || "");
          setMeetingLink(e.meetingLink || "");
          setCapacity(e.capacity ? String(e.capacity) : "");
          setStatus(e.status || "PUBLISHED");
        } else {
          setError("Event not found or unauthorized.");
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load event."); setLoading(false); });
  }, [params.eventId]);

  const handleSave = async () => {
    setSaving(true); setMsg(""); setError("");
    try {
      const res = await fetch(`/api/organizer/events/${params.eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, description, venueName, address, meetingLink, capacity, status }),
      });
      const d = await res.json();
      if (d.success) { setMsg("Saved!"); setTimeout(() => setMsg(""), 3000); }
      else setError(d.error || "Save failed.");
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this event? It will be removed from public listings.")) return;
    const res = await fetch(`/api/organizer/events/${params.eventId}`, { method: "DELETE" });
    if (res.ok) router.push("/organizer/events");
    else setError("Delete failed.");
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>;
  if (error && !event) return <div className="max-w-xl mx-auto py-20 text-center"><p className="text-sm text-red-500 font-jakarta">{error}</p><Link href="/organizer/events" className="text-sm text-brand hover:underline mt-4 inline-block">← Back to events</Link></div>;

  const ic = "w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder-gray-400";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/organizer/events" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-4 h-4 text-gray-500" /></Link>
          <div>
            <h1 className="font-sora font-bold text-lg text-navy dark:text-white">Edit Event</h1>
            <p className="text-xs text-gray-400 font-jakarta">/{event?.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className="text-xs text-green-600 font-jakarta">{msg}</span>}
          <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Title</label><input value={title} onChange={e => setTitle(e.target.value)} className={ic} /></div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Short Description</label><input value={subtitle} onChange={e => setSubtitle(e.target.value)} className={ic} /></div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className={ic + " resize-y"} maxLength={2000} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Venue Name</label><input value={venueName} onChange={e => setVenueName(e.target.value)} className={ic} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Address</label><input value={address} onChange={e => setAddress(e.target.value)} className={ic} /></div>
        </div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Meeting Link</label><input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className={ic} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Capacity</label><input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="Unlimited" className={ic} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={ic}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 font-jakarta">{error}</p>}

        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-600 text-white font-bold font-jakarta text-sm rounded-lg disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </div>
    </div>
  );
}
