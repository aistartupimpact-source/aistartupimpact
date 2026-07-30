import { getEmployerSession } from '@/lib/employer-auth';
import { redirect } from 'next/navigation';
import { Megaphone, Sparkles, Check } from 'lucide-react';

export default async function EmployerPromotePage() {
  const session = await getEmployerSession();
  if (!session) redirect('/employer/login');

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      current: session.plan === 'FREE',
      features: ['1 active job', 'Standard listing', '30-day duration', 'Basic stats'],
    },
    {
      name: 'Featured',
      price: '₹5,000',
      period: '/month',
      current: session.plan === 'FEATURED',
      features: ['5 active jobs', 'Homepage placement', 'Featured badge', 'Full analytics', 'Priority in search'],
    },
    {
      name: 'Premium',
      price: '₹15,000',
      period: '/month',
      current: session.plan === 'PREMIUM',
      features: ['Unlimited jobs', 'Newsletter inclusion', 'Social promotion', '"Hiring Now" badge', 'All Featured perks', 'AI Startup Impact recommendation'],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-brand" />
          Promote Your Jobs
        </h1>
        <p className="text-xs text-gray-500 font-jakarta mt-0.5">Upgrade your plan to reach more candidates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className={`card p-5 sm:p-6 ${plan.name === 'Featured' ? 'border-brand ring-1 ring-brand/20' : ''}`}>
            {plan.name === 'Featured' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-brand mb-3">
                <Sparkles className="w-3 h-3" /> Most Popular
              </span>
            )}
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="font-sora font-extrabold text-2xl text-navy dark:text-white">{plan.price}</span>
              <span className="text-sm text-gray-400 font-jakarta">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-jakarta">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.current ? (
              <button disabled className="w-full py-2.5 text-sm font-semibold font-jakarta rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-default">
                Current Plan
              </button>
            ) : (
              <button className="w-full py-2.5 text-sm font-semibold font-jakarta rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors">
                Upgrade
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 font-jakarta mt-6">
        Need a custom plan? <a href="mailto:contact@aistartupimpact.com" className="text-brand hover:underline">Contact us</a>
      </p>
    </div>
  );
}
