import { Lightbulb } from 'lucide-react';

interface KeyTakeawaysProps {
  takeaways: string[];
}

export default function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
  if (!takeaways.length) return null;

  return (
    <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-xl p-5 my-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <h3 className="font-sora font-bold text-sm text-amber-900 dark:text-amber-200">Key Takeaways</h3>
      </div>
      <ul className="space-y-2">
        {takeaways.map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 font-jakarta leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-1.5 shrink-0" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
