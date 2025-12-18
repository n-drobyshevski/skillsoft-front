import { Badge } from '@/components/ui/badge';
import { Layers, TrendingUp, Award } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      icon: Layers,
      title: 'Определите требования',
      description:
        'Выберите компетенции из нашей базы или импортируйте профили должностей из O*NET. Создавайте тесты за минуты.',
    },
    {
      step: '02',
      icon: TrendingUp,
      title: 'Проведите оценку',
      description:
        'Кандидаты отвечают на научно валидированные вопросы. Адаптивное тестирование подстраивается под уровень.',
    },
    {
      step: '03',
      icon: Award,
      title: 'Анализируйте результаты',
      description:
        'Получите оценку соответствия, анализ командной совместимости и паспорт компетенций с рекомендациями.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <ScrollReveal className="text-center space-y-4 mb-12 md:mb-20">
          <Badge variant="outline" className="mb-4">Как это работает</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Простые шаги к{' '}
            <span className="text-primary">лучшему найму</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            От требований к должности до обоснованных решений по найму за три простых шага.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((item, index) => (
            <ScrollReveal key={item.step} delay={index * 100}>
              <div className="relative text-center">
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}

                <div className="space-y-6">
                  <div className="relative inline-flex">
                    <div className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center transition-transform hover:scale-105">
                      <div className="w-24 h-24 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
                        <item.icon className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
