"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Video, QrCode, Download, Clock, CheckCircle, Loader2 } from "lucide-react";

interface Registration {
  id: string;
  eventTitle: string;
  eventSlug: string;
  eventCategory: string;
  eventFormat: string;
  eventStartAt: string;
  eventEndAt: string;
  eventTimezone: string;
  eventVenueName?: string;
  eventCoverImageUrl?: string;
  status: string;
  qrToken: string;
  registeredAt: string;
  checkedInAt?: string;
}

export default function MyEventsClient() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => { fetchRegistrations(); }, []);

  const fetchRegistrations = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/events/my");
      const data = await res.json();
      if (data.success) { setRegistrations(data.registrations || []); }
      else { setError(data.error || "Failed to fetch."); }
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  const now = new Date();
  const upcoming = registrations.filter((r) => new Date(r.eventStartAt) >= now);
  const past = registrations.filter((r) => new Date(r.eventStartAt) < now);
  const active = tab === "upcoming" ? upcoming : past;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
            <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-[15px] text-gray-500">{error}</p>
        <Link href="/events" className="inline-block mt-3 text-sm text-brand font-medium hover:underline">Browse events</Link>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-[15px] font-medium text-gray-600 dark:text-gray-400">No events yet</p>
        <p className="text-sm text-gray-400 mt-1">Events you register for will appear here</p>
        <Link href="/events" className="inline-block mt-4 px-5 py-2.5 text-sm font-medium text-white bg-brand rounded-xl hover:bg-brand/90 transition-colors">Browse events</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => setTab("upcoming")} className={`px-4 py-2.5 text-[14px] font-medium relative transition-colors ${tab === "upcoming" ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
          Upcoming ({upcoming.length})
          {tab === "upcoming" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t" />}
        </button>
        <button onClick={() => setTab("past")} className={`px-4 py-2.5 text-[14px] font-medium relative transition-colors ${tab === "past" ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
          Past ({past.length})
          {tab === "past" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t" />}
        </button>
      </div>

      {/* Cards */}
      {active.length === 0 ? (
        <p className="text-center py-10 text-sm text-gray-400">No {tab} events</p>
      ) : (
        <div className="space-y-3">
          {active.map((reg) => <EventRegCard key={reg.id} reg={reg} isPast={tab === "past"} />)}
        </div>
      )}
    </div>
  );
}

function EventRegCard({ reg, isPast }: { reg: Registration; isPast?: boolean }) {
  const [showQr, setShowQr] = useState(false);
  const d = new Date(reg.eventStartAt);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const checkInUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/events/check-in?token=${reg.qrToken}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}`;

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 transition-all ${isPast ? "opacity-70" : ""}`}>
      <div className="flex gap-3">
        {/* Cover */}
        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
          {reg.eventCoverImageUrl ? (
            <Image src={reg.eventCoverImageUrl} alt="" width={72} height={72} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Calendar className="w-6 h-6 text-gray-300" /></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/events/${reg.eventSlug}`} className="hover:text-brand transition-colors">
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white line-clamp-1">{reg.eventTitle}</h3>
            </Link>
            <StatusBadge status={reg.status} />
          </div>

          <div className="flex items-center gap-3 mt-1 text-[13px] text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[13px] text-gray-500">
            {reg.eventFormat === "VIRTUAL" ? (
              <><Video className="w-3 h-3" /> Online</>
            ) : reg.eventVenueName ? (
              <><MapPin className="w-3 h-3" /> {reg.eventVenueName}</>
            ) : null}
          </div>

          {/* Actions */}
          {!isPast && (
            <div className="flex items-center gap-2 mt-2.5">
              <button onClick={() => setShowQr(!showQr)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-brand/5 text-brand rounded-lg hover:bg-brand/10 transition-colors">
                <QrCode className="w-3 h-3" /> {showQr ? "Hide" : "QR"}
              </button>
              <a href={`/api/events/calendar?slug=${reg.eventSlug}`} download className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-3 h-3" /> Calendar
              </a>
            </div>
          )}

          {reg.status === "CHECKED_IN" && reg.checkedInAt && (
            <p className="flex items-center gap-1 mt-2 text-[12px] text-green-600 font-medium">
              <CheckCircle className="w-3 h-3" /> Checked in
            </p>
          )}
        </div>
      </div>

      {/* QR */}
      {showQr && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center gap-2">
          <Image src={qrImageUrl} alt="QR" width={140} height={140} className="rounded-lg" unoptimized />
          <p className="text-xs text-gray-400">Show at check-in</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    CHECKED_IN: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    WAITLISTED: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    CANCELLED: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  };
  return (
    <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${styles[status] || styles.CONFIRMED}`}>
      {status === "CHECKED_IN" ? "Checked In" : status}
    </span>
  );
}
