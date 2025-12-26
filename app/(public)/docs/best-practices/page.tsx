import { Metadata } from "next";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { Callout } from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Лучшие практики | Документация | SkillSoft",
  description:
    "Рекомендации по эффективному использованию платформы SkillSoft",
};

const tocItems = [
  { id: "test-design", title: "Дизайн тестов", level: 2 },
  { id: "content-quality", title: "Качество контента", level: 2 },
  { id: "deployment", title: "Запуск тестирования", level: 2 },
  { id: "results-analysis", title: "Анализ результатов", level: 2 },
  { id: "common-mistakes", title: "Частые ошибки", level: 2 },
];

export default function BestPracticesPage() {
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
          Лучшие практики
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Рекомендации по эффективному использованию платформы SkillSoft для
          оценки soft skills.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="test-design">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Дизайн тестов
          </h2>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Определите цель тестирования
              </h4>
              <p className="text-sm text-muted-foreground">
                Выберите подходящий тип теста: Overview для общего профиля, Job
                Fit для оценки соответствия должности, Team Fit для командной
                совместимости.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Ограничьте количество компетенций
              </h4>
              <p className="text-sm text-muted-foreground">
                Оптимально оценивать 5-8 компетенций за один тест. Больше -
                утомляет респондентов, меньше - может не дать полной картины.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Сбалансируйте длительность
              </h4>
              <p className="text-sm text-muted-foreground">
                Рекомендуемая длительность теста: 20-40 минут. Более длинные
                тесты снижают качество ответов из-за усталости.
              </p>
            </div>
          </div>

          <Callout type="tip" title="Совет">
            <p>
              Используйте режим Test-Drive перед запуском теста для сотрудников.
              Это позволяет увидеть тест глазами респондента и проверить
              психометрические показатели.
            </p>
          </Callout>
        </section>

        <section id="content-quality">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Качество контента
          </h2>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Используйте понятный язык
              </h4>
              <p className="text-sm text-muted-foreground">
                Избегайте профессионального жаргона и сложных конструкций.
                Вопросы должны быть понятны сотрудникам любого уровня.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Избегайте социально желательных ответов
              </h4>
              <p className="text-sm text-muted-foreground">
                Формулируйте вопросы так, чтобы "правильный" ответ не был
                очевиден. Используйте ситуационные вопросы вместо прямых.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Проверяйте психометрику
              </h4>
              <p className="text-sm text-muted-foreground">
                Регулярно проверяйте показатели вопросов в разделе
                Психометрика. Улучшайте или заменяйте проблемные вопросы.
              </p>
            </div>
          </div>

          <Callout type="info" title="Пилотное тестирование">
            <p>
              Перед масштабным запуском проведите пилот на небольшой группе
              (20-50 человек) для сбора начальных психометрических данных.
            </p>
          </Callout>
        </section>

        <section id="deployment">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Запуск тестирования
          </h2>

          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              Заранее информируйте сотрудников о цели и формате тестирования
            </li>
            <li>
              Обеспечьте комфортные условия: тихое место, достаточно времени
            </li>
            <li>
              Объясните, что результаты используются для развития, а не для
              наказания
            </li>
            <li>Установите разумные сроки прохождения (3-7 дней)</li>
            <li>Отправляйте напоминания тем, кто не прошел тест</li>
          </ul>

          <Callout type="warning" title="Важно">
            <p>
              Не запускайте тестирование в стрессовые периоды (конец квартала,
              реорганизация). Это негативно влияет на качество ответов.
            </p>
          </Callout>
        </section>

        <section id="results-analysis">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Анализ результатов
          </h2>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Смотрите на профиль, а не отдельные баллы
              </h4>
              <p className="text-sm text-muted-foreground">
                Комбинация компетенций важнее абсолютных значений. Ищите паттерны
                сильных и слабых сторон.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Учитывайте контекст
              </h4>
              <p className="text-sm text-muted-foreground">
                Результаты могут зависеть от текущей роли и опыта сотрудника.
                Сравнивайте с релевантной группой.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Используйте для развития
              </h4>
              <p className="text-sm text-muted-foreground">
                Главная ценность оценки - в планировании развития. Обсуждайте
                результаты с сотрудниками и создавайте планы развития.
              </p>
            </div>
          </div>
        </section>

        <section id="common-mistakes">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Частые ошибки
          </h2>

          <div className="space-y-3">
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/30">
              <p className="font-medium text-red-700 dark:text-red-400 mb-1">
                Слишком длинные тесты
              </p>
              <p className="text-sm text-muted-foreground">
                Тесты более 60 минут приводят к снижению внимания и качества
                ответов.
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/30">
              <p className="font-medium text-red-700 dark:text-red-400 mb-1">
                Игнорирование психометрики
              </p>
              <p className="text-sm text-muted-foreground">
                Использование вопросов с плохой дискриминацией искажает
                результаты.
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/30">
              <p className="font-medium text-red-700 dark:text-red-400 mb-1">
                Отсутствие обратной связи
              </p>
              <p className="text-sm text-muted-foreground">
                Сотрудники должны получать результаты и понимать, как их
                использовать для развития.
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/30">
              <p className="font-medium text-red-700 dark:text-red-400 mb-1">
                Использование для наказания
              </p>
              <p className="text-sm text-muted-foreground">
                Если результаты используются против сотрудников, они начнут
                отвечать социально желательно.
              </p>
            </div>
          </div>
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
