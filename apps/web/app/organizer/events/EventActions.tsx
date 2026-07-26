"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Edit, Trash2, Share2, ExternalLink, Copy, Check } from "lucide-react";

interface Props {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  shortCode?: string;
}

export default function EventActions({ eventId, eventSlug, eventTitle, shortCode }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/events/${eventSlug}`;
  const shortUrl = shortCode ? `${origin}/e/${shortCode}` : publicUrl;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Delete failed:", data);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
    setDeleting(false);
    setShowDelete(false);
    setOpen(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortCode ? shortUrl : publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(eventTitle)}&url=${encodeURIComponent(shortUrl)}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${eventTitle} ${shortUrl}`)}`, "_blank");
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
            <a href={`/events/${eventSlug}`} target="_blank" rel="noopener" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-jakarta transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> View Public Page
            </a>
            <Link href={`/organizer/events/${eventId}`} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-jakarta transition-colors">
              <Edit className="w-3.5 h-3.5 text-gray-400" /> Edit Event
            </Link>
            <Link href={`/organizer/promote?event=${eventId}`} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-jakarta transition-colors">
              <Share2 className="w-3.5 h-3.5 text-gray-400" /> Promote Event
            </Link>
            <button onClick={async () => { await fetch(`/api/organizer/events/${eventId}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: "DRAFT" }) }); router.refresh(); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-jakarta transition-colors">
              <Edit className="w-3.5 h-3.5 text-gray-400" /> Unpublish (Draft)
            </button>
            <a href={`/api/organizer/attendees?eventId=${eventId}`} download className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-jakarta transition-colors">
              <Copy className="w-3.5 h-3.5 text-gray-400" /> Download Attendees
            </a>
            <button onClick={() => { setShowShare(true); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-jakarta transition-colors">
              <Share2 className="w-3.5 h-3.5 text-gray-400" /> Share Event
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
            <button onClick={() => { setShowDelete(true); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-jakarta transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete Event
            </button>
          </div>
        </>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowShare(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Share Event</h3>
            <p className="text-xs text-gray-500 font-jakarta">{eventTitle}</p>

            {/* Copy Link */}
            <div className="space-y-2">
              {shortCode && (
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Short Link (for sharing)</p>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={shortUrl} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 font-jakarta font-mono" />
                    <button onClick={handleCopy} className="px-3 py-2 bg-brand text-white rounded-lg text-xs font-bold flex items-center gap-1">
                      {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{shortCode ? "Full URL" : "Event Link"}</p>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={publicUrl} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 font-jakarta" />
                  {!shortCode && <button onClick={handleCopy} className="px-3 py-2 bg-brand text-white rounded-lg text-xs font-bold flex items-center gap-1">{copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}</button>}
                </div>
              </div>
            </div>

            {/* Social Share */}
            <div className="flex gap-2">
              <button onClick={handleShareTwitter} className="flex-1 py-2.5 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg text-xs font-bold font-jakarta hover:bg-[#1DA1F2]/20 transition-colors">Twitter</button>
              <button onClick={handleShareLinkedIn} className="flex-1 py-2.5 bg-[#0077B5]/10 text-[#0077B5] rounded-lg text-xs font-bold font-jakarta hover:bg-[#0077B5]/20 transition-colors">LinkedIn</button>
              <button onClick={handleShareWhatsApp} className="flex-1 py-2.5 bg-[#25D366]/10 text-[#25D366] rounded-lg text-xs font-bold font-jakarta hover:bg-[#25D366]/20 transition-colors">WhatsApp</button>
            </div>

            <button onClick={() => setShowShare(false)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-jakarta">Close</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDelete(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Event</h3>
            <p className="text-sm text-gray-500 font-jakarta">
              Are you sure you want to delete <strong>{eventTitle}</strong>? This will remove it from public listings. Data is preserved for records.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-jakarta">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-jakarta font-semibold disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
