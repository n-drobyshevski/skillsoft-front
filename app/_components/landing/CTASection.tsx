import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, LayoutDashboard, Shield, Users, Star } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export async function CTASection() {
  const t = await getTranslations('landing.cta');

  return (
    <section className="py-10 md:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <ScrollReveal>
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 md:mb-6">
            <Star className="w-3.5 h-3.5 mr-1.5" />
            {t('badge')}
          </Badge>

          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
            {t('titlePart1')}
            <span className="block text-primary">{t('titlePart2')}</span>
          </h2>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 md:gap-4 md:mb-8">
            <SignedOut>
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base sm:h-14 sm:px-10 sm:text-lg">
                  {t('ctaStart')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base sm:h-14 sm:px-10 sm:text-lg">
                  <LayoutDashboard className="mr-2 w-5 h-5" />
                  {t('ctaDashboard')}
                </Button>
              </Link>
            </SignedIn>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base sm:h-14 sm:px-10 sm:text-lg">
              {t('ctaDemo')}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
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
              <span>{t('trustSupport')}</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
