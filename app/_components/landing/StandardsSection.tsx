import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Globe, Database, BrainCircuit, CheckCircle } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { cn } from '@/lib/utils';

export async function StandardsSection() {
  const t = await getTranslations('landing.standards');

  const standards = [
    { icon: Globe, bg: 'bg-indigo-500', name: 'ESCO', full: t('esco.full'), desc: t('esco.desc'), metric: t('esco.metric'), metricLabel: t('esco.metricLabel'), badge: t('esco.badge'), bc: 'border-indigo-500/30 text-indigo-600' },
    { icon: Database, bg: 'bg-violet-500', name: 'O*NET', full: t('onet.full'), desc: t('onet.desc'), metric: t('onet.metric'), metricLabel: t('onet.metricLabel'), badge: t('onet.badge'), bc: 'border-violet-500/30 text-violet-600' },
    { icon: BrainCircuit, bg: 'bg-cyan-500', name: 'Big Five', full: t('bigFive.full'), desc: t('bigFive.desc'), metric: t('bigFive.metric'), metricLabel: t('bigFive.metricLabel'), badge: t('bigFive.badge'), bc: 'border-cyan-500/30 text-cyan-600' },
  ];

  const integrationSteps = [
    { n: '1', t: t('integration.step1Title'), d: t('integration.step1Desc') },
    { n: '2', t: t('integration.step2Title'), d: t('integration.step2Desc') },
    { n: '3', t: t('integration.step3Title'), d: t('integration.step3Desc') },
    { n: '4', t: t('integration.step4Title'), d: t('integration.step4Desc') },
  ];

  return (
    <section id="standards" className="py-10 md:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center space-y-3 mb-8 md:mb-20">
          <Badge variant="outline" className="mb-2 md:mb-4">{t('badge')}</Badge>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t('title')} <span className="text-primary">{t('titleHighlight')}</span></h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {standards.map((s, i) => (
            <ScrollReveal key={s.name} delay={i * 100}>
              <div className="h-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-background border border-border/50 text-center hover:border-border hover:shadow-lg transition-all">
                <div className={cn('w-10 h-10 md:w-12 md:h-12 mx-auto rounded-xl flex items-center justify-center mb-3 md:mb-4', s.bg)}><s.icon className="w-5 h-5 md:w-6 md:h-6 text-white" /></div>
                <h3 className="text-xl font-semibold mb-1">{s.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{s.full}</p>
                <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
                <div className="mb-4"><span className="text-2xl font-bold">{s.metric}</span><span className="text-sm text-muted-foreground ml-1">{s.metricLabel}</span></div>
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', s.bc)}><CheckCircle className="w-3 h-3" />{s.badge}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={300} className="mt-8 md:mt-12">
          <div className="p-4 md:p-8 rounded-xl md:rounded-2xl bg-background border border-border/50">
            <h4 className="text-sm font-medium mb-4 md:mb-6 text-center">{t('integration.title')}</h4>
            <div className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-4 md:gap-8">
              {integrationSteps.map((step, i, arr) => (
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
