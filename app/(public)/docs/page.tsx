import { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  RocketIcon,
  PencilIcon,
  LightbulbIcon,
  ArrowRightIcon,
} from "lucide-react";

import { DocsToc } from "./_components/DocsToc";
import { DocsFooterNav } from "./_components/DocsFooterNav";
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
  { id: "about", title: "О документации", level: 2 },
  { id: "quick-links", title: "Быстрые ссылки", level: 2 },
  { id: "getting-help", title: "Получение помощи", level: 2 },
];

const quickLinks = [
  {
    title: "Быстрый старт",
    description: "Начните работу с платформой за несколько минут",
    href: "/docs/getting-started",
    icon: RocketIcon,
  },
  {
    title: "Система оценивания",
    description: "Как рассчитываются баллы и результаты",
    href: "/docs/scoring",
    icon: BookOpenIcon,
  },
  {
    title: "Создание контента",
    description: "Создавайте компетенции, индикаторы и вопросы",
    href: "/docs/authoring",
    icon: PencilIcon,
  },
  {
    title: "Лучшие практики",
    description: "Рекомендации по эффективному использованию",
    href: "/docs/best-practices",
    icon: LightbulbIcon,
  },
];

export default function DocsPage() {
  return (
    <div className="docs-content">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Документация SkillSoft
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Добро пожаловать в документацию платформы оценки soft skills. Здесь вы
          найдете все необходимое для эффективной работы с системой.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="about">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            О документации
          </h2>
          <p className="text-muted-foreground mb-4">
            Эта документация предназначена для HR-администраторов и содержит
            подробную информацию о возможностях платформы, принципах работы
            системы оценки и рекомендации по созданию качественного контента.
          </p>

          <Callout type="info" title="Для кого эта документация?">
            <p>
              Документация ориентирована на HR-специалистов, которые создают и
              управляют тестами на платформе. Для сотрудников, проходящих
              тестирование, доступны подсказки непосредственно в интерфейсе
              прохождения теста.
            </p>
          </Callout>
        </section>

        <section id="quick-links">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Быстрые ссылки
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <link.icon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </span>
                  <ArrowRightIcon className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section id="getting-help">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Получение помощи
          </h2>
          <p className="text-muted-foreground mb-4">
            Если вы не нашли ответ на свой вопрос в документации, обратитесь к
            администратору системы или в службу поддержки.
          </p>

          <Callout type="tip" title="Совет">
            <p>
              Используйте поиск (Ctrl+K) для быстрого перехода к нужному разделу
              документации.
            </p>
          </Callout>
        </section>
      </div>

      {/* Footer Navigation */}
      <DocsFooterNav />

      {/* Table of Contents */}
      <aside className="hidden lg:block absolute right-8 top-6 w-56">
        <DocsToc items={tocItems} />
      </aside>
    </div>
  );
}
