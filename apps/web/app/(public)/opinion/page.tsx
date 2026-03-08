import Link from 'next/link';
import { MessageSquare, Clock, ChevronRight } from 'lucide-react';

const articles = [
  { slug: 'ai-ethics-india', title: "The Ethics Question: Should India Regulate AI Before It's Too Late?", excerpt: "As India's AI ecosystem grows rapidly, the question of regulation becomes increasingly urgent — but premature rules could stifle innovation.", author: 'Priya Sharma', date: 'Feb 20, 2025', readTime: '8 min', topic: 'Regulation' },
  { slug: 'open-source-vs-closed', title: 'Open Source vs Closed AI: Which Path Should India Choose?', excerpt: "India has a unique opportunity to lead the open-source AI movement. But is it the right strategic bet?", author: 'Arjun Singh', date: 'Feb 17, 2025', readTime: '7 min', topic: 'Strategy' },
  { slug: 'ai-jobs-displacement', title: "Will AI Really Destroy Jobs in India? A More Nuanced Take", excerpt: "The reality is more complex than apocalyptic headlines suggest — and India's demographics create a unique buffer.", author: 'Vikram Patel', date: 'Feb 14, 2025', readTime: '10 min', topic: 'Economy' },
  { slug: 'vc-ai-hype', title: 'The VC AI Hype Cycle: Are Indian Investors Getting Smarter?', excerpt: "After the 2023 frenzy, Indian VCs are becoming more discerning about AI investments. Here's what they're looking for.", author: 'Anjali Nair', date: 'Feb 11, 2025', readTime: '6 min', topic: 'Funding' },
  { slug: 'ai-education-gap', title: "India's AI Talent Gap: Why Engineering Colleges Need a Curriculum Overhaul", excerpt: "Most Indian CS graduates still can't build an ML pipeline. Here's what needs to change.", author: 'Meera Rao', date: 'Feb 8, 2025', readTime: '9 min', topic: 'Education' },
  { slug: 'data-sovereignty', title: "Data Sovereignty in the AI Age: India's Strategic Imperative", excerpt: "If data is the new oil, India needs to ensure its vast data reserves aren't being refined elsewhere.", author: 'Rahul Kumar', date: 'Feb 5, 2025', readTime: '11 min', topic: 'Policy' },
];

export default function OpinionPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-6 h-6 text-brand" />
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">Opinion & Analysis</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base max-w-2xl">
          Deep analysis and bold opinions on India&apos;s AI ecosystem from our editorial team and guest contributors.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {articles.map((a) => (
          <Link key={a.slug} href={`/news/${a.slug}`} className="group block">
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-category text-[10px]">Opinion</span>
                <span className="text-[10px] font-bold text-gray-400 font-jakarta uppercase tracking-wider">{a.topic}</span>
              </div>
              <h2 className="font-sora font-bold text-lg sm:text-xl text-navy dark:text-white group-hover:text-brand transition-colors leading-snug">
                {a.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-jakarta mt-2 leading-relaxed line-clamp-2">{a.excerpt}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
                <span className="font-medium text-gray-500 dark:text-gray-400">{a.author}</span>
                <span>·</span>
                <span>{a.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
