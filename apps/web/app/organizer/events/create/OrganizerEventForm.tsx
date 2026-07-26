"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Calendar, MapPin, Video, X, Upload, Clock,
  Users, Globe, Image as ImageIcon, Tag, ChevronDown, Plus, Trash2,
  Link2, Mail, Eye, User, Mic,
} from "lucide-react";
import CitySelect from "@/components/events/CitySelect";

const CATEGORIES = [
  "Conference","Hackathon","Summit","Workshop","Meetup","Demo Day","Webinar","Networking"
];
const CATEGORY_VALUES = [
  "CONFERENCE","HACKATHON","SUMMIT","WORKSHOP","MEETUP","DEMO_DAY","WEBINAR","NETWORKING"
];
const TIMEZONES = [
  { v: "Pacific/Midway", l: "(GMT-11:00) Midway Island" },
  { v: "Pacific/Honolulu", l: "(GMT-10:00) Hawaii" },
  { v: "America/Anchorage", l: "(GMT-09:00) Alaska" },
  { v: "America/Los_Angeles", l: "(GMT-08:00) Pacific Time (US)" },
  { v: "America/Denver", l: "(GMT-07:00) Mountain Time (US)" },
  { v: "America/Chicago", l: "(GMT-06:00) Central Time (US)" },
  { v: "America/New_York", l: "(GMT-05:00) Eastern Time (US)" },
  { v: "America/Caracas", l: "(GMT-04:30) Caracas" },
  { v: "America/Halifax", l: "(GMT-04:00) Atlantic Time" },
  { v: "America/Sao_Paulo", l: "(GMT-03:00) São Paulo" },
  { v: "Atlantic/South_Georgia", l: "(GMT-02:00) Mid-Atlantic" },
  { v: "Atlantic/Azores", l: "(GMT-01:00) Azores" },
  { v: "UTC", l: "(GMT+00:00) UTC" },
  { v: "Europe/London", l: "(GMT+00:00) London" },
  { v: "Europe/Paris", l: "(GMT+01:00) Paris, Berlin" },
  { v: "Europe/Istanbul", l: "(GMT+03:00) Istanbul" },
  { v: "Africa/Cairo", l: "(GMT+02:00) Cairo" },
  { v: "Europe/Moscow", l: "(GMT+03:00) Moscow" },
  { v: "Asia/Dubai", l: "(GMT+04:00) Dubai" },
  { v: "Asia/Karachi", l: "(GMT+05:00) Karachi" },
  { v: "Asia/Kolkata", l: "(GMT+05:30) India (IST)" },
  { v: "Asia/Kathmandu", l: "(GMT+05:45) Kathmandu" },
  { v: "Asia/Dhaka", l: "(GMT+06:00) Dhaka" },
  { v: "Asia/Bangkok", l: "(GMT+07:00) Bangkok" },
  { v: "Asia/Singapore", l: "(GMT+08:00) Singapore" },
  { v: "Asia/Shanghai", l: "(GMT+08:00) Beijing, Shanghai" },
  { v: "Asia/Tokyo", l: "(GMT+09:00) Tokyo" },
  { v: "Asia/Seoul", l: "(GMT+09:00) Seoul" },
  { v: "Australia/Sydney", l: "(GMT+10:00) Sydney" },
  { v: "Pacific/Noumea", l: "(GMT+11:00) New Caledonia" },
  { v: "Pacific/Auckland", l: "(GMT+12:00) Auckland" },
];
const MAX_DESC = 2000;

function slugify(t: string) { return t.toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/[\s_]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80); }

export default function OrganizerEventForm({ organizerId }: { organizerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 1. Basic
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("CONFERENCE");
  const [tags, setTags] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  // 2. Schedule
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [sameDay, setSameDay] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [registrationDeadline, setRegistrationDeadline] = useState("");

  // 3. Location
  const [format, setFormat] = useState("IN_PERSON");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [venueMapUrl, setVenueMapUrl] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  // 4. Registration
  const [unlimited, setUnlimited] = useState(true);
  const [capacity, setCapacity] = useState("");
  const [waitlist, setWaitlist] = useState(true);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [visibility, setVisibility] = useState("PUBLIC");
  const [customQuestions, setCustomQuestions] = useState<{text:string;type:string;required:boolean;options:string}[]>([]);
  const [ticketTiers, setTicketTiers] = useState<{name:string;type:string;quantity:string;description:string}[]>([]);
  const [checkinMethod, setCheckinMethod] = useState("QR");

  // 5. Content
  const [description, setDescription] = useState("");
  const [speakers, setSpeakers] = useState<{name:string;title:string;company:string;linkedin:string;photo:string;photoError:string}[]>([]);
  const [agenda, setAgenda] = useState<{time:string;title:string;speaker:string}[]>([]);
  const [sponsors, setSponsors] = useState<{name:string;tier:string;website:string}[]>([]);
  const [partners, setPartners] = useState<{name:string;website:string}[]>([]);

  // 6. Contact
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState({ twitter: "", linkedin: "", instagram: "" });

  // 7. SEO
  const [customSlug, setCustomSlug] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Section toggles
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true, schedule: true, location: true, registration: false, content: false, contact: false, seo: false,
  });
  const toggle = (s: string) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  const showPhysical = format === "IN_PERSON" || format === "HYBRID";
  const showVirtual = format === "VIRTUAL" || format === "HYBRID";
  const generatedSlug = slugify(title + (city ? `-${city}` : ""));

  const processFile = useCallback(async (file: File) => {
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) { setFieldErrors(p=>({...p,cover:"Only JPG, PNG, WebP allowed"})); return; }
    if (file.size > 5*1024*1024) { setFieldErrors(p=>({...p,cover:"Max file size is 5MB"})); return; }
    setUploading(true); setFieldErrors(p=>({...p,cover:""}));
    try { const fd = new FormData(); fd.append("file",file); const r = await fetch("/api/organizer/upload",{method:"POST",body:fd}); const d = await r.json(); if(d.success) setCoverImageUrl(d.url); else setFieldErrors(p=>({...p,cover:d.error||"Upload failed"})); }
    catch { setFieldErrors(p=>({...p,cover:"Upload failed"})); } finally { setUploading(false); }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setFieldErrors({});
    const errs: Record<string, string> = {};
    if (!title) errs.title = "Title is required";
    if (!startAt) errs.startAt = "Start date is required";
    if (!endAt) errs.endAt = "End date is required";
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) errs.endAt = "End must be after start";
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/organizer/events", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          title, slug: customSlug && slug ? slug : generatedSlug, subtitle, category, format, timezone,
          startAt: new Date(startAt).toISOString(), endAt: new Date(endAt).toISOString(),
          venueName, address: venueMapUrl ? `${address}|||${venueMapUrl}` : address, meetingLink,
          description, capacity: unlimited ? null : capacity, coverImageUrl, visibility,
          registrationDeadline: registrationDeadline || null, approvalRequired,
          tags, contactEmail, website, city, speakers, agenda, socialLinks,
        }),
      });
      const d = await res.json();
      if (!d.success) { setError(d.error||"Failed."); setLoading(false); return; }
      router.push("/organizer/events");
    } catch { setError("Network error."); setLoading(false); }
  };

  const ic = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder-gray-400";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/organizer/events" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-4 h-4 text-gray-500"/></Link>
        <h1 className="font-sora font-bold text-lg text-navy dark:text-white">Create Event</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
        <div className="lg:col-span-2 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 scrollbar-hide">
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* ═══ 1. BASIC INFORMATION ═══ */}
          <Section title="Basic Information" icon={ImageIcon} open={openSections.basic} onToggle={()=>toggle("basic")}>
            {/* Cover - compact */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Event Cover * <span className="normal-case">Square · JPG/PNG/WebP · 5MB</span></label>
              {coverImageUrl ? (
                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <img src={coverImageUrl} alt="" className="w-14 h-14 object-cover rounded"/>
                  <span className="text-[10px] text-green-600 font-jakarta font-medium flex-1">✓ Uploaded</span>
                  <button type="button" onClick={()=>fileRef.current?.click()} className="text-[10px] text-brand font-jakarta hover:underline">Change</button>
                  <button type="button" onClick={()=>setCoverImageUrl("")} className="text-[10px] text-red-500 font-jakarta hover:underline">Remove</button>
                </div>
              ) : (
                <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);if(e.dataTransfer.files[0])processFile(e.dataTransfer.files[0])}} onClick={()=>fileRef.current?.click()} className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver?"border-brand bg-brand/5":"border-gray-200 dark:border-gray-700 hover:border-brand/40"} ${uploading?"opacity-60 pointer-events-none":""}`}>
                  {uploading?<Loader2 className="w-4 h-4 animate-spin text-brand"/>:<Upload className="w-4 h-4 text-gray-400"/>}
                  <span className="text-xs text-gray-500 font-jakarta">{uploading?"Uploading...":"Drag & drop or click to upload cover"}</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{if(e.target.files?.[0])processFile(e.target.files[0]);e.target.value=""}} className="hidden"/>
              {fieldErrors.cover && <p className="text-[10px] text-red-500 font-jakarta mt-1">{fieldErrors.cover}</p>}
            </div>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Title *</label><input required value={title} onChange={e=>{setTitle(e.target.value);if(!customSlug)setSlug(slugify(e.target.value+(city?`-${city}`:"")));if(fieldErrors.title)setFieldErrors(p=>({...p,title:""}))}} placeholder="AI Builders Hackathon" className={`${ic} ${fieldErrors.title?"!border-red-400 !ring-red-200":""}`} maxLength={200}/>{fieldErrors.title&&<p className="text-[10px] text-red-500 font-jakarta mt-0.5">{fieldErrors.title}</p>}<p className="text-[9px] text-gray-400 mt-0.5 font-jakarta">Appears everywhere attendees see your event</p></div>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Short Description</label><input value={subtitle} onChange={e=>setSubtitle(e.target.value)} placeholder="Join 500+ AI founders" className={ic} maxLength={300}/></div>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Category *</label><div className="grid grid-cols-4 gap-1">{CATEGORIES.map((c,i)=><button key={c} type="button" onClick={()=>setCategory(CATEGORY_VALUES[i])} className={`px-2 py-1.5 rounded text-[10px] font-jakarta font-medium border ${category===CATEGORY_VALUES[i]?"border-brand bg-brand/5 text-brand":"border-gray-200 dark:border-gray-700 text-gray-500"}`}>{c}</button>)}</div></div>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Tags <span className="normal-case">(comma-separated)</span></label><input value={tags} onChange={e=>setTags(e.target.value)} placeholder="AI, GenAI, Startups, LLMs" className={ic}/></div>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Slug</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer shrink-0"><input type="checkbox" checked={customSlug} onChange={e=>setCustomSlug(e.target.checked)} className="w-3.5 h-3.5 rounded text-brand focus:ring-brand"/><span className="text-[10px] text-gray-500 font-jakarta">Custom</span></label>
                <input value={customSlug ? slug : generatedSlug} onChange={e=>setSlug(slugify(e.target.value))} disabled={!customSlug} className={ic + (customSlug?"":" opacity-60")} />
              </div>
              <p className="text-[9px] text-gray-400 font-jakarta mt-0.5">/events/{customSlug&&slug?slug:generatedSlug||"..."}</p>
            </div>
          </Section>

          {/* ═══ 2. SCHEDULE ═══ */}
          <Section title="Schedule" icon={Clock} open={openSections.schedule} onToggle={()=>toggle("schedule")}>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sameDay} onChange={e=>{setSameDay(e.target.checked);if(e.target.checked&&startAt)setEndAt(startAt.split("T")[0]+"T"+(endAt.split("T")[1]||"18:00"))}} className="w-3.5 h-3.5 rounded text-brand focus:ring-brand"/><span className="text-xs text-gray-600 dark:text-gray-300 font-jakarta">Same-day event</span></label>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[10px] text-gray-400 mb-0.5 font-jakarta">Start *</label><input type="datetime-local" required value={startAt} onChange={e=>{setStartAt(e.target.value);if(sameDay&&e.target.value)setEndAt(e.target.value.split("T")[0]+"T"+(endAt.split("T")[1]||"18:00"));if(fieldErrors.startAt)setFieldErrors(p=>({...p,startAt:""}))}} className={`${ic} ${fieldErrors.startAt?"!border-red-400":""}`}/>{fieldErrors.startAt&&<p className="text-[10px] text-red-500 font-jakarta mt-0.5">{fieldErrors.startAt}</p>}</div>
              <div><label className="block text-[10px] text-gray-400 mb-0.5 font-jakarta">End *</label><input type="datetime-local" required value={endAt} onChange={e=>{setEndAt(e.target.value);if(fieldErrors.endAt)setFieldErrors(p=>({...p,endAt:""}))}} className={`${ic} ${fieldErrors.endAt?"!border-red-400":""}`}/>{fieldErrors.endAt&&<p className="text-[10px] text-red-500 font-jakarta mt-0.5">{fieldErrors.endAt}</p>}</div>
            </div>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Timezone *</label><select value={timezone} onChange={e=>setTimezone(e.target.value)} className={ic}>{TIMEZONES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select></div>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Registration Deadline <span className="normal-case text-gray-400">(optional)</span></label><input type="datetime-local" value={registrationDeadline} onChange={e=>setRegistrationDeadline(e.target.value)} className={ic}/></div>
          </Section>

          {/* ═══ 3. LOCATION ═══ */}
          <Section title="Location" icon={MapPin} open={openSections.location} onToggle={()=>toggle("location")}>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Format *</label><div className="grid grid-cols-3 gap-2">{[{v:"IN_PERSON",l:"In Person",I:MapPin},{v:"VIRTUAL",l:"Virtual",I:Video},{v:"HYBRID",l:"Hybrid",I:Globe}].map(f=><button key={f.v} type="button" onClick={()=>setFormat(f.v)} className={`px-3 py-2 rounded-lg text-center border ${format===f.v?"border-brand bg-brand/5":"border-gray-200 dark:border-gray-700"}`}><f.I className={`w-3.5 h-3.5 mx-auto mb-0.5 ${format===f.v?"text-brand":"text-gray-400"}`}/><p className={`text-[10px] font-jakarta ${format===f.v?"text-brand font-medium":"text-gray-500"}`}>{f.l}</p></button>)}</div></div>
            {showPhysical && <>
              <input value={venueName} onChange={e=>setVenueName(e.target.value)} placeholder="Venue Name" className={ic}/>
              <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" className={ic}/>
              <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">City</label><CitySelect value={city} onChange={(c) => { setCity(c.name); if(!customSlug) setSlug(slugify(title+(c.name?`-${c.name}`:""))) }} placeholder="Search city..." /></div>
              <input type="url" value={venueMapUrl} onChange={e=>setVenueMapUrl(e.target.value)} placeholder="Google Maps URL" className={ic}/>
            </>}
            {showVirtual && <input type="url" value={meetingLink} onChange={e=>setMeetingLink(e.target.value)} placeholder="Meeting Link (Zoom, Meet)" className={ic}/>}
          </Section>

          {/* ═══ 4. REGISTRATION ═══ */}
          <Section title="Registration" icon={Users} open={openSections.registration} onToggle={()=>toggle("registration")}>
            <div className="space-y-3">
              <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Capacity</label>
                <label className="flex items-center gap-2 cursor-pointer mb-2"><input type="checkbox" checked={unlimited} onChange={e=>setUnlimited(e.target.checked)} className="w-3.5 h-3.5 rounded text-brand focus:ring-brand"/><span className="text-xs text-gray-600 font-jakarta">Unlimited</span></label>
                {!unlimited && <input type="number" min={1} value={capacity} onChange={e=>setCapacity(e.target.value)} placeholder="e.g. 500" className={ic}/>}
                {!unlimited && <label className="flex items-center gap-2 cursor-pointer mt-2"><input type="checkbox" checked={waitlist} onChange={e=>setWaitlist(e.target.checked)} className="w-3.5 h-3.5 rounded text-brand focus:ring-brand"/><span className="text-xs text-gray-600 font-jakarta">Enable waitlist after full</span></label>}
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={approvalRequired} onChange={e=>setApprovalRequired(e.target.checked)} className="w-3.5 h-3.5 rounded text-brand focus:ring-brand"/><span className="text-xs text-gray-600 font-jakarta">Require manual approval for registrations</span></label>
              <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Visibility</label>
                <select value={visibility} onChange={e=>setVisibility(e.target.value)} className={ic}>
                  <option value="PUBLIC">Public — Anyone can find & register</option>
                  <option value="UNLISTED">Unlisted — Only via direct link</option>
                  <option value="INVITE_ONLY">Private — Invite only</option>
                </select>
              </div>
              {/* Registration Form Builder */}
              <div><div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-gray-400 uppercase font-jakarta">Custom Registration Fields</label><button type="button" onClick={()=>setCustomQuestions(p=>[...p,{text:"",type:"TEXT",required:false,options:""}])} className="text-[10px] text-brand font-semibold font-jakarta flex items-center gap-0.5"><Plus className="w-3 h-3"/>Add Field</button></div>
                <p className="text-[9px] text-gray-400 font-jakarta mb-2">Default fields: Name, Email, Phone, Occupation, City. Add custom fields below.</p>
                {customQuestions.map((q,i)=>(
                  <div key={i} className="flex gap-2 mb-2 items-start p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 space-y-1.5">
                      <input value={q.text} onChange={e=>{const u=[...customQuestions];u[i]={...u[i],text:e.target.value};setCustomQuestions(u)}} placeholder="Question text" className={ic}/>
                      <div className="flex gap-2">
                        <select value={q.type} onChange={e=>{const u=[...customQuestions];u[i]={...u[i],type:e.target.value};setCustomQuestions(u)}} className={ic+" !w-auto"}>
                          <option value="TEXT">Text</option><option value="SELECT">Dropdown</option><option value="CHECKBOX">Checkbox</option>
                        </select>
                        <label className="flex items-center gap-1.5 cursor-pointer shrink-0"><input type="checkbox" checked={q.required} onChange={e=>{const u=[...customQuestions];u[i]={...u[i],required:e.target.checked};setCustomQuestions(u)}} className="w-3 h-3 rounded text-brand"/><span className="text-[10px] text-gray-500 font-jakarta">Required</span></label>
                      </div>
                      {q.type==="SELECT"&&<input value={q.options} onChange={e=>{const u=[...customQuestions];u[i]={...u[i],options:e.target.value};setCustomQuestions(u)}} placeholder="Options (comma-separated)" className={ic}/>}
                    </div>
                    <button type="button" onClick={()=>setCustomQuestions(p=>p.filter((_,j)=>j!==i))} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                  </div>
                ))}
              </div>
              {/* Ticket Types */}
              <div><div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-gray-400 uppercase font-jakarta">Ticket Types</label><button type="button" onClick={()=>setTicketTiers(p=>[...p,{name:"General",type:"REGULAR",quantity:"",description:""}])} className="text-[10px] text-brand font-semibold font-jakarta flex items-center gap-0.5"><Plus className="w-3 h-3"/>Add Tier</button></div>
                <p className="text-[9px] text-gray-400 font-jakarta mb-2">All events are free. Use tiers for capacity limits (VIP seating, student quota, etc.)</p>
                {ticketTiers.map((t,i)=>(
                  <div key={i} className="flex gap-2 mb-2 items-start p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-1.5">
                      <input value={t.name} onChange={e=>{const u=[...ticketTiers];u[i]={...u[i],name:e.target.value};setTicketTiers(u)}} placeholder="Tier name" className={ic}/>
                      <select value={t.type} onChange={e=>{const u=[...ticketTiers];u[i]={...u[i],type:e.target.value};setTicketTiers(u)}} className={ic}>
                        <option value="REGULAR">Regular</option><option value="EARLY_BIRD">Early Bird</option><option value="VIP">VIP</option>
                      </select>
                      <input type="number" min={1} value={t.quantity} onChange={e=>{const u=[...ticketTiers];u[i]={...u[i],quantity:e.target.value};setTicketTiers(u)}} placeholder="Qty (∞)" className={ic}/>
                    </div>
                    <button type="button" onClick={()=>setTicketTiers(p=>p.filter((_,j)=>j!==i))} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                  </div>
                ))}
              </div>
              {/* Check-in Settings */}
              <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Check-in Method</label>
                <select value={checkinMethod} onChange={e=>setCheckinMethod(e.target.value)} className={ic}>
                  <option value="QR">QR Code Scan</option><option value="MANUAL">Manual Lookup</option><option value="BOTH">QR + Manual</option>
                </select>
              </div>
            </div>
          </Section>

          {/* ═══ 5. CONTENT ═══ */}
          <Section title="Content" icon={Mic} open={openSections.content} onToggle={()=>toggle("content")}>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Description</label><textarea value={description} onChange={e=>{if(e.target.value.length<=MAX_DESC)setDescription(e.target.value)}} rows={5} placeholder="What's this event about? Use markdown: **bold**, *italic*, - bullets, [links](url)" className={ic+" resize-y"} maxLength={MAX_DESC}/><div className="flex justify-between mt-0.5"><p className="text-[9px] text-gray-400 font-jakarta">Markdown supported: **bold** *italic* - lists [links](url)</p><p className={`text-[9px] font-jakarta ${description.length>MAX_DESC*0.9?"text-red-500":"text-gray-400"}`}>{description.length}/{MAX_DESC}</p></div></div>
            {/* Speakers */}
            <div><div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-gray-400 uppercase font-jakarta">Speakers</label><button type="button" onClick={()=>setSpeakers(p=>[...p,{name:"",title:"",company:"",linkedin:"",photo:"",photoError:""}])} className="text-[10px] text-brand font-semibold font-jakarta flex items-center gap-0.5"><Plus className="w-3 h-3"/>Add Speaker</button></div>
              {speakers.length===0?<p className="text-[10px] text-gray-400 font-jakarta">No speakers added yet</p>:speakers.map((s,i)=>(
                <div key={i} className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[9px] font-bold text-gray-400 font-jakarta">Speaker {i+1}</span>
                    <button type="button" onClick={()=>setSpeakers(p=>p.filter((_,j)=>j!==i))} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                  </div>
                  {/* Photo Upload */}
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Photo <span className="normal-case text-gray-400">JPG/PNG/WebP · Max 2MB · Square recommended</span></label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center shrink-0">
                        {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover"/> : <User className="w-6 h-6 text-gray-400"/>}
                      </div>
                      <div>
                        <input type="file" accept="image/jpeg,image/png,image/webp" id={`speaker-photo-${i}`} className="hidden" onChange={async e=>{
                          const file=e.target.files?.[0]; if(!file)return;
                          const u=[...speakers];
                          if(!["image/jpeg","image/png","image/webp"].includes(file.type)){u[i]={...u[i],photoError:"Only JPG, PNG, WebP allowed"};setSpeakers(u);e.target.value="";return}
                          if(file.size>2*1024*1024){u[i]={...u[i],photoError:"Max file size is 2MB"};setSpeakers(u);e.target.value="";return}
                          u[i]={...u[i],photoError:""};setSpeakers(u);
                          const fd=new FormData();fd.append("file",file);
                          const r=await fetch("/api/organizer/upload",{method:"POST",body:fd});
                          const d=await r.json();
                          const u2=[...speakers];
                          if(d.success){u2[i]={...u2[i],photo:d.url,photoError:""}}
                          else {u2[i]={...u2[i],photoError:d.error||"Upload failed"}}
                          setSpeakers(u2);
                          e.target.value="";
                        }}/>
                        <label htmlFor={`speaker-photo-${i}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] font-semibold text-gray-600 dark:text-gray-300 font-jakarta cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Upload className="w-3 h-3"/> {s.photo ? "Change Photo" : "Upload Photo"}
                        </label>
                        {s.photo && <button type="button" onClick={()=>{const u=[...speakers];u[i]={...u[i],photo:"",photoError:""};setSpeakers(u)}} className="ml-2 text-[10px] text-red-500 font-jakarta hover:underline">Remove</button>}
                        {s.photoError && <p className="text-[10px] text-red-500 font-jakarta mt-1">{s.photoError}</p>}
                      </div>
                    </div>
                  </div>
                  {/* Name */}
                  <div className="mb-2"><label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5 font-jakarta">Full Name *</label><input value={s.name} onChange={e=>{const u=[...speakers];u[i]={...u[i],name:e.target.value};setSpeakers(u)}} placeholder="John Doe" className={ic}/></div>
                  {/* Role + Company */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5 font-jakarta">Role</label><input value={s.title} onChange={e=>{const u=[...speakers];u[i]={...u[i],title:e.target.value};setSpeakers(u)}} placeholder="CTO, Founder" className={ic}/></div>
                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5 font-jakarta">Company</label><input value={s.company} onChange={e=>{const u=[...speakers];u[i]={...u[i],company:e.target.value};setSpeakers(u)}} placeholder="Company name" className={ic}/></div>
                  </div>
                  {/* LinkedIn */}
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5 font-jakarta">LinkedIn</label><input value={s.linkedin} onChange={e=>{const u=[...speakers];u[i]={...u[i],linkedin:e.target.value};setSpeakers(u)}} placeholder="https://linkedin.com/in/..." className={ic}/></div>
                </div>
              ))}
            </div>
            {/* Agenda */}
            <div><div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-gray-400 uppercase font-jakarta">Agenda</label><button type="button" onClick={()=>setAgenda(p=>[...p,{time:"",title:"",speaker:""}])} className="text-[10px] text-brand font-semibold font-jakarta flex items-center gap-0.5"><Plus className="w-3 h-3"/>Add</button></div>
              {agenda.length===0?<p className="text-[10px] text-gray-400 font-jakarta">No agenda items</p>:agenda.map((a,i)=>(
                <div key={i} className="flex gap-2 mb-2 items-start"><div className="flex-1 grid grid-cols-3 gap-1.5"><input value={a.time} onChange={e=>{const u=[...agenda];u[i]={...u[i],time:e.target.value};setAgenda(u)}} placeholder="10:00 AM" className={ic}/><input value={a.title} onChange={e=>{const u=[...agenda];u[i]={...u[i],title:e.target.value};setAgenda(u)}} placeholder="Session title" className={ic}/><input value={a.speaker} onChange={e=>{const u=[...agenda];u[i]={...u[i],speaker:e.target.value};setAgenda(u)}} placeholder="Speaker" className={ic}/></div><button type="button" onClick={()=>setAgenda(p=>p.filter((_,j)=>j!==i))} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button></div>
              ))}
            </div>
            {/* Sponsors */}
            <div><div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-gray-400 uppercase font-jakarta">Sponsors</label><button type="button" onClick={()=>setSponsors(p=>[...p,{name:"",tier:"GOLD",website:""}])} className="text-[10px] text-brand font-semibold font-jakarta flex items-center gap-0.5"><Plus className="w-3 h-3"/>Add</button></div>
              {sponsors.length===0?<p className="text-[10px] text-gray-400 font-jakarta">No sponsors added</p>:sponsors.map((s,i)=>(
                <div key={i} className="flex gap-2 mb-2 items-start"><div className="flex-1 grid grid-cols-3 gap-1.5"><input value={s.name} onChange={e=>{const u=[...sponsors];u[i]={...u[i],name:e.target.value};setSponsors(u)}} placeholder="Sponsor name" className={ic}/><select value={s.tier} onChange={e=>{const u=[...sponsors];u[i]={...u[i],tier:e.target.value};setSponsors(u)}} className={ic}><option value="PLATINUM">Platinum</option><option value="GOLD">Gold</option><option value="SILVER">Silver</option><option value="COMMUNITY">Community</option></select><input value={s.website} onChange={e=>{const u=[...sponsors];u[i]={...u[i],website:e.target.value};setSponsors(u)}} placeholder="Website" className={ic}/></div><button type="button" onClick={()=>setSponsors(p=>p.filter((_,j)=>j!==i))} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button></div>
              ))}
            </div>
            {/* Community Partners */}
            <div><div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-gray-400 uppercase font-jakarta">Community Partners</label><button type="button" onClick={()=>setPartners(p=>[...p,{name:"",website:""}])} className="text-[10px] text-brand font-semibold font-jakarta flex items-center gap-0.5"><Plus className="w-3 h-3"/>Add</button></div>
              {partners.length===0?<p className="text-[10px] text-gray-400 font-jakarta">No partners added</p>:partners.map((p2,i)=>(
                <div key={i} className="flex gap-2 mb-2 items-start"><div className="flex-1 grid grid-cols-2 gap-1.5"><input value={p2.name} onChange={e=>{const u=[...partners];u[i]={...u[i],name:e.target.value};setPartners(u)}} placeholder="Partner name" className={ic}/><input value={p2.website} onChange={e=>{const u=[...partners];u[i]={...u[i],website:e.target.value};setPartners(u)}} placeholder="Website" className={ic}/></div><button type="button" onClick={()=>setPartners(p3=>p3.filter((_,j)=>j!==i))} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button></div>
              ))}
            </div>
          </Section>

          {/* ═══ 6. CONTACT ═══ */}
          <Section title="Contact" icon={Mail} open={openSections.contact} onToggle={()=>toggle("contact")}>
            <input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="Contact email for attendees" className={ic}/>
            <input type="url" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="Event website (optional)" className={ic}/>
            <div className="grid grid-cols-3 gap-2">
              <input value={socialLinks.twitter} onChange={e=>setSocialLinks(p=>({...p,twitter:e.target.value}))} placeholder="Twitter/X" className={ic}/>
              <input value={socialLinks.linkedin} onChange={e=>setSocialLinks(p=>({...p,linkedin:e.target.value}))} placeholder="LinkedIn" className={ic}/>
              <input value={socialLinks.instagram} onChange={e=>setSocialLinks(p=>({...p,instagram:e.target.value}))} placeholder="Instagram" className={ic}/>
            </div>
          </Section>

          {/* ═══ 7. SEO & SHARING ═══ */}
          <Section title="SEO & Sharing" icon={Eye} open={openSections.seo} onToggle={()=>toggle("seo")}>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">SEO Title <span className="normal-case">(defaults to event title)</span></label><input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} placeholder={title||"Event title"} className={ic} maxLength={70}/><p className="text-[9px] text-gray-400 text-right font-jakarta">{(seoTitle||title).length}/70</p></div>
            <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">SEO Description</label><textarea value={seoDescription} onChange={e=>setSeoDescription(e.target.value)} placeholder={subtitle||"Auto-generated from short description"} className={ic+" resize-none"} rows={2} maxLength={160}/><p className="text-[9px] text-gray-400 text-right font-jakarta">{(seoDescription||subtitle).length}/160</p></div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Preview URL</p>
              <p className="text-xs text-brand font-jakarta font-mono">/events/{customSlug&&slug?slug:generatedSlug||"..."}</p>
              <p className="text-[9px] text-gray-400 font-jakarta mt-2">Short URL auto-generated after publish (e.g. /e/KX7M4P)</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Social Preview</p>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                {coverImageUrl?<img src={coverImageUrl} alt="" className="w-full h-20 object-cover"/>:<div className="w-full h-20 bg-gray-100 dark:bg-gray-800"/>}
                <div className="p-2"><p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate">{seoTitle||title||"Event Title"}</p><p className="text-[9px] text-gray-400 truncate">{seoDescription||subtitle||"aistartupimpact.com"}</p></div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-900/20">
              <p className="text-[9px] font-bold text-blue-600 uppercase mb-0.5 font-jakarta">📅 Calendar Integration</p>
              <p className="text-[9px] text-blue-600/80 font-jakarta">Google Calendar, Outlook, and .ics downloads are auto-generated for attendees after registration.</p>
            </div>
          </Section>

          {error && <p className="text-sm text-red-500 font-jakarta bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-brand hover:bg-brand-600 text-white font-bold font-jakarta text-sm rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 sticky bottom-0">{loading&&<Loader2 className="w-4 h-4 animate-spin"/>}Create & Publish Event</button>
        </form>
        </div>

        {/* ═══ LIVE PREVIEW ═══ */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-6">
            <p className="text-[9px] font-bold uppercase text-gray-400 font-jakarta mb-2 tracking-wider">Live Preview</p>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <div className="relative" style={{aspectRatio:"1/1"}}>{coverImageUrl?<img src={coverImageUrl} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full bg-gradient-to-br from-brand/5 to-brand/10 flex items-center justify-center"><ImageIcon className="w-7 h-7 text-gray-200"/></div>}<span className="absolute top-2 left-2 text-[8px] font-bold uppercase bg-white/90 text-brand px-1.5 py-0.5 rounded-full">{CATEGORIES[CATEGORY_VALUES.indexOf(category)]}</span></div>
              <div className="p-3 space-y-1.5">
                <h3 className="font-sora font-bold text-sm text-navy dark:text-white leading-tight">{title||<span className="text-gray-300">Title</span>}</h3>
                {subtitle&&<p className="text-[10px] text-gray-500 font-jakarta">{subtitle}</p>}
                {startAt&&<p className="text-[10px] text-gray-500 font-jakarta flex items-center gap-1"><Calendar className="w-3 h-3 text-brand"/>{new Date(startAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</p>}
                <p className="text-[10px] text-gray-500 font-jakarta flex items-center gap-1">{format==="VIRTUAL"?<><Video className="w-3 h-3 text-purple-500"/>Online</>:city||venueName?<><MapPin className="w-3 h-3 text-blue-500"/>{city||venueName}</>:<><MapPin className="w-3 h-3 text-gray-300"/>TBA</>}</p>
                {tags&&<div className="flex flex-wrap gap-1">{tags.split(",").slice(0,4).map((t,i)=>t.trim()&&<span key={i} className="text-[8px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded font-jakarta">{t.trim()}</span>)}</div>}
                <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-gray-800"><span className="text-[9px] font-bold text-green-600">Free</span><span className="text-[8px] text-gray-400 flex items-center gap-0.5"><Users className="w-2.5 h-2.5"/>{unlimited?"∞":capacity||"∞"}</span></div>
                {speakers.length>0&&<div className="pt-1"><p className="text-[8px] text-gray-400 font-jakarta">{speakers.length} speaker{speakers.length>1?"s":""}</p></div>}
                <div className="pt-1"><div className="w-full py-1.5 bg-brand/10 text-brand text-[9px] font-bold font-jakarta rounded text-center">Register Now</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, open, onToggle, children }: { title: string; icon: any; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 font-jakarta"><Icon className="w-4 h-4 text-gray-400"/>{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open?"rotate-180":""}`}/>
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}
