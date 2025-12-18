import { Metadata } from "next";

import { DocsBreadcrumb } from "../../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../../_components/DocsFooterNav";
import { DocsToc } from "../../_components/DocsToc";
import { Callout, Steps, Step } from "../../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Вопросы | Создание контента | Документация | SkillSoft",
  description: "Руководство по созданию оценочных вопросов разных типов",
};

const tocItems = [
  { id: "overview", title: "Обзор", level: 2 },
  { id: "question-types", title: "Типы вопросов", level: 2 },
  { id: "likert", title: "Шкала Лайкерта", level: 3 },
  { id: "sjt", title: "Ситуационные суждения", level: 3 },
  { id: "mcq", title: "Множественный выбор", level: 3 },
  { id: "creating", title: "Создание вопроса", level: 2 },
  { id: "quality", title: "Качество вопросов", level: 2 },
];

export default function QuestionsPage() {
  return (
    <div className="docs-content">
      <DocsBreadcrumb />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Оценочные вопросы
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Оценочный вопрос - это инструмент измерения для оценки поведенческих
          индикаторов. Качество вопросов напрямую влияет на точность оценки.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="overview">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Обзор
          </h2>
          <p className="text-muted-foreground mb-4">
            Вопросы представляют микро-уровень в иерархии оценки. Каждый вопрос
            привязан к одному поведенческому индикатору и измеряет его
            проявление.
          </p>

          <Callout type="info" title="Рекомендуемое распределение">
            <ul className="list-disc list-inside space-y-1">
              <li>70% - вопросы по шкале Лайкерта</li>
              <li>25% - ситуационные суждения (SJT)</li>
              <li>5% - множественный выбор (MCQ)</li>
            </ul>
          </Callout>
        </section>

        <section id="question-types">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Типы вопросов
          </h2>
        </section>

        <section id="likert">
          <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
            Шкала Лайкерта
          </h3>
          <p className="text-muted-foreground mb-4">
            Респондент оценивает согласие с утверждением по 5-балльной шкале.
          </p>

          <div className="rounded-lg border p-4 bg-muted/30">
            <p className="text-sm text-foreground mb-3 italic">
              "Я легко нахожу общий язык с новыми коллегами"
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-background px-2 py-1 border">
                1 - Полностью не согласен
              </span>
              <span className="rounded bg-background px-2 py-1 border">
                2 - Не согласен
              </span>
              <span className="rounded bg-background px-2 py-1 border">
                3 - Нейтрально
              </span>
              <span className="rounded bg-background px-2 py-1 border">
                4 - Согласен
              </span>
              <span className="rounded bg-background px-2 py-1 border">
                5 - Полностью согласен
              </span>
            </div>
          </div>

          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-4">
            <li>Время на ответ: ~30 секунд</li>
            <li>Поддерживает инвертированную шкалу</li>
            <li>Лучше всего для самооценки поведения</li>
          </ul>
        </section>

        <section id="sjt">
          <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
            Ситуационные суждения (SJT)
          </h3>
          <p className="text-muted-foreground mb-4">
            Респондент выбирает наиболее подходящий вариант действия в
            описанной ситуации.
          </p>

          <div className="rounded-lg border p-4 bg-muted/30">
            <p className="text-sm text-foreground mb-3 italic">
              "Коллега просит помочь с задачей, но у вас есть срочный дедлайн.
              Что вы сделаете?"
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="shrink-0 font-mono text-xs bg-background rounded px-1.5 py-0.5 border">
                  A
                </span>
                <span className="text-muted-foreground">
                  Откажу, сославшись на дедлайн
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 font-mono text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 border border-primary/20">
                  B
                </span>
                <span className="text-muted-foreground">
                  Предложу помочь после завершения своей задачи
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 font-mono text-xs bg-background rounded px-1.5 py-0.5 border">
                  C
                </span>
                <span className="text-muted-foreground">
                  Сразу соглашусь помочь
                </span>
              </div>
            </div>
          </div>

          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-4">
            <li>Время на ответ: ~180 секунд</li>
            <li>Каждый вариант имеет свой вес</li>
            <li>Лучше всего для оценки принятия решений</li>
          </ul>
        </section>

        <section id="mcq">
          <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
            Множественный выбор (MCQ)
          </h3>
          <p className="text-muted-foreground mb-4">
            Респондент выбирает один или несколько правильных ответов.
          </p>

          <div className="rounded-lg border p-4 bg-muted/30">
            <p className="text-sm text-foreground mb-3 italic">
              "Какие из следующих действий демонстрируют активное слушание?"
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border bg-background" />
                <span>Перебивать, чтобы уточнить</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border bg-primary/10 border-primary/30" />
                <span>Поддерживать зрительный контакт</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border bg-primary/10 border-primary/30" />
                <span>Задавать уточняющие вопросы</span>
              </div>
            </div>
          </div>

          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-4">
            <li>Время на ответ: ~60 секунд</li>
            <li>Поддерживает частичное оценивание</li>
            <li>Лучше всего для проверки знаний</li>
          </ul>
        </section>

        <section id="creating">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Создание вопроса
          </h2>

          <Steps>
            <Step title="Выберите индикатор">
              <p>
                Откройте индикатор, к которому нужно добавить вопрос. Убедитесь,
                что понимаете, какое поведение он измеряет.
              </p>
            </Step>

            <Step title="Выберите тип вопроса">
              <p>
                Определите наиболее подходящий тип: Лайкерт для самооценки, SJT
                для решений, MCQ для знаний.
              </p>
            </Step>

            <Step title="Сформулируйте вопрос">
              <p>
                Напишите четкий, однозначный текст вопроса. Избегайте двойных
                отрицаний и сложных конструкций.
              </p>
            </Step>

            <Step title="Добавьте варианты ответов">
              <p>
                Для SJT и MCQ укажите варианты ответов и их веса/правильность.
              </p>
            </Step>

            <Step title="Проверьте качество">
              <p>
                После накопления 50+ ответов проверьте психометрические
                показатели и при необходимости улучшите вопрос.
              </p>
            </Step>
          </Steps>
        </section>

        <section id="quality">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Качество вопросов
          </h2>
          <p className="text-muted-foreground mb-4">
            Качественный вопрос должен соответствовать критериям:
          </p>

          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              <strong>Релевантность</strong> - измеряет именно целевой индикатор
            </li>
            <li>
              <strong>Ясность</strong> - однозначно понимается респондентами
            </li>
            <li>
              <strong>Дискриминация</strong> - различает уровни компетенции
              (rpb &gt;= 0.25)
            </li>
            <li>
              <strong>Сложность</strong> - не слишком легкий и не слишком
              сложный (p 0.2-0.9)
            </li>
          </ul>

          <Callout type="warning" title="Автоматическое исключение">
            <p>
              Вопросы с отрицательным индексом дискриминации (rpb &lt; 0)
              автоматически исключаются из тестов и получают статус RETIRED.
            </p>
          </Callout>

          <Callout type="tip" title="Test-Drive Mode">
            <p>
              Используйте режим Test-Drive для просмотра психометрических
              показателей вопроса в реальном времени.
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
