import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, Target, ArrowRight } from 'lucide-react';
import { ReliabilityGauge } from './ReliabilityGauge';
import { ScrollReveal } from './ScrollReveal';
import { cn } from '@/lib/utils';

export async function PsychometricsShowcase() {
  const t = await getTranslations('landing.psychometrics');

  return (
    <section id="features" className="py-10 md:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center space-y-3 mb-8 md:mb-20">
          <Badge variant="outline" className="mb-2 md:mb-4">{t('badge')}</Badge>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t('title')} <span className="text-primary">{t('titleHighlight')}</span></h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <ScrollReveal delay={0}><FeatureCard icon={Activity} color="bg-emerald-500" title={t('reliability.title')} desc={t('reliability.desc')}><ReliabilityGauge value={0.87} /></FeatureCard></ScrollReveal>
          <ScrollReveal delay={100}><FeatureCard icon={BarChart3} color="bg-blue-500" title={t('validity.title')} desc={t('validity.desc')}><ValidityBars discriminationLabel={t('validity.discrimination')} difficultyLabel={t('validity.difficulty')} /></FeatureCard></ScrollReveal>
          <ScrollReveal delay={200}><FeatureCard icon={Target} color="bg-violet-500" title={t('quality.title')} desc={t('quality.desc')}><QualityStats validatedLabel={t('quality.validated')} passingLabel={t('quality.passing')} underReviewLabel={t('quality.underReview')} criticalLabel={t('quality.critical')} /></FeatureCard></ScrollReveal>
        </div>
        <ScrollReveal delay={300} className="mt-6 md:mt-8">
          <StatusPipeline
            title={t('pipeline.title')}
            pendingLabel={t('pipeline.pending')}
            validLabel={t('pipeline.valid')}
            reviewLabel={t('pipeline.review')}
            disabledLabel={t('pipeline.disabled')}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, color, title, desc, children }: { icon: React.ComponentType<{ className?: string }>; color: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="h-full p-4 md:p-8 rounded-xl md:rounded-2xl bg-background border border-border/50 hover:border-border hover:shadow-lg transition-all">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4" style={{ backgroundColor: color.includes('emerald') ? '#10b981' : color.includes('blue') ? '#3b82f6' : '#8b5cf6' }}><Icon className="w-5 h-5 md:w-6 md:h-6 text-white" /></div>
      <h3 className="text-base md:text-lg font-semibold mb-1.5 md:mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 md:mb-4">{desc}</p>
      <div className="pt-3 md:pt-4 border-t border-border/50">{children}</div>
    </div>
  );
}

function ValidityBars({ discriminationLabel, difficultyLabel }: { discriminationLabel: string; difficultyLabel: string }) {
  return (
    <div className="space-y-3">
      <ValidityBar label={discriminationLabel} value={0.42} threshold={0.25} />
      <ValidityBar label={difficultyLabel} value={0.65} threshold={0.2} max={0.9} />
    </div>
  );
}

function ValidityBar({ label, value, threshold, max = 1 }: { label: string; value: number; threshold: number; max?: number }) {
  const pct = (value / max) * 100;
  const good = value >= threshold;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value.toFixed(2)}</span></div>
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden relative">
        <div className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/50" style={{ left: `${(threshold / max) * 100}%` }} />
        <div className={cn('h-full rounded-full', good ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QualityStats({ validatedLabel, passingLabel, underReviewLabel, criticalLabel }: { validatedLabel: string; passingLabel: string; underReviewLabel: string; criticalLabel: string }) {
  const stats = [{ v: '2 500+', l: validatedLabel, c: 'emerald' }, { v: '98%', l: passingLabel, c: 'blue' }, { v: '<3%', l: underReviewLabel, c: 'amber' }, { v: '0', l: criticalLabel, c: 'emerald' }];
  return (
    <div className="grid grid-cols-2 gap-4 text-center">
      {stats.map((s) => (
        <div key={s.l}><div className={cn('text-lg font-bold', s.c === 'emerald' ? 'text-emerald-600' : s.c === 'blue' ? 'text-blue-600' : 'text-amber-600')}>{s.v}</div><div className="text-xs text-muted-foreground">{s.l}</div></div>
      ))}
    </div>
  );
}

function StatusPipeline({ title, pendingLabel, validLabel, reviewLabel, disabledLabel }: { title: string; pendingLabel: string; validLabel: string; reviewLabel: string; disabledLabel: string }) {
  const items = [{ l: pendingLabel, n: 45, c: 'muted' }, { l: validLabel, n: 2312, c: 'emerald' }, { l: reviewLabel, n: 28, c: 'amber' }, { l: disabledLabel, n: 115, c: 'slate' }];
  return (
    <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-background border border-border/50">
      <h4 className="text-sm font-medium mb-4 text-center">{title}</h4>
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
        {items.map((i, idx) => (
          <div key={i.l} className="flex items-center gap-2">
            <span className={cn('px-3 py-1.5 rounded-full text-xs font-medium border', i.c === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : i.c === 'amber' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : i.c === 'slate' ? 'bg-slate-500/10 text-slate-600 border-slate-500/20' : 'bg-muted text-muted-foreground border-border')}>{i.l} ({i.n.toLocaleString()})</span>
            {idx < items.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground/50 hidden md:block" />}
          </div>
        ))}
      </div>
    </div>
  );
}
