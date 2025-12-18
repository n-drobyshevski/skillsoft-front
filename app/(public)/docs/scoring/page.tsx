import { Metadata } from "next";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { Callout, Diagram } from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Система оценивания | Документация | SkillSoft",
  description: "Как рассчитываются баллы и результаты в SkillSoft",
};

const tocItems = [
  { id: "overview", title: "Обзор системы", level: 2 },
  { id: "question-scoring", title: "Оценка вопросов", level: 2 },
  { id: "aggregation", title: "Агрегация баллов", level: 2 },
  { id: "normalization", title: "Нормализация", level: 2 },
];

export default function ScoringPage() {
  return (
    <div className="docs-content">
      <DocsBreadcrumb />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Система оценивания
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Подробное описание алгоритмов расчета баллов и формирования результатов
          тестирования.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="overview">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Обзор системы
          </h2>
          <p className="text-muted-foreground mb-4">
            Система оценивания SkillSoft использует многоуровневую агрегацию
            баллов: от отдельных ответов до общего профиля компетенций.
          </p>

          <Diagram title="Иерархия агрегации баллов">
{`
  Ответ на вопрос
        |
        v
  Балл индикатора  (среднее по вопросам)
        |
        v
  Балл компетенции (взвешенное среднее)
        |
        v
  Общий профиль    (все компетенции)
`}
          </Diagram>
        </section>

        <section id="question-scoring">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Оценка вопросов
          </h2>
          <p className="text-muted-foreground mb-4">
            Каждый тип вопроса имеет свою схему оценивания:
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Шкала Лайкерта (Likert Scale)
              </h4>
              <p className="text-sm text-muted-foreground">
                Оценивается по 5-балльной шкале. Балл равен выбранному значению
                (1-5). Некоторые вопросы имеют инвертированную шкалу.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Ситуационные суждения (SJT)
              </h4>
              <p className="text-sm text-muted-foreground">
                Каждый вариант ответа имеет свой вес. Выбор оптимального варианта
                дает максимальный балл, субоптимальные варианты - частичный.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Множественный выбор (MCQ)
              </h4>
              <p className="text-sm text-muted-foreground">
                Правильный ответ = 1 балл, неправильный = 0 баллов. Может
                поддерживать частичное оценивание для вопросов с несколькими
                правильными ответами.
              </p>
            </div>
          </div>
        </section>

        <section id="aggregation">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Агрегация баллов
          </h2>
          <p className="text-muted-foreground mb-4">
            Баллы агрегируются снизу вверх по иерархии:
          </p>

          <Callout type="info" title="Формула расчета">
            <p>
              <strong>Балл индикатора</strong> = Среднее арифметическое баллов
              всех вопросов индикатора
            </p>
            <p className="mt-2">
              <strong>Балл компетенции</strong> = Сумма (Балл индикатора * Вес
              индикатора) для всех индикаторов компетенции
            </p>
          </Callout>

          <p className="text-muted-foreground mt-4">
            Веса индикаторов настраиваются при создании компетенции и должны в
            сумме давать 1.0.
          </p>
        </section>

        <section id="normalization">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Нормализация
          </h2>
          <p className="text-muted-foreground mb-4">
            Для сравнимости результатов все баллы нормализуются в диапазон 0-100:
          </p>

          <Diagram title="Формула нормализации">
{`
  Нормализованный балл = (Сырой балл - Min) / (Max - Min) * 100

  Где:
  - Сырой балл: исходное значение
  - Min: минимально возможный балл
  - Max: максимально возможный балл
`}
          </Diagram>

          <Callout type="tip" title="Интерпретация">
            <ul className="list-disc list-inside space-y-1">
              <li>0-40: Низкий уровень компетенции</li>
              <li>41-60: Средний уровень</li>
              <li>61-80: Хороший уровень</li>
              <li>81-100: Отличный уровень</li>
            </ul>
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
