import { Metadata } from "next";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { Callout, Steps, Step } from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Быстрый старт | Документация | SkillSoft",
  description: "Начните работу с платформой SkillSoft за несколько минут",
};

const tocItems = [
  { id: "introduction", title: "Введение", level: 2 },
  { id: "first-steps", title: "Первые шаги", level: 2 },
  { id: "create-test", title: "Создание первого теста", level: 2 },
  { id: "next-steps", title: "Следующие шаги", level: 2 },
];

export default function GettingStartedPage() {
  return (
    <div className="docs-content">
      <DocsBreadcrumb />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Быстрый старт
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Начните работу с платформой SkillSoft за несколько минут. Это
          руководство проведет вас через основные шаги настройки.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="introduction">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Введение
          </h2>
          <p className="text-muted-foreground mb-4">
            SkillSoft - это платформа для оценки soft skills сотрудников. Она
            позволяет создавать тесты на основе компетенций, проводить
            тестирование и анализировать результаты.
          </p>

          <Callout type="info" title="Что вам понадобится">
            <ul className="list-disc list-inside space-y-1">
              <li>Учетная запись HR-администратора</li>
              <li>Доступ к панели управления</li>
              <li>Понимание компетенций, которые вы хотите оценить</li>
            </ul>
          </Callout>
        </section>

        <section id="first-steps">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Первые шаги
          </h2>

          <Steps>
            <Step title="Войдите в систему">
              <p>
                Используйте свои учетные данные для входа в панель
                администратора. После входа вы увидите главный дашборд с
                основными метриками.
              </p>
            </Step>

            <Step title="Изучите структуру">
              <p>
                Познакомьтесь с основными разделами: компетенции, индикаторы,
                вопросы и шаблоны тестов. Каждый раздел доступен из бокового
                меню.
              </p>
            </Step>

            <Step title="Проверьте существующий контент">
              <p>
                Просмотрите библиотеку компетенций и вопросов. Возможно, нужные
                вам элементы уже созданы другими администраторами.
              </p>
            </Step>
          </Steps>
        </section>

        <section id="create-test">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Создание первого теста
          </h2>
          <p className="text-muted-foreground mb-4">
            После знакомства с платформой вы можете создать свой первый тест:
          </p>

          <Steps>
            <Step title="Выберите цель теста">
              <p>
                Определите, что вы хотите оценить: общий профиль компетенций
                (Overview), соответствие должности (Job Fit) или совместимость с
                командой (Team Fit).
              </p>
            </Step>

            <Step title="Выберите компетенции">
              <p>
                Добавьте нужные компетенции в blueprint теста. Система
                автоматически подберет подходящие вопросы.
              </p>
            </Step>

            <Step title="Настройте параметры">
              <p>
                Укажите количество вопросов, ограничение по времени и другие
                параметры тестирования.
              </p>
            </Step>

            <Step title="Запустите тест">
              <p>
                Пригласите сотрудников пройти тестирование и отслеживайте
                результаты в реальном времени.
              </p>
            </Step>
          </Steps>

          <Callout type="tip" title="Совет">
            <p>
              Используйте режим Test-Drive для предварительного просмотра теста
              перед запуском для сотрудников.
            </p>
          </Callout>
        </section>

        <section id="next-steps">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Следующие шаги
          </h2>
          <p className="text-muted-foreground mb-4">
            Теперь вы готовы к более глубокому изучению платформы:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              Изучите раздел <strong>Система оценивания</strong> для понимания
              алгоритмов расчета
            </li>
            <li>
              Прочитайте о <strong>Психометрике</strong> для обеспечения качества
              вопросов
            </li>
            <li>
              Ознакомьтесь с <strong>Лучшими практиками</strong> для создания
              эффективных тестов
            </li>
          </ul>
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
