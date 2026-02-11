'use cache';

import { Metadata } from "next";
import { cacheLife } from "next/cache";

import { DocsBreadcrumb } from "../../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../../_components/DocsFooterNav";
import { DocsToc } from "../../_components/DocsToc";
import { Callout, Steps, Step } from "../../_components/mdx";

export const metadata: Metadata = {
  title: "Индикаторы | Создание контента | Документация | SkillSoft",
  description: "Руководство по созданию поведенческих индикаторов",
};

const tocItems = [
  { id: "what-is", title: "Что такое индикатор", level: 2 },
  { id: "structure", title: "Структура индикатора", level: 2 },
  { id: "creating", title: "Создание индикатора", level: 2 },
  { id: "weights", title: "Распределение весов", level: 2 },
  { id: "examples", title: "Примеры хороших индикаторов", level: 2 },
];

export default async function IndicatorsPage() {
  cacheLife('max');

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
          Поведенческие индикаторы
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Поведенческий индикатор - это конкретное, наблюдаемое поведение,
          демонстрирующее уровень владения компетенцией.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="what-is">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Что такое индикатор
          </h2>
          <p className="text-muted-foreground mb-4">
            Индикатор представляет собой мезо-уровень в иерархии оценки. Он
            конкретизирует компетенцию до наблюдаемого поведения.
          </p>

          <Callout type="info" title="Пример">
            <p>
              <strong>Компетенция:</strong> Коммуникация
            </p>
            <p>
              <strong>Индикатор:</strong> Адаптирует стиль общения к
              особенностям аудитории
            </p>
          </Callout>
        </section>

        <section id="structure">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Структура индикатора
          </h2>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Название (обязательно)
              </h4>
              <p className="text-sm text-muted-foreground">
                Краткое описание наблюдаемого поведения. До 150 символов.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Описание (обязательно)
              </h4>
              <p className="text-sm text-muted-foreground">
                Детальное описание поведения и контекста его проявления. До 500
                символов.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">Вес</h4>
              <p className="text-sm text-muted-foreground">
                Вклад индикатора в оценку компетенции. Значение от 0.1 до 1.0.
                Сумма весов всех индикаторов компетенции должна равняться 1.0.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Примеры и контр-примеры
              </h4>
              <p className="text-sm text-muted-foreground">
                Конкретные примеры проявления и непроявления индикатора.
                Помогают при разработке вопросов.
              </p>
            </div>
          </div>
        </section>

        <section id="creating">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Создание индикатора
          </h2>

          <Steps>
            <Step title="Откройте компетенцию">
              <p>
                Перейдите на страницу компетенции, к которой нужно добавить
                индикатор.
              </p>
            </Step>

            <Step title="Добавьте индикатор">
              <p>
                В разделе управления индикаторами нажмите "Добавить индикатор".
              </p>
            </Step>

            <Step title="Заполните поля">
              <p>
                Укажите название, описание, примеры и контр-примеры
                поведения.
              </p>
            </Step>

            <Step title="Настройте вес">
              <p>
                Укажите вес индикатора. Система покажет предупреждение, если
                сумма весов не равна 1.0.
              </p>
            </Step>

            <Step title="Создайте вопросы">
              <p>
                После сохранения индикатора добавьте минимум 2 оценочных
                вопроса.
              </p>
            </Step>
          </Steps>
        </section>

        <section id="weights">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Распределение весов
          </h2>
          <p className="text-muted-foreground mb-4">
            Веса индикаторов определяют их вклад в итоговую оценку компетенции.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-semibold">Сценарий</th>
                  <th className="py-2 text-left font-semibold">
                    Рекомендация
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2">Равнозначные индикаторы</td>
                  <td className="py-2">Равные веса (1/N для N индикаторов)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Есть ключевой индикатор</td>
                  <td className="py-2">
                    Ключевой: 0.4-0.5, остальные: равномерно
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Разная важность</td>
                  <td className="py-2">Пропорционально важности</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Callout type="warning" title="Внимание">
            <p>
              Сумма весов всех индикаторов компетенции должна строго равняться
              1.0. При изменении одного веса пересмотрите остальные.
            </p>
          </Callout>
        </section>

        <section id="examples">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Примеры хороших индикаторов
          </h2>

          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
              <p className="font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                Хороший пример
              </p>
              <p className="text-sm text-foreground">
                &quot;Структурирует сложную информацию и представляет ее в понятной
                форме&quot;
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Конкретный, наблюдаемый, измеримый
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/30">
              <p className="font-medium text-red-700 dark:text-red-400 mb-2">
                Плохой пример
              </p>
              <p className="text-sm text-foreground">
                &quot;Хорошо общается с людьми&quot;
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Слишком общий, не наблюдаемый напрямую
              </p>
            </div>
          </div>

          <Callout type="tip" title="Совет">
            <p>
              Используйте глаголы действия: &quot;структурирует&quot;, &quot;адаптирует&quot;,
              &quot;инициирует&quot;, &quot;анализирует&quot;. Избегайте оценочных слов: &quot;хорошо&quot;,
              &quot;эффективно&quot;, &quot;качественно&quot;.
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
