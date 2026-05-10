import { Flag, Rocket, IndianRupee, Users, Trophy } from 'lucide-react';

interface Stat {
  id: string;
  metricKey: string;
  metricLabel: string;
  metricValue: string;
  metricChange: string | null;
  metricIcon: string | null;
  displayOrder: number;
}

interface IndiaAIHeroProps {
  stats: Stat[];
}

const iconMap: Record<string, any> = {
  rocket: Rocket,
  currency: IndianRupee,
  users: Users,
  trophy: Trophy,
};

export default function IndiaAIHero({ stats }: IndiaAIHeroProps) {
  return (
    <div className="mb-12 sm:mb-16 text-center">
      <div className="inline-flex items-center gap-2 badge-brand mb-4">
        <Flag className="w-3 h-3" /> India AI Ecosystem — Live
      </div>
      <h1 className="font-sora font-extrabold text-3xl sm:text-4xl md:text-[48px] md:leading-tight text-navy dark:text-white max-w-4xl mx-auto">
        India&apos;s AI Revolution — Live
      </h1>
      <p className="text-gray-600 dark:text-gray-300 font-jakarta text-base sm:text-lg mt-4 max-w-2xl mx-auto">
        Real-time intelligence on <strong>3,247+ AI startups</strong>, funding, policy, and talent shaping India&apos;s AI future
      </p>

      {/* Live Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-10">
        {stats.map((stat) => {
          const Icon = iconMap[stat.metricIcon || 'rocket'] || Rocket;
          return (
            <div key={stat.id} className="card p-5 sm:p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-brand" />
              </div>
              <div className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-brand mb-1">
                {stat.metricValue}
              </div>
              {stat.metricChange && (
                <div className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mb-2">
                  {stat.metricChange}
                </div>
              )}
              <div className="text-sm text-gray-700 dark:text-gray-300 font-jakarta font-semibold">
                {stat.metricLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
