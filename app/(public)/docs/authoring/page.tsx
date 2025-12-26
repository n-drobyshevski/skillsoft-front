import { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, LayersIcon, TargetIcon, HelpCircleIcon } from "lucide-react";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { Callout, HierarchyDiagram } from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Создание контента | Документация | SkillSoft",
  description: "Руководство по созданию компетенций, индикаторов и вопросов",
};

const tocItems = [
  { id: "overview", title: "Обзор", level: 2 },
  { id: "hierarchy", title: "Иерархия контента", level: 2 },
  { id: "content-types", title: "Типы контента", level: 2 },
  { id: "workflow", title: "Рабочий процесс", level: 2 },
];

const contentTypes = [
  {
    title: "Компетенции",
    description: "Измеримые навыки и способности на макро-уровне",
    href: "/docs/authoring/competencies",
    icon: LayersIcon,
  },
  {
    title: "Индикаторы",
    description: "Наблюдаемые поведения на мезо-уровне",
    href: "/docs/authoring/indicators",
    icon: TargetIcon,
  },
  {
    title: "Вопросы",
    description: "Инструменты измерения на микро-уровне",
    href: "/docs/authoring/questions",
    icon: HelpCircleIcon,
  },
];

export default function AuthoringPage() {
  return (
    <div className="docs-content">
      <DocsBreadcrumb />

      {/* Two-column layout: Content + Desktop TOC */}
      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
        {/* Main content column */}
        <div className="min-w-0">
          {/* Page Header */}
          <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Создание контента
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Узнайте, как создавать качественный контент для оценки: компетенции,
          поведенческие индикаторы и оценочные вопросы.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="overview">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Обзор
          </h2>
          <p className="text-muted-foreground mb-4">
            Качество оценки напрямую зависит от качества контента. Система
            SkillSoft использует трехуровневую модель контента, где каждый
            уровень служит определенной цели.
          </p>

          <Callout type="tip" title="Принцип создания">
            <p>
              Всегда начинайте с верхнего уровня (компетенции) и двигайтесь вниз.
              Это обеспечивает согласованность и полноту покрытия.
            </p>
          </Callout>
        </section>

        <section id="hierarchy">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Иерархия контента
          </h2>
          <p className="text-muted-foreground mb-4">
            Контент организован в строгую иерархию:
          </p>

          <HierarchyDiagram
            data={{
              label: "Компетенция",
              children: [
                {
                  label: "Индикатор 1",
                  children: [
                    { label: "Вопрос 1.1" },
                    { label: "Вопрос 1.2" },
                  ],
                },
                {
                  label: "Индикатор 2",
                  children: [
                    { label: "Вопрос 2.1" },
                    { label: "Вопрос 2.2" },
                  ],
                },
              ],
            }}
          />

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Компетенция</strong> содержит 3-8 поведенческих
              индикаторов
            </p>
            <p>
              <strong>Индикатор</strong> должен иметь минимум 2 оценочных
              вопроса
            </p>
            <p>
              <strong>Вопрос</strong> привязан к одному индикатору
            </p>
          </div>
        </section>

        <section id="content-types">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Типы контента
          </h2>
          <div className="grid gap-4 sm:grid-cols-1">
            {contentTypes.map((type) => (
              <Link
                key={type.href}
                href={type.href}
                className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <type.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {type.title}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {type.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="workflow">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Рабочий процесс
          </h2>
          <p className="text-muted-foreground mb-4">
            Рекомендуемый процесс создания контента:
          </p>

          <ol className="list-decimal list-inside text-muted-foreground space-y-2">
            <li>Определите компетенции, которые нужно оценить</li>
            <li>Для каждой компетенции создайте поведенческие индикаторы</li>
            <li>Для каждого индикатора разработайте вопросы</li>
            <li>Проверьте качество через психометрические показатели</li>
            <li>Итеративно улучшайте контент на основе данных</li>
          </ol>

          <Callout type="warning" title="Важно">
            <p>
              Новые вопросы имеют статус PENDING до накопления 50+ ответов.
              Планируйте пилотное тестирование для сбора начальных данных.
            </p>
          </Callout>
        </section>
      </div>

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
