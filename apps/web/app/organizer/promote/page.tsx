"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MapPin, Briefcase, Users, Loader2, Mail, CalendarDays, Eye, MessageCircle, Plus, ChevronDown } from "lucide-react";

export default function PromotePage() {
  const searchParams = useSearchParams();
  const preselectedEvent = searchParams.get("event") || "";
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [topCities, setTopCities] = useState<{city:string;count:number}[]>([]);
  const [topOccupations, setTopOccupations] = useState<{occupation:string;count:number}[]>([]);
  const [totalPromotable, setTotalPromotable] = useState(0);

  const [selectedEventId, setSelectedEventId] = useState("");
  const [channels, setChannels] = useState({ email: true, whatsapp: false });
  const [filterCity, setFilterCity] = useState("");
  const [filterOccupation, setFilterOccupation] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [whatsappBody, setWhatsappBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const selectedEvent = events.find((e: any) => e.id === selectedEventId);
  const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://aistartupimpact.com";

  useEffect(() => {
    Promise.all([
      fetch("/api/organizer/events").then(r => r.json()),
      fetch("/api/organizer/promote").then(r => r.json()),
    ]).then(([evRes, promoRes]) => {
      if (evRes.success) setEvents(evRes.events || []);
      if (promoRes.success) {
        setTopCities(promoRes.topCities || []);
        setTopOccupations(promoRes.topOccupations || []);
        setTotalPromotable(promoRes.totalPromotable || 0);
      }
      // Auto-select event if passed via URL
      if (preselectedEvent && evRes.events?.length) {
        const found = evRes.events.find((e: any) => e.id === preselectedEvent);
        if (found) {
          setSelectedEventId(found.id);
          const date = new Date(found.startAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
          setSubject(`🎉 ${found.title} — Register Now!`);
          setEmailBody(`We're excited to invite you to:\n\n${found.title}\n\n📅 ${date}\n🏷️ ${found.category?.replace(/_/g, " ") || "Event"}\n\nThis event is free and spots are limited. Don't miss out!\n\nSee you there!`);
          setWhatsappBody(`🎉 *${found.title}*\n\n📅 ${date}\n\nRegister free → ${SITE_URL}/events/${found.slug}`);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = events.find((e: any) => e.id === eventId);
    if (event) {
      const date = new Date(event.startAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      setSubject(`🎉 ${event.title} — Register Now!`);
      setEmailBody(`We're excited to invite you to:\n\n${event.title}\n\n📅 ${date}\n🏷️ ${event.category?.replace(/_/g, " ") || "Event"}\n\nThis event is free and spots are limited. Don't miss out!\n\nSee you there!`);
      setWhatsappBody(`🎉 *${event.title}*\n\n📅 ${date}\n\nRegister free → ${SITE_URL}/events/${event.slug}`);
    }
  };

  const handleSend = async () => {
    if (channels.email && (!subject || !emailBody)) { setMsg("Email subject and body required"); return; }
    if (channels.whatsapp && !whatsappBody) { setMsg("WhatsApp message required"); return; }
    setSending(true); setMsg("");
    if (channels.email) {
      const res = await fetch("/api/organizer/promote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body: emailBody, filterCity: filterCity || undefined, filterOccupation: filterOccupation || undefined }),
      });
      const d = await res.json();
      setMsg(d.success ? `✓ Email sent to ${d.sent} subscribers!` : d.error || "Failed");
    }
    if (channels.whatsapp) {
      setMsg(prev => prev + (prev ? " | " : "") + "⚠ WhatsApp: Connect API in Settings → Integrations");
    }
    setSending(false);
  };

  // Email preview HTML
  const escapeHtml = (str: string) => str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const emailPreviewHtml = selectedEvent ? `
    <div style="font-family:-apple-system,sans-serif;max-width:100%;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="padding:20px;">
        <h2 style="font-size:18px;font-weight:700;color:#0D1B2A;margin:0 0 12px;">${escapeHtml(selectedEvent.title)}</h2>
        <div style="font-size:13px;color:#6b7280;line-height:1.7;white-space:pre-wrap;">${escapeHtml(emailBody)}</div>
        <div style="margin:20px 0;"><a style="background:#FF3131;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">Register Now →</a></div>
        <p style="font-size:10px;color:#9ca3af;">AI Startup Impact Events · Unsubscribe</p>
      </div>
    </div>` : "";

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="font-sora font-bold text-xl text-navy dark:text-white">Promote Event</h1>
        <p className="text-sm text-gray-500 font-jakarta mt-0.5">Send targeted emails & WhatsApp to your attendees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-center gap-3"><Mail className="w-4 h-4 text-blue-500"/><div><p className="text-lg font-bold text-navy dark:text-white">{totalPromotable}</p><p className="text-xs text-gray-400">Promotable</p></div></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-center gap-3"><MapPin className="w-4 h-4 text-green-500"/><div><p className="text-lg font-bold text-navy dark:text-white">{topCities.length}</p><p className="text-xs text-gray-400">Cities</p></div></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-center gap-3"><Briefcase className="w-4 h-4 text-purple-500"/><div><p className="text-lg font-bold text-navy dark:text-white">{topOccupations.length}</p><p className="text-xs text-gray-400">Occupations</p></div></div>
      </div>

      {/* Campaign Builder */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-5">

        {/* Step 1: Event */}
        <Step num={1} title="Select Event">
          <select value={selectedEventId} onChange={e => handleEventSelect(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/20">
            <option value="">Choose an event...</option>
            {events.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </Step>

        {/* Step 2: Channel */}
        {selectedEventId && (
          <Step num={2} title="Choose Channel">
            <div className="flex gap-3">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${channels.email?"border-brand bg-brand/5":"border-gray-200 dark:border-gray-700"}`}>
                <input type="checkbox" checked={channels.email} onChange={e=>setChannels(p=>({...p,email:e.target.checked}))} className="w-3.5 h-3.5 rounded text-brand focus:ring-brand"/>
                <Mail className={`w-4 h-4 ${channels.email?"text-brand":"text-gray-400"}`}/><span className="text-xs font-medium font-jakarta">Email</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${channels.whatsapp?"border-green-500 bg-green-50 dark:bg-green-900/10":"border-gray-200 dark:border-gray-700"}`}>
                <input type="checkbox" checked={channels.whatsapp} onChange={e=>setChannels(p=>({...p,whatsapp:e.target.checked}))} className="w-3.5 h-3.5 rounded text-green-600 focus:ring-green-500"/>
                <MessageCircle className={`w-4 h-4 ${channels.whatsapp?"text-green-600":"text-gray-400"}`}/><span className="text-xs font-medium font-jakarta">WhatsApp</span>
              </label>
            </div>
          </Step>
        )}

        {/* Step 3: Audience */}
        {selectedEventId && (channels.email || channels.whatsapp) && (
          <Step num={3} title="Target Audience">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1 font-jakarta">City</label><select value={filterCity} onChange={e=>setFilterCity(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-jakarta"><option value="">All Cities</option>{topCities.map(c=><option key={c.city} value={c.city}>{c.city} ({c.count})</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1 font-jakarta">Occupation</label><select value={filterOccupation} onChange={e=>setFilterOccupation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-jakarta"><option value="">All</option>{topOccupations.map(o=><option key={o.occupation} value={o.occupation}>{o.occupation} ({o.count})</option>)}</select></div>
            </div>
          </Step>
        )}

        {/* Step 4: Compose */}
        {selectedEventId && (channels.email || channels.whatsapp) && (
          <Step num={4} title="Compose Message">
            {channels.email && (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase font-jakarta flex items-center gap-1"><Mail className="w-3 h-3"/>Email</p>
                <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject line" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/20"/>
                <textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} rows={5} placeholder="Email body..." className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/20 resize-y"/>
              </div>
            )}
            {channels.whatsapp && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase font-jakarta flex items-center gap-1"><MessageCircle className="w-3 h-3"/>WhatsApp</p>
                <textarea value={whatsappBody} onChange={e=>{if(e.target.value.length<=1024)setWhatsappBody(e.target.value)}} rows={4} placeholder="WhatsApp message..." className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/20 resize-y" maxLength={1024}/>
                <p className="text-xs text-gray-400 text-right font-jakarta">{whatsappBody.length}/1024</p>
              </div>
            )}
          </Step>
        )}

        {/* Step 5: Preview */}
        {selectedEventId && (emailBody || whatsappBody) && (
          <Step num={5} title="Preview">
            <button onClick={()=>setShowPreview(!showPreview)} className="px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 font-jakarta">
              <Eye className="w-3.5 h-3.5"/> {showPreview?"Hide":"Show"} Preview
            </button>
            {showPreview && (
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {channels.email && (
                  <div><p className="text-xs font-bold text-gray-400 uppercase mb-2 font-jakarta">📧 Email</p>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-h-[350px] overflow-y-auto">
                      <div className="bg-white dark:bg-gray-900 rounded p-2 mb-2 text-xs text-gray-400"><strong className="text-gray-600">Subject:</strong> {subject}</div>
                      <div dangerouslySetInnerHTML={{__html:emailPreviewHtml}}/>
                    </div>
                  </div>
                )}
                {channels.whatsapp && (
                  <div><p className="text-xs font-bold text-gray-400 uppercase mb-2 font-jakarta">💬 WhatsApp</p>
                    <div className="bg-[#e5ddd5] dark:bg-[#0b141a] rounded-lg p-3 max-h-[350px] overflow-y-auto">
                      <div className="max-w-[260px] bg-white dark:bg-[#1f2c33] rounded-xl rounded-tl-sm shadow-sm p-3">
                        <p className="text-[12px] text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed" style={{fontFamily:"Helvetica,Arial,sans-serif"}}>{whatsappBody}</p>
                        <p className="text-xs text-gray-400 text-right mt-1">10:30 AM <span className="text-blue-500">✓✓</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Step>
        )}

        {/* Send */}
        {selectedEventId && (emailBody || whatsappBody) && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            {msg && <p className={`text-sm mb-3 font-jakarta ${msg.includes("✓")?"text-green-600":msg.includes("⚠")?"text-yellow-600":"text-red-500"}`}>{msg}</p>}
            <button onClick={handleSend} disabled={sending} className="px-6 py-2.5 bg-brand hover:bg-brand-600 text-white font-bold text-sm rounded-lg disabled:opacity-40 flex items-center gap-2 transition-colors font-jakarta">
              {sending?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
              {sending?"Sending...":"Send Campaign"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2 font-jakarta">
        <span className="w-5 h-5 bg-brand text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{num}</span>{title}
      </h2>
      <div className="pl-7">{children}</div>
    </div>
  );
}
