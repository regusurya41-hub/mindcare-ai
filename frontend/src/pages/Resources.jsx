import { BookOpen, Headphones, LifeBuoy, Moon, Waves } from 'lucide-react';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';

const resources = [
  { icon: Waves, title: 'Breathing Library', detail: 'Box breathing, long-exhale reset, and panic grounding.' },
  { icon: Headphones, title: 'Sound Space', detail: 'Rain, ocean, soft noise, and focus ambience placeholders.' },
  { icon: Moon, title: 'Night Reflection', detail: 'Wind-down prompts for sleep, closure, and emotional unloading.' },
  { icon: BookOpen, title: 'Support Guides', detail: 'Plain-language guides for stress, loneliness, motivation, and burnout.' }
];

export default function Resources() {
  return (
    <AnimatedPage className="grid gap-5">
      <section className="panel bg-gradient-to-br from-white/90 to-lavender/70 dark:from-white/10 dark:to-violet/10">
        <div className="flex items-center gap-3">
          <LifeBuoy className="text-indigo dark:text-indigo-200" />
          <p className="text-sm font-bold text-indigo dark:text-indigo-200">Resources</p>
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight">A calmer toolkit for everyday moments.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          Short, supportive tools users can reach for without feeling like they entered a clinical portal.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resources.map(({ icon: Icon, title, detail }) => (
          <WellnessCard key={title}>
            <Icon className="text-indigo dark:text-indigo-200" />
            <h2 className="mt-4 text-xl font-black tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
          </WellnessCard>
        ))}
      </section>
    </AnimatedPage>
  );
}
