import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle,
  Shield,
  Users,
  Play,
  Globe,
  Database,
} from 'lucide-react';
import { InteractiveDemo, MiniResultsPreview } from './InteractiveDemo';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          {/* Badge */}
          <div>
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
              Платформа психометрической оценки
            </Badge>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Научно обоснованная
              <span className="block text-primary">оценка гибких навыков</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Точное измерение компетенций. Подбор талантов на позиции.
              Формирование высокоэффективных команд на основе данных.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-base">
                Начать бесплатно
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base group">
              <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              Смотреть демо
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>30 дней бесплатно</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Безопасность данных</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              <span>2 500+ специалистов</span>
            </div>
          </div>

          {/* Standards Trust Bar */}
          <div className="pt-6">
            <p className="text-xs text-muted-foreground mb-3">На основе международных стандартов</p>
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
        <div className="mt-12 md:mt-16 flex flex-col lg:flex-row items-center justify-center gap-6">
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
