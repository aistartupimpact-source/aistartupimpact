"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Calendar, MapPin, Video, Users, Loader2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  category: string;
  format: string;
  startAt: string;
  endAt: string;
  venueName?: string;
  address?: string;
  coverImageUrl?: string;
  registrationCount: number;
  capacity?: number;
  timezone: string;
  organizerName?: string;
  organizerAvatar?: string;
}

const CATEGORIES = [
  { value: "", label: "All" },
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
  { value: "", label: "All Formats" },
  { value: "IN_PERSON", label: "In Person" },
  { value: "VIRTUAL", label: "Virtual" },
  { value: "HYBRID", label: "Hybrid" },
];

const TIMEFRAMES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "", label: "All" },
  { value: "past", label: "Past" },
];

const ITEMS_PER_PAGE = 20;

interface Props { initialEvents: Event[]; }

export default function EventSearch({ initialEvents }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [format, setFormat] = useState(searchParams.get("format") || "");
  const [timeframe, setTimeframe] = useState(searchParams.get("timeframe") || "upcoming");
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const hasInteracted = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchEvents = useCallback(async (q: string, cat: string, fmt: string, tf: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cat) params.set("category", cat);
      if (fmt) params.set("format", fmt);
      if (tf) params.set("timeframe", tf);
      const res = await fetch(`/api/events/search?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
      setVisibleCount(ITEMS_PER_PAGE);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!hasInteracted.current) return;
    clearTimeout(debounceRef.current);
    // Instant for filter changes, debounced for text search
    const delay = query !== (searchParams.get("q") || "") ? 200 : 0;
    debounceRef.current = setTimeout(() => {
      fetchEvents(query, category, format, timeframe);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      if (format) params.set("format", format);
      if (timeframe && timeframe !== "upcoming") params.set("timeframe", timeframe);
      router.replace(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
    }, delay);
    return () => clearTimeout(debounceRef.current);
  }, [query, category, format, timeframe, fetchEvents, pathname, router, searchParams]);

  const visibleEvents = useMemo(() => events.slice(0, visibleCount), [events, visibleCount]);
  const hasMore = visibleCount < events.length;

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: { label: string; events: Event[] }[] = [];
    const now = new Date();
    let currentLabel = "";
    for (const event of visibleEvents) {
      const label = getDateLabel(new Date(event.startAt), now);
      if (label !== currentLabel) {
        groups.push({ label, events: [event] });
        currentLabel = label;
      } else {
        groups[groups.length - 1].events.push(event);
      }
    }
    return groups;
  }, [visibleEvents]);

  const clearFilters = () => { hasInteracted.current = true; setQuery(""); setCategory(""); setFormat(""); setTimeframe("upcoming"); };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { hasInteracted.current = true; setQuery(e.target.value); }}
          placeholder="Search AI events..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
        />
        {query && <button onClick={() => { hasInteracted.current = true; setQuery(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400"><X className="w-5 h-5" /></button>}
      </div>

      {/* Time quick filters */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {TIMEFRAMES.map(t => (
          <button key={t.value} onClick={() => { hasInteracted.current = true; setTimeframe(t.value); }}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${timeframe === t.value ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
            {t.label}
          </button>
        ))}
        <select value={format} onChange={(e) => { hasInteracted.current = true; setFormat(e.target.value); }}
          className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0 focus:outline-none cursor-pointer appearance-none">
          {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => { hasInteracted.current = true; setCategory(cat.value); }}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${category === cat.value ? "bg-brand/10 text-brand border-brand/20" : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading — engaging feedback */}
      {loading && (
        <div className="space-y-3">
          <div className="flex flex-col items-center py-4">
            <p className="text-[13px] text-gray-400 dark:text-gray-500 animate-pulse">Finding events for you...</p>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-5 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-3 w-1/4 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
              <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] rounded-[10px] bg-gray-100 dark:bg-gray-800 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && events.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-base text-gray-500 mb-2">No events found</p>
          <button onClick={clearFilters} className="text-sm text-brand font-medium">Clear filters</button>
        </div>
      )}

      {/* Timeline */}
      {!loading && groupedEvents.map((group, gi) => (
        <EventDateGroup key={gi} label={group.label} events={group.events} />
      ))}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center py-6">
          <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)} className="w-full sm:w-auto px-8 py-3 text-[15px] font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl active:scale-[0.98] transition-transform">
            Show more events
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Date Group ───────────────────────────────────────

function EventDateGroup({ label, events }: { label: string; events: Event[] }) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">{label}</h2>
        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="space-y-3 ml-[5px] pl-5 border-l-2 border-gray-100 dark:border-gray-800">
        {events.map(event => <EventTimelineCard key={event.id} event={event} />)}
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────

function EventTimelineCard({ event }: { event: Event }) {
  const d = new Date(event.startAt);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const isFull = event.capacity ? event.registrationCount >= event.capacity : false;
  const fewSpots = event.capacity ? (event.capacity - event.registrationCount) <= 10 && !isFull : false;

  // Relative time
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  let relativeLabel = "";
  if (diffMs < 0 && diffMs > -3 * 60 * 60 * 1000) relativeLabel = "Live Now";
  else if (diffHours > 0 && diffHours <= 3) relativeLabel = `Starts in ${diffHours}h`;

  const city = extractCity(event.address || event.venueName || "");

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <div className="flex gap-3 sm:gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 active:scale-[0.99] hover:border-gray-200 dark:hover:border-gray-700 transition-all">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{time}</span>
            {relativeLabel && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${relativeLabel === "Live Now" ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-brand/10 text-brand"}`}>
                {relativeLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[15px] sm:text-[19px] font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors line-clamp-2 leading-snug mb-1">
            {event.title}
          </h3>

          {/* Organizer */}
          {event.organizerName && (
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-1">
              By {event.organizerName}
            </p>
          )}

          {/* Location — city only, no full address */}
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400 mb-2.5">
            {event.format === "VIRTUAL" ? (
              <><Video className="w-3.5 h-3.5 shrink-0" /> Online</>
            ) : (
              <><MapPin className="w-3.5 h-3.5 shrink-0" /> {city || "In Person"}</>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center flex-wrap gap-1.5">
            {isFull && <Badge color="red">Sold Out</Badge>}
            {fewSpots && <Badge color="orange">Few Spots Left</Badge>}
            {!isFull && !fewSpots && <Badge color="green">Free</Badge>}
            <Badge color="gray">{event.category.replace(/_/g, " ")}</Badge>
            <Badge color="gray">{event.format.replace(/_/g, " ")}</Badge>
            {event.registrationCount > 0 && (
              <span className="text-[13px] text-gray-400 flex items-center gap-1.5 ml-1">
                <span className="flex -space-x-1.5">
                  {[...Array(Math.min(event.registrationCount, 3))].map((_, i) => (
                    <span key={i} className={`w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-[8px] font-bold text-white ${["bg-brand", "bg-purple-500", "bg-blue-500"][i]}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                  ))}
                </span>
                {event.registrationCount > 3 && <span>+{event.registrationCount - 3}</span>}
                {event.registrationCount <= 3 && <span>{event.registrationCount}</span>}
              </span>
            )}
          </div>
        </div>

        {/* Poster — square, Luma-style */}
        <div className="shrink-0 self-start">
          {event.coverImageUrl ? (
            <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] rounded-[10px] overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image src={event.coverImageUrl} alt="" className="w-full h-full object-cover" width={140} height={140} />
            </div>
          ) : (
            <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] rounded-[10px] bg-gradient-to-br from-brand/5 to-brand/10 flex items-center justify-center">
              <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-brand/20" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Badge ────────────────────────────────────────────

function Badge({ color, children }: { color: "green" | "red" | "orange" | "gray"; children: React.ReactNode }) {
  const styles = {
    green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    gray: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  };
  return <span className={`text-[10px] font-medium px-1.5 py-[2px] rounded ${styles[color]}`}>{children}</span>;
}

// ─── Helpers ──────────────────────────────────────────

function getDateLabel(date: Date, now: Date): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow · " + date.toLocaleDateString("en-US", { weekday: "long" });
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 6) return date.toLocaleDateString("en-US", { weekday: "long" }) + " · " + date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  if (diffDays < -1) return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return date.toLocaleDateString("en-US", { weekday: "long" }) + " · " + date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function extractCity(address: string): string {
  if (!address) return "";
  // Remove URLs (Google Maps links etc.)
  const cleaned = address.replace(/https?:\/\/[^\s,|]+/g, "").replace(/\|\|/g, ",");
  // Remove coordinates (numbers like 80.651917)
  const noCoords = cleaned.replace(/\b\d+\.\d{4,}\b/g, "");
  // Split by comma or pipe and find a meaningful city-like part
  const parts = noCoords.split(/[,|]/).map(s => s.trim()).filter(s => s.length > 2 && !/^\d+$/.test(s));
  // Return first meaningful part (usually area/city name)
  return parts[0] || "";
}
