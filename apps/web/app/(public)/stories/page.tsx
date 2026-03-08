import Link from 'next/link';
import { Clock, Users, BookOpen, ChevronRight } from 'lucide-react';

const stories = [
  { slug: 'medai-rural-india', title: 'From IIT Lab to 10,000 Villages: How MedAI is Bringing Diagnostics to Rural India', excerpt: 'Ravi Kumar left a ₹1.5Cr Google offer to build AI that detects tuberculosis from chest X-rays.', author: 'Anjali Nair', date: 'Mar 4, 2025', readTime: '15 min', featured: true },
  { slug: 'sarvam-ai-journey', title: 'Sarvam AI: Building India-First Foundation Models from Scratch', excerpt: 'How a team of 30 engineers is taking on GPT-4 with models trained exclusively on Indian data.', author: 'Priya Sharma', date: 'Mar 2, 2025', readTime: '12 min', featured: true },
  { slug: 'agribot-agriculture', title: "AgriBot's Mission: AI-Powered Farming for 100 Million Indian Farmers", excerpt: 'Satellite imagery meets machine learning in a bid to double crop yields across Maharashtra.', author: 'Vikram Patel', date: 'Feb 28, 2025', readTime: '10 min', featured: false },
  { slug: 'fintech-ai-lending', title: 'How LendAI is Using NLP to Bring Credit to India\'s Unbanked', excerpt: 'Natural language processing meets alternative credit scoring for 300 million underserved Indians.', author: 'Rahul Kumar', date: 'Feb 25, 2025', readTime: '8 min', featured: false },
  { slug: 'edtech-ai-tutor', title: 'PadhAI: The AI Tutor Teaching in 10 Indian Languages', excerpt: 'An AI tutoring platform that adapts to each student\'s learning pace — now in 50,000 schools.', author: 'Meera Rao', date: 'Feb 22, 2025', readTime: '11 min', featured: false },
  { slug: 'climate-ai-india', title: 'Fighting Climate Change with AI: India\'s Green Tech Revolution', excerpt: 'From carbon tracking to renewable energy optimization, AI startups are leading India\'s climate response.', author: 'Arjun Singh', date: 'Feb 19, 2025', readTime: '9 min', featured: false },
];

export default function StoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-brand" />
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white">Founder Stories</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base max-w-2xl">
          Deep-dive interviews and profiles of the founders building India&apos;s AI future. Real journeys, real challenges, real impact.
        </p>
      </div>

      {/* Featured Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10">
        {stories.filter(s => s.featured).map((story) => (
          <Link key={story.slug} href={`/stories/${story.slug}`} className="group">
            <div className="card overflow-hidden h-full flex flex-col">
              <div className="aspect-[16/9] bg-gradient-to-br from-brand-50 to-gray-50 dark:from-brand-900/20 dark:to-gray-900 relative flex items-center justify-center">
                <Users className="w-16 h-16 text-brand/20" />
                <span className="absolute top-3 left-3 badge-brand text-[10px]">Featured Story</span>
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col">
                <h2 className="font-sora font-bold text-lg sm:text-xl text-navy dark:text-white group-hover:text-brand transition-colors leading-snug">
                  {story.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-jakarta mt-2 line-clamp-2 flex-1">{story.excerpt}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
                  <span className="font-medium text-gray-500 dark:text-gray-400">{story.author}</span>
                  <span>·</span><span>{story.date}</span>
                  <span>·</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{story.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* All Stories */}
      <h2 className="section-title mb-6">All Stories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stories.filter(s => !s.featured).map((story) => (
          <Link key={story.slug} href={`/stories/${story.slug}`} className="group">
            <div className="card p-4 sm:p-5 h-full flex flex-col">
              <span className="badge-category text-[10px] mb-3 inline-block self-start">Founder Story</span>
              <h3 className="font-sora font-bold text-[15px] sm:text-base text-navy dark:text-white group-hover:text-brand transition-colors leading-snug flex-1">
                {story.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-jakarta mt-2 line-clamp-2">{story.excerpt}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
                <span className="font-medium">{story.author}</span>
                <span>·</span><span>{story.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
