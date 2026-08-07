"use client";

import { useState } from "react";
import Image from "next/image";
import { X, CheckCircle, Loader2, Calendar, MapPin, Video } from "lucide-react";
import CitySelect from "@/components/events/CitySelect";

const OCCUPATIONS = [
  "Founder / CEO",
  "Student",
  "Software Engineer",
  "Product Manager",
  "Investor",
  "Researcher",
  "Designer",
  "Data Scientist",
  "Freelancer",
  "Marketing / Growth",
  "Business Analyst",
  "Content Creator",
  "Other",
];

interface Props {
  event: any;
  customQuestions: any[];
  ticketTiers: any[];
  onClose: () => void;
}

export default function RegistrationModal({ event, customQuestions, ticketTiers, onClose }: Props) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [occupation, setOccupation] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(true);
  const [whatsappConsent, setWhatsappConsent] = useState(true);
  const [ticketTierId, setTicketTierId] = useState(ticketTiers.length > 0 ? ticketTiers[0].id : "");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const validateEmail = (val: string) => {
    const lower = val.toLowerCase();
    setEmail(lower);
    if (lower && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (emailError) return;
    setLoading(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id, name, email, phone: phone || null,
          company: company || null, role: null, occupation: occupation || null,
          locationCity: locationCity || null, newsletterConsent, whatsappConsent,
          ticketTierId: ticketTierId || null,
          answers: Object.entries(answers).map(([questionId, answerText]) => ({ questionId, answerText })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || "Registration failed."); setLoading(false); return; }
      setStep("success");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white">
            {step === "success" ? "You're In!" : "Register"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {step === "success" ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-sora font-bold text-xl text-navy dark:text-white">Registration Confirmed!</h3>
            <p className="text-sm text-gray-500 font-jakarta">
              You&apos;re registered for <strong>{event.title}</strong>. A confirmation email with your QR code has been sent to <strong>{email}</strong>.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left">
              <p className="text-xs font-bold uppercase text-gray-400 font-jakarta mb-2">What&apos;s next</p>
              <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 font-jakarta">
                <li>✓ Check your email for the QR code</li>
                <li>✓ Add the event to your calendar</li>
                <li>✓ Show the QR code at check-in</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <a href={`/api/events/calendar?slug=${event.slug}`} download className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-jakarta font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-center transition-colors">📅 Download .ics</a>
              <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.startAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${new Date(event.endAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}&ctz=${event.timezone}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-jakarta font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-center transition-colors">Google Calendar</a>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-brand hover:bg-brand-600 text-white font-bold font-jakarta text-sm rounded-xl transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Event Header with Cover Image */}
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-2">
              {/* Cover image (16:9) */}
              {event.coverImageUrl && (
                <div style={{ aspectRatio: "16/9" }} className="w-full">
                  <Image src={event.coverImageUrl} alt="" width={400} height={225} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-sora font-bold text-navy dark:text-white">{event.title}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-jakarta">
                    <Calendar className="w-3 h-3 text-brand" />
                    {new Date(event.startAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} • {new Date(event.startAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {event.venueName ? (
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-jakarta">
                      <MapPin className="w-3 h-3 text-blue-500" />{event.venueName}
                    </span>
                  ) : event.format === "VIRTUAL" ? (
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-jakarta">
                      <Video className="w-3 h-3 text-purple-500" />Online
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Full Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm font-jakarta" />
            </div>

            {/* Email with live validation */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Email *</label>
              <input type="email" required value={email} onChange={(e) => validateEmail(e.target.value)} placeholder="you@company.com" className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 text-sm font-jakarta ${emailError ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-gray-200 dark:border-gray-700 focus:ring-brand/30 focus:border-brand"}`} />
              {emailError && <p className="text-[10px] text-red-500 font-jakarta mt-0.5">{emailError}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Phone <span className="normal-case text-gray-400">(Optional)</span></label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm font-jakarta" />
              <p className="text-[10px] text-gray-400 font-jakarta mt-0.5">Used for event reminders and important updates</p>
            </div>

            {/* Company / Organization */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Company / Organization</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Where do you work or study?" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm font-jakarta" />
            </div>

            {/* Occupation - searchable dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Occupation *</label>
              <select required value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand appearance-none">
                <option value="" disabled>Select your occupation</option>
                {OCCUPATIONS.map((occ) => <option key={occ} value={occ}>{occ}</option>)}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Your City</label>
              <CitySelect value={locationCity} onChange={(city) => setLocationCity(city.name)} placeholder="Search your city..." />
              <p className="text-[10px] text-gray-400 font-jakarta mt-0.5">Helps us notify you about events near you</p>
            </div>

            {/* Ticket Tier */}
            {ticketTiers.length > 1 && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">Ticket Type</label>
                <select value={ticketTierId} onChange={(e) => setTicketTierId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30">
                  {ticketTiers.map((tier: any) => (
                    <option key={tier.id} value={tier.id}>{tier.name} — {tier.priceCents === 0 ? "Free" : `₹${tier.priceCents / 100}`}{tier.quantity && ` (${tier.quantity - tier.soldCount} left)`}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Questions */}
            {customQuestions.map((q: any) => (
              <div key={q.id}>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 font-jakarta">{q.questionText} {q.required && "*"}</label>
                {q.questionType === "TEXT" && (
                  <input type="text" required={q.required} value={answers[q.id] || ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30" />
                )}
                {q.questionType === "SELECT" && (
                  <select required={q.required} value={answers[q.id] || ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30">
                    <option value="">Select...</option>
                    {(q.options || []).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}
                {q.questionType === "CHECKBOX" && (
                  <label className="flex items-center gap-2 mt-1 cursor-pointer">
                    <input type="checkbox" checked={answers[q.id] === "yes"} onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.checked ? "yes" : "no" }))} className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">Yes</span>
                  </label>
                )}
              </div>
            ))}

            {/* Newsletter Consent */}
            {/* Newsletter Consent */}
            <div className="bg-brand/5 dark:bg-brand/10 rounded-xl p-3 border border-brand/10">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={newsletterConsent} onChange={(e) => setNewsletterConsent(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand focus:ring-brand" />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">Keep me updated about upcoming AI events, conferences, and opportunities in my area via email.</span>
              </label>
            </div>

            {/* WhatsApp Consent */}
            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-900/20">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={whatsappConsent} onChange={(e) => setWhatsappConsent(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">Send me event reminders and updates on WhatsApp. You can opt out anytime.</span>
              </label>
            </div>

            {error && <p className="text-sm text-red-500 font-jakarta bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}

            <button type="submit" disabled={loading || !name || !email || !occupation || !!emailError} className="w-full py-3 bg-brand hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold font-jakarta text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Registering...</> : "Complete Registration"}
            </button>

            <p className="text-[10px] text-gray-400 font-jakarta text-center">By registering, you agree to our terms of service and privacy policy.</p>
          </form>
        )}
      </div>
    </div>
  );
}
