import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function FooterSection() {
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
              Интеллектуальная платформа для научно обоснованной оценки гибких навыков
              и профессионального развития.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Продукт</h4>
            <nav className="space-y-3 text-sm text-muted-foreground">
              <a href="#features" className="block hover:text-foreground transition-colors">
                Возможности
              </a>
              <a href="#how-it-works" className="block hover:text-foreground transition-colors">
                Как это работает
              </a>
              <a href="#standards" className="block hover:text-foreground transition-colors">
                Стандарты
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Интеграции
              </a>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Компания</h4>
            <nav className="space-y-3 text-sm text-muted-foreground">
              <a href="#" className="block hover:text-foreground transition-colors">
                О нас
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Блог
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Карьера
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Контакты
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-12 md:mt-16 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 SkillSoft. Все права защищены.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Конфиденциальность
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Условия
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
