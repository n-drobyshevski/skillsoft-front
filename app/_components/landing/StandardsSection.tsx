import { Badge } from '@/components/ui/badge';
import { Globe, Database, BrainCircuit, CheckCircle } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { cn } from '@/lib/utils';

const standards = [
  { icon: Globe, bg: 'bg-indigo-500', name: 'ESCO', full: 'Европейская классификация навыков', desc: 'Многоязычная классификация навыков, компетенций и профессий ЕС.', metric: '2 945 навыков', badge: 'Стандарт ЕС', bc: 'border-indigo-500/30 text-indigo-600' },
  { icon: Database, bg: 'bg-violet-500', name: 'O*NET', full: 'Информация о профессиях США', desc: 'Основной источник информации о профессиях Министерства труда США.', metric: '974 профессии', badge: 'США DOL', bc: 'border-violet-500/30 text-violet-600' },
  { icon: BrainCircuit, bg: 'bg-cyan-500', name: 'Big Five', full: 'Модель личности OCEAN', desc: 'Наиболее валидированная модель личности для картирования черт и компетенций.', metric: '5 измерений', badge: 'Психология', bc: 'border-cyan-500/30 text-cyan-600' },
];

export function StandardsSection() {
  return (
    <section id="standards" className="py-16 md:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center space-y-4 mb-12 md:mb-20">
          <Badge variant="outline" className="mb-4">Международные стандарты</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Соответствие <span className="text-primary">мировым стандартам</span></h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">Три международно признанных стандарта для комплексной оценки навыков.</p>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-6">
          {standards.map((s, i) => (
            <ScrollReveal key={s.name} delay={i * 100}>
              <div className="h-full p-6 rounded-2xl bg-background border border-border/50 text-center hover:border-border hover:shadow-lg transition-all">
                <div className={cn('w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4', s.bg)}><s.icon className="w-6 h-6 text-white" /></div>
                <h3 className="text-xl font-semibold mb-1">{s.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{s.full}</p>
                <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
                <div className="mb-4"><span className="text-2xl font-bold">{s.metric.split(' ')[0]}</span><span className="text-sm text-muted-foreground ml-1">{s.metric.split(' ').slice(1).join(' ')}</span></div>
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', s.bc)}><CheckCircle className="w-3 h-3" />{s.badge}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={300} className="mt-12">
          <div className="p-6 md:p-8 rounded-2xl bg-background border border-border/50">
            <h4 className="text-sm font-medium mb-6 text-center">Как стандарты работают вместе</h4>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {[{ n: '1', t: 'Профиль должности', d: 'Импорт из O*NET' }, { n: '2', t: 'Картирование навыков', d: 'Связь с таксономией ESCO' }, { n: '3', t: 'Оценка', d: 'Валидированные вопросы' }, { n: '4', t: 'Аналитика', d: 'Проекция Big Five' }].map((step, i, arr) => (
                <div key={step.n} className="flex items-center gap-4">
                  <div className="flex flex-col items-center text-center max-w-[120px]">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-2">{step.n}</div>
                    <h5 className="text-sm font-medium mb-1">{step.t}</h5>
                    <p className="text-xs text-muted-foreground">{step.d}</p>
                  </div>
                  {i < arr.length - 1 && <svg className="hidden md:block text-muted-foreground/30" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
