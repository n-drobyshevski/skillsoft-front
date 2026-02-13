import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Layers, TrendingUp, Award } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export async function HowItWorksSection() {
  const t = await getTranslations('landing.howItWorks');

  const steps = [
    {
      step: '01',
      icon: Layers,
      title: t('step1.title'),
      description: t('step1.desc'),
    },
    {
      step: '02',
      icon: TrendingUp,
      title: t('step2.title'),
      description: t('step2.desc'),
    },
    {
      step: '03',
      icon: Award,
      title: t('step3.title'),
      description: t('step3.desc'),
    },
  ];

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="py-8 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <ScrollReveal className="text-center space-y-3 mb-6 md:mb-12">
          <Badge variant="outline" className="mb-2 md:mb-4">{t('badge')}</Badge>
          <h2 id="how-it-works-heading" className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {t('title')}{' '}
            <span className="text-primary">{t('titleHighlight')}</span>
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </ScrollReveal>

        {/* Steps */}
        <ol className="grid md:grid-cols-3 gap-3 md:gap-6 list-none p-0 m-0">
          {steps.map((item, index) => (
            <li key={item.step}>
              <ScrollReveal delay={index * 100}>
                <article className="h-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border text-center hover:shadow-lg transition-all">
                  <div className="relative inline-flex mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
                    </div>
                    <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-card">
                      {item.step}
                    </span>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-lg md:text-xl font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
