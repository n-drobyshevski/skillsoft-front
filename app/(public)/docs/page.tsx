import { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  RocketIcon,
  PencilIcon,
  LightbulbIcon,
  ArrowRightIcon,
  BarChart3Icon,
  BrainIcon,
  SettingsIcon,
  HelpCircleIcon,
  BookMarkedIcon,
  Zap,
} from "lucide-react";

import { DocsToc } from "./_components/DocsToc";
import { DocsFooterNav } from "./_components/DocsFooterNav";
import { MobileTocDrawer } from "./_components/MobileTocDrawer";
import { Callout } from "./_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Документация | SkillSoft",
  description:
    "Добро пожаловать в документацию платформы оценки soft skills SkillSoft",
};

const tocItems = [
  { id: "welcome", title: "Добро пожаловать", level: 2 },
  { id: "quick-links", title: "Быстрые ссылки", level: 2 },
  { id: "features", title: "Возможности платформы", level: 2 },
  { id: "audience", title: "Для кого документация", level: 2 },
  { id: "getting-help", title: "Получение помощи", level: 2 },
];

const quickLinks = [
  {
    title: "Быстрый старт",
    description: "Начните работу с платформой",
    href: "/docs/getting-started",
    icon: RocketIcon,
    color: "emerald",
  },
  {
    title: "Как работает система",
    description: "Полный обзор архитектуры",
    href: "/docs/how-it-works",
    icon: SettingsIcon,
    color: "blue",
  },
  {
    title: "Система оценивания",
    description: "Алгоритмы расчета баллов",
    href: "/docs/scoring",
    icon: BarChart3Icon,
    color: "violet",
  },
  {
    title: "Сборка тестов",
    description: "Конфигурация и Blueprint",
    href: "/docs/test-building",
    icon: BookOpenIcon,
    color: "amber",
  },
  {
    title: "Психометрика",
    description: "Валидация качества вопросов",
    href: "/docs/psychometrics",
    icon: BrainIcon,
    color: "rose",
  },
  {
    title: "Создание контента",
    description: "Компетенции, индикаторы, вопросы",
    href: "/docs/authoring",
    icon: PencilIcon,
    color: "cyan",
  },
];

const features = [
  {
    title: "Три сценария оценки",
    description: "Overview, Job Fit и Team Fit — выбирайте подходящий под задачу",
  },
  {
    title: "Психометрическая валидация",
    description: "Автоматический расчет p-value, rpb и Cronbach's Alpha",
  },
  {
    title: "Международные стандарты",
    description: "Интеграция с O*NET, ESCO и Big Five",
  },
  {
    title: "Гибкая сборка тестов",
    description: "Адаптивный выбор вопросов по Blueprint",
  },
];

const colorClasses = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-600 dark:text-emerald-400",
    hover: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    hover: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    icon: "text-violet-600 dark:text-violet-400",
    hover: "hover:border-violet-300 dark:hover:border-violet-700",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400",
    hover: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    icon: "text-rose-600 dark:text-rose-400",
    hover: "hover:border-rose-300 dark:hover:border-rose-700",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-800",
    icon: "text-cyan-600 dark:text-cyan-400",
    hover: "hover:border-cyan-300 dark:hover:border-cyan-700",
  },
};

export default function DocsPage() {
  return (
    <div className="docs-content">
      {/* Mobile TOC Drawer */}
      <MobileTocDrawer items={tocItems} />

      {/* Two-column layout: Content + Desktop TOC */}
      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
        {/* Main content column */}
        <div className="min-w-0">
          {/* Page Header - Hero Section */}
          <section id="welcome" className="mb-8 sm:mb-10">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BookMarkedIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  Документация SkillSoft
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Платформа оценки soft skills
                </p>
              </div>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Добро пожаловать в документацию платформы SkillSoft. Здесь вы найдете
              руководства по созданию тестов, настройке оценки и анализу результатов.
            </p>

            {/* Quick action button */}
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-base sm:text-sm transition-colors min-h-[48px] sm:min-h-[44px]"
              >
                <Zap className="w-4 h-4" />
                Начать работу
              </Link>
              <Link
                href="/docs/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-lg border border-border bg-background hover:bg-muted active:bg-muted/80 text-foreground font-medium text-base sm:text-sm transition-colors min-h-[48px] sm:min-h-[44px]"
              >
                <BookOpenIcon className="w-4 h-4" />
                Обзор системы
              </Link>
            </div>
          </section>

          {/* Quick Links Section */}
          <section id="quick-links" className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-5 flex items-center gap-2">
              <RocketIcon className="w-5 h-5 text-muted-foreground" />
              Быстрые ссылки
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {quickLinks.map((link) => {
                const colors = colorClasses[link.color as keyof typeof colorClasses];
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      group flex items-start gap-3 sm:gap-4
                      p-4 sm:p-5 rounded-xl border
                      ${colors.bg} ${colors.border} ${colors.hover}
                      transition-all duration-150
                      active:scale-[0.98]
                      min-h-[88px]
                    `}
                  >
                    {/* Icon container */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11
                      rounded-lg bg-white dark:bg-white/10
                      flex items-center justify-center
                      shadow-sm
                    `}>
                      <link.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {link.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {link.description}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <ArrowRightIcon className="flex-shrink-0 w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all mt-2" />
                  </Link>
                );
              })}
            </div>

            {/* Additional links */}
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/docs/best-practices"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[44px]"
              >
                <LightbulbIcon className="w-4 h-4" />
                Лучшие практики
              </Link>
              <Link
                href="/docs/glossary"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[44px]"
              >
                <BookOpenIcon className="w-4 h-4" />
                Глоссарий
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-5 flex items-center gap-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              Возможности платформы
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border bg-card"
                >
                  <h3 className="text-base font-medium text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Audience Section */}
          <section id="audience" className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-5">
              Для кого эта документация
            </h2>

            <Callout type="info" title="Целевая аудитория">
              <p className="mb-3">
                Документация ориентирована на <strong>HR-администраторов</strong>, которые:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Создают и настраивают тесты на платформе</li>
                <li>Управляют библиотекой компетенций и вопросов</li>
                <li>Анализируют результаты оценки сотрудников</li>
                <li>Следят за качеством психометрических показателей</li>
              </ul>
            </Callout>

            <p className="text-muted-foreground mt-4 text-sm sm:text-base">
              Для сотрудников, проходящих тестирование, доступны подсказки
              непосредственно в интерфейсе прохождения теста.
            </p>
          </section>

          {/* Getting Help Section */}
          <section id="getting-help" className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-5 flex items-center gap-2">
              <HelpCircleIcon className="w-5 h-5 text-muted-foreground" />
              Получение помощи
            </h2>

            <Callout type="tip" title="Навигация по документации">
              <p className="mb-3">
                Используйте эти инструменты для быстрого поиска:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+K</kbd> —
                  быстрый поиск по документации
                </li>
                <li>
                  Боковое меню — структурированная навигация по разделам
                </li>
                <li>
                  Оглавление справа — навигация внутри страницы
                </li>
              </ul>
            </Callout>

            <div className="mt-4 p-4 rounded-xl border bg-muted/30">
              <p className="text-sm text-muted-foreground mb-3">
                Если вы не нашли ответ на свой вопрос:
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <a
                  href="mailto:support@skillsoft.ru"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border bg-background hover:bg-muted text-sm font-medium transition-colors min-h-[44px]"
                >
                  Написать в поддержку
                </a>
                <Link
                  href="/docs/glossary"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border bg-background hover:bg-muted text-sm font-medium transition-colors min-h-[44px]"
                >
                  Глоссарий терминов
                </Link>
              </div>
            </div>
          </section>

          {/* Footer Navigation */}
          <DocsFooterNav />
        </div>

        {/* Desktop TOC column - sticky sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <DocsToc items={tocItems} />
          </div>
        </aside>
      </div>
    </div>
  );
}
