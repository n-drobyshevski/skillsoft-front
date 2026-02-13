import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle,
  LayoutDashboard,
  Shield,
  Users,
  Play,
  Globe,
  Database,
} from 'lucide-react';
import { InteractiveDemo, MiniResultsPreview } from './InteractiveDemo';

export async function HeroSection() {
  const t = await getTranslations('landing.hero');

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-14 md:pt-16">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-8">
          {/* Badge */}
          <div>
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
              {t('badge')}
            </Badge>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              {t('headlinePart1')}
              <span className="block text-primary">{t('headlinePart2')}</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('subheading')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <Link href="/sign-up">
                <Button size="lg" className="h-11 px-6 text-sm sm:h-12 sm:px-8 sm:text-base">
                  {t('ctaStart')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="h-11 px-6 text-sm sm:h-12 sm:px-8 sm:text-base">
                  <LayoutDashboard className="mr-2 w-4 h-4" />
                  {t('ctaDashboard')}
                </Button>
              </Link>
            </SignedIn>
            <Button variant="outline" size="lg" className="h-11 px-6 text-sm sm:h-12 sm:px-8 sm:text-base group">
              <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              {t('ctaDemo')}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 sm:gap-x-8 sm:gap-y-3 sm:pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{t('trustFree')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>{t('trustSecurity')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              <span>{t('trustUsers')}</span>
            </div>
          </div>

          {/* Standards Trust Bar */}
          <div className="pt-3 sm:pt-6">
            <p className="text-xs text-muted-foreground mb-2 sm:mb-3">{t('standardsLabel')}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-500/30 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                <Globe className="w-3.5 h-3.5" />
                ESCO
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-500/30 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors">
                <Database className="w-3.5 h-3.5" />
                O*NET
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                <BrainCircuit className="w-3.5 h-3.5" />
                Big Five
              </span>
            </div>
          </div>
        </div>

        {/* Mini Demo Preview Cards */}
        <div className="mt-8 md:mt-16 flex flex-col lg:flex-row items-center justify-center gap-6">
          <InteractiveDemo />
          <MiniResultsPreview className="hidden lg:block" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center animate-bounce">
          <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
}
