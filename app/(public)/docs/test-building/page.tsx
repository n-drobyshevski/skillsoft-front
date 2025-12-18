import { Metadata } from "next";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { Callout, FlowDiagram } from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Сборка тестов | Документация | SkillSoft",
  description: "Как система собирает тесты из компетенций и вопросов",
};

const tocItems = [
  { id: "overview", title: "Обзор процесса", level: 2 },
  { id: "test-goals", title: "Цели тестирования", level: 2 },
  { id: "blueprint", title: "Blueprint теста", level: 2 },
  { id: "question-selection", title: "Выбор вопросов", level: 2 },
];

export default function TestBuildingPage() {
  return (
    <div className="docs-content">
      <DocsBreadcrumb />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Сборка тестов
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Узнайте, как система автоматически собирает тесты из компетенций,
          индикаторов и вопросов.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="overview">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Обзор процесса
          </h2>
          <p className="text-muted-foreground mb-4">
            Сборка теста происходит автоматически на основе выбранных компетенций
            и параметров. Система использует алгоритмы для оптимального подбора
            вопросов.
          </p>

          <FlowDiagram
            steps={["Выбор компетенций", "Генерация Blueprint", "Подбор вопросов", "Валидация"]}
          />
        </section>

        <section id="test-goals">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Цели тестирования
          </h2>
          <p className="text-muted-foreground mb-4">
            Система поддерживает три основные цели тестирования, каждая из
            которых влияет на алгоритм сборки:
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Overview (Обзор компетенций)
              </h4>
              <p className="text-sm text-muted-foreground">
                Создает общий профиль компетенций сотрудника. Равномерно
                распределяет вопросы по всем выбранным компетенциям без
                сравнения с эталоном.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Job Fit (Соответствие должности)
              </h4>
              <p className="text-sm text-muted-foreground">
                Оценивает соответствие кандидата требованиям должности.
                Акцентирует вопросы на критичных для должности компетенциях.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Team Fit (Совместимость с командой)
              </h4>
              <p className="text-sm text-muted-foreground">
                Оценивает, как сотрудник дополнит существующую команду.
                Фокусируется на компетенциях, которые усилят командную динамику.
              </p>
            </div>
          </div>
        </section>

        <section id="blueprint">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Blueprint теста
          </h2>
          <p className="text-muted-foreground mb-4">
            Blueprint определяет структуру теста: сколько вопросов будет по
            каждой компетенции и индикатору.
          </p>

          <Callout type="info" title="Автоматический расчет">
            <p>
              Система автоматически рассчитывает оптимальное распределение
              вопросов на основе весов компетенций и доступных вопросов в базе.
            </p>
          </Callout>
        </section>

        <section id="question-selection">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Выбор вопросов
          </h2>
          <p className="text-muted-foreground mb-4">
            При выборе вопросов система учитывает:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Психометрическое качество вопроса</li>
            <li>Разнообразие типов вопросов</li>
            <li>Отсутствие повторов для респондента</li>
            <li>Баланс сложности</li>
          </ul>

          <Callout type="warning" title="Важно">
            <p>
              Вопросы с низким индексом дискриминации или статусом FLAGGED не
              включаются в тесты автоматически.
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
