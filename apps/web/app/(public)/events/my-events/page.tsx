import { Metadata } from "next";
import MyEventsClient from "./MyEventsClient";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Events — Registered Events",
  description: "View your event registrations, QR codes, and calendar links.",
  robots: { index: false },
};

export default function MyEventsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back */}
      <Link href="/events" className="inline-flex items-center gap-1.5 text-[14px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        Events
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">My Events</h1>
        <p className="text-sm text-gray-500 mt-1">Events you've registered for</p>
      </div>
      <MyEventsClient />
    </div>
  );
}
