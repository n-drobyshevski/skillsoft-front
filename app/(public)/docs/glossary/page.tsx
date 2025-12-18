import { Metadata } from "next";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Глоссарий | Документация | SkillSoft",
  description: "Определения терминов, используемых в платформе SkillSoft",
};

const tocItems = [
  { id: "domain-terms", title: "Термины предметной области", level: 2 },
  { id: "psychometric-terms", title: "Психометрические термины", level: 2 },
  { id: "technical-terms", title: "Технические термины", level: 2 },
];

const domainTerms = [
  {
    term: "Компетенция (Competency)",
    definition:
      "Измеримый навык или способность, которую можно наблюдать и развивать. Примеры: коммуникация, лидерство, критическое мышление.",
  },
  {
    term: "Поведенческий индикатор (Behavioral Indicator)",
    definition:
      "Конкретное, наблюдаемое поведение, демонстрирующее уровень владения компетенцией. Например: 'Адаптирует стиль общения к аудитории'.",
  },
  {
    term: "Оценочный вопрос (Assessment Question)",
    definition:
      "Инструмент измерения для оценки поведенческих индикаторов. Может быть разных типов: шкала Лайкерта, ситуационные суждения, множественный выбор.",
  },
  {
    term: "Шаблон теста (Test Template)",
    definition:
      "Предварительно настроенная конфигурация теста с выбранными компетенциями, параметрами и целями оценки.",
  },
  {
    term: "Blueprint",
    definition:
      "План распределения вопросов по компетенциям и индикаторам в тесте. Определяет структуру и охват теста.",
  },
];

const psychometricTerms = [
  {
    term: "Индекс сложности (Difficulty Index, p-value)",
    definition:
      "Показатель того, насколько сложным является вопрос. Рассчитывается как доля правильных ответов. Оптимальное значение: 0.2-0.9.",
  },
  {
    term: "Индекс дискриминации (Discrimination Index, rpb)",
    definition:
      "Показатель способности вопроса различать респондентов с высоким и низким уровнем компетенции. Хорошее значение: >= 0.25.",
  },
  {
    term: "Альфа Кронбаха (Cronbach's Alpha)",
    definition:
      "Мера внутренней согласованности теста. Показывает, насколько согласованно вопросы измеряют одну и ту же конструкцию. Хорошее значение: >= 0.7.",
  },
  {
    term: "Валидность (Validity)",
    definition:
      "Степень, в которой тест измеряет то, что он должен измерять. Включает содержательную, критериальную и конструктную валидность.",
  },
  {
    term: "Надежность (Reliability)",
    definition:
      "Согласованность и воспроизводимость результатов теста при повторных измерениях.",
  },
];

const technicalTerms = [
  {
    term: "Job Fit",
    definition:
      "Цель теста, направленная на оценку соответствия кандидата требованиям должности. Включает сравнение профиля с эталонным.",
  },
  {
    term: "Team Fit",
    definition:
      "Цель теста для оценки совместимости сотрудника с существующей командой на основе дополняющих компетенций.",
  },
  {
    term: "Overview",
    definition:
      "Цель теста для создания общего профиля компетенций без сравнения с эталоном. Используется для паспорта компетенций.",
  },
  {
    term: "Test-Drive Mode",
    definition:
      "Режим предварительного просмотра теста для HR-администраторов с отображением психометрических данных и технической информации.",
  },
  {
    term: "Lens",
    definition:
      "Контекст просмотра интерфейса, определяющий доступные функции в зависимости от роли пользователя (HR, Admin, Employee).",
  },
];

export default function GlossaryPage() {
  return (
    <div className="docs-content">
      <DocsBreadcrumb />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Глоссарий
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Определения терминов, используемых в платформе SkillSoft и
          документации.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="domain-terms">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Термины предметной области
          </h2>
          <dl className="space-y-4">
            {domainTerms.map((item) => (
              <div key={item.term} className="border-b pb-4 last:border-0">
                <dt className="font-semibold text-foreground mb-1">
                  {item.term}
                </dt>
                <dd className="text-muted-foreground text-sm">
                  {item.definition}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="psychometric-terms">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Психометрические термины
          </h2>
          <dl className="space-y-4">
            {psychometricTerms.map((item) => (
              <div key={item.term} className="border-b pb-4 last:border-0">
                <dt className="font-semibold text-foreground mb-1">
                  {item.term}
                </dt>
                <dd className="text-muted-foreground text-sm">
                  {item.definition}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="technical-terms">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Технические термины
          </h2>
          <dl className="space-y-4">
            {technicalTerms.map((item) => (
              <div key={item.term} className="border-b pb-4 last:border-0">
                <dt className="font-semibold text-foreground mb-1">
                  {item.term}
                </dt>
                <dd className="text-muted-foreground text-sm">
                  {item.definition}
                </dd>
              </div>
            ))}
          </dl>
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
