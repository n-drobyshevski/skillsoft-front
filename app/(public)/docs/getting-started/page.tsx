import { Metadata } from "next";
import Link from "next/link";
import {
  RocketIcon,
  ClockIcon,
  UserIcon,
  ZapIcon,
  CheckCircle2Icon,
  CircleIcon,
  BookOpenIcon,
  BarChart3Icon,
  BrainIcon,
  LightbulbIcon,
  ArrowRightIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  TargetIcon,
  ListChecksIcon,
  PlayIcon,
} from "lucide-react";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { MobileTocDrawer } from "../_components/MobileTocDrawer";
import { Callout } from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Быстрый старт | Документация | SkillSoft",
  description: "Начните работу с платформой SkillSoft за несколько минут",
};

const tocItems = [
  { id: "introduction", title: "Введение", level: 2 },
  { id: "prerequisites", title: "Что понадобится", level: 2 },
  { id: "first-steps", title: "Первые шаги", level: 2 },
  { id: "create-test", title: "Создание теста", level: 2 },
  { id: "next-steps", title: "Следующие шаги", level: 2 },
];

// Step data for timeline display
const firstSteps = [
  {
    number: 1,
    title: "Войдите в систему",
    description:
      "Используйте свои учетные данные для входа в панель администратора. После входа вы увидите главный дашборд с основными метриками.",
    icon: LayoutDashboardIcon,
  },
  {
    number: 2,
    title: "Изучите структуру",
    description:
      "Познакомьтесь с основными разделами: компетенции, индикаторы, вопросы и шаблоны тестов. Каждый раздел доступен из бокового меню.",
    icon: SearchIcon,
  },
  {
    number: 3,
    title: "Проверьте контент",
    description:
      "Просмотрите библиотеку компетенций и вопросов. Возможно, нужные вам элементы уже созданы другими администраторами.",
    icon: ListChecksIcon,
  },
];

const createTestSteps = [
  {
    number: 1,
    title: "Выберите цель теста",
    description:
      "Определите, что вы хотите оценить: общий профиль компетенций (Overview), соответствие должности (Job Fit) или совместимость с командой (Team Fit).",
    icon: TargetIcon,
  },
  {
    number: 2,
    title: "Выберите компетенции",
    description:
      "Добавьте нужные компетенции в blueprint теста. Система автоматически подберет подходящие вопросы.",
    icon: ListChecksIcon,
  },
  {
    number: 3,
    title: "Настройте параметры",
    description:
      "Укажите количество вопросов, ограничение по времени и другие параметры тестирования.",
    icon: SettingsIcon,
  },
  {
    number: 4,
    title: "Запустите тест",
    description:
      "Пригласите сотрудников пройти тестирование и отслеживайте результаты в реальном времени.",
    icon: PlayIcon,
  },
];

const nextStepsLinks = [
  {
    title: "Система оценивания",
    description: "Алгоритмы расчета баллов",
    href: "/docs/scoring",
    icon: BarChart3Icon,
    color: "violet",
  },
  {
    title: "Психометрика",
    description: "Валидация качества вопросов",
    href: "/docs/psychometrics",
    icon: BrainIcon,
    color: "rose",
  },
  {
    title: "Лучшие практики",
    description: "Создание эффективных тестов",
    href: "/docs/best-practices",
    icon: LightbulbIcon,
    color: "amber",
  },
];

const colorClasses = {
  violet: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    icon: "text-violet-600 dark:text-violet-400",
  },
  rose: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    icon: "text-rose-600 dark:text-rose-400",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: "text-amber-600 dark:text-amber-400",
  },
};

// Reusable Step Timeline Component
function StepTimeline({
  steps,
}: {
  steps: {
    number: number;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}) {
  return (
    <div className="relative mt-6">
      {/* Vertical timeline line */}
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border hidden sm:block" />

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="relative sm:pl-14">
            {/* Step number circle */}
            <div className="hidden sm:flex absolute left-0 top-0 items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold text-lg shadow-sm">
              {step.number}
            </div>

            {/* Step content card */}
            <div className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                {/* Mobile number badge */}
                <div className="flex sm:hidden items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-sm shrink-0">
                  {step.number}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <step.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <h3 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GettingStartedPage() {
  return (
    <div className="docs-content">
      {/* Mobile TOC Drawer */}
      <MobileTocDrawer items={tocItems} />

      {/* Two-column layout: Content + Desktop TOC */}
      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
        {/* Main content column */}
        <div className="min-w-0">
          <DocsBreadcrumb />

          {/* Hero Section */}
          <section id="introduction" className="mb-8 sm:mb-10">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <RocketIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  Быстрый старт
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Начните работу с платформой
                </p>
              </div>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-5">
              Это руководство проведет вас через основные шаги настройки
              платформы SkillSoft. Вы узнаете, как создать свой первый тест и
              начать оценку компетенций.
            </p>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium dark:bg-violet-900/30 dark:text-violet-300">
                <ClockIcon className="h-3.5 w-3.5" />
                10 мин
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300">
                <UserIcon className="h-3.5 w-3.5" />
                HR Админ
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium dark:bg-emerald-900/30 dark:text-emerald-300">
                <ZapIcon className="h-3.5 w-3.5" />
                Начинающий
              </span>
            </div>
          </section>

          {/* Prerequisites Section */}
          <section id="prerequisites" className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <ListChecksIcon className="w-5 h-5 text-muted-foreground" />
              Что вам понадобится
            </h2>

            <div className="space-y-3">
              {/* Required items */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
                <CheckCircle2Icon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Учетная запись HR-администратора
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Обратитесь к администратору системы для получения доступа
                  </p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                  Обязательно
                </span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
                <CheckCircle2Icon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Доступ к панели управления
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Вход через веб-интерфейс по ссылке от администратора
                  </p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                  Обязательно
                </span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
                <CircleIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Понимание оцениваемых компетенций
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Список навыков, которые вы хотите измерить
                  </p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Желательно
                </span>
              </div>
            </div>
          </section>

          {/* First Steps Section */}
          <section id="first-steps" className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
              <RocketIcon className="w-5 h-5 text-muted-foreground" />
              Первые шаги
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Начните с знакомства с интерфейсом платформы
            </p>

            <StepTimeline steps={firstSteps} />
          </section>

          {/* Create Test Section */}
          <section id="create-test" className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
              <TargetIcon className="w-5 h-5 text-muted-foreground" />
              Создание первого теста
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              После знакомства с платформой создайте свой первый тест
            </p>

            <StepTimeline steps={createTestSteps} />

            {/* Tip callout */}
            <div className="mt-6">
              <Callout type="tip" title="Совет">
                <p>
                  Используйте режим Test-Drive для предварительного просмотра
                  теста перед запуском для сотрудников. Это поможет убедиться,
                  что все настроено правильно.
                </p>
              </Callout>
            </div>
          </section>

          {/* Next Steps Section */}
          <section id="next-steps" className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <ArrowRightIcon className="w-5 h-5 text-muted-foreground" />
              Следующие шаги
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Теперь вы готовы к более глубокому изучению платформы
            </p>

            <div className="space-y-3">
              {nextStepsLinks.map((link) => {
                const colors =
                  colorClasses[link.color as keyof typeof colorClasses];
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border hover:bg-muted/50 active:scale-[0.99] transition-all min-h-[72px]"
                  >
                    <div
                      className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${colors.bg}`}
                    >
                      <link.icon className={`h-5 w-5 ${colors.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">
                        {link.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {link.description}
                      </p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>

            {/* Additional resources */}
            <div className="mt-6 p-4 rounded-xl border bg-muted/30">
              <div className="flex items-start gap-3">
                <BookOpenIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Нужна помощь?
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Посетите раздел{" "}
                    <Link
                      href="/docs/glossary"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      Глоссарий
                    </Link>{" "}
                    для понимания терминологии или{" "}
                    <a
                      href="mailto:support@skillsoft.ru"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      свяжитесь с поддержкой
                    </a>
                    .
                  </p>
                </div>
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
