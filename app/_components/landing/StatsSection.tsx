import { AnimatedCounter } from './AnimatedCounter';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 2500, suffix: '+', label: 'Активных пользователей' },
  { value: 150, suffix: '+', label: 'Организаций' },
  { value: 98, suffix: '%', label: 'Удовлетворённость' },
  { value: 45, suffix: '%', label: 'Рост продуктивности' },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-primary-foreground">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-2 text-sm text-primary-foreground/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
