import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Sparkles } from 'lucide-react';

export async function FooterSection() {
  const t = await getTranslations('landing.footer');

  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">SkillSoft</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">{t('product')}</h4>
            <nav className="space-y-3 text-sm text-muted-foreground">
              <a href="#features" className="block hover:text-foreground transition-colors">
                {t('features')}
              </a>
              <a href="#how-it-works" className="block hover:text-foreground transition-colors">
                {t('howItWorks')}
              </a>
              <a href="#standards" className="block hover:text-foreground transition-colors">
                {t('standards')}
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                {t('integrations')}
              </a>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">{t('company')}</h4>
            <nav className="space-y-3 text-sm text-muted-foreground">
              <a href="#" className="block hover:text-foreground transition-colors">
                {t('about')}
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                {t('blog')}
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                {t('careers')}
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                {t('contact')}
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-12 md:mt-16 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            {t('copyright')}
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              {t('privacy')}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t('terms')}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t('cookies')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
