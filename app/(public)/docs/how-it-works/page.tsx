import { Metadata } from "next";
import {
  Zap,
  FileText,
  Scale,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Target,
  User,
  ChevronRight,
  Briefcase,
  Users,
  Settings2,
  GitBranch,
  RefreshCw,
  Activity,
  Globe,
  Brain,
  Layers,
  ArrowRight,
  AlertTriangle,
  XCircle,
  Percent,
} from "lucide-react";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { MobileTocDrawer } from "../_components/MobileTocDrawer";
import {
  Callout,
  MermaidDiagram,
  MathBlock,
  ScrollableTable,
  ResponsiveDiagram,
} from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Как работает система | Документация | SkillSoft",
  description:
    "Полный обзор системы SkillSoft: жизненный цикл теста, сценарии оценки, алгоритмы оценивания и интеграция с внешними стандартами",
};

const tocItems = [
  { id: "tldr", title: "TL;DR", level: 2 },
  { id: "lifecycle", title: "Жизненный цикл теста", level: 2 },
  { id: "scenarios", title: "Три сценария оценки", level: 2 },
  { id: "scenario-overview", title: "A - Overview", level: 3 },
  { id: "scenario-jobfit", title: "B - Job Fit", level: 3 },
  { id: "scenario-teamfit", title: "C - Team Fit", level: 3 },
  { id: "integration", title: "Интеграция компонентов", level: 2 },
  { id: "data-flows", title: "Потоки данных", level: 2 },
  { id: "normalization", title: "Нормализация ответов", level: 3 },
  { id: "aggregation", title: "Агрегация баллов", level: 3 },
  { id: "percentiles", title: "Расчет перцентилей", level: 3 },
  { id: "formulas", title: "Ключевые формулы", level: 2 },
  { id: "external", title: "Внешние сервисы", level: 2 },
];

export default function HowItWorksPage() {
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
          Как работает система
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Полный обзор платформы SkillSoft: от создания теста до психометрической
          валидации. Узнайте, как все компоненты системы работают вместе для
          обеспечения научно обоснованной оценки soft skills.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        {/* ===== TL;DR Section ===== */}
        <section id="tldr">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            TL;DR - Краткая справка
          </h2>

          {/* Core Principle with Full Flow */}
          <div className="rounded-xl border bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 sm:p-5 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-neutral-100 text-sm sm:text-base">
                  Полный цикл оценки
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400">
                  6 этапов от создания теста до улучшения качества
                </p>
              </div>
            </div>

            {/* Full Flow Diagram - Stacked on mobile, horizontal on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-2 sm:gap-1.5 text-xs">
              <div className="px-2 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-blue-900/50 border border-blue-700 text-blue-300 flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0">
                <Settings2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span>Создание</span>
              </div>
              <div className="px-2 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-purple-900/50 border border-purple-700 text-purple-300 flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0">
                <GitBranch className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span>Сборка</span>
              </div>
              <div className="px-2 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-amber-900/50 border border-amber-700 text-amber-300 flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0">
                <FileText className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span>Прохождение</span>
              </div>
              <div className="px-2 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-700 text-emerald-300 flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0">
                <Scale className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span>Оценивание</span>
              </div>
              <div className="px-2 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-cyan-900/50 border border-cyan-700 text-cyan-300 flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0">
                <BarChart3 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span>Результаты</span>
              </div>
              <div className="px-2 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-rose-900/50 border border-rose-700 text-rose-300 flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0">
                <RefreshCw className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span>Психометрика</span>
              </div>
            </div>
          </div>

          {/* Three Columns: Scenarios Quick Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Column A: Overview */}
            <div className="rounded-xl border bg-neutral-900/50 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="px-2 py-1 rounded text-xs bg-neutral-700 text-neutral-300 font-mono min-w-[24px] text-center">
                  A
                </span>
                <h4 className="font-semibold text-neutral-200 text-sm sm:text-base">Overview</h4>
              </div>
              <div className="text-xs text-neutral-500 mb-2 sm:mb-3">
                Паспорт компетенций
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center gap-2 py-0.5">
                  <span className="text-neutral-400">Цель</span>
                  <span className="text-neutral-300 text-right">Общий профиль</span>
                </div>
                <div className="flex justify-between items-center gap-2 py-0.5">
                  <span className="text-neutral-400">Баллы</span>
                  <span className="font-mono text-neutral-400">Нет</span>
                </div>
                <div className="flex justify-between items-center gap-2 py-0.5">
                  <span className="text-neutral-400">Big Five</span>
                  <span className="font-mono text-purple-400">Да</span>
                </div>
              </div>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-neutral-800">
                <div className="text-xs text-neutral-500 mb-1">Визуализация:</div>
                <div className="text-xs text-neutral-400 leading-relaxed">Radar-диаграмма Big Five, нейтральные цвета</div>
              </div>
            </div>

            {/* Column B: Job Fit */}
            <div className="rounded-xl border bg-emerald-900/20 border-emerald-800/50 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="px-2 py-1 rounded text-xs bg-emerald-900 text-emerald-400 font-mono min-w-[24px] text-center">
                  B
                </span>
                <h4 className="font-semibold text-neutral-200 text-sm sm:text-base">Job Fit</h4>
              </div>
              <div className="text-xs text-neutral-500 mb-2 sm:mb-3">
                Соответствие должности
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center gap-2 py-0.5">
                  <span className="text-neutral-400">Цель</span>
                  <span className="text-neutral-300 text-right">Оценка gap</span>
                </div>
                <div className="flex justify-between items-center gap-2 py-0.5">
                  <span className="text-neutral-400">Порог</span>
                  <span className="font-mono text-emerald-400">50-80%</span>
                </div>
                <div className="flex justify-between items-center gap-2 py-0.5">
                  <span className="text-neutral-400">Бейдж</span>
                  <span className="text-emerald-400">Pass/Fail</span>
                </div>
              </div>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-emerald-800/50">
                <div className="text-xs text-neutral-500 mb-1">Интеграция:</div>
                <code className="text-xs text-emerald-400">O*NET SOC</code>
              </div>
            </div>

            {/* Column C: Team Fit */}
            <div className="rounded-xl border bg-blue-900/20 border-blue-800/50 p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="px-2 py-1 rounded text-xs bg-blue-900 text-blue-400 font-mono min-w-[24px] text-center">
                  C
                </span>
                <h4 className="font-semibold text-neutral-200 text-sm sm:text-base">Team Fit</h4>
              </div>
              <div className="text-xs text-neutral-500 mb-2 sm:mb-3">
                Совместимость с командой
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center gap-2 py-0.5">
                  <span className="text-neutral-400">Цель</span>
                  <span className="text-neutral-300 text-right">Saturation</span>
                </div>
                <div className="flex justify-between items-center gap-2 py-0.5">
                  <span className="text-neutral-400">Порог</span>
                  <span className="font-mono text-blue-400">60% + div</span>
                </div>
                <div className="flex justify-between items-center gap-2 py-0.5">
                  <span className="text-neutral-400">Бейдж</span>
                  <span className="text-blue-400">Compatibility %</span>
                </div>
              </div>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-800/50">
                <div className="text-xs text-neutral-500 mb-1">Интеграция:</div>
                <code className="text-xs text-blue-400">ESCO + Big Five</code>
              </div>
            </div>
          </div>

          {/* Key Insights Box */}
          <div className="rounded-xl border bg-neutral-900/50 p-3 sm:p-4 mb-4 sm:mb-6">
            <h4 className="font-semibold text-neutral-200 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Activity className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>Ключевые особенности реализации</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-800/50 active:bg-neutral-700/50 transition-colors">
                <div className="text-amber-400 font-medium mb-1 text-xs sm:text-sm">Агрегация</div>
                <div className="text-xs text-neutral-400 leading-relaxed">
                  Вопросы агрегируются напрямую в компетенции (без уровня индикаторов)
                </div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-800/50 active:bg-neutral-700/50 transition-colors">
                <div className="text-amber-400 font-medium mb-1 text-xs sm:text-sm">Пропущенные</div>
                <div className="text-xs text-neutral-400 leading-relaxed">
                  Вопросы с isSkipped=true или answeredAt=null исключаются из расчета
                </div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-800/50 active:bg-neutral-700/50 transition-colors">
                <div className="text-amber-400 font-medium mb-1 text-xs sm:text-sm">Перцентили</div>
                <div className="text-xs text-neutral-400 leading-relaxed">
                  Первый результат получает 50-й перцентиль по умолчанию
                </div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-800/50 active:bg-neutral-700/50 transition-colors">
                <div className="text-amber-400 font-medium mb-1 text-xs sm:text-sm">Content Gate</div>
                <div className="text-xs text-neutral-400 leading-relaxed">
                  Психометрика влияет на сборку через фильтрацию вопросов
                </div>
              </div>
            </div>
          </div>

          <Callout type="tip" title="Подробнее">
            <p>
              Ниже представлен полный обзор каждого компонента системы с диаграммами,
              формулами и примерами. Для углубленного изучения отдельных тем используйте
              ссылки на специализированные страницы документации.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 1: Test Lifecycle ===== */}
        <section id="lifecycle">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Жизненный цикл теста
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            Каждый тест в SkillSoft проходит через шесть ключевых этапов. Понимание
            этого цикла важно для эффективного использования платформы.
          </p>

          <ResponsiveDiagram
            title="Полный жизненный цикл теста"
            caption="Используйте жесты для масштабирования"
            maxHeight={420}
          >
            <MermaidDiagram
              chart={`
flowchart TB
    subgraph create["1. СОЗДАНИЕ ШАБЛОНА"]
        A1["TestTemplate"]
        A2["Blueprint конфигурация"]
        A3["Выбор Goal: Overview/JobFit/TeamFit"]
    end

    subgraph assemble["2. СБОРКА ТЕСТА"]
        B1["Strategy Pattern"]
        B2["Content Gate фильтрация"]
        B3["Выбор вопросов"]
    end

    subgraph execute["3. ПРОХОЖДЕНИЕ"]
        C1["TestSession создание"]
        C2["Ответы сотрудника"]
        C3["Сбор SessionAnswer"]
    end

    subgraph score["4. ОЦЕНИВАНИЕ"]
        D1["Нормализация ответов"]
        D2["Агрегация по компетенциям"]
        D3["Применение весов"]
    end

    subgraph result["5. РЕЗУЛЬТАТЫ"]
        E1["TestResult генерация"]
        E2["Перцентили расчет"]
        E3["Визуализация по сценарию"]
    end

    subgraph feedback["6. ПСИХОМЕТРИКА"]
        F1["Обновление p-value, rpb"]
        F2["Cronbach alpha"]
        F3["Feedback Loop"]
    end

    create --> assemble --> execute --> score --> result --> feedback
    feedback -.->|"Улучшение качества"| assemble

    style create fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    style assemble fill:#581c87,stroke:#a855f7,color:#f3e8ff
    style execute fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style score fill:#14532d,stroke:#22c55e,color:#dcfce7
    style result fill:#0c4a6e,stroke:#0ea5e9,color:#e0f2fe
    style feedback fill:#7f1d1d,stroke:#ef4444,color:#fecaca
`}
            />
          </ResponsiveDiagram>

          {/* Lifecycle Steps Detail */}
          <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            {/* Step 1: Template Creation */}
            <div className="rounded-lg border p-3 sm:p-4 bg-blue-900/10 border-blue-800/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-xs sm:text-sm">1</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Создание шаблона (Template)</h4>
                  <p className="text-xs text-muted-foreground">HR создает конфигурацию теста</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-blue-400 font-medium">Blueprint</div>
                  <div className="text-xs text-neutral-400">JSON конфигурация с параметрами</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-blue-400 font-medium">Goal</div>
                  <div className="text-xs text-neutral-400">OVERVIEW / JOB_FIT / TEAM_FIT</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-blue-400 font-medium">Параметры</div>
                  <div className="text-xs text-neutral-400 break-all">competencyIds, onetSocCode, teamId</div>
                </div>
              </div>
            </div>

            {/* Step 2: Assembly */}
            <div className="rounded-lg border p-3 sm:p-4 bg-purple-900/10 border-purple-800/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold text-xs sm:text-sm">2</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Сборка теста (Assembly)</h4>
                  <p className="text-xs text-muted-foreground">Автоматический выбор вопросов</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-purple-400 font-medium">Strategy</div>
                  <div className="text-xs text-neutral-400">Overview/JobFit/TeamFit Assembler</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-purple-400 font-medium">Content Gate</div>
                  <div className="text-xs text-neutral-400">Фильтр по rpb, p-value</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-purple-400 font-medium">Приоритеты</div>
                  <div className="text-xs text-neutral-400">ACTIVE &gt; PROBATION &gt; FLAGGED</div>
                </div>
              </div>
            </div>

            {/* Step 3: Execution */}
            <div className="rounded-lg border p-3 sm:p-4 bg-amber-900/10 border-amber-800/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-bold text-xs sm:text-sm">3</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Прохождение теста</h4>
                  <p className="text-xs text-muted-foreground">Сотрудник отвечает на вопросы</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-amber-400 font-medium">TestSession</div>
                  <div className="text-xs text-neutral-400">Уникальная сессия для сотрудника</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-amber-400 font-medium">SessionAnswer</div>
                  <div className="text-xs text-neutral-400">Сохранение каждого ответа</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-amber-400 font-medium">Состояния</div>
                  <div className="text-xs text-neutral-400 break-all">answeredAt, isSkipped, flagged</div>
                </div>
              </div>
            </div>

            {/* Step 4: Scoring */}
            <div className="rounded-lg border p-3 sm:p-4 bg-emerald-900/10 border-emerald-800/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 font-bold text-xs sm:text-sm">4</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Оценивание</h4>
                  <p className="text-xs text-muted-foreground">Нормализация и агрегация баллов</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-emerald-400 font-medium">Нормализация</div>
                  <div className="text-xs text-neutral-400">Приведение к шкале [0, 1]</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-emerald-400 font-medium">Агрегация</div>
                  <div className="text-xs text-neutral-400">Вопросы - Компетенции - Профиль</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-emerald-400 font-medium">Веса</div>
                  <div className="text-xs text-neutral-400">O*NET 1.2x, ESCO 1.15x, Big5 1.1x</div>
                </div>
              </div>
            </div>

            {/* Step 5: Results */}
            <div className="rounded-lg border p-3 sm:p-4 bg-cyan-900/10 border-cyan-800/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold text-xs sm:text-sm">5</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Результаты</h4>
                  <p className="text-xs text-muted-foreground">Генерация и визуализация</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-cyan-400 font-medium">TestResult</div>
                  <div className="text-xs text-neutral-400">Итоговые баллы и статус</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-cyan-400 font-medium">Перцентили</div>
                  <div className="text-xs text-neutral-400">Сравнение с другими</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-cyan-400 font-medium">View Strategy</div>
                  <div className="text-xs text-neutral-400">Адаптация под сценарий</div>
                </div>
              </div>
            </div>

            {/* Step 6: Psychometrics */}
            <div className="rounded-lg border p-3 sm:p-4 bg-rose-900/10 border-rose-800/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-rose-400 font-bold text-xs sm:text-sm">6</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Психометрическая обратная связь</h4>
                  <p className="text-xs text-muted-foreground">Улучшение качества вопросов</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-rose-400 font-medium">Метрики</div>
                  <div className="text-xs text-neutral-400">p-value, rpb, Cronbach alpha</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-rose-400 font-medium">Статусы</div>
                  <div className="text-xs text-neutral-400">PROBATION - ACTIVE - RETIRED</div>
                </div>
                <div className="p-2 rounded bg-neutral-800/50">
                  <div className="text-rose-400 font-medium">Feedback Loop</div>
                  <div className="text-xs text-neutral-400">Авто-retire токсичных вопросов</div>
                </div>
              </div>
            </div>
          </div>

          <Callout type="info" title="Замкнутый цикл">
            <p>
              Результаты психометрического анализа напрямую влияют на сборку будущих
              тестов через Content Gate. Это обеспечивает постоянное улучшение качества
              оценочных инструментов.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 2: Three Assessment Scenarios ===== */}
        <section id="scenarios">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Три сценария оценки
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            SkillSoft поддерживает три различных сценария оценки, каждый со своей
            логикой сборки, оценивания и визуализации результатов.
          </p>

          {/* Comparison Table */}
          <ScrollableTable className="my-4 sm:my-6">
            <table className="w-full border-collapse text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 sm:p-3 font-semibold whitespace-nowrap">Характеристика</th>
                  <th className="text-left p-2 sm:p-3 font-semibold whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-300 text-xs mr-1 sm:mr-2">A</span>
                    <span className="hidden sm:inline">Overview</span>
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-400 text-xs mr-1 sm:mr-2">B</span>
                    <span className="hidden sm:inline">Job Fit</span>
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded bg-blue-900 text-blue-400 text-xs mr-1 sm:mr-2">C</span>
                    <span className="hidden sm:inline">Team Fit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">Цель</td>
                  <td className="p-2 sm:p-3 text-muted-foreground">Паспорт</td>
                  <td className="p-2 sm:p-3 text-muted-foreground">Должность</td>
                  <td className="p-2 sm:p-3 text-muted-foreground">Команда</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">Алгоритм</td>
                  <td className="p-2 sm:p-3"><code className="text-xs">Waterfall</code></td>
                  <td className="p-2 sm:p-3"><code className="text-xs">Gap-Based</code></td>
                  <td className="p-2 sm:p-3"><code className="text-xs">Saturation</code></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">Сервис</td>
                  <td className="p-2 sm:p-3 text-neutral-500">-</td>
                  <td className="p-2 sm:p-3 text-emerald-500">O*NET</td>
                  <td className="p-2 sm:p-3 text-blue-500">ESCO</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">Score</td>
                  <td className="p-2 sm:p-3 text-red-400">Нет</td>
                  <td className="p-2 sm:p-3 text-emerald-400">Да</td>
                  <td className="p-2 sm:p-3 text-blue-400">%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">Pass/Fail</td>
                  <td className="p-2 sm:p-3 text-red-400">Нет</td>
                  <td className="p-2 sm:p-3 text-emerald-400">Да</td>
                  <td className="p-2 sm:p-3 text-red-400">Нет</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">Big Five</td>
                  <td className="p-2 sm:p-3 text-emerald-400">Да</td>
                  <td className="p-2 sm:p-3 text-amber-400">Опц.</td>
                  <td className="p-2 sm:p-3 text-emerald-400">Да</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">Gap</td>
                  <td className="p-2 sm:p-3 text-red-400">Нет</td>
                  <td className="p-2 sm:p-3 text-emerald-400">Да</td>
                  <td className="p-2 sm:p-3 text-red-400">Нет</td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap">Цвет</td>
                  <td className="p-2 sm:p-3 text-neutral-400">Серый</td>
                  <td className="p-2 sm:p-3 text-emerald-400">Зеленый</td>
                  <td className="p-2 sm:p-3 text-blue-400">Синий</td>
                </tr>
              </tbody>
            </table>
          </ScrollableTable>

          {/* Scenario A: Overview */}
          <div id="scenario-overview" className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
              <span>Сценарий A: Overview (Паспорт компетенций)</span>
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              Создает общий профиль компетенций сотрудника без привязки к конкретной
              должности или команде. Используется для понимания сильных и слабых сторон.
            </p>

            <div className="rounded-xl border bg-neutral-900/50 p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-medium text-neutral-200 mb-2 text-sm sm:text-base">Визуальные элементы</h4>
                  <ul className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Big Five radar-диаграмма (главный элемент)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Карточки компетенций без баллов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Нейтральные цвета (без pass/fail)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Нет Score Circle</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-200 mb-2 text-sm sm:text-base">Алгоритм Waterfall</h4>
                  <ul className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-400 flex-shrink-0 mt-0.5">1</span>
                      <span>Сортировка индикаторов по весу</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-400 flex-shrink-0 mt-0.5">2</span>
                      <span>Фильтр: INTERMEDIATE сложность</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-400 flex-shrink-0 mt-0.5">3</span>
                      <span>Round-robin: по 1 вопросу за раунд</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-400 flex-shrink-0 mt-0.5">4</span>
                      <span>Лимит: 3 вопроса на индикатор</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario B: Job Fit */}
          <div id="scenario-jobfit" className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <span>Сценарий B: Job Fit (Соответствие должности)</span>
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              Оценивает соответствие кандидата требованиям конкретной должности
              на основе профиля O*NET. Включает gap-анализ и бейдж pass/fail.
            </p>

            <div className="rounded-xl border bg-emerald-900/20 border-emerald-800/50 p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-medium text-neutral-200 mb-2 text-sm sm:text-base">Визуальные элементы</h4>
                  <ul className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Score Circle с процентом</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Pass/Fail бейдж (green/red)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Gap analysis карточки</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Green/Amber цветовая схема</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-200 mb-2 text-sm sm:text-base">Алгоритм Gap-Based</h4>
                  <ul className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 flex-shrink-0 mt-0.5">1</span>
                      <span>Загрузка O*NET профиля по SOC</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 flex-shrink-0 mt-0.5">2</span>
                      <span>Расчет gap = benchmark - score</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 flex-shrink-0 mt-0.5">3</span>
                      Сортировка по gap (DESC)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs text-emerald-400">4</span>
                      5 ADVANCED вопросов на gap
                    </li>
                  </ul>
                </div>
              </div>

              {/* Threshold Formula */}
              <div className="mt-4 p-3 rounded bg-neutral-800/50">
                <div className="text-xs text-neutral-400 mb-2">Формула порога прохождения:</div>
                <div className="font-mono text-sm text-emerald-400 text-center">
                  threshold = 50% + (strictnessLevel / 100) * 30%
                </div>
                <div className="text-xs text-neutral-500 text-center mt-2">
                  strictness = 0: порог 50% | strictness = 100: порог 80%
                </div>
              </div>
            </div>
          </div>

          {/* Scenario C: Team Fit */}
          <div id="scenario-teamfit" className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
              <span>Сценарий C: Team Fit (Совместимость с командой)</span>
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              Оценивает, как кандидат дополнит существующую команду, анализируя
              &quot;насыщенность&quot; компетенций в команде и потребности в разнообразии.
            </p>

            <div className="rounded-xl border bg-blue-900/20 border-blue-800/50 p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-medium text-neutral-200 mb-2 text-sm sm:text-base">Визуальные элементы</h4>
                  <ul className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Compatibility % (круговой индикатор)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Team context карточки</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Big Five radar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Blue цветовая схема</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-200 mb-2 text-sm sm:text-base">Алгоритм Saturation</h4>
                  <ul className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-400 flex-shrink-0 mt-0.5">1</span>
                      <span>Загрузка saturation профиля команды</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-400 flex-shrink-0 mt-0.5">2</span>
                      <span>Фильтр undersaturated компетенций</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-400 flex-shrink-0 mt-0.5">3</span>
                      <span>Динамическое кол-во вопросов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-400 flex-shrink-0 mt-0.5">4</span>
                      <span>2-6 вопросов в зависимости от sat.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Team Fit Specific Formulas */}
              <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded bg-neutral-800/50 space-y-2 sm:space-y-3">
                <div className="text-xs text-neutral-400 mb-2">Формулы Team Fit:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 font-mono text-xs">
                  <div className="p-2 rounded bg-neutral-900/50">
                    <div className="text-blue-400 text-xs">diversityRatio =</div>
                    <div className="text-neutral-300 text-xs break-all">diversityContributors / competencyCount</div>
                  </div>
                  <div className="p-2 rounded bg-neutral-900/50">
                    <div className="text-blue-400 text-xs">saturationRatio =</div>
                    <div className="text-neutral-300 text-xs break-all">saturationContributors / competencyCount</div>
                  </div>
                </div>
                <div className="text-xs text-neutral-500 text-center leading-relaxed">
                  teamFitMultiplier: 1.1 если (diversity &gt; 40% AND saturation &lt; 60%), 0.9 если saturation &gt; 80%, иначе 1.0
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 3: Component Integration ===== */}
        <section id="integration">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Интеграция компонентов
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            Компоненты системы тесно взаимосвязаны. Понимание этих связей важно
            для эффективной работы с платформой.
          </p>

          <ResponsiveDiagram
            title="Взаимодействие компонентов системы"
            caption="Используйте жесты для масштабирования"
            maxHeight={400}
          >
            <MermaidDiagram
              chart={`
flowchart TB
    subgraph assembly["СБОРКА ТЕСТОВ"]
        AS["Assembler Strategy"]
        CG["Content Gate"]
        BP["Blueprint"]
    end

    subgraph scoring["ОЦЕНИВАНИЕ"]
        SC["Score Calculator"]
        WM["Weight Multipliers"]
        AG["Aggregator"]
    end

    subgraph psycho["ПСИХОМЕТРИКА"]
        PM["Psychometric Metrics"]
        IS["Item Statistics"]
        FB["Feedback Loop"]
    end

    subgraph external["ВНЕШНИЕ СЕРВИСЫ"]
        ON["O*NET Service"]
        ES["ESCO Service"]
        TM["Team Service"]
    end

    BP --> AS
    AS --> CG
    CG -->|"eligible questions"| AS
    PM -->|"rpb, p-value"| CG

    ON -->|"benchmarks"| AS
    ES -->|"skills"| AS
    TM -->|"saturation"| AS

    ON -->|"weights"| WM
    ES -->|"weights"| WM

    SC --> AG
    WM --> AG

    IS -->|"накопление данных"| PM
    PM --> FB
    FB -->|"обновление статусов"| IS

    style assembly fill:#581c87,stroke:#a855f7,color:#f3e8ff
    style scoring fill:#14532d,stroke:#22c55e,color:#dcfce7
    style psycho fill:#7f1d1d,stroke:#ef4444,color:#fecaca
    style external fill:#0c4a6e,stroke:#0ea5e9,color:#e0f2fe
`}
            />
          </ResponsiveDiagram>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
            {/* Assembly -> Scoring Connection */}
            <div className="rounded-lg border p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                <h4 className="font-medium text-sm sm:text-base">Сборка - Оценивание</h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed">
                Blueprint определяет не только вопросы, но и параметры оценивания:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Goal определяет формулу расчета порога</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>strictnessLevel влияет на threshold</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Внешние сервисы предоставляют веса</span>
                </li>
              </ul>
            </div>

            {/* Psychometrics -> Assembly Connection */}
            <div className="rounded-lg border p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 flex-shrink-0" />
                <h4 className="font-medium text-sm sm:text-base">Психометрика - Сборка</h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed">
                Content Gate использует психометрические данные для фильтрации:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>ACTIVE вопросы (rpb &ge; 0.3) - приоритет</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>PROBATION (&lt;50 ответов) - допускаются</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>RETIRED (rpb &lt; 0) - исключаются</span>
                </li>
              </ul>
            </div>
          </div>

          <Callout type="note" title="Замкнутый цикл улучшения">
            <p>
              Каждый ответ сотрудника обновляет психометрические метрики вопроса.
              Со временем система автоматически определяет качественные вопросы
              и исключает &quot;токсичные&quot; из будущих тестов.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 4: Data Flows ===== */}
        <section id="data-flows">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Потоки данных
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            Понимание потоков данных помогает разобраться в том, как ответы
            превращаются в итоговые баллы и перцентили.
          </p>

          {/* Answer Normalization */}
          <div id="normalization" className="mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              Нормализация ответов
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              Все ответы приводятся к единой шкале [0, 1] для справедливого сравнения.
            </p>

            {/* Full Question Type Normalization Table */}
            <ScrollableTable className="rounded-lg border bg-neutral-900 p-2 sm:p-4 my-3 sm:my-4">
              <table className="w-full text-xs sm:text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400 whitespace-nowrap">Тип</th>
                    <th className="text-left p-2 text-neutral-400 hidden sm:table-cell">Enum</th>
                    <th className="text-left p-2 text-neutral-400 whitespace-nowrap">Формула</th>
                    <th className="text-left p-2 text-neutral-400 whitespace-nowrap">Диапазон</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium whitespace-nowrap">Likert шкалы</td>
                    <td className="p-2 text-xs hidden sm:table-cell">
                      <code className="text-blue-400">LIKERT</code>,{" "}
                      <code className="text-blue-400">LIKERT_SCALE</code>,{" "}
                      <code className="text-blue-400">FREQUENCY_SCALE</code>
                    </td>
                    <td className="p-2 font-mono text-emerald-400 whitespace-nowrap">(value - 1) / 4</td>
                    <td className="p-2">[0, 1]</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium whitespace-nowrap">Ситуационные</td>
                    <td className="p-2 text-xs hidden sm:table-cell">
                      <code className="text-blue-400">SJT</code>,{" "}
                      <code className="text-blue-400">SITUATIONAL_JUDGMENT</code>
                    </td>
                    <td className="p-2 font-mono text-emerald-400 whitespace-nowrap">clamp(score, 0, 1)</td>
                    <td className="p-2">[0, 1]</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium whitespace-nowrap">Множ. выбор</td>
                    <td className="p-2 text-xs hidden sm:table-cell">
                      <code className="text-blue-400">MCQ</code>,{" "}
                      <code className="text-blue-400">MULTIPLE_CHOICE</code>
                    </td>
                    <td className="p-2 font-mono text-emerald-400 whitespace-nowrap">correct ? 1.0 : 0.0</td>
                    <td className="p-2">{"{0, 1}"}</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium whitespace-nowrap">Способности</td>
                    <td className="p-2 text-xs hidden sm:table-cell">
                      <code className="text-blue-400">CAPABILITY_ASSESSMENT</code>
                    </td>
                    <td className="p-2 font-mono text-amber-400 whitespace-nowrap">Likert или score</td>
                    <td className="p-2">[0, 1]</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium whitespace-nowrap">Peer feedback</td>
                    <td className="p-2 text-xs hidden sm:table-cell">
                      <code className="text-blue-400">PEER_FEEDBACK</code>
                    </td>
                    <td className="p-2 font-mono text-amber-400 whitespace-nowrap">Likert или score</td>
                    <td className="p-2">[0, 1]</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium whitespace-nowrap">Текстовые</td>
                    <td className="p-2 text-xs hidden sm:table-cell">
                      <code className="text-blue-400">BEHAVIORAL_EXAMPLE</code>,{" "}
                      <code className="text-blue-400">OPEN_TEXT</code>,{" "}
                      <code className="text-blue-400">SELF_REFLECTION</code>
                    </td>
                    <td className="p-2 font-mono text-neutral-500 whitespace-nowrap">score field only</td>
                    <td className="p-2 text-neutral-500 whitespace-nowrap">Ручная оценка</td>
                  </tr>
                </tbody>
              </table>
            </ScrollableTable>

            <Callout type="warning" title="Обработка пропущенных вопросов">
              <p>
                Вопросы с <code>isSkipped=true</code> или <code>answeredAt=null</code>{" "}
                полностью исключаются из расчета баллов. Они не влияют на итоговую оценку.
              </p>
            </Callout>
          </div>

          {/* Score Aggregation */}
          <div id="aggregation" className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              Агрегация баллов
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              Нормализованные баллы агрегируются по иерархии: Вопросы - Компетенции - Профиль.
            </p>

            {/* Important Implementation Note */}
            <div className="rounded-xl border bg-amber-900/20 border-amber-800/50 p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <h4 className="font-medium text-amber-400 text-sm sm:text-base">Важная особенность реализации</h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                В текущей реализации <strong>уровень индикаторов пропускается</strong>.
                Вопросы агрегируются напрямую в компетенции.
              </p>
            </div>

            {/* Aggregation Hierarchy */}
            <div className="rounded-xl border bg-neutral-900/50 p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-blue-900/50 border border-blue-700 flex items-center justify-center mb-1">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <div className="text-xs text-neutral-400">Вопросы</div>
                  <div className="text-xs text-blue-400 font-mono">avg()</div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 hidden sm:block" />
                <div className="text-neutral-500 sm:hidden">→</div>
                <div className="text-center opacity-50">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-neutral-800 border border-neutral-700 border-dashed flex items-center justify-center mb-1">
                    <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-500" />
                  </div>
                  <div className="text-xs text-neutral-500 line-through">Индик.</div>
                  <div className="text-xs text-neutral-600 font-mono">skip</div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 hidden sm:block" />
                <div className="text-neutral-500 sm:hidden">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-amber-900/50 border border-amber-700 flex items-center justify-center mb-1">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  </div>
                  <div className="text-xs text-neutral-400">Компет.</div>
                  <div className="text-xs text-amber-400 font-mono">weighted</div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 hidden sm:block" />
                <div className="text-neutral-500 sm:hidden">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-emerald-900/50 border border-emerald-700 flex items-center justify-center mb-1">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  </div>
                  <div className="text-xs text-neutral-400">Профиль</div>
                  <div className="text-xs text-emerald-400 font-mono">final %</div>
                </div>
              </div>
            </div>

            {/* Aggregation Formula */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <MathBlock
                tex="\text{Профиль} = \frac{\sum_{i=1}^{n} (C_i \times W_i)}{\sum_{i=1}^{n} W_i}"
                label="Формула взвешенной агрегации компетенций в профиль"
                variant="emerald"
                className="mb-2 mt-0"
              />
              <div className="text-center text-xs text-neutral-500 mt-2">
                C<sub>i</sub> - балл компетенции, W<sub>i</sub> - вес компетенции (из внешнего сервиса или 1.0)
              </div>
            </div>
          </div>

          {/* Percentile Calculation */}
          <div id="percentiles" className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              Расчет перцентилей
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              Перцентили показывают положение результата относительно других сотрудников.
            </p>

            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <MathBlock
                tex="\text{percentile} = \frac{\text{belowCount}}{\text{totalCount} - 1} \times 100"
                label="Формула расчета перцентиля"
                variant="purple"
                className="mb-2 mt-0"
              />
              <div className="text-center text-xs text-neutral-500 mt-2">
                belowCount - количество результатов ниже текущего
              </div>
            </div>

            <div className="rounded-lg border p-3 sm:p-4 bg-purple-900/10 border-purple-800/50">
              <div className="flex items-start gap-2 mb-2">
                <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <h4 className="font-medium text-purple-400 text-sm sm:text-base">Особый случай: первый результат</h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Когда <code className="text-xs">totalCount = 1</code> (первый результат), система присваивает
                50-й перцентиль по умолчанию, так как деление на ноль невозможно.
              </p>
            </div>
          </div>
        </section>

        {/* ===== SECTION 5: Key Formulas ===== */}
        <section id="formulas">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Ключевые формулы
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
            Сводка основных формул, используемых в системе оценивания и психометрике.
          </p>

          <div className="space-y-4 sm:space-y-6">
            {/* Normalization Formulas */}
            <div className="rounded-xl border bg-neutral-900 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900/50 to-neutral-900 p-4 border-b border-neutral-700">
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-neutral-100">Нормализация</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <MathBlock
                  tex="\text{Likert: } \frac{v - 1}{4}"
                  label="Нормализация Likert шкалы (1-5 в 0-1)"
                  variant="blue"
                  className="mb-0 mt-0"
                />
                <MathBlock
                  tex="\text{SJT: } \text{clamp}(\text{score}, 0, 1)"
                  label="Нормализация ситуационных суждений"
                  variant="blue"
                  className="mb-0 mt-0"
                />
              </div>
            </div>

            {/* Aggregation Formulas */}
            <div className="rounded-xl border bg-neutral-900 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-900/50 to-neutral-900 p-4 border-b border-neutral-700">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-neutral-100">Агрегация</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <MathBlock
                  tex="\text{Профиль} = \frac{\sum (C_i \times W_i)}{\sum W_i}"
                  label="Взвешенное среднее компетенций"
                  variant="emerald"
                  className="mb-0 mt-0"
                />
              </div>
            </div>

            {/* Threshold Formulas */}
            <div className="rounded-xl border bg-neutral-900 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-900/50 to-neutral-900 p-4 border-b border-neutral-700">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-amber-400" />
                  <h3 className="font-semibold text-neutral-100">Пороги прохождения</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <MathBlock
                  tex="\text{Job Fit: } 50\% + \frac{\text{strictness}}{100} \times 30\%"
                  label="Порог для Job Fit (50-80% в зависимости от строгости)"
                  variant="amber"
                  className="mb-0 mt-0"
                />
                <MathBlock
                  tex="\text{Team Fit: } \text{score} \geq 60\% \land \text{diversity} \geq 30\%"
                  label="Два условия для Team Fit"
                  variant="amber"
                  className="mb-0 mt-0"
                />
              </div>
            </div>

            {/* Psychometric Formulas */}
            <div className="rounded-xl border bg-neutral-900 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-900/50 to-neutral-900 p-4 border-b border-neutral-700">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-neutral-100">Психометрика</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <MathBlock
                  tex="p = \frac{\sum \text{correct}}{\sum \text{total}}"
                  label="Индекс сложности (p-value)"
                  variant="purple"
                  className="mb-0 mt-0"
                />
                <MathBlock
                  tex="r_{pb} = \frac{M_1 - M_0}{s} \times \sqrt{p \times q}"
                  label="Индекс дискриминации (rpb)"
                  variant="purple"
                  className="mb-0 mt-0"
                />
                <MathBlock
                  tex="\alpha = \frac{k}{k-1} \times \left(1 - \frac{\sum \sigma_i^2}{\sigma_t^2}\right)"
                  label="Cronbach's alpha (внутренняя согласованность)"
                  variant="purple"
                  className="mb-0 mt-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 6: External Services ===== */}
        <section id="external">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
            Внешние сервисы
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            SkillSoft интегрируется с международными стандартами и внешними сервисами
            для обеспечения научной обоснованности оценки.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* O*NET */}
            <div className="rounded-xl border bg-emerald-900/20 border-emerald-800/50 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-emerald-400 text-sm sm:text-base">O*NET</h4>
                  <p className="text-xs text-neutral-400">Job Fit сценарий</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 leading-relaxed">
                Профессиональная база данных с профилями должностей.
              </p>
              <div className="space-y-1.5 sm:space-y-2 text-xs">
                <div className="flex justify-between items-center p-1.5 sm:p-2 rounded bg-neutral-800/50">
                  <span className="text-neutral-400">Данные</span>
                  <span className="text-emerald-400">Benchmarks</span>
                </div>
                <div className="flex justify-between items-center p-1.5 sm:p-2 rounded bg-neutral-800/50">
                  <span className="text-neutral-400">Множитель</span>
                  <span className="font-mono text-emerald-400">1.2x</span>
                </div>
                <div className="flex justify-between items-center p-1.5 sm:p-2 rounded bg-neutral-800/50">
                  <span className="text-neutral-400">Формат</span>
                  <code className="text-emerald-400 text-xs">XX-XXXX.XX</code>
                </div>
              </div>
            </div>

            {/* ESCO */}
            <div className="rounded-xl border bg-blue-900/20 border-blue-800/50 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-blue-400 text-sm sm:text-base">ESCO</h4>
                  <p className="text-xs text-neutral-400">Team Fit сценарий</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 leading-relaxed">
                Европейская классификация навыков и компетенций.
              </p>
              <div className="space-y-1.5 sm:space-y-2 text-xs">
                <div className="flex justify-between items-center p-1.5 sm:p-2 rounded bg-neutral-800/50">
                  <span className="text-neutral-400">Данные</span>
                  <span className="text-blue-400">Skills</span>
                </div>
                <div className="flex justify-between items-center p-1.5 sm:p-2 rounded bg-neutral-800/50">
                  <span className="text-neutral-400">Множитель</span>
                  <span className="font-mono text-blue-400">1.15x</span>
                </div>
                <div className="flex justify-between items-center p-1.5 sm:p-2 rounded bg-neutral-800/50">
                  <span className="text-neutral-400">Связь</span>
                  <code className="text-blue-400 text-xs">standardCodes</code>
                </div>
              </div>
            </div>

            {/* Big Five */}
            <div className="rounded-xl border bg-purple-900/20 border-purple-800/50 p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-purple-400 text-sm sm:text-base">Big Five</h4>
                  <p className="text-xs text-neutral-400">Все сценарии</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 leading-relaxed">
                Пятифакторная модель личности для проекции компетенций.
              </p>
              <div className="space-y-1.5 sm:space-y-2 text-xs">
                <div className="flex justify-between items-center p-1.5 sm:p-2 rounded bg-neutral-800/50">
                  <span className="text-neutral-400">Данные</span>
                  <span className="text-purple-400">Trait projection</span>
                </div>
                <div className="flex justify-between items-center p-1.5 sm:p-2 rounded bg-neutral-800/50">
                  <span className="text-neutral-400">Множитель</span>
                  <span className="font-mono text-purple-400">1.1x</span>
                </div>
                <div className="flex justify-between items-center p-1.5 sm:p-2 rounded bg-neutral-800/50">
                  <span className="text-neutral-400">Маппинг</span>
                  <code className="text-purple-400 text-xs">onet_to_bigfive</code>
                </div>
              </div>
            </div>
          </div>

          {/* Big Five Traits */}
          <div className="mt-4 sm:mt-6 rounded-lg border p-3 sm:p-4">
            <h4 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>Черты Big Five</span>
            </h4>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
              {[
                { code: "O", name: "Открыт.", color: "purple" },
                { code: "C", name: "Доброс.", color: "blue" },
                { code: "E", name: "Экстрав.", color: "amber" },
                { code: "A", name: "Доброж.", color: "emerald" },
                { code: "N", name: "Нейрот.", color: "red" },
              ].map((trait) => (
                <div
                  key={trait.code}
                  className={`rounded-lg border p-2 sm:p-3 text-center bg-${trait.color}-900/20 border-${trait.color}-800/50`}
                >
                  <div className={`text-lg sm:text-2xl font-bold text-${trait.color}-400 mb-0.5 sm:mb-1`}>
                    {trait.code}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">{trait.name}</div>
                </div>
              ))}
            </div>
          </div>

          <Callout type="info" title="Проекция компетенций на Big Five">
            <p>
              Система использует файл маппинга <code>onet_to_bigfive_map.json</code> для
              проекции баллов компетенций на черты Big Five. Каждая компетенция может
              иметь primary, secondary и tertiary веса для разных черт.
            </p>
          </Callout>

          {/* Quick Links */}
          <div className="mt-6 sm:mt-8 rounded-xl border bg-neutral-900/50 p-3 sm:p-4">
            <h4 className="font-semibold text-neutral-200 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Подробная документация</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <a
                href="/docs/test-building"
                className="p-2.5 sm:p-3 rounded-lg bg-purple-900/20 border border-purple-800/50 hover:bg-purple-900/30 active:bg-purple-900/40 transition-colors min-h-[44px] flex flex-col justify-center"
              >
                <div className="text-purple-400 font-medium text-sm">Сборка тестов</div>
                <div className="text-xs text-neutral-400 hidden sm:block">Алгоритмы, Blueprint, Content Gate</div>
              </a>
              <a
                href="/docs/scoring"
                className="p-2.5 sm:p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/50 hover:bg-emerald-900/30 active:bg-emerald-900/40 transition-colors min-h-[44px] flex flex-col justify-center"
              >
                <div className="text-emerald-400 font-medium text-sm">Система оценивания</div>
                <div className="text-xs text-neutral-400 hidden sm:block">Нормализация, агрегация, пороги</div>
              </a>
              <a
                href="/docs/psychometrics"
                className="p-2.5 sm:p-3 rounded-lg bg-rose-900/20 border border-rose-800/50 hover:bg-rose-900/30 active:bg-rose-900/40 transition-colors min-h-[44px] flex flex-col justify-center"
              >
                <div className="text-rose-400 font-medium text-sm">Психометрика</div>
                <div className="text-xs text-neutral-400 hidden sm:block">p-value, rpb, Cronbach alpha</div>
              </a>
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
