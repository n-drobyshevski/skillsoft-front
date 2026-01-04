import { Metadata } from "next";
import {
  Zap,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  ChevronRight,
  ChevronDown,
  FileQuestion,
  Database,
  RefreshCw,
  Shield,
  TrendingUp,
  Eye,
  Filter,
  Gauge,
} from "lucide-react";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { MobileTocDrawer } from "../_components/MobileTocDrawer";
import {
  Callout,
  MermaidDiagram,
  MathBlock,
  InlineMath,
  ScrollableTable,
  ResponsiveDiagram,
} from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Психометрика | Документация | SkillSoft",
  description:
    "Полное руководство по психометрической валидации: расчет метрик качества, жизненный цикл вопросов и автоматическая обратная связь в SkillSoft",
};

const tocItems = [
  { id: "tldr", title: "TL;DR", level: 2 },
  { id: "overview", title: "Обзор системы", level: 2 },
  { id: "metrics", title: "Ключевые метрики", level: 2 },
  { id: "difficulty", title: "Индекс сложности (p-value)", level: 3 },
  { id: "discrimination", title: "Индекс дискриминации (rpb)", level: 3 },
  { id: "cronbach", title: "Альфа Кронбаха", level: 3 },
  { id: "lifecycle", title: "Жизненный цикл валидности", level: 2 },
  { id: "phase-content-gate", title: "Фаза 1: Content Gate", level: 2 },
  { id: "phase-audit", title: "Фаза 2: Audit", level: 2 },
  { id: "phase-feedback", title: "Фаза 3: Feedback Loop", level: 2 },
  { id: "big-five", title: "Big Five интеграция", level: 2 },
  { id: "api", title: "API эндпоинты", level: 2 },
  { id: "examples", title: "Примеры расчетов", level: 2 },
];

export default function PsychometricsPage() {
  return (
    <div className="docs-content">
      <DocsBreadcrumb />

      {/* Mobile TOC Drawer */}
      <MobileTocDrawer items={tocItems} />

      {/* Two-column layout: Content + Desktop TOC */}
      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
        {/* Main content column */}
        <div className="min-w-0">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2 sm:mb-3">
          Психометрика
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          Полное руководство по психометрической валидации качества вопросов,
          расчету статистических метрик и автоматической обратной связи в SkillSoft.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        {/* ===== TL;DR Section ===== */}
        <section id="tldr">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            TL;DR - Краткая справка
          </h2>

          {/* Core Principle */}
          <div className="rounded-xl border bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 sm:p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-100 text-sm sm:text-base">Главный принцип</h3>
                <p className="text-xs sm:text-sm text-neutral-400">Трехфазная архитектура обеспечивает научную валидность тестов</p>
              </div>
            </div>

            {/* Flow Diagram - Vertical on mobile, horizontal on desktop */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
              <div className="px-3 py-2 sm:py-1.5 rounded-lg bg-blue-900/50 border border-blue-700 text-blue-300 flex items-center gap-1.5 w-full sm:w-auto justify-center">
                <Filter className="w-3.5 h-3.5" />
                <span>Content Gate</span>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-500 sm:hidden" />
              <ChevronRight className="w-4 h-4 text-neutral-500 hidden sm:block" />
              <div className="px-3 py-2 sm:py-1.5 rounded-lg bg-amber-900/50 border border-amber-700 text-amber-300 flex items-center gap-1.5 w-full sm:w-auto justify-center">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Audit</span>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-500 sm:hidden" />
              <ChevronRight className="w-4 h-4 text-neutral-500 hidden sm:block" />
              <div className="px-3 py-2 sm:py-1.5 rounded-lg bg-purple-900/50 border border-purple-700 text-purple-300 flex items-center gap-1.5 w-full sm:w-auto justify-center">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Feedback Loop</span>
              </div>
            </div>
          </div>

          {/* Three Columns: Metrics, Statuses, Thresholds */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Column 1: Key Metrics */}
            <div className="rounded-xl border bg-neutral-900/50 p-4">
              <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Ключевые метрики</span>
              </h4>
              <div className="space-y-3">
                <div className="p-2 rounded-lg bg-neutral-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-neutral-200">p-value</span>
                  </div>
                  <div className="text-xs text-neutral-500">Индекс сложности: <span className="text-emerald-400">0.2-0.9</span></div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-neutral-200">rpb</span>
                  </div>
                  <div className="text-xs text-neutral-500">Дискриминация: <span className="text-emerald-400">&ge;0.3</span> для ACTIVE</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-neutral-200">Alpha</span>
                  </div>
                  <div className="text-xs text-neutral-500">Надежность: <span className="text-emerald-400">&ge;0.7</span> RELIABLE</div>
                </div>
              </div>
            </div>

            {/* Column 2: Status Lifecycle */}
            <div className="rounded-xl border bg-neutral-900/50 p-4">
              <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Жизненный цикл</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-900/20 border border-amber-900/50">
                  <span className="text-sm font-medium text-amber-400">PROBATION</span>
                  <span className="text-xs text-neutral-500">&lt;50 ответов</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-900/20 border border-emerald-900/50">
                  <span className="text-sm font-medium text-emerald-400">ACTIVE</span>
                  <span className="text-xs text-neutral-500">rpb&ge;0.3</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-orange-900/20 border border-orange-900/50">
                  <span className="text-sm font-medium text-orange-400">FLAGGED</span>
                  <span className="text-xs text-neutral-500">требует проверки</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-red-900/20 border border-red-900/50">
                  <span className="text-sm font-medium text-red-400">RETIRED</span>
                  <span className="text-xs text-neutral-500">rpb&lt;0</span>
                </div>
              </div>
            </div>

            {/* Column 3: Key Thresholds */}
            <div className="rounded-xl border bg-neutral-900/50 p-4">
              <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>Пороговые значения</span>
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-neutral-500 mb-1">Сложность (p):</div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-red-900/50 text-red-400">&lt;0.2</span>
                    <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400">0.2-0.9</span>
                    <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-400">&gt;0.9</span>
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1">Дискриминация (rpb):</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded bg-red-900/50 text-red-400">&lt;0</span>
                    <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-400">0-0.25</span>
                    <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400">&ge;0.3</span>
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1">Надежность (alpha):</div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-red-900/50 text-red-400">&lt;0.6</span>
                    <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-400">0.6-0.7</span>
                    <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400">&ge;0.7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimum Requirements */}
          <div className="rounded-xl border bg-neutral-900/50 p-4 mb-6">
            <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm sm:text-base">Минимальные требования</span>
            </h4>
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3 justify-center">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-blue-900/30 border border-blue-800 text-center sm:text-left">
                <span className="text-[10px] sm:text-xs text-neutral-400">Ответов:</span>
                <span className="font-mono font-bold text-blue-400 text-sm sm:text-base">&ge;50</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-purple-900/30 border border-purple-800 text-center sm:text-left">
                <span className="text-[10px] sm:text-xs text-neutral-400">Для alpha:</span>
                <span className="font-mono font-bold text-purple-400 text-sm sm:text-base">&ge;2</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-amber-900/30 border border-amber-800 text-center sm:text-left">
                <span className="text-[10px] sm:text-xs text-neutral-400">Точность:</span>
                <span className="font-mono font-bold text-amber-400 text-sm sm:text-base">4 зн.</span>
              </div>
            </div>
          </div>

          <Callout type="tip" title="Подробнее">
            <p>
              Ниже представлена полная документация с формулами, примерами расчета и
              визуализациями для каждой метрики и фазы психометрического анализа.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 1: System Overview ===== */}
        <section id="overview">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Обзор системы
          </h2>
          <p className="text-muted-foreground mb-4">
            Система психометрической валидации SkillSoft обеспечивает научную
            обоснованность оценочных инструментов через непрерывный анализ качества
            вопросов, отслеживание статистических показателей и автоматическую
            обратную связь.
          </p>

          <ResponsiveDiagram
            title="Трехфазная архитектура психометрической валидации"
            caption="Нажмите для увеличения"
            maxHeight={350}
          >
            <MermaidDiagram
              chart={`
flowchart TB
    subgraph phase1["ФАЗА 1: CONTENT GATE"]
        A["Сборка теста"]
        B["Фильтрация вопросов"]
        C["Приоритет ACTIVE"]
    end

    subgraph phase2["ФАЗА 2: AUDIT"]
        D["Сбор ответов"]
        E["Расчет метрик"]
        F["p-value, rpb, alpha"]
    end

    subgraph phase3["ФАЗА 3: FEEDBACK LOOP"]
        G["Анализ метрик"]
        H["Обновление статусов"]
        I["Авто-retire токсичных"]
    end

    phase1 --> phase2 --> phase3
    phase3 -.->|"Улучшение качества"| phase1

    style phase1 fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    style phase2 fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style phase3 fill:#581c87,stroke:#a855f7,color:#f3e8ff
`}
            />
          </ResponsiveDiagram>

          <Callout type="info" title="Ключевой принцип">
            <p>
              Все вопросы проходят через <strong>испытательный период (PROBATION)</strong> до
              накопления 50 ответов. После этого система автоматически рассчитывает метрики
              и определяет статус валидности.
            </p>
          </Callout>

          {/* Phase Summary Cards */}
          <div className="space-y-4 mt-6">
            <div className="rounded-lg border p-4 bg-blue-900/10 border-blue-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Content Gate</h4>
                  <p className="text-xs text-muted-foreground">Фильтрация при сборке теста</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Валидатор <code className="text-xs bg-muted px-1.5 py-0.5 rounded">PsychometricBlueprintValidator</code> приоритизирует
                ACTIVE вопросы, допускает PROBATION при необходимости, исключает RETIRED.
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-amber-900/10 border-amber-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Audit</h4>
                  <p className="text-xs text-muted-foreground">Расчет психометрических метрик</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Инкрементальные обновления при каждом ответе + ручной триггер полного пересчета.
                Рассчитывается p-value, rpb, Cronbach's alpha.
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-purple-900/10 border-purple-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Feedback Loop</h4>
                  <p className="text-xs text-muted-foreground">Автоматическая обратная связь</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Токсичные вопросы (rpb &lt; 0) автоматически переводятся в RETIRED.
                Пограничные метрики помечаются для ручной проверки.
              </p>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2: Key Metrics ===== */}
        <section id="metrics">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Ключевые метрики
          </h2>
          <p className="text-muted-foreground mb-4">
            SkillSoft использует три основные психометрические метрики для оценки
            качества вопросов и надежности тестов.
          </p>

          {/* Metrics Comparison Table */}
          <ScrollableTable className="my-6">
            <table className="w-full border-collapse text-sm min-w-[480px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 sm:p-3 font-semibold whitespace-nowrap">Метрика</th>
                  <th className="text-left p-2 sm:p-3 font-semibold">Назначение</th>
                  <th className="text-left p-2 sm:p-3 font-semibold whitespace-nowrap">Оптимум</th>
                  <th className="text-left p-2 sm:p-3 font-semibold">Уровень</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">p-value</td>
                  <td className="p-2 sm:p-3 text-muted-foreground">Сложность вопроса</td>
                  <td className="p-2 sm:p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">0.2 - 0.9</code>
                  </td>
                  <td className="p-2 sm:p-3 text-muted-foreground whitespace-nowrap">Вопрос</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">rpb</td>
                  <td className="p-2 sm:p-3 text-muted-foreground">Различающая способность</td>
                  <td className="p-2 sm:p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&ge; 0.30</code>
                  </td>
                  <td className="p-2 sm:p-3 text-muted-foreground whitespace-nowrap">Вопрос</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">Cronbach&apos;s α</td>
                  <td className="p-2 sm:p-3 text-muted-foreground">Внутренняя согласованность</td>
                  <td className="p-2 sm:p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&ge; 0.70</code>
                  </td>
                  <td className="p-2 sm:p-3 text-muted-foreground whitespace-nowrap">Компетенция</td>
                </tr>
              </tbody>
            </table>
          </ScrollableTable>

          {/* Difficulty Index */}
          <div id="difficulty" className="mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              Индекс сложности (Difficulty Index - p-value)
            </h3>
            <p className="text-muted-foreground mb-4">
              Показывает долю респондентов, правильно ответивших на вопрос.
              Для Likert-вопросов используется модифицированная формула.
            </p>

            {/* p-value Formulas */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <div className="text-xs text-neutral-500 mb-3">Для MCQ/SJT вопросов:</div>
              <MathBlock
                tex="p = \frac{\sum \text{correct\_responses}}{\sum \text{total\_responses}}"
                label="Формула p-value: сумма правильных ответов деленная на общее количество ответов"
                variant="blue"
                className="mb-4 mt-0"
              />
              <div className="text-xs text-neutral-500 mb-3">Для Likert вопросов:</div>
              <MathBlock
                tex="p = \frac{\sum \text{selected\_values}}{\text{max\_value} \times \text{total\_responses}}"
                label="Формула p-value для Likert: сумма выбранных значений деленная на максимум умноженный на количество ответов"
                variant="purple"
                className="mb-0 mt-0"
              />
            </div>

            {/* p-value Thresholds Table */}
            <ScrollableTable className="rounded-lg border bg-neutral-900 p-3 sm:p-4 my-4">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400 whitespace-nowrap">Значение p</th>
                    <th className="text-left p-2 text-neutral-400">Интерпретация</th>
                    <th className="text-left p-2 text-neutral-400">Статус</th>
                    <th className="text-right p-2 text-neutral-400 whitespace-nowrap">Флаг</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">p &lt; 0.2</td>
                    <td className="p-2 text-neutral-400">Слишком сложный</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded bg-red-900/50 text-red-400 text-xs whitespace-nowrap">
                        Требует пересмотра
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono text-red-400 whitespace-nowrap">TOO_HARD</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">0.2 &le; p &le; 0.9</td>
                    <td className="p-2 text-neutral-400">Оптимальный диапазон</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 text-xs whitespace-nowrap">
                        Хороший
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono text-emerald-400 whitespace-nowrap">OPTIMAL</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono whitespace-nowrap">p &gt; 0.9</td>
                    <td className="p-2 text-neutral-400">Слишком легкий</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded bg-amber-900/50 text-amber-400 text-xs whitespace-nowrap">
                        Требует пересмотра
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono text-amber-400 whitespace-nowrap">TOO_EASY</td>
                  </tr>
                </tbody>
              </table>
            </ScrollableTable>

            {/* Visual Scale */}
            <div className="rounded-lg border p-4 mb-4">
              <div className="text-sm text-muted-foreground mb-3">Шкала сложности:</div>
              <div className="relative h-8 rounded-full overflow-hidden bg-neutral-800">
                <div className="absolute inset-y-0 left-0 w-[20%] bg-red-500/30 flex items-center justify-center">
                  <span className="text-xs text-red-400 font-medium">Сложный</span>
                </div>
                <div className="absolute inset-y-0 left-[20%] w-[70%] bg-emerald-500/30 flex items-center justify-center">
                  <span className="text-xs text-emerald-400 font-medium">Оптимально</span>
                </div>
                <div className="absolute inset-y-0 right-0 w-[10%] bg-amber-500/30 flex items-center justify-center">
                  <span className="text-xs text-amber-400 font-medium">Легкий</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0.0</span>
                <span>0.2</span>
                <span>0.9</span>
                <span>1.0</span>
              </div>
            </div>
          </div>

          {/* Discrimination Index */}
          <div id="discrimination" className="mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              Индекс дискриминации (Discrimination Index - rpb)
            </h3>
            <p className="text-muted-foreground mb-4">
              Показывает, насколько хорошо вопрос различает респондентов с высоким
              и низким уровнем компетенции. Используется точечно-бисериальная корреляция.
            </p>

            {/* rpb Formula */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <MathBlock
                tex="r_{pb} = \frac{M_1 - M_0}{s} \times \sqrt{p \times q}"
                label="Формула точечно-бисериальной корреляции: разница средних делится на стандартное отклонение и умножается на корень из произведения долей"
                variant="emerald"
                className="mb-4 mt-0"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2 rounded bg-neutral-800">
                  <div className="text-neutral-500 mb-1">M<sub>1</sub></div>
                  <div className="text-neutral-300">Среднее ответивших верно</div>
                </div>
                <div className="p-2 rounded bg-neutral-800">
                  <div className="text-neutral-500 mb-1">M<sub>0</sub></div>
                  <div className="text-neutral-300">Среднее ответивших неверно</div>
                </div>
                <div className="p-2 rounded bg-neutral-800">
                  <div className="text-neutral-500 mb-1">s</div>
                  <div className="text-neutral-300">Станд. отклонение всех баллов</div>
                </div>
                <div className="p-2 rounded bg-neutral-800">
                  <div className="text-neutral-500 mb-1">p, q</div>
                  <div className="text-neutral-300">Доли верных и неверных ответов</div>
                </div>
              </div>
            </div>

            {/* rpb Thresholds Table */}
            <ScrollableTable className="rounded-lg border bg-neutral-900 p-3 sm:p-4 my-4">
              <table className="w-full text-sm min-w-[460px]">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400 whitespace-nowrap">Значение rpb</th>
                    <th className="text-left p-2 text-neutral-400">Качество</th>
                    <th className="text-left p-2 text-neutral-400">Действие</th>
                    <th className="text-right p-2 text-neutral-400 whitespace-nowrap">Флаг</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">rpb &lt; 0</td>
                    <td className="p-2 text-red-400">Токсичный</td>
                    <td className="p-2 text-neutral-400 whitespace-nowrap">Автоматический retire</td>
                    <td className="p-2 text-right font-mono text-red-400 whitespace-nowrap">NEGATIVE</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">0 &le; rpb &lt; 0.1</td>
                    <td className="p-2 text-red-400">Критический</td>
                    <td className="p-2 text-neutral-400 whitespace-nowrap">Требует переработки</td>
                    <td className="p-2 text-right font-mono text-red-400 whitespace-nowrap">CRITICAL</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">0.1 &le; rpb &lt; 0.2</td>
                    <td className="p-2 text-amber-400">Низкий</td>
                    <td className="p-2 text-neutral-400 whitespace-nowrap">Требует улучшения</td>
                    <td className="p-2 text-right font-mono text-amber-400 whitespace-nowrap">WARNING</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">0.2 &le; rpb &lt; 0.25</td>
                    <td className="p-2 text-amber-400">Приемлемый</td>
                    <td className="p-2 text-neutral-400">Мониторинг</td>
                    <td className="p-2 text-right font-mono text-amber-400 whitespace-nowrap">WARNING</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">0.25 &le; rpb &lt; 0.3</td>
                    <td className="p-2 text-lime-400">Хороший</td>
                    <td className="p-2 text-neutral-400">Допустимо</td>
                    <td className="p-2 text-right font-mono text-lime-400 whitespace-nowrap">GOOD</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono whitespace-nowrap">rpb &ge; 0.3</td>
                    <td className="p-2 text-emerald-400">Отличный</td>
                    <td className="p-2 text-neutral-400 whitespace-nowrap">ACTIVE статус</td>
                    <td className="p-2 text-right font-mono text-emerald-400 whitespace-nowrap">EXCELLENT</td>
                  </tr>
                </tbody>
              </table>
            </ScrollableTable>

            <Callout type="warning" title="Отрицательная дискриминация">
              <p>
                Вопросы с <InlineMath>{"rpb < 0"}</InlineMath> считаются &quot;токсичными&quot; - на них
                лучше отвечают менее компетентные респонденты. Такие вопросы
                автоматически переводятся в статус RETIRED и исключаются из сборки тестов.
              </p>
            </Callout>
          </div>

          {/* Cronbach's Alpha */}
          <div id="cronbach" className="mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              Альфа Кронбаха (Cronbach&apos;s Alpha)
            </h3>
            <p className="text-muted-foreground mb-4">
              Измеряет внутреннюю согласованность теста - насколько хорошо вопросы
              измеряют один и тот же конструкт (компетенцию).
            </p>

            {/* Alpha Formula */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <MathBlock
                tex="\alpha = \frac{k}{k-1} \times \left(1 - \frac{\sum_{i=1}^{k} \sigma_i^2}{\sigma_t^2}\right)"
                label="Формула Альфы Кронбаха: k делится на k-1 и умножается на 1 минус отношение суммы дисперсий вопросов к общей дисперсии"
                variant="purple"
                className="mb-4 mt-0"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs">
                <div className="p-2 rounded bg-neutral-800">
                  <div className="text-neutral-500 mb-1">k</div>
                  <div className="text-neutral-300">Количество вопросов</div>
                </div>
                <div className="p-2 rounded bg-neutral-800">
                  <div className="text-neutral-500 mb-1"><InlineMath>{"\\sigma_i^2"}</InlineMath></div>
                  <div className="text-neutral-300">Дисперсия i-го вопроса</div>
                </div>
                <div className="p-2 rounded bg-neutral-800">
                  <div className="text-neutral-500 mb-1"><InlineMath>{"\\sigma_t^2"}</InlineMath></div>
                  <div className="text-neutral-300">Общая дисперсия теста</div>
                </div>
              </div>
            </div>

            {/* Alpha Interpretation */}
            <ScrollableTable className="rounded-lg border bg-neutral-900 p-3 sm:p-4 my-4">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400 whitespace-nowrap">Значение alpha</th>
                    <th className="text-left p-2 text-neutral-400">Интерпретация</th>
                    <th className="text-right p-2 text-neutral-400">Статус</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">alpha &ge; 0.9</td>
                    <td className="p-2 text-emerald-400 whitespace-nowrap">Превосходная надежность</td>
                    <td className="p-2 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 text-xs whitespace-nowrap">RELIABLE</span>
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">0.7 &le; alpha &lt; 0.9</td>
                    <td className="p-2 text-emerald-400 whitespace-nowrap">Хорошая надежность</td>
                    <td className="p-2 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 text-xs whitespace-nowrap">RELIABLE</span>
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono whitespace-nowrap">0.6 &le; alpha &lt; 0.7</td>
                    <td className="p-2 text-amber-400 whitespace-nowrap">Приемлемая надежность</td>
                    <td className="p-2 text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-900/50 text-amber-400 text-xs whitespace-nowrap">ACCEPTABLE</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono whitespace-nowrap">alpha &lt; 0.6</td>
                    <td className="p-2 text-red-400 whitespace-nowrap">Низкая надежность</td>
                    <td className="p-2 text-right">
                      <span className="px-2 py-0.5 rounded bg-red-900/50 text-red-400 text-xs whitespace-nowrap">UNRELIABLE</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </ScrollableTable>

            <Callout type="info" title="Alpha-If-Deleted анализ">
              <p>
                Для каждого вопроса рассчитывается &quot;Alpha-If-Deleted&quot; - значение
                альфы, которое получится при удалении этого вопроса. Если удаление
                вопроса значительно повышает alpha, вопрос может ухудшать согласованность
                теста и требует пересмотра.
              </p>
            </Callout>

            {/* Minimum Requirements */}
            <div className="rounded-lg border p-4 my-4">
              <h4 className="font-medium mb-2">Минимальные требования для расчета alpha:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  Минимум <strong>50 ответов</strong> для надежной оценки
                </li>
                <li>
                  Минимум <strong>2 вопроса</strong> в компетенции
                </li>
                <li>
                  Расчет на уровне <strong>компетенции</strong> и <strong>Big Five черты</strong>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ===== SECTION 3: Validity Lifecycle ===== */}
        <section id="lifecycle">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Жизненный цикл валидности
          </h2>
          <p className="text-muted-foreground mb-4">
            Каждый вопрос проходит через определенные стадии валидации на основе
            накопленных данных и рассчитанных метрик.
          </p>

          <ResponsiveDiagram
            title="Машина состояний валидности вопроса"
            caption="Используйте жесты для масштабирования"
            maxHeight={380}
          >
            <MermaidDiagram
              chart={`
flowchart TD
    START(("Создание")) --> PROBATION["PROBATION<br/>Испытательный период"]

    PROBATION -->|"50+ ответов, rpb≥0.3"| ACTIVE["ACTIVE<br/>Валидный"]
    PROBATION -->|"50+ ответов, проблемы"| FLAGGED["FLAGGED_FOR_REVIEW<br/>На проверке"]
    PROBATION -->|"rpb < 0"| RETIRED["RETIRED<br/>Выведен"]

    ACTIVE -->|"Ухудшение метрик"| FLAGGED
    ACTIVE -->|"rpb < 0"| RETIRED

    FLAGGED -->|"После исправления"| ACTIVE
    FLAGGED -->|"Подтверждение проблемы"| RETIRED

    style PROBATION fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style ACTIVE fill:#14532d,stroke:#22c55e,color:#dcfce7
    style FLAGGED fill:#7c2d12,stroke:#f97316,color:#ffedd5
    style RETIRED fill:#7f1d1d,stroke:#ef4444,color:#fecaca
`}
            />
          </ResponsiveDiagram>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* PROBATION */}
            <div className="rounded-xl border bg-amber-900/10 border-amber-800/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-400">PROBATION</h4>
                  <p className="text-xs text-neutral-400">Испытательный период</p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Менее 50 ответов
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Ожидает накопления данных
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Допускается в тесты при нехватке ACTIVE
                </li>
              </ul>
            </div>

            {/* ACTIVE */}
            <div className="rounded-xl border bg-emerald-900/10 border-emerald-800/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-400">ACTIVE</h4>
                  <p className="text-xs text-neutral-400">Активный</p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  rpb &ge; 0.3 (EXCELLENT)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  p-value в диапазоне 0.2-0.9
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Приоритет при сборке тестов
                </li>
              </ul>
            </div>

            {/* FLAGGED_FOR_REVIEW */}
            <div className="rounded-xl border bg-orange-900/10 border-orange-800/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-400">FLAGGED_FOR_REVIEW</h4>
                  <p className="text-xs text-neutral-400">Требует проверки</p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  rpb &lt; 0.1 или экстремальный p-value
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Маргинальные метрики
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Требует ручной проверки
                </li>
              </ul>
            </div>

            {/* RETIRED */}
            <div className="rounded-xl border bg-red-900/10 border-red-800/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-400">RETIRED</h4>
                  <p className="text-xs text-neutral-400">Выведен из использования</p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  rpb &lt; 0 (токсичный) - автоматически
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Исключен из сборки тестов
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Данные сохраняются для анализа
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ===== SECTION 4: Phase 1 - Content Gate ===== */}
        <section id="phase-content-gate">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Фаза 1: Content Gate (Контроль качества при сборке)
          </h2>
          <p className="text-muted-foreground mb-4">
            При сборке теста система фильтрует вопросы на основе их психометрического
            статуса, обеспечивая качество оценочного инструмента.
          </p>

          <ResponsiveDiagram
            title="Алгоритм выбора вопросов для теста"
            caption="Используйте жесты для масштабирования"
            maxHeight={350}
          >
            <MermaidDiagram
              chart={`
flowchart TB
    A["Запрос вопросов<br/>для компетенции"] --> B{"Достаточно<br/>ACTIVE вопросов?"}

    B -->|Да| C["Использовать<br/>ACTIVE вопросы"]
    B -->|Нет| D["Добавить<br/>PROBATION вопросы"]

    C --> E["Исключить<br/>RETIRED вопросы"]
    D --> E

    E --> F["Случайный выбор<br/>из отфильтрованных"]
    F --> G["Сформированный набор"]

    style A fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    style C fill:#14532d,stroke:#22c55e,color:#dcfce7
    style D fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style E fill:#7f1d1d,stroke:#ef4444,color:#fecaca
    style G fill:#14532d,stroke:#22c55e,color:#dcfce7
`}
            />
          </ResponsiveDiagram>

          <div className="rounded-lg border p-4 my-4">
            <h4 className="font-medium mb-3">Приоритеты при выборе вопросов:</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded bg-emerald-900/20 border border-emerald-800/50">
                <span className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">1</span>
                <div className="flex-1">
                  <span className="font-medium text-emerald-400">ACTIVE вопросы</span>
                  <p className="text-xs text-neutral-400">Высший приоритет, валидированные вопросы</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded bg-amber-900/20 border border-amber-800/50">
                <span className="w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">2</span>
                <div className="flex-1">
                  <span className="font-medium text-amber-400">PROBATION вопросы</span>
                  <p className="text-xs text-neutral-400">Допускаются при нехватке ACTIVE</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded bg-red-900/20 border border-red-800/50">
                <span className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">X</span>
                <div className="flex-1">
                  <span className="font-medium text-red-400">RETIRED вопросы</span>
                  <p className="text-xs text-neutral-400">Всегда исключаются из сборки</p>
                </div>
              </div>
            </div>
          </div>

          <Callout type="note" title="PsychometricBlueprintValidator">
            <p>
              Валидатор <code className="text-xs bg-muted px-1.5 py-0.5 rounded">PsychometricBlueprintValidator</code> проверяет
              blueprint теста и обеспечивает соблюдение правил выбора вопросов. При недостаточном
              количестве качественных вопросов генерируется предупреждение.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 5: Phase 2 - Audit ===== */}
        <section id="phase-audit">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Фаза 2: Audit (Психометрический аудит)
          </h2>
          <p className="text-muted-foreground mb-4">
            Система расчета психометрических метрик работает в двух режимах:
            инкрементальное обновление при каждом ответе и полный пересчет по триггеру.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Incremental Updates */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium">Инкрементальные обновления</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Триггер: каждый новый ответ
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Время: ~10ms на вопрос
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Обновляет: p-value, базовый rpb
                </li>
              </ul>
            </div>

            {/* Manual Trigger */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium">Ручной триггер</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  POST /api/v1/psychometrics/audit/trigger
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Время: ~50ms на вопрос, ~200ms alpha
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Полный пересчет всех метрик
                </li>
              </ul>
            </div>
          </div>

          {/* Calculation Workflow */}
          <ResponsiveDiagram
            title="Рабочий процесс расчета метрик"
            caption="Используйте жесты для масштабирования"
            maxHeight={320}
          >
            <MermaidDiagram
              chart={`
flowchart LR
    A["Новый ответ"] --> B["Обновление<br/>p-value"]
    B --> C["Обновление<br/>rpb"]
    C --> D{"response_count<br/>>= 50?"}

    D -->|Нет| E["Сохранение<br/>PROBATION"]
    D -->|Да| F["Расчет<br/>alpha"]

    F --> G["Определение<br/>статуса"]
    G --> H["Обновление<br/>ItemStatistics"]

    style A fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    style B fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style C fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style F fill:#581c87,stroke:#a855f7,color:#f3e8ff
    style H fill:#14532d,stroke:#22c55e,color:#dcfce7
`}
            />
          </ResponsiveDiagram>

          <Callout type="info" title="Производительность">
            <p>
              Система оптимизирована для высокой производительности: инкрементальные обновления
              занимают ~10ms, полный расчет по вопросу ~50ms, расчет Cronbach&apos;s alpha ~200ms.
              Данные хранятся в BigDecimal с точностью до 4 знаков.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 6: Phase 3 - Feedback Loop ===== */}
        <section id="phase-feedback">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Фаза 3: Feedback Loop (Автоматическая обратная связь)
          </h2>
          <p className="text-muted-foreground mb-4">
            Система автоматически реагирует на результаты психометрического анализа,
            обновляя статусы вопросов и формируя очередь для ручной проверки.
          </p>

          <div className="space-y-4">
            {/* Auto-Retire Rule */}
            <div className="rounded-lg border bg-red-900/10 border-red-800/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <h4 className="font-medium text-red-400">Автоматический retire (токсичные вопросы)</h4>
              </div>
              <div className="flex items-center gap-4 p-3 rounded bg-neutral-900/50">
                <div className="text-center">
                  <div className="text-xs text-neutral-500 mb-1">Условие</div>
                  <div className="font-mono text-red-400">rpb &lt; 0</div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
                <div className="text-center">
                  <div className="text-xs text-neutral-500 mb-1">Действие</div>
                  <div className="text-red-400">Автоматический RETIRED</div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
                <div className="text-center">
                  <div className="text-xs text-neutral-500 mb-1">Результат</div>
                  <div className="text-neutral-400">Исключение из тестов</div>
                </div>
              </div>
            </div>

            {/* Flagging Criteria */}
            <div className="rounded-lg border bg-orange-900/10 border-orange-800/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h4 className="font-medium text-orange-400">Критерии для пометки на проверку</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded bg-neutral-900/50">
                  <div className="text-xs text-neutral-500 mb-1">Низкая дискриминация</div>
                  <div className="font-mono text-orange-400">0 &le; rpb &lt; 0.1</div>
                </div>
                <div className="p-3 rounded bg-neutral-900/50">
                  <div className="text-xs text-neutral-500 mb-1">Экстремальная сложность</div>
                  <div className="font-mono text-orange-400">p &lt; 0.1 или p &gt; 0.95</div>
                </div>
                <div className="p-3 rounded bg-neutral-900/50">
                  <div className="text-xs text-neutral-500 mb-1">Низкая надежность</div>
                  <div className="font-mono text-orange-400">Alpha-If-Deleted &gt;&gt; alpha</div>
                </div>
                <div className="p-3 rounded bg-neutral-900/50">
                  <div className="text-xs text-neutral-500 mb-1">Ухудшение метрик</div>
                  <div className="font-mono text-orange-400">Переход из ACTIVE</div>
                </div>
              </div>
            </div>

            {/* Review Queue */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium">Очередь ручной проверки</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Помеченные вопросы попадают в очередь проверки, доступную через
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded mx-1">GET /api/v1/psychometrics/flagged</code>
              </p>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 rounded bg-blue-900/30 text-blue-400">Просмотр</span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
                <span className="px-2 py-1 rounded bg-purple-900/30 text-purple-400">Анализ</span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
                <span className="px-2 py-1 rounded bg-emerald-900/30 text-emerald-400">Решение</span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
                <span className="px-2 py-1 rounded bg-amber-900/30 text-amber-400">Обновление статуса</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 7: Big Five Integration ===== */}
        <section id="big-five">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Big Five интеграция
          </h2>
          <p className="text-muted-foreground mb-4">
            Система рассчитывает надежность на уровне Big Five черт личности,
            агрегируя данные из связанных компетенций.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
            {[
              { name: "Открытость", code: "O", color: "purple" },
              { name: "Добросовестность", code: "C", color: "blue" },
              { name: "Экстраверсия", code: "E", color: "amber" },
              { name: "Согласие", code: "A", color: "emerald" },
              { name: "Эмоц. стабильность", code: "N", color: "red" },
            ].map((trait) => (
              <div
                key={trait.code}
                className={`rounded-lg border p-3 text-center bg-${trait.color}-900/20 border-${trait.color}-800/50`}
              >
                <div className={`text-2xl font-bold text-${trait.color}-400 mb-1`}>{trait.code}</div>
                <div className="text-xs text-neutral-400">{trait.name}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-neutral-900 p-4 my-4">
            <h4 className="font-medium text-neutral-200 mb-3">Расчет надежности черты</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Для каждой черты Big Five рассчитывается Cronbach&apos;s alpha на основе
              вопросов из связанных компетенций. Связи определяются через O*NET element codes.
            </p>
            <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
              <div className="px-3 py-1.5 rounded-lg bg-purple-900/50 text-purple-300">
                Компетенции с O*NET кодом
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
              <div className="px-3 py-1.5 rounded-lg bg-blue-900/50 text-blue-300">
                Вопросы из индикаторов
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
              <div className="px-3 py-1.5 rounded-lg bg-emerald-900/50 text-emerald-300">
                BigFiveReliability
              </div>
            </div>
          </div>

          <Callout type="tip" title="O*NET маппинг">
            <p>
              Связи между компетенциями и Big Five чертами определяются через файл маппинга
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded mx-1">onet_to_bigfive_map.json</code>,
              который содержит веса корреляций (primary, secondary, tertiary).
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 8: API Endpoints ===== */}
        <section id="api">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            API эндпоинты
          </h2>
          <p className="text-muted-foreground mb-4">
            REST API для работы с психометрическими данными и управления качеством вопросов.
          </p>

          <div className="space-y-4">
            {/* Dashboard */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 text-xs font-mono">GET</span>
                <code className="text-sm text-neutral-200">/api/v1/psychometrics/dashboard</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Сводный отчет о состоянии психометрической системы: количество вопросов по статусам,
                средние метрики, проблемные области.
              </p>
            </div>

            {/* Items List */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 text-xs font-mono">GET</span>
                <code className="text-sm text-neutral-200">/api/v1/psychometrics/items</code>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Пагинированный список статистики по вопросам с фильтрацией.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-400">?status=ACTIVE</span>
                <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-400">?competencyId=uuid</span>
                <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-400">?minRpb=0.3</span>
              </div>
            </div>

            {/* Item Detail */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 text-xs font-mono">GET</span>
                <code className="text-sm text-neutral-200">/api/v1/psychometrics/items/{"{id}"}</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Детальная статистика по вопросу включая alpha-if-deleted и историю статусов.
              </p>
            </div>

            {/* Competencies */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 text-xs font-mono">GET</span>
                <code className="text-sm text-neutral-200">/api/v1/psychometrics/competencies</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Надежность компетенций (Cronbach&apos;s alpha на уровне компетенции).
              </p>
            </div>

            {/* Big Five */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 text-xs font-mono">GET</span>
                <code className="text-sm text-neutral-200">/api/v1/psychometrics/big-five</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Надежность Big Five черт личности.
              </p>
            </div>

            {/* Flagged Items */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 text-xs font-mono">GET</span>
                <code className="text-sm text-neutral-200">/api/v1/psychometrics/flagged</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Очередь вопросов, требующих ручной проверки (FLAGGED_FOR_REVIEW).
              </p>
            </div>

            {/* Audit Trigger */}
            <div className="rounded-lg border p-4 bg-amber-900/10 border-amber-800/50">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-400 text-xs font-mono">POST</span>
                <code className="text-sm text-neutral-200">/api/v1/psychometrics/audit/trigger</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Запуск полного пересчета всех психометрических метрик.
              </p>
            </div>

            {/* Update Status */}
            <div className="rounded-lg border p-4 bg-purple-900/10 border-purple-800/50">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-purple-900/50 text-purple-400 text-xs font-mono">PATCH</span>
                <code className="text-sm text-neutral-200">/api/v1/psychometrics/items/{"{id}"}/status</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Ручное обновление статуса вопроса (после проверки).
              </p>
            </div>
          </div>
        </section>

        {/* ===== SECTION 9: Calculation Examples ===== */}
        <section id="examples">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Примеры расчетов
          </h2>
          <p className="text-muted-foreground mb-6">
            Пошаговые примеры расчета психометрических метрик для понимания логики системы.
          </p>

          {/* Example 1: p-value */}
          <div className="rounded-xl border bg-neutral-900 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-900/50 to-neutral-900 p-4 border-b border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FileQuestion className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100">Пример 1: Расчет p-value</h3>
                  <p className="text-sm text-neutral-400">Индекс сложности для Likert вопроса</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-sm font-medium text-neutral-300">Исходные данные</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-neutral-800/50 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Всего ответов</div>
                  <div className="text-xl font-mono font-bold text-neutral-100">100</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Макс. значение</div>
                  <div className="text-xl font-mono font-bold text-neutral-100">5</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Сумма ответов</div>
                  <div className="text-xl font-mono font-bold text-neutral-100">380</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Среднее</div>
                  <div className="text-xl font-mono font-bold text-neutral-100">3.8</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-sm font-medium text-neutral-300">Расчет</span>
              </div>
              <div className="p-4 rounded-lg bg-neutral-800/50 font-mono text-sm text-center">
                <div className="text-neutral-400 mb-2">p = sum(values) / (max_value * total_responses)</div>
                <div className="text-neutral-300">p = 380 / (5 * 100)</div>
                <div className="text-neutral-300">p = 380 / 500</div>
                <div className="text-2xl font-bold text-blue-400 mt-2">p = 0.76</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-900/30 to-neutral-900">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-sm font-medium text-neutral-300">Результат</span>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 mb-1">p-value</div>
                    <div className="text-3xl font-mono font-bold text-emerald-400">0.76</div>
                  </div>
                  <div className="text-neutral-600 text-2xl">&isin;</div>
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 mb-1">Диапазон</div>
                    <div className="text-xl font-mono font-bold text-neutral-400">[0.2, 0.9]</div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-emerald-400 w-5 h-5" />
                    <span className="text-emerald-400 font-semibold">OPTIMAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example 2: Cronbach's Alpha */}
          <div className="rounded-xl border bg-neutral-900 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-purple-900/50 to-neutral-900 p-4 border-b border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100">Пример 2: Cronbach&apos;s Alpha</h3>
                  <p className="text-sm text-neutral-400">Надежность компетенции с 4 вопросами</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-sm font-medium text-neutral-300">Дисперсии вопросов</span>
              </div>
              <ScrollableTable>
                <table className="w-full text-sm min-w-[280px]">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800">
                      <th className="text-left p-2">Вопрос</th>
                      <th className="text-center p-2">Дисперсия</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-300">
                    <tr className="border-b border-neutral-800">
                      <td className="p-2">Q1</td>
                      <td className="p-2 text-center font-mono">1.20</td>
                    </tr>
                    <tr className="border-b border-neutral-800">
                      <td className="p-2">Q2</td>
                      <td className="p-2 text-center font-mono">0.95</td>
                    </tr>
                    <tr className="border-b border-neutral-800">
                      <td className="p-2">Q3</td>
                      <td className="p-2 text-center font-mono">1.10</td>
                    </tr>
                    <tr>
                      <td className="p-2">Q4</td>
                      <td className="p-2 text-center font-mono">1.05</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-neutral-700 text-neutral-200">
                      <td className="p-2 font-medium whitespace-nowrap">Сумма дисперсий</td>
                      <td className="p-2 text-center font-mono font-bold">4.30</td>
                    </tr>
                    <tr className="text-neutral-200">
                      <td className="p-2 font-medium whitespace-nowrap">Общая дисперсия теста</td>
                      <td className="p-2 text-center font-mono font-bold">12.50</td>
                    </tr>
                  </tfoot>
                </table>
              </ScrollableTable>
            </div>

            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-sm font-medium text-neutral-300">Расчет</span>
              </div>
              <div className="p-4 rounded-lg bg-neutral-800/50 font-mono text-sm">
                <div className="text-neutral-400 mb-3 text-center">alpha = (k / (k-1)) * (1 - sum(var_i) / var_total)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-neutral-300">
                    <div>k = 4 (количество вопросов)</div>
                    <div>sum(var_i) = 4.30</div>
                    <div>var_total = 12.50</div>
                  </div>
                  <div className="space-y-1 text-neutral-300">
                    <div>k/(k-1) = 4/3 = 1.333</div>
                    <div>1 - 4.30/12.50 = 0.656</div>
                    <div className="text-purple-400 font-bold">alpha = 1.333 * 0.656 = 0.875</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-900/30 to-neutral-900">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-sm font-medium text-neutral-300">Результат</span>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 mb-1">Alpha</div>
                    <div className="text-3xl font-mono font-bold text-purple-400">0.875</div>
                  </div>
                  <div className="text-neutral-600 text-2xl">&ge;</div>
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 mb-1">Порог</div>
                    <div className="text-xl font-mono font-bold text-neutral-400">0.70</div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-emerald-400 w-5 h-5" />
                    <span className="text-emerald-400 font-semibold">RELIABLE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Callout type="tip" title="Интерпретация alpha">
            <p>
              Alpha = 0.875 означает хорошую внутреннюю согласованность. Вопросы компетенции
              измеряют один и тот же конструкт. Для высоконагруженных тестов рекомендуется
              alpha &ge; 0.80.
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
