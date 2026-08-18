import type { Metadata } from 'next';
import { Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us — AI Startup Impact',
  description: 'Get in touch with the AI Startup Impact team for partnerships, press inquiries, bug reports, or feedback.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us — AI Startup Impact',
    description: 'Get in touch with the AI Startup Impact team for partnerships, press inquiries, bug reports, or feedback.',
    url: 'https://aistartupimpact.com/contact',
  },
};

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@aistartupimpact.com',
    href: 'mailto:hello@aistartupimpact.com',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Hyderabad, Telangana, India',
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Within 24–48 hours',
  },
  {
    icon: MessageSquare,
    label: 'Support',
    value: 'Logged-in users can also raise tickets from their dashboard',
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">
          Contact Us
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-2 max-w-lg mx-auto">
          Have a question, partnership idea, or found a bug? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {contactInfo.map((item) => (
            <div key={item.label} className="card p-4 sm:p-5 hover:shadow-none">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 font-jakarta uppercase tracking-wider">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-jakarta text-brand hover:underline mt-0.5 block">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-jakarta text-gray-700 dark:text-gray-300 mt-0.5">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* FAQ hint */}
          <div className="card p-4 sm:p-5 bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30 hover:shadow-none">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 font-jakarta uppercase tracking-wider mb-1">
              Before you write
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">
              For startup or tool listing issues, try re-submitting from your{' '}
              <a href="/founder/login" className="text-brand hover:underline">founder dashboard</a>.
              For job board questions, visit{' '}
              <a href="/employer/login" className="text-brand hover:underline">employer settings</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
