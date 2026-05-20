'use client';

/**
 * FAQ Section UI Component
 * Displays FAQs with accordion functionality
 * Accessible with keyboard navigation and ARIA labels
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQSectionProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  title?: string;
}

export default function FAQSection({ faqs, title = 'Frequently Asked Questions' }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="section-title mb-6">{title}</h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="font-sora font-bold text-sm sm:text-base text-navy dark:text-white pr-4">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-brand shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              id={`faq-answer-${index}`}
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === index ? 'max-h-[1000px]' : 'max-h-0'
              }`}
            >
              <div className="p-4 pt-0 text-sm sm:text-base text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
