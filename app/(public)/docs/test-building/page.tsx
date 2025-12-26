import { Metadata } from "next";
import {
  Zap,
  Users,
  Briefcase,
  ChevronRight,
  Settings2,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Ban,
  Clock,
  Filter,
  GitBranch,
  Database,
  Sliders,
  BookOpen,
  BarChart3,
  Gauge,
} from "lucide-react";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { MobileTocDrawer } from "../_components/MobileTocDrawer";
import {
  Callout,
  FlowDiagram,
  Steps,
  Step,
  MermaidDiagram,
  MathBlock,
  ScrollableTable,
  CodeBlock,
  ResponsiveDiagram,
  CollapsibleSection,
} from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Сборка тестов | Документация | SkillSoft",
  description:
    "Полное руководство по алгоритмам сборки тестов, Blueprint-конфигурации и психометрической фильтрации вопросов",
};

const tocItems = [
  { id: "tldr", title: "TL;DR", level: 2 },
  { id: "overview", title: "Обзор архитектуры", level: 2 },
  { id: "test-goals", title: "Цели тестирования", level: 2 },
  { id: "overview-assembly", title: "Сборка Overview", level: 3 },
  { id: "jobfit-assembly", title: "Сборка Job Fit", level: 3 },
  { id: "teamfit-assembly", title: "Сборка Team Fit", level: 3 },
  { id: "blueprints", title: "Конфигурация Blueprint", level: 2 },
  { id: "psychometric-gate", title: "Психометрическая фильтрация", level: 2 },
  { id: "question-selection", title: "Алгоритмы выбора вопросов", level: 2 },
  { id: "external-services", title: "Внешние сервисы", level: 2 },
  { id: "examples", title: "Примеры конфигурации", level: 2 },
];

export default function TestBuildingPage() {
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
          Сборка тестов
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          Полное руководство по алгоритмам автоматической сборки тестов,
          конфигурации Blueprint и психометрической валидации вопросов.
          Узнайте, как система адаптирует содержание теста под цели оценки.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        {/* ===== TL;DR Section ===== */}
        <section id="tldr">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            TL;DR - Краткая справка
          </h2>

          {/* Core Principle */}
          <div className="rounded-xl border bg-gradient-to-br from-neutral-900 to-neutral-800 p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-100">
                  Главный принцип
                </h3>
                <p className="text-sm text-neutral-400">
                  Стратегия сборки определяется целью тестирования (Goal)
                </p>
              </div>
            </div>

            {/* Flow Diagram - Mobile responsive */}
            <div className="flex items-center justify-center gap-2 text-sm flex-wrap sm:flex-nowrap">
              <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-900/50 border border-blue-700 text-blue-300 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs sm:text-sm">Blueprint</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 hidden sm:block" />
              <ChevronRight className="w-4 h-4 text-neutral-500 rotate-90 sm:hidden" />
              <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-900/50 border border-amber-700 text-amber-300 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs sm:text-sm">Strategy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 hidden sm:block" />
              <ChevronRight className="w-4 h-4 text-neutral-500 rotate-90 sm:hidden" />
              <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-purple-900/50 border border-purple-700 text-purple-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs sm:text-sm">Content Gate</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 hidden sm:block" />
              <ChevronRight className="w-4 h-4 text-neutral-500 rotate-90 sm:hidden" />
              <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-700 text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs sm:text-sm">Вопросы</span>
              </div>
            </div>
          </div>

          {/* Three Columns: Test Types - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {/* Column 1: Overview */}
            <div className="rounded-xl border bg-neutral-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded text-xs bg-neutral-700 text-neutral-300 font-mono">
                  A
                </span>
                <h4 className="font-semibold text-neutral-200">Overview</h4>
              </div>
              <div className="text-xs text-neutral-500 mb-3">
                Паспорт компетенций
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Алгоритм</span>
                  <span className="font-mono text-neutral-300">Waterfall</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Сложность</span>
                  <span className="font-mono text-amber-400">INTERMEDIATE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Вопросов/инд.</span>
                  <span className="font-mono text-emerald-400">3</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-800">
                <div className="text-xs text-neutral-500 mb-1">Параметры:</div>
                <code className="text-xs text-neutral-400">competencyIds</code>
                <br />
                <code className="text-xs text-neutral-400">includeBigFive</code>
              </div>
            </div>

            {/* Column 2: Job Fit */}
            <div className="rounded-xl border bg-emerald-900/20 border-emerald-800/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded text-xs bg-emerald-900 text-emerald-400 font-mono">
                  B
                </span>
                <h4 className="font-semibold text-neutral-200">Job Fit</h4>
              </div>
              <div className="text-xs text-neutral-500 mb-3">
                Соответствие должности
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Алгоритм</span>
                  <span className="font-mono text-neutral-300">Gap-Based</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Сложность</span>
                  <span className="font-mono text-red-400">ADVANCED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Вопросов/gap</span>
                  <span className="font-mono text-emerald-400">5</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-800/50">
                <div className="text-xs text-neutral-500 mb-1">Параметры:</div>
                <code className="text-xs text-emerald-400">onetSocCode</code>
                <br />
                <code className="text-xs text-emerald-400">strictnessLevel</code>
              </div>
            </div>

            {/* Column 3: Team Fit */}
            <div className="rounded-xl border bg-blue-900/20 border-blue-800/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded text-xs bg-blue-900 text-blue-400 font-mono">
                  C
                </span>
                <h4 className="font-semibold text-neutral-200">Team Fit</h4>
              </div>
              <div className="text-xs text-neutral-500 mb-3">
                Совместимость с командой
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Алгоритм</span>
                  <span className="font-mono text-neutral-300">Saturation</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Сложность</span>
                  <span className="font-mono text-amber-400">Динамическая</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Вопросов/комп.</span>
                  <span className="font-mono text-blue-400">2-6</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-800/50">
                <div className="text-xs text-neutral-500 mb-1">Параметры:</div>
                <code className="text-xs text-blue-400">teamId</code>
                <br />
                <code className="text-xs text-blue-400">saturationThreshold</code>
              </div>
            </div>
          </div>

          {/* Content Gate Quick Reference - Mobile responsive */}
          <div className="rounded-xl border bg-neutral-900/50 p-3 sm:p-4 mb-6">
            <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Content Gate - Приоритет выбора</span>
            </h4>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-emerald-900/30 border border-emerald-800">
                <span className="text-xs font-mono text-emerald-400">1.</span>
                <span className="text-xs text-neutral-300">ACTIVE</span>
                <span className="text-xs text-neutral-500 hidden sm:inline">(rpb &ge; 0.3)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600 hidden md:block" />
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-amber-900/30 border border-amber-800">
                <span className="text-xs font-mono text-amber-400">2.</span>
                <span className="text-xs text-neutral-300">PROBATION</span>
                <span className="text-xs text-neutral-500 hidden sm:inline">(20%)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600 hidden md:block" />
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-orange-900/30 border border-orange-800">
                <span className="text-xs font-mono text-orange-400">3.</span>
                <span className="text-xs text-neutral-300">FLAGGED</span>
                <span className="text-xs text-neutral-500 hidden sm:inline">(если нужно)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600 hidden md:block" />
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-red-900/30 border border-red-800">
                <span className="text-xs font-mono text-red-400">X</span>
                <span className="text-xs text-neutral-300 line-through">
                  RETIRED
                </span>
                <span className="text-xs text-neutral-500 hidden sm:inline">(никогда)</span>
              </div>
            </div>
          </div>

          {/* Key Formulas - Mobile responsive grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 mb-6">
            <div className="rounded-xl border bg-neutral-900/50 p-4">
              <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>Формула Gap (Job Fit)</span>
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-2 rounded bg-neutral-800 text-amber-400">
                  adjustedThreshold = 0.2 * (100 - strictness) / 100
                </div>
                <div className="p-2 rounded bg-neutral-800 text-emerald-400">
                  gap = benchmark - candidateScore
                </div>
                <div className="text-neutral-500">
                  Gap &gt; threshold = ADVANCED вопросы
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-neutral-900/50 p-4">
              <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Формула Saturation (Team Fit)</span>
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-2 rounded bg-neutral-800 text-blue-400">
                  saturation = coverage * (avgScore / 5.0)
                </div>
                <div className="p-2 rounded bg-neutral-800 text-purple-400">
                  questionsCount = f(saturation)
                </div>
                <div className="text-neutral-500">
                  Низкая saturation = больше вопросов
                </div>
              </div>
            </div>
          </div>

          <Callout type="tip" title="Подробнее">
            <p>
              Ниже представлена полная документация с алгоритмами, примерами
              конфигурации Blueprint и визуализациями для каждой стратегии
              сборки.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 1: Overview ===== */}
        <section id="overview">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Обзор архитектуры
          </h2>
          <p className="text-muted-foreground mb-4">
            Система сборки тестов использует <strong>Strategy Pattern</strong> -
            три независимых алгоритма сборки, выбираемых на основе цели
            тестирования. Каждая стратегия получает конфигурацию через
            Blueprint DTO и возвращает список UUID выбранных вопросов.
          </p>

          <ResponsiveDiagram title="Архитектура системы сборки тестов" maxHeight={500}>
            <MermaidDiagram
              chart={`
flowchart TB
    subgraph input["ВХОДНЫЕ ДАННЫЕ"]
        A["TestTemplate"]
        B["Blueprint DTO"]
    end

    subgraph strategy["ВЫБОР СТРАТЕГИИ"]
        S{"AssessmentGoal?"}
        S1["OverviewAssembler"]
        S2["JobFitAssembler"]
        S3["TeamFitAssembler"]
    end

    subgraph processing["ОБРАБОТКА"]
        P1["Fetch Data"]
        P2["Content Gate"]
        P3["Select Questions"]
    end

    subgraph output["РЕЗУЛЬТАТ"]
        O["List&lt;UUID&gt; questionIds"]
    end

    A --> B
    B --> S
    S -->|OVERVIEW| S1
    S -->|JOB_FIT| S2
    S -->|TEAM_FIT| S3

    S1 --> P1
    S2 --> P1
    S3 --> P1

    P1 --> P2
    P2 --> P3
    P3 --> O

    style input fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    style strategy fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style processing fill:#581c87,stroke:#a855f7,color:#f3e8ff
    style output fill:#14532d,stroke:#22c55e,color:#dcfce7
`}
            />
          </ResponsiveDiagram>

          <Callout type="info" title="Strategy Pattern">
            <p>
              Каждая стратегия сборки реализует интерфейс{" "}
              <code>TestAssembler</code> с методом{" "}
              <code>assemble(TestBlueprintDto blueprint)</code>. Это позволяет
              добавлять новые стратегии без изменения существующего кода.
            </p>
          </Callout>

          <FlowDiagram
            steps={[
              "Blueprint",
              "Assembler",
              "Content Gate",
              "Вопросы",
              "TestSession",
            ]}
          />
        </section>

        {/* ===== SECTION 2: Test Goals ===== */}
        <section id="test-goals">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Цели тестирования
          </h2>
          <p className="text-muted-foreground mb-4">
            Система поддерживает три цели тестирования. Каждая определяет
            уникальную логику сборки, источники данных и критерии выбора
            вопросов.
          </p>

          {/* Comparison Table - Mobile responsive with horizontal scroll */}
          <ScrollableTable className="my-6">
            <table className="w-full border-collapse text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 sm:p-3 font-semibold whitespace-nowrap sticky left-0 bg-muted/50 z-10">Цель</th>
                  <th className="text-left p-2 sm:p-3 font-semibold">Назначение</th>
                  <th className="text-left p-2 sm:p-3 font-semibold">Источник данных</th>
                  <th className="text-left p-2 sm:p-3 font-semibold">Алгоритм</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium sticky left-0 bg-background z-10">OVERVIEW</td>
                  <td className="p-2 sm:p-3 text-muted-foreground">
                    Паспорт компетенций
                  </td>
                  <td className="p-2 sm:p-3">Выбранные competencyIds</td>
                  <td className="p-2 sm:p-3">Waterfall Distribution</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium sticky left-0 bg-background z-10">JOB_FIT</td>
                  <td className="p-2 sm:p-3 text-muted-foreground">
                    Соответствие должности
                  </td>
                  <td className="p-2 sm:p-3">O*NET SOC Profile</td>
                  <td className="p-2 sm:p-3">Gap-Based Priority</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 sm:p-3 font-medium sticky left-0 bg-background z-10">TEAM_FIT</td>
                  <td className="p-2 sm:p-3 text-muted-foreground">
                    Совместимость с командой
                  </td>
                  <td className="p-2 sm:p-3">Team Saturation Profile</td>
                  <td className="p-2 sm:p-3">Saturation-Based Priority</td>
                </tr>
              </tbody>
            </table>
          </ScrollableTable>

          {/* Overview Assembly */}
          <div id="overview-assembly" className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-neutral-400" />
              Сборка Overview (Паспорт компетенций)
            </h3>
            <p className="text-muted-foreground mb-4">
              Создает сбалансированный тест для общего профиля компетенций.
              Использует алгоритм &quot;Waterfall&quot; для равномерного покрытия
              всех индикаторов.
            </p>

            <div className="rounded-lg border p-4 mb-4">
              <h4 className="font-medium mb-2">Алгоритм Waterfall Distribution:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Получить все <code>BehavioralIndicator</code> для выбранных
                  компетенций
                </li>
                <li>
                  Отсортировать индикаторы по весу (weight) по убыванию
                </li>
                <li>
                  Для каждого индикатора отфильтровать вопросы с{" "}
                  <strong>INTERMEDIATE</strong> сложностью
                </li>
                <li>
                  Round-robin распределение: цикл по индикаторам, выбор по 1
                  вопросу за раунд
                </li>
                <li>
                  Повторять до достижения лимита (по умолчанию 3 вопроса на
                  индикатор)
                </li>
              </ol>
            </div>

            <MermaidDiagram
              title="Waterfall Distribution: 3 индикатора, 3 вопроса каждый"
              chart={`
flowchart TB
    subgraph round1["РАУНД 1"]
        I1Q1["I1: Q1"]
        I2Q1["I2: Q1"]
        I3Q1["I3: Q1"]
    end

    subgraph round2["РАУНД 2"]
        I1Q2["I1: Q2"]
        I2Q2["I2: Q2"]
        I3Q2["I3: Q2"]
    end

    subgraph round3["РАУНД 3"]
        I1Q3["I1: Q3"]
        I2Q3["I2: Q3"]
        I3Q3["I3: Q3"]
    end

    I1Q1 --> I2Q1 --> I3Q1 --> I1Q2 --> I2Q2 --> I3Q2 --> I1Q3 --> I2Q3 --> I3Q3

    style round1 fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    style round2 fill:#581c87,stroke:#a855f7,color:#f3e8ff
    style round3 fill:#14532d,stroke:#22c55e,color:#dcfce7
`}
            />

            <Callout type="note" title="Преимущество Waterfall">
              <p>
                Если тест прерывается досрочно, каждый индикатор уже получил хотя
                бы один вопрос. Это обеспечивает минимальное покрытие всех
                компетенций даже при неполном прохождении.
              </p>
            </Callout>
          </div>

          {/* Job Fit Assembly */}
          <div id="jobfit-assembly" className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Сборка Job Fit (Соответствие должности)
            </h3>
            <p className="text-muted-foreground mb-4">
              Анализирует разрывы между требованиями должности (O*NET) и
              текущим уровнем кандидата. Концентрирует вопросы на критичных
              областях.
            </p>

            <div className="rounded-lg border p-4 mb-4">
              <h4 className="font-medium mb-2">Алгоритм Gap-Based Priority:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Загрузить O*NET профиль по SOC коду (benchmarks)
                </li>
                <li>
                  Если есть Competency Passport - рассчитать gap = benchmark -
                  score
                </li>
                <li>
                  Рассчитать порог значимости:{" "}
                  <code>adjustedThreshold = 0.2 * (100 - strictness) / 100</code>
                </li>
                <li>
                  Отсортировать gaps по убыванию (самые большие разрывы первыми)
                </li>
                <li>
                  Для значительных gaps (gap &gt; threshold) - выбрать{" "}
                  <strong>ADVANCED</strong> вопросы
                </li>
                <li>
                  Для меньших gaps - выбрать <strong>INTERMEDIATE</strong>{" "}
                  вопросы
                </li>
                <li>До 5 вопросов на каждую область с разрывом</li>
              </ol>
            </div>

            {/* Gap Threshold Formula */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <MathBlock
                tex="\text{adjustedThreshold} = 0.2 \times \frac{100 - \text{strictnessLevel}}{100}"
                label="Формула расчета адаптивного порога значимости разрыва"
                variant="emerald"
              />
              <div className="text-center text-xs text-neutral-500 -mt-2 mb-4">
                Чем выше строгость - тем ниже порог - тем больше gaps считаются
                значимыми
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400">
                      Строгость
                    </th>
                    <th className="text-left p-2 text-neutral-400">Расчет</th>
                    <th className="text-right p-2 text-emerald-400">Порог</th>
                    <th className="text-right p-2 text-amber-400">Сложность</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2">
                      0{" "}
                      <span className="text-neutral-500 text-xs">
                        (минимум)
                      </span>
                    </td>
                    <td className="p-2 font-mono text-xs">
                      0.2 * (100-0) / 100
                    </td>
                    <td className="p-2 text-right font-mono text-emerald-400">
                      0.20
                    </td>
                    <td className="p-2 text-right text-amber-400">
                      Только большие gaps
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2">50</td>
                    <td className="p-2 font-mono text-xs">
                      0.2 * (100-50) / 100
                    </td>
                    <td className="p-2 text-right font-mono text-lime-400">
                      0.10
                    </td>
                    <td className="p-2 text-right text-amber-400">
                      Средние и большие gaps
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">
                      100{" "}
                      <span className="text-neutral-500 text-xs">
                        (максимум)
                      </span>
                    </td>
                    <td className="p-2 font-mono text-xs">
                      0.2 * (100-100) / 100
                    </td>
                    <td className="p-2 text-right font-mono text-red-400">
                      0.00
                    </td>
                    <td className="p-2 text-right text-red-400">
                      Все gaps значимы
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Callout type="tip" title="Delta Testing">
              <p>
                Если у кандидата уже есть Competency Passport (результаты
                Overview теста), система использует его данные для расчета gaps.
                Это позволяет сократить тест, оценивая только области с
                разрывами.
              </p>
            </Callout>
          </div>

          {/* Team Fit Assembly */}
          <div id="teamfit-assembly" className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Сборка Team Fit (Совместимость с командой)
            </h3>
            <p className="text-muted-foreground mb-4">
              Анализирует &quot;насыщенность&quot; команды по компетенциям и
              фокусирует тест на областях, где команде не хватает экспертизы.
            </p>

            <div className="rounded-lg border p-4 mb-4">
              <h4 className="font-medium mb-2">
                Алгоритм Saturation-Based Priority:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Загрузить профиль команды (saturation по компетенциям)
                </li>
                <li>
                  Определить undersaturated компетенции (saturation &lt;
                  threshold)
                </li>
                <li>Отсортировать по saturation (самые низкие первыми)</li>
                <li>
                  Рассчитать количество вопросов на основе уровня saturation
                </li>
                <li>
                  Выбрать вопросы из индикаторов, отсортированных по весу
                </li>
              </ol>
            </div>

            {/* Saturation-based question count */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <h4 className="font-medium text-neutral-200 mb-3">
                Динамический расчет количества вопросов
              </h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400">
                      Saturation
                    </th>
                    <th className="text-left p-2 text-neutral-400">
                      Интерпретация
                    </th>
                    <th className="text-center p-2 text-blue-400">
                      Вопросов
                    </th>
                    <th className="text-left p-2 text-neutral-400">
                      Обоснование
                    </th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono text-red-400">&lt; 0.1</td>
                    <td className="p-2 text-neutral-400">Критический разрыв</td>
                    <td className="p-2 text-center font-mono font-bold text-red-400">
                      6
                    </td>
                    <td className="p-2 text-xs text-neutral-500">
                      Команде критически нужен этот навык
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono text-orange-400">&lt; 0.3</td>
                    <td className="p-2 text-neutral-400">Умеренный разрыв</td>
                    <td className="p-2 text-center font-mono font-bold text-orange-400">
                      4
                    </td>
                    <td className="p-2 text-xs text-neutral-500">
                      Команде не хватает экспертизы
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-mono text-amber-400">&lt; 0.5</td>
                    <td className="p-2 text-neutral-400">Небольшой разрыв</td>
                    <td className="p-2 text-center font-mono font-bold text-amber-400">
                      3
                    </td>
                    <td className="p-2 text-xs text-neutral-500">
                      Усиление будет полезно
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-emerald-400">&ge; 0.5</td>
                    <td className="p-2 text-neutral-400">
                      Минимальный разрыв
                    </td>
                    <td className="p-2 text-center font-mono font-bold text-emerald-400">
                      2
                    </td>
                    <td className="p-2 text-xs text-neutral-500">
                      Базовая проверка совместимости
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Callout type="note" title="Saturation Formula">
              <p>
                <strong>saturation = coverage * (avgScore / 5.0)</strong>
                <br />
                Coverage - процент членов команды с данной компетенцией.
                avgScore - средний балл тех, у кого она есть.
              </p>
            </Callout>
          </div>
        </section>

        {/* ===== SECTION 3: Blueprints ===== */}
        <section id="blueprints">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Конфигурация Blueprint
          </h2>
          <p className="text-muted-foreground mb-4">
            Blueprint - это DTO с конфигурацией для сборки теста. Каждая цель
            тестирования имеет свой тип Blueprint с уникальными параметрами.
          </p>

          {/* Overview Blueprint */}
          <div className="rounded-xl border bg-card overflow-hidden mb-4">
            <div className="flex items-center gap-3 p-4 bg-neutral-500/10 border-b border-neutral-500/20">
              <div className="w-8 h-8 rounded-full bg-neutral-500/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">OverviewBlueprint</h3>
                <p className="text-xs text-muted-foreground">
                  AssessmentGoal.OVERVIEW
                </p>
              </div>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Параметр</th>
                    <th className="text-left p-2 font-medium">Тип</th>
                    <th className="text-left p-2 font-medium">По умолчанию</th>
                    <th className="text-left p-2 font-medium">Описание</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="p-2 font-mono text-foreground">
                      competencyIds
                    </td>
                    <td className="p-2">
                      <code>List&lt;UUID&gt;</code>
                    </td>
                    <td className="p-2 text-amber-500">required</td>
                    <td className="p-2">
                      Список ID компетенций для включения в тест
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-foreground">
                      includeBigFive
                    </td>
                    <td className="p-2">
                      <code>boolean</code>
                    </td>
                    <td className="p-2 font-mono">true</td>
                    <td className="p-2">
                      Включать вопросы для Big Five профиля
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Job Fit Blueprint */}
          <div className="rounded-xl border bg-card overflow-hidden mb-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border-b border-emerald-500/20">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">JobFitBlueprint</h3>
                <p className="text-xs text-muted-foreground">
                  AssessmentGoal.JOB_FIT
                </p>
              </div>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Параметр</th>
                    <th className="text-left p-2 font-medium">Тип</th>
                    <th className="text-left p-2 font-medium">По умолчанию</th>
                    <th className="text-left p-2 font-medium">Описание</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="p-2 font-mono text-foreground">onetSocCode</td>
                    <td className="p-2">
                      <code>String</code>
                    </td>
                    <td className="p-2 text-amber-500">required</td>
                    <td className="p-2">
                      O*NET SOC код формата XX-XXXX.XX
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-foreground">
                      strictnessLevel
                    </td>
                    <td className="p-2">
                      <code>int (0-100)</code>
                    </td>
                    <td className="p-2 font-mono">50</td>
                    <td className="p-2">
                      Уровень строгости (влияет на порог gaps)
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 p-3 rounded bg-emerald-950/30 border border-emerald-800/50">
                <div className="text-xs text-neutral-400 mb-2">
                  Паттерн SOC кода:
                </div>
                <code className="text-emerald-400">
                  \d{"{2}"}-\d{"{4}"}.\d{"{2}"}
                </code>
                <div className="text-xs text-neutral-500 mt-2">
                  Примеры: &quot;15-1252.00&quot; (Software Developers),
                  &quot;11-9199.00&quot; (Managers)
                </div>
              </div>
            </div>
          </div>

          {/* Team Fit Blueprint */}
          <div className="rounded-xl border bg-card overflow-hidden mb-4">
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 border-b border-blue-500/20">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">TeamFitBlueprint</h3>
                <p className="text-xs text-muted-foreground">
                  AssessmentGoal.TEAM_FIT
                </p>
              </div>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Параметр</th>
                    <th className="text-left p-2 font-medium">Тип</th>
                    <th className="text-left p-2 font-medium">По умолчанию</th>
                    <th className="text-left p-2 font-medium">Описание</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="p-2 font-mono text-foreground">teamId</td>
                    <td className="p-2">
                      <code>UUID</code>
                    </td>
                    <td className="p-2 text-amber-500">required</td>
                    <td className="p-2">UUID команды для анализа</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-foreground">
                      saturationThreshold
                    </td>
                    <td className="p-2">
                      <code>double (0-1)</code>
                    </td>
                    <td className="p-2 font-mono">0.75</td>
                    <td className="p-2">
                      Порог насыщенности (выше = терпит больше overlap)
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 p-3 rounded bg-blue-950/30 border border-blue-800/50">
                <div className="text-xs text-neutral-400 mb-2">
                  Интерпретация saturationThreshold:
                </div>
                <ul className="text-xs text-neutral-500 space-y-1">
                  <li>
                    <span className="text-red-400">0.25</span> - Предпочитает
                    разнообразие, быстро считает роли saturated
                  </li>
                  <li>
                    <span className="text-amber-400">0.50</span> - Сбалансированный
                    подход
                  </li>
                  <li>
                    <span className="text-emerald-400">0.75</span> - Толерантен к
                    overlap, меньше undersaturated компетенций
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 4: Psychometric Gate ===== */}
        <section id="psychometric-gate">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Психометрическая фильтрация (Content Gate)
          </h2>
          <p className="text-muted-foreground mb-4">
            Content Gate - критический этап сборки, фильтрующий вопросы по их
            психометрическому качеству. Гарантирует, что в тесты попадают
            только валидированные инструменты измерения.
          </p>

          {/* Status Priority Diagram */}
          <div className="rounded-xl border bg-neutral-900/50 p-6 mb-6">
            <h4 className="font-semibold text-neutral-200 mb-4 text-center">
              Приоритет выбора по статусу валидности
            </h4>
            <div className="flex flex-col items-center gap-3">
              {/* Priority 1: Active */}
              <div className="w-full max-w-lg p-4 rounded-lg bg-emerald-900/30 border border-emerald-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-400">
                        ACTIVE
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                        Приоритет 1
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Валидированные вопросы с rpb &ge; 0.3, p в допустимом
                      диапазоне. Основной пул для сборки.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">
                      ~70%
                    </div>
                    <div className="text-xs text-neutral-500">от теста</div>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-neutral-600 rotate-90" />

              {/* Priority 2: Probation */}
              <div className="w-full max-w-lg p-4 rounded-lg bg-amber-900/30 border border-amber-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/30 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-400">
                        PROBATION
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-800 text-amber-200">
                        Приоритет 2
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Новые вопросы с &lt; 50 ответами. Включаются для сбора
                      статистики (лимит 20%).
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">20%</div>
                    <div className="text-xs text-neutral-500">максимум</div>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-neutral-600 rotate-90" />

              {/* Priority 3: Flagged */}
              <div className="w-full max-w-lg p-4 rounded-lg bg-orange-900/30 border border-orange-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-400">
                        FLAGGED_FOR_REVIEW
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-orange-800 text-orange-200">
                        Приоритет 3
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Вопросы с пограничными метриками (rpb 0.1-0.3). Только если
                      не хватает ACTIVE/PROBATION.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">
                      ~10%
                    </div>
                    <div className="text-xs text-neutral-500">если нужно</div>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-neutral-600 rotate-90" />

              {/* Never: Retired */}
              <div className="w-full max-w-lg p-4 rounded-lg bg-red-900/30 border border-red-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center">
                    <Ban className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-400 line-through">
                        RETIRED
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-800 text-red-200">
                        НИКОГДА
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Токсичные вопросы с rpb &lt; 0. Автоматически исключаются
                      из всех тестов.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-400">0%</div>
                    <div className="text-xs text-neutral-500">исключены</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="rounded-lg border p-4 mb-4">
            <h4 className="font-medium mb-3">Конфигурация Content Gate:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded bg-muted/50">
                <Sliders className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <code className="text-sm font-mono">
                    skillsoft.psychometrics.enabled
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Включить психометрическую фильтрацию. По умолчанию:{" "}
                    <code>true</code>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded bg-muted/50">
                <BarChart3 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <code className="text-sm font-mono">
                    skillsoft.psychometrics.probation-percentage
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Процент PROBATION вопросов в тесте. По умолчанию:{" "}
                    <code>20</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Callout type="warning" title="Важно: Отключение фильтрации">
            <p>
              Если <code>psychometrics.enabled=false</code>, Content Gate
              пропускается и все активные вопросы считаются eligible. Это может
              включить в тест вопросы с низким качеством измерения.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 5: Question Selection ===== */}
        <section id="question-selection">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Алгоритмы выбора вопросов
          </h2>
          <p className="text-muted-foreground mb-4">
            После Content Gate каждая стратегия применяет свой алгоритм для
            окончательного выбора и упорядочивания вопросов.
          </p>

          <div className="space-y-4">
            {/* Overview Selection */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-neutral-400" />
                <h4 className="font-semibold">Overview: Waterfall Selection</h4>
              </div>
              <Steps>
                <Step title="Сортировка индикаторов">
                  <code>indicators.sort(by: weight, order: DESC)</code>
                </Step>
                <Step title="Фильтрация по сложности">
                  <code>questions.filter(difficultyLevel == INTERMEDIATE)</code>
                </Step>
                <Step title="Round-robin по индикаторам">
                  <code>
                    for round in 1..3: for indicator in indicators: select 1
                    question
                  </code>
                </Step>
                <Step title="Исключение дубликатов">
                  <code>usedQuestions.add(questionId)</code>
                </Step>
              </Steps>
            </div>

            {/* Job Fit Selection */}
            <div className="rounded-lg border border-emerald-800/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold">Job Fit: Gap-Priority Selection</h4>
              </div>
              <Steps>
                <Step title="Получение O*NET профиля">
                  <code>onetService.getProfile(socCode) -&gt; benchmarks</code>
                </Step>
                <Step title="Расчет gaps">
                  <code>
                    gaps = benchmarks.map(comp =&gt; comp.benchmark -
                    passportScore)
                  </code>
                </Step>
                <Step title="Сортировка по значимости">
                  <code>gaps.sort(by: gap, order: DESC)</code>
                </Step>
                <Step title="Выбор сложности">
                  <code>
                    difficulty = gap &gt; threshold ? ADVANCED : INTERMEDIATE
                  </code>
                </Step>
                <Step title="Лимит на gap">
                  <code>
                    questions.limit(DEFAULT_QUESTIONS_PER_GAP = 5)
                  </code>
                </Step>
              </Steps>
            </div>

            {/* Team Fit Selection */}
            <div className="rounded-lg border border-blue-800/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold">
                  Team Fit: Saturation-Priority Selection
                </h4>
              </div>
              <Steps>
                <Step title="Получение профиля команды">
                  <code>
                    teamService.getTeamProfile(teamId) -&gt; saturationMap
                  </code>
                </Step>
                <Step title="Фильтрация undersaturated">
                  <code>
                    undersaturated = competencies.filter(saturation &lt;
                    threshold)
                  </code>
                </Step>
                <Step title="Сортировка по saturation">
                  <code>
                    undersaturated.sort(by: saturation, order: ASC)
                  </code>
                </Step>
                <Step title="Динамический лимит">
                  <code>questionsCount = calculateQuestionsForSaturation(sat)</code>
                </Step>
                <Step title="Выбор по весу индикаторов">
                  <code>indicators.sort(by: weight, order: DESC).take(limit)</code>
                </Step>
              </Steps>
            </div>
          </div>
        </section>

        {/* ===== SECTION 6: External Services ===== */}
        <section id="external-services">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Внешние сервисы
          </h2>
          <p className="text-muted-foreground mb-4">
            Стратегии Job Fit и Team Fit зависят от внешних сервисов для
            получения бенчмарков и профилей.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {/* O*NET Service */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="p-3 sm:p-4 bg-emerald-500/10 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h4 className="font-semibold text-sm sm:text-base">OnetService</h4>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Интеграция с O*NET для Job Fit
                </p>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Метод:</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    getProfile(socCode): OnetProfile?
                  </code>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Возвращает:</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    benchmarks: Map&lt;String, Double&gt;
                  </code>
                </div>
                <div className="p-2 rounded bg-emerald-950/30 text-xs">
                  <div className="text-neutral-400 mb-1">Примеры SOC:</div>
                  <ul className="text-neutral-500 space-y-0.5">
                    <li>15-1252.00 - Software Developers</li>
                    <li>11-9199.00 - Managers, All Other</li>
                    <li>13-1161.00 - Market Research Analysts</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Team Service */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold">TeamService</h4>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Анализ состава команды для Team Fit
                </p>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Методы:</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded block mb-1">
                    getTeamProfile(teamId): TeamProfile?
                  </code>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    getUndersaturatedCompetencies(teamId, threshold): List
                  </code>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">TeamProfile:</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    competencySaturation: Map&lt;UUID, Double&gt;
                  </code>
                </div>
                <div className="p-2 rounded bg-blue-950/30 text-xs">
                  <div className="text-neutral-400 mb-1">Saturation calc:</div>
                  <code className="text-neutral-500">
                    saturation = coverage * (avgScore / 5.0)
                  </code>
                </div>
              </div>
            </div>
          </div>

          <Callout type="info" title="PassportService">
            <p>
              <code>PassportService</code> используется для проверки наличия
              Competency Passport у кандидата. Если паспорт есть, его данные
              используются для Delta Testing в Job Fit.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 7: Examples ===== */}
        <section id="examples">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Примеры конфигурации
          </h2>
          <p className="text-muted-foreground mb-6">
            JSON-примеры Blueprint для каждого типа теста.
          </p>

          {/* Example 1: Overview */}
          <div className="rounded-xl border bg-neutral-900 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 p-4 border-b border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100">
                    Пример: Overview Blueprint
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Создание паспорта компетенций
                  </p>
                </div>
              </div>
            </div>
            <CodeBlock
              language="json"
              filename="overview-blueprint.json"
              code={`{
  "strategy": "OVERVIEW",
  "competencyIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ],
  "includeBigFive": true,
  "adaptivity": {
    "enabled": false
  }
}`}
            />
          </div>

          {/* Example 2: Job Fit */}
          <div className="rounded-xl border bg-neutral-900 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-emerald-900/50 to-neutral-900 p-4 border-b border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100">
                    Пример: Job Fit Blueprint
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Оценка соответствия должности Software Developer
                  </p>
                </div>
              </div>
            </div>
            <CodeBlock
              language="json"
              filename="jobfit-blueprint.json"
              code={`{
  "strategy": "JOB_FIT",
  "onetSocCode": "15-1252.00",
  "strictnessLevel": 65,
  "adaptivity": {
    "enabled": true,
    "initialDifficulty": "INTERMEDIATE",
    "adjustmentStep": 0.1
  }
}`}
            />
            <div className="px-4 pb-4">
              <div className="p-3 rounded bg-emerald-950/30 border border-emerald-800/50 text-xs">
                <div className="text-emerald-400 mb-2">Результат:</div>
                <ul className="text-neutral-400 space-y-1">
                  <li>
                    Порог gap:{" "}
                    <code className="text-emerald-300">
                      0.2 * (100-65) / 100 = 0.07
                    </code>
                  </li>
                  <li>Большинство gaps будут считаться значимыми</li>
                  <li>
                    Будут выбраны преимущественно ADVANCED вопросы
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Example 3: Team Fit */}
          <div className="rounded-xl border bg-neutral-900 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-900/50 to-neutral-900 p-4 border-b border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100">
                    Пример: Team Fit Blueprint
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Оценка совместимости с командой разработки
                  </p>
                </div>
              </div>
            </div>
            <CodeBlock
              language="json"
              filename="teamfit-blueprint.json"
              code={`{
  "strategy": "TEAM_FIT",
  "teamId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "saturationThreshold": 0.5,
  "adaptivity": {
    "enabled": false
  }
}`}
            />
            <div className="px-4 pb-4">
              <div className="p-3 rounded bg-blue-950/30 border border-blue-800/50 text-xs">
                <div className="text-blue-400 mb-2">Результат:</div>
                <ul className="text-neutral-400 space-y-1">
                  <li>
                    Все компетенции с saturation &lt; 0.5 считаются
                    undersaturated
                  </li>
                  <li>
                    Количество вопросов зависит от уровня saturation
                  </li>
                  <li>Фокус на областях, где команде нужно усиление</li>
                </ul>
              </div>
            </div>
          </div>

          <Callout type="tip" title="Валидация">
            <p>
              Все Blueprint проходят валидацию перед сборкой. Ошибки валидации
              (например, невалидный SOC код или отсутствующий teamId)
              возвращаются как HTTP 400 Bad Request с описанием проблемы.
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
