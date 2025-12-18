import { Metadata } from "next";

import { DocsBreadcrumb } from "../../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../../_components/DocsFooterNav";
import { DocsToc } from "../../_components/DocsToc";
import { Callout, Steps, Step } from "../../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Компетенции | Создание контента | Документация | SkillSoft",
  description: "Руководство по созданию и настройке компетенций",
};

const tocItems = [
  { id: "what-is", title: "Что такое компетенция", level: 2 },
  { id: "structure", title: "Структура компетенции", level: 2 },
  { id: "creating", title: "Создание компетенции", level: 2 },
  { id: "standards", title: "Международные стандарты", level: 2 },
  { id: "best-practices", title: "Рекомендации", level: 2 },
];

export default function CompetenciesPage() {
  return (
    <div className="docs-content">
      <DocsBreadcrumb />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Компетенции
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Компетенция - это измеримый навык или способность, которую можно
          наблюдать, оценивать и развивать.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        <section id="what-is">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Что такое компетенция
          </h2>
          <p className="text-muted-foreground mb-4">
            Компетенция представляет собой макро-уровень в иерархии оценки.
            Примеры компетенций: коммуникация, лидерство, критическое мышление,
            эмоциональный интеллект.
          </p>

          <Callout type="info" title="Ключевые характеристики">
            <ul className="list-disc list-inside space-y-1">
              <li>Наблюдаемость - можно увидеть проявление в поведении</li>
              <li>Измеримость - можно оценить уровень владения</li>
              <li>Развиваемость - можно улучшить через обучение</li>
              <li>Связь с результатами - влияет на эффективность работы</li>
            </ul>
          </Callout>
        </section>

        <section id="structure">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Структура компетенции
          </h2>
          <p className="text-muted-foreground mb-4">
            Каждая компетенция содержит следующие поля:
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Название (обязательно)
              </h4>
              <p className="text-sm text-muted-foreground">
                Уникальное название компетенции. Должно быть кратким и
                понятным.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Описание (обязательно)
              </h4>
              <p className="text-sm text-muted-foreground">
                Развернутое описание компетенции: что включает, как
                проявляется, почему важна. 50-1000 символов.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">Категория</h4>
              <p className="text-sm text-muted-foreground">
                Группировка компетенций: личностные, межличностные,
                когнитивные, лидерские и др.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Коды стандартов
              </h4>
              <p className="text-sm text-muted-foreground">
                Привязка к международным стандартам: ESCO, O*NET, Big Five.
              </p>
            </div>
          </div>
        </section>

        <section id="creating">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Создание компетенции
          </h2>

          <Steps>
            <Step title="Перейдите в раздел компетенций">
              <p>
                Откройте раздел HR &gt; Компетенции в боковом меню и нажмите
                кнопку "Создать компетенцию".
              </p>
            </Step>

            <Step title="Заполните основные поля">
              <p>
                Укажите название и описание компетенции. Выберите категорию из
                списка.
              </p>
            </Step>

            <Step title="Добавьте коды стандартов">
              <p>
                Используйте Skill Mapper для поиска соответствующих кодов ESCO
                и O*NET.
              </p>
            </Step>

            <Step title="Создайте индикаторы">
              <p>
                Добавьте 3-8 поведенческих индикаторов, распределив веса так,
                чтобы их сумма равнялась 1.0.
              </p>
            </Step>

            <Step title="Отправьте на проверку">
              <p>
                Новые компетенции создаются в статусе DRAFT. Отправьте на
                проверку для активации.
              </p>
            </Step>
          </Steps>
        </section>

        <section id="standards">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Международные стандарты
          </h2>
          <p className="text-muted-foreground mb-4">
            SkillSoft поддерживает интеграцию с международными системами
            классификации навыков:
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <p className="font-medium text-foreground">ESCO</p>
              <p className="text-sm text-muted-foreground">
                Европейская классификация навыков, компетенций и профессий
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="font-medium text-foreground">O*NET</p>
              <p className="text-sm text-muted-foreground">
                Американская система информации о профессиях
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="font-medium text-foreground">Big Five</p>
              <p className="text-sm text-muted-foreground">
                Пятифакторная модель личности для проекции результатов
              </p>
            </div>
          </div>
        </section>

        <section id="best-practices">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Рекомендации
          </h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Используйте глаголы действия в описании</li>
            <li>Избегайте слишком широких или слишком узких формулировок</li>
            <li>Проверяйте уникальность названия в системе</li>
            <li>Связывайте компетенцию минимум с одним стандартом</li>
            <li>Распределяйте веса индикаторов равномерно, если нет явных приоритетов</li>
          </ul>

          <Callout type="warning" title="Ограничения">
            <p>
              Компетенция должна содержать от 3 до 8 индикаторов. Если нужно
              больше - рассмотрите разделение на несколько компетенций.
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
