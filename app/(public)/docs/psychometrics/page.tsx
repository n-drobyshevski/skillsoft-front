import { Metadata } from "next";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { Callout } from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Психометрика | Документация | SkillSoft",
  description:
    "Психометрические показатели и валидация качества вопросов в SkillSoft",
};

const tocItems = [
  { id: "overview", title: "Обзор", level: 2 },
  { id: "difficulty", title: "Индекс сложности", level: 2 },
  { id: "discrimination", title: "Индекс дискриминации", level: 2 },
  { id: "reliability", title: "Надежность теста", level: 2 },
  { id: "validity-status", title: "Статусы валидности", level: 2 },
];

export default function PsychometricsPage() {
  return (
    <div className="docs-content">
      <DocsBreadcrumb />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Психометрика
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Система психометрической валидации обеспечивает научную обоснованность
          и качество оценочных инструментов.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="overview">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Обзор
          </h2>
          <p className="text-muted-foreground mb-4">
            Психометрика - это наука об измерении психологических
            характеристик. В SkillSoft используется трехфазная архитектура
            валидации:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </span>
              <div>
                <p className="font-medium text-foreground">Content Gate</p>
                <p className="text-sm text-muted-foreground">
                  Фильтрация вопросов при сборке теста
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </span>
              <div>
                <p className="font-medium text-foreground">Audit</p>
                <p className="text-sm text-muted-foreground">
                  Расчет психометрических метрик
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </span>
              <div>
                <p className="font-medium text-foreground">Feedback Loop</p>
                <p className="text-sm text-muted-foreground">
                  Автоматическое исключение проблемных вопросов
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="difficulty">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Индекс сложности (p-value)
          </h2>
          <p className="text-muted-foreground mb-4">
            Показывает, какая доля респондентов правильно отвечает на вопрос.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-semibold">Значение</th>
                  <th className="py-2 text-left font-semibold">Интерпретация</th>
                  <th className="py-2 text-left font-semibold">Статус</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2">p &lt; 0.2</td>
                  <td className="py-2">Слишком сложный</td>
                  <td className="py-2">
                    <span className="rounded bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Требует пересмотра
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">0.2 - 0.9</td>
                  <td className="py-2">Оптимальный</td>
                  <td className="py-2">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Хороший
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">p &gt; 0.9</td>
                  <td className="py-2">Слишком легкий</td>
                  <td className="py-2">
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Требует пересмотра
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="discrimination">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Индекс дискриминации (rpb)
          </h2>
          <p className="text-muted-foreground mb-4">
            Показывает, насколько хорошо вопрос различает респондентов с высоким
            и низким уровнем компетенции.
          </p>

          <Callout type="info" title="Формула">
            <p>
              Используется точечно-бисериальная корреляция между ответом на
              вопрос и общим баллом по тесту.
            </p>
          </Callout>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-semibold">Значение rpb</th>
                  <th className="py-2 text-left font-semibold">Качество</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2">rpb &lt; 0</td>
                  <td className="py-2">
                    Токсичный (автоматически исключается)
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">0 - 0.1</td>
                  <td className="py-2">Плохой</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">0.1 - 0.25</td>
                  <td className="py-2">Требует улучшения</td>
                </tr>
                <tr>
                  <td className="py-2">rpb &gt;= 0.25</td>
                  <td className="py-2">Хороший</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="reliability">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Надежность теста
          </h2>
          <p className="text-muted-foreground mb-4">
            Альфа Кронбаха измеряет внутреннюю согласованность теста.
          </p>

          <Callout type="tip" title="Хорошие значения">
            <ul className="list-disc list-inside space-y-1">
              <li>Alpha &gt;= 0.9 - Отличная надежность</li>
              <li>Alpha 0.7 - 0.9 - Хорошая надежность</li>
              <li>Alpha 0.6 - 0.7 - Приемлемая надежность</li>
              <li>Alpha &lt; 0.6 - Низкая надежность</li>
            </ul>
          </Callout>
        </section>

        <section id="validity-status">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Статусы валидности вопросов
          </h2>
          <p className="text-muted-foreground mb-4">
            Каждый вопрос имеет статус валидности, определяющий его пригодность
            для тестирования:
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <span className="font-semibold text-foreground">PENDING</span>
              <p className="text-sm text-muted-foreground mt-1">
                Менее 50 ответов. Ожидает накопления данных.
              </p>
            </div>

            <div className="rounded-lg border p-3 border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                VALID
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Соответствует всем критериям качества.
              </p>
            </div>

            <div className="rounded-lg border p-3 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                NEEDS_REVIEW
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Пограничные метрики. Требует ручной проверки.
              </p>
            </div>

            <div className="rounded-lg border p-3 border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30">
              <span className="font-semibold text-red-700 dark:text-red-400">
                FLAGGED
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Критические проблемы с качеством.
              </p>
            </div>

            <div className="rounded-lg border p-3 border-slate-300 bg-slate-100/50 dark:border-slate-700 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                RETIRED
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Исключен из сборки тестов.
              </p>
            </div>
          </div>
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
