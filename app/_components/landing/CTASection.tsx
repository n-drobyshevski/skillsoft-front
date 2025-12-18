import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Shield, Users, Star } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export function CTASection() {
  return (
    <section className="py-16 md:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <ScrollReveal>
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            <Star className="w-3.5 h-3.5 mr-1.5" />
            Готовы к переменам?
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Создайте команду
            <span className="block text-primary">на основе данных</span>
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Присоединяйтесь к тысячам HR-специалистов, использующих валидированные
            тесты для принятия лучших решений о найме.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/sign-up">
              <Button size="lg" className="h-14 px-10 text-lg">
                Начать бесплатно
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-10 text-lg">
              Запланировать демо
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>30 дней бесплатно</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Корпоративная безопасность</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              <span>Поддержка 24/7</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
