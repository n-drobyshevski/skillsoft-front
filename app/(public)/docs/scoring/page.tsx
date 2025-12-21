import { Metadata } from "next";
import {
  Zap,
  FileText,
  Scale,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Target,
  Calculator,
  User,
  ChevronRight,
  Briefcase,
  Users,
} from "lucide-react";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import {
  Callout,
  FlowDiagram,
  Steps,
  Step,
  HierarchyDiagram,
  MermaidDiagram,
  MathBlock,
  InlineMath,
} from "../_components/mdx";

// Route segment configuration for static generation
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Система оценивания | Документация | SkillSoft",
  description:
    "Полное руководство по расчету баллов, агрегации результатов и сценариям оценивания в SkillSoft",
};

const tocItems = [
  { id: "tldr", title: "TL;DR", level: 2 },
  { id: "overview", title: "Обзор системы", level: 2 },
  { id: "question-types", title: "Типы вопросов и оценка", level: 2 },
  { id: "likert", title: "Шкала Лайкерта", level: 3 },
  { id: "sjt", title: "Ситуационные суждения", level: 3 },
  { id: "mcq", title: "Множественный выбор", level: 3 },
  { id: "aggregation", title: "Иерархия агрегации", level: 2 },
  { id: "scenarios", title: "Сценарии оценивания", level: 2 },
  { id: "scenario-overview", title: "Обзор компетенций", level: 3 },
  { id: "scenario-jobfit", title: "Соответствие должности", level: 3 },
  { id: "scenario-teamfit", title: "Совместимость с командой", level: 3 },
  { id: "thresholds", title: "Расчет порога прохождения", level: 2 },
  { id: "percentiles", title: "Перцентили", level: 2 },
  { id: "examples", title: "Примеры расчета", level: 2 },
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
          Полное руководство по расчету баллов, агрегации результатов и
          формированию итоговых оценок в SkillSoft. Узнайте, как работает
          система оценивания для разных сценариев тестирования.
        </p>
      </div>

      {/* Main Content */}
      <div className="docs-prose">
        {/* ===== TL;DR Section ===== */}
        <section id="tldr">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            TL;DR — Краткая справка
          </h2>

          {/* Core Principle */}
          <div className="rounded-xl border bg-gradient-to-br from-neutral-900 to-neutral-800 p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-100">Главный принцип</h3>
                <p className="text-sm text-neutral-400">Все оценки нормализуются в [0, 1] перед агрегацией</p>
              </div>
            </div>

            {/* Flow Diagram */}
            <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
              <div className="px-3 py-1.5 rounded-lg bg-blue-900/50 border border-blue-700 text-blue-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Ответы</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
              <div className="px-3 py-1.5 rounded-lg bg-amber-900/50 border border-amber-700 text-amber-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Нормализация</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
              <div className="px-3 py-1.5 rounded-lg bg-purple-900/50 border border-purple-700 text-purple-300 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Агрегация</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
              <div className="px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-700 text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Результат</span>
              </div>
            </div>
          </div>

          {/* Three Columns: Question Types, Scenarios, Formulas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Column 1: Question Types */}
            <div className="rounded-xl border bg-neutral-900/50 p-4">
              <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>Типы вопросов</span>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">Likert (1-5)</span>
                  <span className="font-mono text-blue-400">70%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">SJT (ситуации)</span>
                  <span className="font-mono text-blue-400">25%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">MCQ (верно/неверно)</span>
                  <span className="font-mono text-blue-400">5%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-800">
                <div className="text-xs text-neutral-500 mb-1">Нормализация:</div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="text-neutral-300">Likert: <span className="text-emerald-400">(v-1)/4</span></div>
                  <div className="text-neutral-300">SJT: <span className="text-emerald-400">score/max</span></div>
                  <div className="text-neutral-300">MCQ: <span className="text-emerald-400">0 или 1</span></div>
                </div>
              </div>
            </div>

            {/* Column 2: Scenarios */}
            <div className="rounded-xl border bg-neutral-900/50 p-4">
              <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Сценарии</span>
              </h4>
              <div className="space-y-3">
                <div className="p-2 rounded-lg bg-neutral-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-xs bg-neutral-700 text-neutral-300">A</span>
                    <span className="text-sm font-medium text-neutral-200">Overview</span>
                  </div>
                  <div className="text-xs text-neutral-500">Паспорт компетенций • Равные веса</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-900/20 border border-emerald-900/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-xs bg-emerald-900 text-emerald-400">B</span>
                    <span className="text-sm font-medium text-neutral-200">Job Fit</span>
                  </div>
                  <div className="text-xs text-neutral-500">Должность • O*NET <span className="text-emerald-400">1.2×</span></div>
                </div>
                <div className="p-2 rounded-lg bg-blue-900/20 border border-blue-900/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-xs bg-blue-900 text-blue-400">C</span>
                    <span className="text-sm font-medium text-neutral-200">Team Fit</span>
                  </div>
                  <div className="text-xs text-neutral-500">Команда • ESCO <span className="text-blue-400">1.15×</span> • Big5 <span className="text-purple-400">1.1×</span></div>
                </div>
              </div>
            </div>

            {/* Column 3: Key Formulas */}
            <div className="rounded-xl border bg-neutral-900/50 p-4">
              <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Ключевые формулы</span>
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-neutral-500 mb-1">Агрегация:</div>
                  <div className="p-2 rounded bg-neutral-800 text-emerald-400">
                    Σ(Cᵢ × Wᵢ) / Σ(Wᵢ)
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1">Порог Job Fit:</div>
                  <div className="p-2 rounded bg-neutral-800 text-amber-400">
                    50% + (strict/100) × 30%
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1">Порог Team Fit:</div>
                  <div className="p-2 rounded bg-neutral-800 text-blue-400">
                    ≥60% AND diversity≥30%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weight Multipliers Quick Reference */}
          <div className="rounded-xl border bg-neutral-900/50 p-4 mb-6">
            <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Множители весов</span>
            </h4>
            <div className="flex flex-wrap gap-3 justify-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/30 border border-emerald-800">
                <span className="text-xs text-neutral-400">O*NET:</span>
                <span className="font-mono font-bold text-emerald-400">1.2×</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/30 border border-blue-800">
                <span className="text-xs text-neutral-400">ESCO:</span>
                <span className="font-mono font-bold text-blue-400">1.15×</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-900/30 border border-purple-800">
                <span className="text-xs text-neutral-400">Big Five:</span>
                <span className="font-mono font-bold text-purple-400">1.1×</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-900/30 border border-indigo-800">
                <span className="text-xs text-neutral-400">ESCO + Big5:</span>
                <span className="font-mono font-bold text-indigo-400">1.265×</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700">
                <span className="text-xs text-neutral-400">Базовый:</span>
                <span className="font-mono font-bold text-neutral-400">1.0×</span>
              </div>
            </div>
          </div>

          {/* Aggregation Hierarchy */}
          <div className="rounded-xl border bg-neutral-900/50 p-4 mb-6">
            <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Иерархия агрегации</span>
            </h4>
            <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-blue-900/50 border border-blue-700 flex items-center justify-center mb-1">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs text-neutral-400">Вопросы</div>
                <div className="text-xs text-blue-400 font-mono">avg()</div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-purple-900/50 border border-purple-700 flex items-center justify-center mb-1">
                  <ClipboardList className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-xs text-neutral-400">Индикаторы</div>
                <div className="text-xs text-purple-400 font-mono">Σ(I×W)</div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-amber-900/50 border border-amber-700 flex items-center justify-center mb-1">
                  <Target className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-xs text-neutral-400">Компетенции</div>
                <div className="text-xs text-amber-400 font-mono">Σ(C×W)/ΣW</div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-emerald-900/50 border border-emerald-700 flex items-center justify-center mb-1">
                  <User className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-xs text-neutral-400">Профиль</div>
                <div className="text-xs text-emerald-400 font-mono">final%</div>
              </div>
            </div>
          </div>

          {/* Threshold Quick Reference */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border bg-neutral-800/50 p-4 text-center">
              <div className="text-xs text-neutral-500 mb-2">Overview порог</div>
              <div className="text-2xl font-mono font-bold text-neutral-300">
                60-70%
              </div>
              <div className="text-xs text-neutral-500 mt-1">из шаблона</div>
            </div>
            <div className="rounded-lg border bg-emerald-900/20 border-emerald-800/50 p-4 text-center">
              <div className="text-xs text-neutral-500 mb-2">Job Fit порог</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                50-80%
              </div>
              <div className="text-xs text-neutral-500 mt-1">динамический</div>
            </div>
            <div className="rounded-lg border bg-blue-900/20 border-blue-800/50 p-4 text-center">
              <div className="text-xs text-neutral-500 mb-2">Team Fit порог</div>
              <div className="text-2xl font-mono font-bold text-blue-400">
                60% + div
              </div>
              <div className="text-xs text-neutral-500 mt-1">два условия</div>
            </div>
          </div>

          <Callout type="tip" title="Подробнее">
            <p>
              Ниже представлена полная документация с формулами, примерами расчета и
              визуализациями для каждого типа вопросов и сценария оценивания.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 1: Overview ===== */}
        <section id="overview">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Обзор системы
          </h2>
          <p className="text-muted-foreground mb-4">
            Система оценивания SkillSoft построена на принципе многоуровневой
            агрегации. Ответы на отдельные вопросы последовательно объединяются
            в оценки поведенческих индикаторов, затем в баллы компетенций, и
            наконец формируют общий профиль сотрудника.
          </p>

          <MermaidDiagram
            title="Конвейер обработки результатов"
            chart={`
flowchart LR
    subgraph input["📝 ОТВЕТЫ"]
        A["Ответы<br/>сотрудника"]
        A1["Likert 1-5<br/>SJT баллы<br/>MCQ 0/1"]
    end

    subgraph norm["⚖️ НОРМАЛИЗАЦИЯ"]
        B["Приведение<br/>к шкале [0-1]"]
        B1["(value-1)/4<br/>score/max<br/>0.0 или 1.0"]
    end

    subgraph agg["📊 АГРЕГАЦИЯ"]
        C["Трехуровневая<br/>иерархия"]
        C1["Вопросы → Индикаторы<br/>Индикаторы → Компетенции<br/>Компетенции → Профиль"]
    end

    subgraph scenario["🎯 СЦЕНАРИЙ"]
        D["Применение<br/>весов и порогов"]
        D1["Overview<br/>JobFit<br/>TeamFit"]
    end

    subgraph result["✅ РЕЗУЛЬТАТ"]
        E["Итоговый балл<br/>+ Статус"]
    end

    A --> B --> C --> D --> E

    A1 -.-> A
    B1 -.-> B
    C1 -.-> C
    D1 -.-> D

    style input fill:#0c4a6e,stroke:#0ea5e9,color:#e0f2fe
    style norm fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style agg fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    style scenario fill:#581c87,stroke:#a855f7,color:#f3e8ff
    style result fill:#14532d,stroke:#22c55e,color:#dcfce7
`}
          />

          <Callout type="info" title="Ключевой принцип">
            <p>
              Все оценки нормализуются в диапазон <strong>[0, 1]</strong> перед
              агрегацией. Это обеспечивает справедливое сравнение разных типов
              вопросов и позволяет применять единые формулы расчета независимо
              от исходной шкалы.
            </p>
          </Callout>

          <FlowDiagram
            steps={[
              "Ответ",
              "Нормализация",
              "Индикатор",
              "Компетенция",
              "Профиль",
            ]}
          />
        </section>

        {/* ===== SECTION 2: Question Types ===== */}
        <section id="question-types">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Типы вопросов и оценка
          </h2>
          <p className="text-muted-foreground mb-4">
            SkillSoft использует три типа вопросов, каждый со своей формулой
            нормализации. Распределение вопросов в тестах: 70% Likert, 25% SJT,
            5% MCQ.
          </p>

          {/* Comparison Table */}
          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Тип вопроса</th>
                  <th className="text-left p-3 font-semibold">
                    Исходная шкала
                  </th>
                  <th className="text-left p-3 font-semibold">
                    Формула нормализации
                  </th>
                  <th className="text-left p-3 font-semibold">Результат</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">Шкала Лайкерта</td>
                  <td className="p-3 text-muted-foreground">1 - 5</td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      (value - 1) / 4
                    </code>
                  </td>
                  <td className="p-3 text-muted-foreground">[0, 1]</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Ситуационные суждения</td>
                  <td className="p-3 text-muted-foreground">0 - maxScore</td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      score / maxScore
                    </code>
                  </td>
                  <td className="p-3 text-muted-foreground">[0, 1]</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Множественный выбор</td>
                  <td className="p-3 text-muted-foreground">верно / неверно</td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      correct ? 1.0 : 0.0
                    </code>
                  </td>
                  <td className="p-3 text-muted-foreground">{"{0, 1}"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Likert Scale */}
          <div id="likert" className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Шкала Лайкерта (Likert Scale)
            </h3>
            <p className="text-muted-foreground mb-4">
              Наиболее распространенный тип вопросов (70% теста). Сотрудник
              выбирает степень согласия с утверждением по 5-балльной шкале.
            </p>

            <div className="rounded-lg border p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  Полностью не согласен
                </span>
                <span className="text-sm text-muted-foreground">
                  Полностью согласен
                </span>
              </div>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                      {n}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {((n - 1) / 4).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Likert Normalization Formula */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <MathBlock
                tex="\text{Нормализованный балл} = \frac{\text{Значение} - 1}{4}"
                label="Формула нормализации Likert: балл минус 1, деленный на 4"
                variant="emerald"
                className="mb-4 mt-0"
              />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400">Ответ</th>
                    <th className="text-left p-2 text-neutral-400">Описание</th>
                    <th className="text-left p-2 text-neutral-400">Расчет</th>
                    <th className="text-right p-2 text-neutral-400">Балл</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium">1</td>
                    <td className="p-2 text-neutral-400">Полностью не согласен</td>
                    <td className="p-2 font-mono text-xs">(1-1)/4</td>
                    <td className="p-2 text-right font-mono text-red-400">0.00</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium">2</td>
                    <td className="p-2 text-neutral-400">Не согласен</td>
                    <td className="p-2 font-mono text-xs">(2-1)/4</td>
                    <td className="p-2 text-right font-mono text-orange-400">0.25</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium">3</td>
                    <td className="p-2 text-neutral-400">Нейтрально</td>
                    <td className="p-2 font-mono text-xs">(3-1)/4</td>
                    <td className="p-2 text-right font-mono text-yellow-400">0.50</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium">4</td>
                    <td className="p-2 text-neutral-400">Согласен</td>
                    <td className="p-2 font-mono text-xs">(4-1)/4</td>
                    <td className="p-2 text-right font-mono text-lime-400">0.75</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">5</td>
                    <td className="p-2 text-neutral-400">Полностью согласен</td>
                    <td className="p-2 font-mono text-xs">(5-1)/4</td>
                    <td className="p-2 text-right font-mono text-emerald-400">1.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Callout type="note" title="Инвертированные вопросы">
              <p>
                Некоторые вопросы формулируются в негативном ключе для проверки
                внимательности. Для таких вопросов шкала автоматически
                инвертируется: ответ 1 дает 1.0, а ответ 5 дает 0.0.
              </p>
            </Callout>
          </div>

          {/* SJT */}
          <div id="sjt" className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Ситуационные суждения (SJT)
            </h3>
            <p className="text-muted-foreground mb-4">
              Вопросы этого типа (25% теста) описывают рабочую ситуацию и
              предлагают несколько вариантов действий. Каждый вариант имеет свой
              вес эффективности.
            </p>

            <div className="rounded-lg border p-4 mb-4 space-y-3">
              <p className="text-sm font-medium">
                Пример: Коллега постоянно опаздывает на совещания. Как вы
                поступите?
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 p-2 rounded bg-emerald-50 dark:bg-emerald-950/30">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    A
                  </span>
                  <span>Поговорю с ним лично о важности пунктуальности</span>
                  <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-medium">
                    4 балла
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded bg-amber-50 dark:bg-amber-950/30">
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    B
                  </span>
                  <span>Начну совещание без него</span>
                  <span className="ml-auto text-amber-600 dark:text-amber-400 font-medium">
                    2 балла
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded bg-red-50 dark:bg-red-950/30">
                  <span className="font-medium text-red-700 dark:text-red-400">
                    C
                  </span>
                  <span>Пожалуюсь руководителю</span>
                  <span className="ml-auto text-red-600 dark:text-red-400 font-medium">
                    1 балл
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="font-medium text-neutral-700 dark:text-neutral-400">
                    D
                  </span>
                  <span>Буду игнорировать ситуацию</span>
                  <span className="ml-auto text-neutral-600 dark:text-neutral-400 font-medium">
                    0 баллов
                  </span>
                </div>
              </div>
            </div>

            {/* SJT Normalization Formula */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <MathBlock
                tex="\text{Нормализованный балл} = \frac{\text{Балл}}{\text{Максимальный балл}}"
                label="Формула нормализации SJT: балл деленный на максимальный балл"
                variant="emerald"
                className="mb-2 mt-0"
              />
              <div className="text-xs text-neutral-500 text-center mb-4">
                В примере ниже <InlineMath label="максимальный балл равен 4">{`\\text{maxScore} = 4`}</InlineMath>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400">Вариант</th>
                    <th className="text-left p-2 text-neutral-400">Оценка</th>
                    <th className="text-left p-2 text-neutral-400">Расчет</th>
                    <th className="text-right p-2 text-neutral-400">Балл</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium text-emerald-400">A</td>
                    <td className="p-2 text-neutral-400">Оптимальный</td>
                    <td className="p-2 font-mono text-xs">4 / 4</td>
                    <td className="p-2 text-right font-mono text-emerald-400">1.00</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium text-amber-400">B</td>
                    <td className="p-2 text-neutral-400">Частично эффективный</td>
                    <td className="p-2 font-mono text-xs">2 / 4</td>
                    <td className="p-2 text-right font-mono text-amber-400">0.50</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2 font-medium text-orange-400">C</td>
                    <td className="p-2 text-neutral-400">Неэффективный</td>
                    <td className="p-2 font-mono text-xs">1 / 4</td>
                    <td className="p-2 text-right font-mono text-orange-400">0.25</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-red-400">D</td>
                    <td className="p-2 text-neutral-400">Контрпродуктивный</td>
                    <td className="p-2 font-mono text-xs">0 / 4</td>
                    <td className="p-2 text-right font-mono text-red-400">0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Callout type="tip" title="Динамическое определение шкалы">
              <p>
                Система автоматически определяет максимальный балл для каждого
                вопроса SJT. Это позволяет использовать разные шкалы (например,
                0-3, 0-5, 0-10) в зависимости от сложности ситуации.
              </p>
            </Callout>
          </div>

          {/* MCQ */}
          <div id="mcq" className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Множественный выбор (MCQ)
            </h3>
            <p className="text-muted-foreground mb-4">
              Вопросы с единственным правильным ответом (5% теста). Используются
              для проверки знаний и понимания концепций.
            </p>

            <div className="rounded-lg border p-4 mb-4">
              <p className="text-sm font-medium mb-3">
                Пример: Какой стиль лидерства наиболее эффективен при работе с
                опытной командой?
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 p-2 rounded">
                  <span className="font-medium">A</span>
                  <span>Авторитарный</span>
                  <span className="ml-auto text-red-500">0.0</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    B
                  </span>
                  <span>Делегирующий</span>
                  <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-medium">
                    1.0
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded">
                  <span className="font-medium">C</span>
                  <span>Директивный</span>
                  <span className="ml-auto text-red-500">0.0</span>
                </div>
              </div>
            </div>

            <Callout type="info" title="Бинарная оценка">
              <p>
                MCQ вопросы имеют строгую бинарную оценку: правильный ответ =
                1.0, неправильный = 0.0. Частичное оценивание не применяется.
              </p>
            </Callout>
          </div>
        </section>

        {/* ===== SECTION 3: Aggregation ===== */}
        <section id="aggregation" aria-labelledby="aggregation-heading">
          <h2 id="aggregation-heading" className="text-xl font-semibold text-foreground mt-8 mb-4">
            Иерархия агрегации
          </h2>
          <p className="text-muted-foreground mb-6">
            SkillSoft использует трехуровневую иерархию для агрегации
            результатов. Каждый уровень имеет свою логику расчета.
          </p>

          {/* Enhanced Visual Hierarchy Diagram */}
          <div
            className="rounded-xl border bg-neutral-900/50 p-6 mb-8"
            role="img"
            aria-label="Диаграмма трехуровневой иерархии агрегации: вопросы агрегируются в индикаторы, индикаторы в компетенции, компетенции в общий профиль"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Level 1: Questions */}
              <div className="w-full">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/50" />
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium flex items-center gap-1.5">
                    <FileText className="w-3 h-3" aria-hidden="true" />
                    Уровень 1: Вопросы
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/50" />
                </div>
                <div className="flex flex-wrap justify-center gap-2" role="list" aria-label="Примеры вопросов">
                  {["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"].map((q) => (
                    <div
                      key={q}
                      role="listitem"
                      className="w-10 h-10 rounded-lg bg-blue-900/50 border border-blue-700 flex items-center justify-center text-xs font-mono text-blue-300"
                    >
                      {q}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow Down */}
              <div className="flex flex-col items-center gap-1 text-neutral-500" aria-hidden="true">
                <div className="w-px h-4 bg-gradient-to-b from-blue-500/50 to-purple-500/50" />
                <span className="text-xs font-mono bg-neutral-800 px-2 py-0.5 rounded">avg()</span>
                <div className="w-px h-4 bg-gradient-to-b from-purple-500/50 to-purple-500" />
              </div>

              {/* Level 2: Indicators */}
              <div className="w-full">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/50" />
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium flex items-center gap-1.5">
                    <ClipboardList className="w-3 h-3" aria-hidden="true" />
                    Уровень 2: Индикаторы
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/50" />
                </div>
                <div className="flex flex-wrap justify-center gap-3" role="list" aria-label="Поведенческие индикаторы">
                  {[
                    { id: "I1", weight: "0.40" },
                    { id: "I2", weight: "0.35" },
                    { id: "I3", weight: "0.25" },
                  ].map((ind) => (
                    <div
                      key={ind.id}
                      role="listitem"
                      className="px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-700 flex flex-col items-center"
                    >
                      <span className="font-mono text-purple-300 text-sm">{ind.id}</span>
                      <span className="text-xs text-purple-400/70">вес: {ind.weight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow Down */}
              <div className="flex flex-col items-center gap-1 text-neutral-500" aria-hidden="true">
                <div className="w-px h-4 bg-gradient-to-b from-purple-500/50 to-amber-500/50" />
                <span className="text-xs font-mono bg-neutral-800 px-2 py-0.5 rounded">Σ(I×W)</span>
                <div className="w-px h-4 bg-gradient-to-b from-amber-500/50 to-amber-500" />
              </div>

              {/* Level 3: Competencies */}
              <div className="w-full">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/50" />
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1.5">
                    <Target className="w-3 h-3" aria-hidden="true" />
                    Уровень 3: Компетенции
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/50" />
                </div>
                <div className="flex flex-wrap justify-center gap-3" role="list" aria-label="Компетенции">
                  {["Лидерство", "Коммуникация", "Упр. временем"].map((comp) => (
                    <div
                      key={comp}
                      role="listitem"
                      className="px-4 py-2 rounded-lg bg-amber-900/50 border border-amber-700 text-amber-300 text-sm font-medium"
                    >
                      {comp}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow Down */}
              <div className="flex flex-col items-center gap-1 text-neutral-500" aria-hidden="true">
                <div className="w-px h-4 bg-gradient-to-b from-amber-500/50 to-emerald-500/50" />
                <span className="text-xs font-mono bg-neutral-800 px-2 py-0.5 rounded">Σ(C×W)/ΣW</span>
                <div className="w-px h-4 bg-gradient-to-b from-emerald-500/50 to-emerald-500" />
              </div>

              {/* Final: Profile */}
              <div className="w-full flex justify-center">
                <div
                  className="px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700 flex items-center gap-3"
                  role="img"
                  aria-label="Итоговый общий профиль сотрудника"
                >
                  <User className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                  <div>
                    <div className="text-emerald-300 font-medium">Общий профиль</div>
                    <div className="text-xs text-emerald-400/70">Итоговый балл сотрудника</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Level Descriptions */}
          <div className="space-y-4 mb-6" role="list" aria-label="Описание уровней агрегации">
            {/* Level 1 */}
            <article
              className="rounded-xl border bg-card overflow-hidden"
              role="listitem"
              aria-labelledby="level1-title"
            >
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 border-b border-blue-500/20">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center" aria-hidden="true">
                  <span className="text-blue-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 id="level1-title" className="font-semibold text-foreground">Вопросы → Индикаторы</h3>
                  <p className="text-xs text-muted-foreground">Простое среднее арифметическое</p>
                </div>
                <FileText className="w-4 h-4 text-blue-400 ml-auto" aria-hidden="true" />
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Нормализованные баллы всех вопросов, относящихся к одному
                  поведенческому индикатору, усредняются.
                </p>
                <MathBlock
                  tex="\text{Балл}_{\text{индикатора}} = \frac{Q_1 + Q_2 + \cdots + Q_n}{n} = \frac{\sum_{i=1}^{n} Q_i}{n}"
                  label="Формула: Балл индикатора равен сумме баллов вопросов, деленной на количество вопросов"
                  variant="blue"
                />
              </div>
            </article>

            {/* Level 2 */}
            <article
              className="rounded-xl border bg-card overflow-hidden"
              role="listitem"
              aria-labelledby="level2-title"
            >
              <div className="flex items-center gap-3 p-4 bg-purple-500/10 border-b border-purple-500/20">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center" aria-hidden="true">
                  <span className="text-purple-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 id="level2-title" className="font-semibold text-foreground">Индикаторы → Компетенции</h3>
                  <p className="text-xs text-muted-foreground">Взвешенное среднее (ΣW = 1.0)</p>
                </div>
                <ClipboardList className="w-4 h-4 text-purple-400 ml-auto" aria-hidden="true" />
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Баллы индикаторов объединяются с учетом весов, отражающих важность каждого индикатора для компетенции.
                </p>
                <MathBlock
                  tex="\text{Балл}_{\text{компетенции}} = \sum_{i=1}^{n} I_i \times W_i = I_1 W_1 + I_2 W_2 + \cdots + I_n W_n"
                  label="Формула: Балл компетенции равен сумме произведений баллов индикаторов на их веса"
                  variant="purple"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <Scale className="w-3 h-3" aria-hidden="true" />
                  <span>Ограничение: <InlineMath label="Сумма весов равна единице">{`\\sum_{i=1}^{n} W_i = 1.0`}</InlineMath></span>
                </div>
              </div>
            </article>

            {/* Level 3 */}
            <article
              className="rounded-xl border bg-card overflow-hidden"
              role="listitem"
              aria-labelledby="level3-title"
            >
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border-b border-amber-500/20">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center" aria-hidden="true">
                  <span className="text-amber-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 id="level3-title" className="font-semibold text-foreground">Компетенции → Профиль</h3>
                  <p className="text-xs text-muted-foreground">Зависит от сценария (Overview/JobFit/TeamFit)</p>
                </div>
                <Target className="w-4 h-4 text-amber-400 ml-auto" aria-hidden="true" />
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Итоговый профиль формируется из баллов компетенций. Базовый сценарий использует простое среднее,
                  JobFit и TeamFit применяют дополнительные множители.
                </p>
                <MathBlock
                  tex="\text{Балл}_{\text{общий}} = \frac{\sum_{i=1}^{n} C_i \times W_i}{\sum_{i=1}^{n} W_i}"
                  label="Формула: Общий балл равен взвешенной сумме баллов компетенций, деленной на сумму весов"
                  variant="amber"
                />
              </div>
            </article>
          </div>

          <MermaidDiagram
            title="Пример расчета с весами: Компетенция «Коммуникация»"
            chart={`
flowchart TB
    subgraph questions["📋 ВОПРОСЫ"]
        Q1["Q1.1: 0.75"]
        Q2["Q1.2: 0.50"]
        Q3["Q1.3: 1.00"]
        Q4["Q2.1: 0.50"]
        Q5["Q2.2: 0.75"]
        Q6["Q3.1: 1.00"]
        Q7["Q3.2: 0.75"]
    end

    subgraph indicators["📊 ИНДИКАТОРЫ"]
        I1["Ясность изложения<br/>───────────<br/>(0.75+0.50+1.00)/3<br/><b>= 0.75</b><br/>вес: 0.40"]
        I2["Активное слушание<br/>───────────<br/>(0.50+0.75)/2<br/><b>= 0.625</b><br/>вес: 0.35"]
        I3["Обратная связь<br/>───────────<br/>(1.00+0.75)/2<br/><b>= 0.875</b><br/>вес: 0.25"]
    end

    subgraph result["✅ ИТОГ"]
        C["КОММУНИКАЦИЯ<br/>───────────<br/>0.75×0.4 + 0.625×0.35 + 0.875×0.25<br/>= 0.300 + 0.219 + 0.219<br/><b>= 0.738 (73.8%)</b>"]
    end

    Q1 & Q2 & Q3 --> I1
    Q4 & Q5 --> I2
    Q6 & Q7 --> I3
    I1 & I2 & I3 --> C

    style questions fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    style indicators fill:#581c87,stroke:#a855f7,color:#f3e8ff
    style result fill:#14532d,stroke:#22c55e,color:#dcfce7
`}
          />

          <Callout type="warning" title="Важно: Сумма весов">
            <p>
              Веса индикаторов внутри компетенции всегда должны суммироваться до
              1.0. Это гарантирует, что балл компетенции остается в диапазоне
              [0, 1] и не искажается при агрегации.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 4: Scenarios ===== */}
        <section id="scenarios">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Сценарии оценивания
          </h2>
          <p className="text-muted-foreground mb-4">
            SkillSoft поддерживает три сценария оценивания, каждый с уникальной
            логикой расчета и интерпретации результатов.
          </p>

          {/* Scenarios Comparison Table */}
          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Сценарий</th>
                  <th className="text-left p-3 font-semibold">Цель</th>
                  <th className="text-left p-3 font-semibold">Взвешивание</th>
                  <th className="text-left p-3 font-semibold">Порог</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">A: Обзор</td>
                  <td className="p-3 text-muted-foreground">
                    Паспорт компетенций
                  </td>
                  <td className="p-3">Равные веса</td>
                  <td className="p-3 text-muted-foreground">
                    По шаблону (напр. 70%)
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">B: Соответствие должности</td>
                  <td className="p-3 text-muted-foreground">
                    Оценка для позиции
                  </td>
                  <td className="p-3">O*NET (1.2x)</td>
                  <td className="p-3 text-muted-foreground">
                    50% + строгость
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">C: Совместимость с командой</td>
                  <td className="p-3 text-muted-foreground">
                    Командный fit
                  </td>
                  <td className="p-3">ESCO + Big Five</td>
                  <td className="p-3 text-muted-foreground">
                    60% + разнообразие
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Scenario A: Overview */}
          <div id="scenario-overview" className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Сценарий A: Обзор компетенций (Overview)
            </h3>
            <p className="text-muted-foreground mb-4">
              Базовый сценарий для создания профиля компетенций сотрудника.
              Используется для общей оценки и развития, без привязки к
              конкретной должности или команде.
            </p>

            <div className="rounded-lg border p-4 mb-4">
              <h4 className="font-medium mb-2">Особенности сценария:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  Все компетенции имеют <strong>равный вес</strong>
                </li>
                <li>Отображается радар Big Five для анализа личности</li>
                <li>Нейтральная цветовая схема без оценочных маркеров</li>
                <li>Фокус на развитии, а не на прохождении/непрохождении</li>
              </ul>
            </div>

            {/* Overview Formula Card */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <div className="text-center mb-4">
                <div className="text-lg font-mono text-emerald-400">
                  Общий балл = (C₁ + C₂ + C₃ + ... + Cₙ) / n
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded bg-neutral-800">
                  <div className="text-neutral-400 text-xs mb-1">C₁...Cₙ</div>
                  <div className="text-neutral-200">Баллы компетенций</div>
                </div>
                <div className="p-3 rounded bg-neutral-800">
                  <div className="text-neutral-400 text-xs mb-1">n</div>
                  <div className="text-neutral-200">Количество компетенций</div>
                </div>
                <div className="p-3 rounded bg-neutral-800">
                  <div className="text-neutral-400 text-xs mb-1">Вес</div>
                  <div className="text-neutral-200">Равный для всех (1/n)</div>
                </div>
              </div>
            </div>

            <Callout type="info" title="Без оценочных бейджей">
              <p>
                В сценарии Overview результаты не маркируются как
                &quot;пройден/не пройден&quot;. Цель - предоставить объективную
                картину текущего уровня развития компетенций для планирования
                обучения.
              </p>
            </Callout>
          </div>

          {/* Scenario B: Job Fit */}
          <div id="scenario-jobfit" className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Сценарий B: Соответствие должности (Job Fit)
            </h3>
            <p className="text-muted-foreground mb-4">
              Сценарий для оценки соответствия кандидата требованиям конкретной
              должности. Использует данные O*NET для определения важности
              компетенций.
            </p>

            <div className="rounded-lg border p-4 mb-4">
              <h4 className="font-medium mb-2">Механизм взвешивания O*NET:</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Компетенции, связанные с должностью через O*NET, получают
                повышенный вес при расчете общего балла.
              </p>
              <div className="flex gap-4">
                <div className="flex-1 p-3 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                    O*NET-связанные
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    1.2x
                  </div>
                  <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                    множитель веса
                  </div>
                </div>
                <div className="flex-1 p-3 rounded bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                  <div className="font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                    Прочие
                  </div>
                  <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                    1.0x
                  </div>
                  <div className="text-xs text-neutral-600/80 dark:text-neutral-400/80">
                    базовый вес
                  </div>
                </div>
              </div>
            </div>

            {/* Job Fit Formula Card */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <MathBlock
                tex="\text{Общий балл} = \frac{\sum_{i=1}^{n} C_i \times W_i}{\sum_{i=1}^{n} W_i}"
                label="Общий балл равен сумме произведений компетенций на веса, деленной на сумму весов"
                variant="emerald"
              />
              <div className="text-center text-xs text-neutral-500 -mt-2 mb-4">
                <InlineMath>{`W_i = 1.2`}</InlineMath> для O*NET-связанных, <InlineMath>{`1.0`}</InlineMath> для остальных
              </div>

              <div className="text-sm text-neutral-400 mb-2">
                Пример: 3 компетенции (2 связаны с O*NET)
              </div>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400">Компетенция</th>
                    <th className="text-center p-2 text-neutral-400">Балл</th>
                    <th className="text-center p-2 text-neutral-400">Вес</th>
                    <th className="text-right p-2 text-neutral-400">C × W</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2">Компетенция 1 <span className="text-emerald-400 text-xs">(O*NET)</span></td>
                    <td className="p-2 text-center font-mono">0.80</td>
                    <td className="p-2 text-center font-mono text-emerald-400">1.2</td>
                    <td className="p-2 text-right font-mono">0.96</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2">Компетенция 2 <span className="text-emerald-400 text-xs">(O*NET)</span></td>
                    <td className="p-2 text-center font-mono">0.70</td>
                    <td className="p-2 text-center font-mono text-emerald-400">1.2</td>
                    <td className="p-2 text-right font-mono">0.84</td>
                  </tr>
                  <tr>
                    <td className="p-2">Компетенция 3</td>
                    <td className="p-2 text-center font-mono">0.90</td>
                    <td className="p-2 text-center font-mono text-neutral-500">1.0</td>
                    <td className="p-2 text-right font-mono">0.90</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 rounded bg-neutral-800 text-center">
                <div className="text-neutral-400 text-sm">
                  (0.96 + 0.84 + 0.90) / (1.2 + 1.2 + 1.0) = 2.70 / 3.4
                </div>
                <div className="text-emerald-400 text-lg font-mono font-bold mt-1">
                  = 79.4%
                </div>
              </div>
            </div>

            <Callout type="tip" title="Анализ разрывов">
              <p>
                Сценарий Job Fit включает анализ разрывов (Gap Analysis) -
                визуализацию расхождений между требуемым уровнем компетенций для
                должности и фактическими результатами сотрудника.
              </p>
            </Callout>
          </div>

          {/* Scenario C: Team Fit */}
          <div id="scenario-teamfit" className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Сценарий C: Совместимость с командой (Team Fit)
            </h3>
            <p className="text-muted-foreground mb-4">
              Сценарий для оценки того, насколько кандидат дополнит существующую
              команду. Учитывает разнообразие навыков и баланс в коллективе.
            </p>

            <div className="rounded-lg border p-4 mb-4">
              <h4 className="font-medium mb-2">
                Многоуровневое взвешивание ESCO + Big Five:
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Компетенции могут быть связаны с европейскими стандартами ESCO и
                чертами личности Big Five. Веса комбинируются мультипликативно.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                    ESCO
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    1.15x
                  </div>
                </div>
                <div className="p-3 rounded bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <div className="font-medium text-purple-700 dark:text-purple-400 mb-1">
                    Big Five
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    1.1x
                  </div>
                </div>
                <div className="p-3 rounded bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                  <div className="font-medium text-indigo-700 dark:text-indigo-400 mb-1">
                    Оба
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    1.265x
                  </div>
                </div>
              </div>
            </div>

            {/* Team Fit Weight Formula Card */}
            <div className="rounded-lg border bg-neutral-900 p-4 my-4">
              <MathBlock
                tex="W = W_{\text{base}} \times W_{\text{ESCO}} \times W_{\text{Big5}}"
                label="Вес равен произведению базового веса на множитель ESCO на множитель Big Five"
                variant="blue"
              />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-400">Связи</th>
                    <th className="text-center p-2 text-neutral-400">Базовый</th>
                    <th className="text-center p-2 text-blue-400">ESCO</th>
                    <th className="text-center p-2 text-purple-400">Big Five</th>
                    <th className="text-right p-2 text-emerald-400">Итого</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800">
                    <td className="p-2">Только ESCO</td>
                    <td className="p-2 text-center font-mono">1.0</td>
                    <td className="p-2 text-center font-mono text-blue-400">1.15</td>
                    <td className="p-2 text-center font-mono text-neutral-500">1.0</td>
                    <td className="p-2 text-right font-mono font-bold text-blue-400">1.15</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2">Только Big Five</td>
                    <td className="p-2 text-center font-mono">1.0</td>
                    <td className="p-2 text-center font-mono text-neutral-500">1.0</td>
                    <td className="p-2 text-center font-mono text-purple-400">1.1</td>
                    <td className="p-2 text-right font-mono font-bold text-purple-400">1.10</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="p-2">ESCO + Big Five</td>
                    <td className="p-2 text-center font-mono">1.0</td>
                    <td className="p-2 text-center font-mono text-blue-400">1.15</td>
                    <td className="p-2 text-center font-mono text-purple-400">1.1</td>
                    <td className="p-2 text-right font-mono font-bold text-indigo-400">1.265</td>
                  </tr>
                  <tr>
                    <td className="p-2">Без связей</td>
                    <td className="p-2 text-center font-mono">1.0</td>
                    <td className="p-2 text-center font-mono text-neutral-500">1.0</td>
                    <td className="p-2 text-center font-mono text-neutral-500">1.0</td>
                    <td className="p-2 text-right font-mono text-neutral-500">1.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border p-4 my-4">
              <h4 className="font-medium mb-2">Командные множители:</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Помимо взвешивания компетенций, итоговый балл корректируется на
                основе анализа состава команды.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded bg-emerald-50 dark:bg-emerald-950/30">
                  <div className="text-2xl">+10%</div>
                  <div>
                    <div className="font-medium text-emerald-700 dark:text-emerald-400">
                      Бонус за разнообразие
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Если diversityRatio &gt; 40% И saturationRatio &lt; 60%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded bg-red-50 dark:bg-red-950/30">
                  <div className="text-2xl">-10%</div>
                  <div>
                    <div className="font-medium text-red-700 dark:text-red-400">
                      Штраф за насыщение
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Если saturationRatio &gt; 80%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Callout type="note" title="Параметры команды">
              <p>
                <strong>Diversity Ratio</strong> - показатель разнообразия
                компетенций в команде. Высокое значение означает, что члены
                команды дополняют друг друга.
              </p>
              <p className="mt-2">
                <strong>Saturation Ratio</strong> - показатель &quot;насыщенности&quot;.
                Высокое значение означает избыток схожих навыков и недостаток
                новых.
              </p>
            </Callout>
          </div>
        </section>

        {/* ===== SECTION 5: Thresholds ===== */}
        <section id="thresholds">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Расчет порога прохождения
          </h2>
          <p className="text-muted-foreground mb-4">
            Порог прохождения определяет минимальный балл, необходимый для
            успешного завершения теста. Логика расчета различается в зависимости
            от сценария.
          </p>

          {/* Threshold by Scenario */}
          <div className="space-y-4">
            {/* Overview */}
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Сценарий A: Обзор компетенций
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Порог задается статически в шаблоне теста администратором.
              </p>
              <div className="p-3 bg-muted/50 rounded">
                <code className="text-sm">
                  Порог = passingScore шаблона (например, 70%)
                </code>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Типичное значение: 60-70% в зависимости от целей оценки
              </p>
            </div>

            {/* Job Fit */}
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Сценарий B: Соответствие должности
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Порог рассчитывается динамически на основе уровня строгости
                оценки.
              </p>
              {/* Dynamic Threshold Formula */}
              <div className="rounded-lg border bg-neutral-900 p-4 my-4">
                <MathBlock
                  tex="\text{Порог} = 50\% + \frac{\text{Строгость}}{100} \times 30\%"
                  label="Порог равен 50% плюс строгость деленная на 100, умноженная на 30%"
                  variant="amber"
                />
                <div className="text-center text-xs text-neutral-500 -mt-2 mb-4">
                  Диапазон: 50% - 80% в зависимости от строгости
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left p-2 text-neutral-400">Строгость</th>
                      <th className="text-left p-2 text-neutral-400">Расчет</th>
                      <th className="text-right p-2 text-emerald-400">Порог</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-300">
                    <tr className="border-b border-neutral-800">
                      <td className="p-2">0 <span className="text-neutral-500 text-xs">(минимум)</span></td>
                      <td className="p-2 font-mono text-xs">50% + (0/100) × 30%</td>
                      <td className="p-2 text-right font-mono text-emerald-400 font-bold">50%</td>
                    </tr>
                    <tr className="border-b border-neutral-800">
                      <td className="p-2">25</td>
                      <td className="p-2 font-mono text-xs">50% + (25/100) × 30%</td>
                      <td className="p-2 text-right font-mono text-lime-400 font-bold">57.5%</td>
                    </tr>
                    <tr className="border-b border-neutral-800">
                      <td className="p-2">50 <span className="text-neutral-500 text-xs">(средний)</span></td>
                      <td className="p-2 font-mono text-xs">50% + (50/100) × 30%</td>
                      <td className="p-2 text-right font-mono text-yellow-400 font-bold">65%</td>
                    </tr>
                    <tr className="border-b border-neutral-800">
                      <td className="p-2">75</td>
                      <td className="p-2 font-mono text-xs">50% + (75/100) × 30%</td>
                      <td className="p-2 text-right font-mono text-orange-400 font-bold">72.5%</td>
                    </tr>
                    <tr>
                      <td className="p-2">100 <span className="text-neutral-500 text-xs">(максимум)</span></td>
                      <td className="p-2 font-mono text-xs">50% + (100/100) × 30%</td>
                      <td className="p-2 text-right font-mono text-red-400 font-bold">80%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team Fit */}
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Сценарий C: Совместимость с командой
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Для прохождения необходимо выполнить два условия одновременно.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded">
                  <div className="text-sm font-medium mb-1">Условие 1</div>
                  <code className="text-sm">Общий балл &ge; 60%</code>
                </div>
                <div className="p-3 bg-muted/50 rounded">
                  <div className="text-sm font-medium mb-1">Условие 2</div>
                  <code className="text-sm">diversityRatio &ge; 30%</code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Оба условия должны быть выполнены для статуса
                &quot;Пройден&quot;
              </p>
            </div>
          </div>

          <Callout type="warning" title="Строгость оценки">
            <p>
              Параметр &quot;строгость&quot; (strictnessLevel) в сценарии Job
              Fit позволяет HR-администратору регулировать требовательность
              оценки. Для критически важных позиций рекомендуется строгость
              70-100, для начальных позиций - 20-40.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 6: Percentiles ===== */}
        <section id="percentiles">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Перцентили
          </h2>
          <p className="text-muted-foreground mb-4">
            Перцентиль показывает, какой процент участников набрал балл ниже,
            чем у данного сотрудника. Это позволяет сравнить результат с
            историческими данными.
          </p>

          {/* Percentile Formula Card */}
          <div className="rounded-lg border bg-neutral-900 p-4 my-4">
            <MathBlock
              tex="\text{Перцентиль} = \frac{\text{Результатов ниже}}{\text{Всего}} \times 100"
              label="Перцентиль равен количеству результатов ниже, деленному на общее количество, умноженному на 100"
              variant="emerald"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded bg-neutral-800">
                <div className="text-neutral-400 text-sm mb-2">Пример расчета:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Всего тестов:</span>
                    <span className="font-mono text-neutral-200">100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Результатов ниже:</span>
                    <span className="font-mono text-neutral-200">75</span>
                  </div>
                  <div className="border-t border-neutral-700 pt-2 flex justify-between">
                    <span className="text-neutral-400">Перцентиль:</span>
                    <span className="font-mono text-emerald-400 font-bold">(75/100) × 100 = 75</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded bg-emerald-950/30 border border-emerald-800">
                <div className="text-emerald-400 text-sm mb-2">Интерпретация:</div>
                <p className="text-sm text-neutral-300">
                  Сотрудник показал результат лучше, чем{" "}
                  <span className="text-emerald-400 font-bold">75%</span> всех участников,
                  проходивших этот тест.
                </p>
              </div>
            </div>
          </div>

          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Перцентиль</th>
                  <th className="text-left p-3 font-semibold">Интерпретация</th>
                  <th className="text-left p-3 font-semibold">Рекомендация</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">90-100</td>
                  <td className="p-3 text-muted-foreground">
                    Выдающийся результат
                  </td>
                  <td className="p-3">Лидерские роли, наставничество</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">70-89</td>
                  <td className="p-3 text-muted-foreground">
                    Выше среднего
                  </td>
                  <td className="p-3">Продвижение, расширение обязанностей</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">30-69</td>
                  <td className="p-3 text-muted-foreground">Средний уровень</td>
                  <td className="p-3">Стандартное развитие</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">10-29</td>
                  <td className="p-3 text-muted-foreground">Ниже среднего</td>
                  <td className="p-3">Целевое развитие, обучение</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">0-9</td>
                  <td className="p-3 text-muted-foreground">
                    Требует внимания
                  </td>
                  <td className="p-3">Интенсивное развитие</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Callout type="info" title="Особый случай: первый результат">
            <p>
              Если сотрудник первым проходит тест по данному шаблону (нет
              исторических данных для сравнения), ему присваивается 50-й
              перцентиль как нейтральное начальное значение.
            </p>
          </Callout>

          <Callout type="tip" title="Накопление данных">
            <p>
              Точность перцентилей повышается с увеличением количества
              результатов. Рекомендуется интерпретировать перцентили с
              осторожностью, пока не накоплено минимум 30 результатов по
              шаблону.
            </p>
          </Callout>
        </section>

        {/* ===== SECTION 7: Examples ===== */}
        <section id="examples">
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            Примеры расчета
          </h2>
          <p className="text-muted-foreground mb-6">
            Рассмотрим полные примеры расчета от ответов до итогового результата
            для всех трех сценариев оценивания: Job Fit, Team Fit и Competency Passport.
          </p>

          {/* ========== Example 1: Job Fit ========== */}
          <div className="rounded-xl border bg-neutral-900 overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900/50 to-neutral-900 p-4 border-b border-neutral-700">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-100">
                      Пример 1: Job Fit
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Соответствие должности
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-neutral-800 text-xs text-neutral-300">
                    Строгость: <span className="text-amber-400 font-mono">50</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Context Card */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-neutral-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-200">Иванов А.А.</div>
                    <div className="text-xs text-neutral-500">Кандидат</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-200">Руководитель проекта</div>
                    <div className="text-xs text-neutral-500">Должность</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Answers */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-sm font-medium text-neutral-300">Ответы и нормализация</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-neutral-500">
                      <th className="text-left p-2">Компетенция</th>
                      <th className="text-center p-2">Ответы</th>
                      <th className="text-center p-2">Нормализация</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-300">
                    <tr className="border-t border-neutral-800">
                      <td className="p-2">
                        <span className="text-emerald-400">●</span> Лидерство
                      </td>
                      <td className="p-2 text-center font-mono">4, 5, 3, 4</td>
                      <td className="p-2 text-center font-mono text-blue-400">0.75, 1.0, 0.5, 0.75</td>
                    </tr>
                    <tr className="border-t border-neutral-800">
                      <td className="p-2">
                        <span className="text-neutral-500">○</span> Коммуникация
                      </td>
                      <td className="p-2 text-center font-mono">5, 4, 5, 3</td>
                      <td className="p-2 text-center font-mono text-blue-400">1.0, 0.75, 1.0, 0.5</td>
                    </tr>
                    <tr className="border-t border-neutral-800">
                      <td className="p-2">
                        <span className="text-emerald-400">●</span> Упр. временем
                      </td>
                      <td className="p-2 text-center font-mono">3/4, 4/4, 2/4, 3/4</td>
                      <td className="p-2 text-center font-mono text-blue-400">0.75, 1.0, 0.5, 0.75</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                <span className="text-emerald-400">●</span> = O*NET-связанная компетенция (1.2x)
              </div>
            </div>

            {/* Step 2: Aggregation */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-sm font-medium text-neutral-300">Агрегация в компетенции</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-neutral-800/50 border border-emerald-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-300">Лидерство</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-400">O*NET</span>
                  </div>
                  <div className="text-xs text-neutral-500 mb-1">
                    И1: 0.875 × 0.6 + И2: 0.625 × 0.4
                  </div>
                  <div className="text-xl font-mono font-bold text-neutral-100">77.5%</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-300">Коммуникация</span>
                  </div>
                  <div className="text-xs text-neutral-500 mb-1">
                    И1: 0.875 × 0.6 + И2: 0.75 × 0.4
                  </div>
                  <div className="text-xl font-mono font-bold text-neutral-100">82.5%</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50 border border-emerald-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-300">Упр. временем</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-400">O*NET</span>
                  </div>
                  <div className="text-xs text-neutral-500 mb-1">
                    И1: 0.875 × 0.6 + И2: 0.625 × 0.4
                  </div>
                  <div className="text-xl font-mono font-bold text-neutral-100">77.5%</div>
                </div>
              </div>
            </div>

            {/* Step 3: Weighted Calculation */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-sm font-medium text-neutral-300">Применение весов O*NET</span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-800/50 font-mono text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-neutral-500 text-xs mb-2">Взвешенная сумма:</div>
                    <div className="space-y-1 text-neutral-300">
                      <div>0.775 × <span className="text-emerald-400">1.2</span> = 0.930</div>
                      <div>0.825 × <span className="text-neutral-500">1.0</span> = 0.825</div>
                      <div>0.775 × <span className="text-emerald-400">1.2</span> = 0.930</div>
                      <div className="border-t border-neutral-700 pt-1 text-neutral-100">Σ = 2.685</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs mb-2">Сумма весов:</div>
                    <div className="space-y-1 text-neutral-300">
                      <div><span className="text-emerald-400">1.2</span> + <span className="text-neutral-500">1.0</span> + <span className="text-emerald-400">1.2</span></div>
                      <div className="border-t border-neutral-700 pt-1 text-neutral-100">Σ = 3.4</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-700 text-center">
                  <span className="text-neutral-400">Общий балл = </span>
                  <span className="text-neutral-200">2.685 / 3.4 = </span>
                  <span className="text-2xl font-bold text-emerald-400">79.0%</span>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="p-4 bg-gradient-to-r from-emerald-900/30 to-neutral-900">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                <span className="text-sm font-medium text-neutral-300">Результат</span>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 mb-1">Балл</div>
                    <div className="text-3xl font-mono font-bold text-emerald-400">79%</div>
                  </div>
                  <div className="text-neutral-600 text-2xl">≥</div>
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 mb-1">Порог (стр. 50)</div>
                    <div className="text-3xl font-mono font-bold text-neutral-400">65%</div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-xl">✓</span>
                    <span className="text-emerald-400 font-semibold">ПРОЙДЕН</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== Example 2: Team Fit ========== */}
          <div className="rounded-xl border bg-neutral-900 overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900/50 to-neutral-900 p-4 border-b border-neutral-700">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-100">
                      Пример 2: Team Fit
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Совместимость с командой
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Context Card */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-neutral-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-200">Петрова М.В.</div>
                    <div className="text-xs text-neutral-500">Кандидат</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-200">Команда разработки</div>
                    <div className="text-xs text-neutral-500">Целевая команда</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Data */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-sm font-medium text-neutral-300">Исходные данные</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-neutral-800/50 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Базовый балл</div>
                  <div className="text-xl font-mono font-bold text-neutral-100">72%</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Diversity Ratio</div>
                  <div className="text-xl font-mono font-bold text-emerald-400">45%</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Saturation Ratio</div>
                  <div className="text-xl font-mono font-bold text-amber-400">55%</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Связи</div>
                  <div className="text-sm font-medium text-blue-400">ESCO</div>
                </div>
              </div>
            </div>

            {/* Bonus Check */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-sm font-medium text-neutral-300">Проверка условий для бонуса</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-neutral-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm text-neutral-300">diversityRatio <span className="font-mono text-emerald-400">45%</span> &gt; 40%</span>
                  </div>
                  <span className="text-xs text-emerald-400">выполнено</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-neutral-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm text-neutral-300">saturationRatio <span className="font-mono text-amber-400">55%</span> &lt; 60%</span>
                  </div>
                  <span className="text-xs text-emerald-400">выполнено</span>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/50 text-center">
                <span className="text-neutral-400">Бонус за разнообразие: </span>
                <span className="text-emerald-400 font-bold">+10%</span>
              </div>
            </div>

            {/* Calculation */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-sm font-medium text-neutral-300">Расчет итогового балла</span>
              </div>
              <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-neutral-800/50 font-mono">
                <div className="text-center">
                  <div className="text-xs text-neutral-500 mb-1">Базовый</div>
                  <div className="text-2xl font-bold text-neutral-300">72%</div>
                </div>
                <div className="text-2xl text-neutral-500">×</div>
                <div className="text-center">
                  <div className="text-xs text-neutral-500 mb-1">Множитель</div>
                  <div className="text-2xl font-bold text-emerald-400">1.1</div>
                </div>
                <div className="text-2xl text-neutral-500">=</div>
                <div className="text-center">
                  <div className="text-xs text-neutral-500 mb-1">Итого</div>
                  <div className="text-2xl font-bold text-emerald-400">79.2%</div>
                </div>
              </div>
            </div>

            {/* Pass Check */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                <span className="text-sm font-medium text-neutral-300">Проверка прохождения</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-neutral-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm text-neutral-300">Балл <span className="font-mono text-emerald-400">79.2%</span> ≥ 60%</span>
                  </div>
                  <span className="text-xs text-emerald-400">выполнено</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-neutral-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm text-neutral-300">diversityRatio <span className="font-mono text-emerald-400">45%</span> ≥ 30%</span>
                  </div>
                  <span className="text-xs text-emerald-400">выполнено</span>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="p-4 bg-gradient-to-r from-blue-900/30 to-neutral-900">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 mb-1">Итоговый балл</div>
                    <div className="text-3xl font-mono font-bold text-blue-400">79.2%</div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-xl">✓</span>
                    <span className="text-blue-400 font-semibold">СОВМЕСТИМА С КОМАНДОЙ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== Example 3: Competency Passport (Overview) ========== */}
          <div className="rounded-xl border bg-neutral-900 overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-neutral-900 p-4 border-b border-neutral-700">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-100">
                      Пример 3: Competency Passport
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Паспорт компетенций (Overview)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-neutral-800 text-xs text-neutral-300">
                    Равные веса
                  </span>
                </div>
              </div>
            </div>

            {/* Context Card */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-neutral-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-200">Сидорова Е.К.</div>
                    <div className="text-xs text-neutral-500">Сотрудник</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-200">Профиль компетенций</div>
                    <div className="text-xs text-neutral-500">Цель оценки</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Answers */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-sm font-medium text-neutral-300">Ответы и нормализация</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-neutral-500">
                      <th className="text-left p-2">Компетенция</th>
                      <th className="text-center p-2">Ответы (Likert 1-5)</th>
                      <th className="text-center p-2">Нормализация</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-300">
                    <tr className="border-t border-neutral-800">
                      <td className="p-2">Коммуникация</td>
                      <td className="p-2 text-center font-mono">5, 4, 4, 5</td>
                      <td className="p-2 text-center font-mono text-blue-400">1.0, 0.75, 0.75, 1.0</td>
                    </tr>
                    <tr className="border-t border-neutral-800">
                      <td className="p-2">Аналитическое мышление</td>
                      <td className="p-2 text-center font-mono">3, 4, 4, 3</td>
                      <td className="p-2 text-center font-mono text-blue-400">0.5, 0.75, 0.75, 0.5</td>
                    </tr>
                    <tr className="border-t border-neutral-800">
                      <td className="p-2">Эмоц. интеллект</td>
                      <td className="p-2 text-center font-mono">4, 5, 3, 4</td>
                      <td className="p-2 text-center font-mono text-blue-400">0.75, 1.0, 0.5, 0.75</td>
                    </tr>
                    <tr className="border-t border-neutral-800">
                      <td className="p-2">Работа в команде</td>
                      <td className="p-2 text-center font-mono">5, 5, 4, 5</td>
                      <td className="p-2 text-center font-mono text-blue-400">1.0, 1.0, 0.75, 1.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                Нормализация: (значение - 1) / 4
              </div>
            </div>

            {/* Step 2: Aggregation to Competencies */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-sm font-medium text-neutral-300">Агрегация в компетенции</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-neutral-800/50">
                  <div className="text-sm text-neutral-300 mb-1">Коммуникация</div>
                  <div className="text-xs text-neutral-500 mb-1">
                    (1.0+0.75+0.75+1.0)/4
                  </div>
                  <div className="text-xl font-mono font-bold text-neutral-100">87.5%</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50">
                  <div className="text-sm text-neutral-300 mb-1">Аналитика</div>
                  <div className="text-xs text-neutral-500 mb-1">
                    (0.5+0.75+0.75+0.5)/4
                  </div>
                  <div className="text-xl font-mono font-bold text-neutral-100">62.5%</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50">
                  <div className="text-sm text-neutral-300 mb-1">Эмоц. интеллект</div>
                  <div className="text-xs text-neutral-500 mb-1">
                    (0.75+1.0+0.5+0.75)/4
                  </div>
                  <div className="text-xl font-mono font-bold text-neutral-100">75.0%</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-800/50">
                  <div className="text-sm text-neutral-300 mb-1">Работа в команде</div>
                  <div className="text-xs text-neutral-500 mb-1">
                    (1.0+1.0+0.75+1.0)/4
                  </div>
                  <div className="text-xl font-mono font-bold text-neutral-100">93.8%</div>
                </div>
              </div>
            </div>

            {/* Step 3: Simple Average (Equal Weights) */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-sm font-medium text-neutral-300">Простое среднее (равные веса)</span>
              </div>
              <div className="p-4 rounded-lg bg-neutral-800/50 font-mono text-sm">
                <div className="text-neutral-500 text-xs mb-3">Все компетенции имеют вес 1.0:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="space-y-1 text-neutral-300">
                      <div className="flex justify-between">
                        <span>Коммуникация:</span>
                        <span>0.875 × <span className="text-neutral-500">1.0</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Аналитика:</span>
                        <span>0.625 × <span className="text-neutral-500">1.0</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Эмоц. интеллект:</span>
                        <span>0.750 × <span className="text-neutral-500">1.0</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Работа в команде:</span>
                        <span>0.938 × <span className="text-neutral-500">1.0</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-neutral-500 text-xs mb-1">Формула:</div>
                    <div className="text-neutral-300">(0.875 + 0.625 + 0.750 + 0.938) / 4</div>
                    <div className="border-t border-neutral-700 pt-2 mt-2 text-neutral-100 font-bold">
                      = 3.188 / 4 = <span className="text-purple-400">0.797</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Big Five Projection */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">4</span>
                <span className="text-sm font-medium text-neutral-300">Проекция на Big Five</span>
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                Компетенции проецируются на пятифакторную модель личности для дополнительного анализа
              </p>
              <div className="grid grid-cols-5 gap-2">
                <div className="p-2 rounded-lg bg-rose-900/20 border border-rose-800/30 text-center">
                  <div className="text-xs text-rose-400 mb-1">Нейротизм</div>
                  <div className="text-lg font-mono font-bold text-neutral-200">32%</div>
                  <div className="text-xs text-neutral-500">низкий</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-900/20 border border-amber-800/30 text-center">
                  <div className="text-xs text-amber-400 mb-1">Экстраверсия</div>
                  <div className="text-lg font-mono font-bold text-neutral-200">78%</div>
                  <div className="text-xs text-neutral-500">высокий</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-900/20 border border-emerald-800/30 text-center">
                  <div className="text-xs text-emerald-400 mb-1">Открытость</div>
                  <div className="text-lg font-mono font-bold text-neutral-200">65%</div>
                  <div className="text-xs text-neutral-500">средний</div>
                </div>
                <div className="p-2 rounded-lg bg-blue-900/20 border border-blue-800/30 text-center">
                  <div className="text-xs text-blue-400 mb-1">Согласие</div>
                  <div className="text-lg font-mono font-bold text-neutral-200">88%</div>
                  <div className="text-xs text-neutral-500">высокий</div>
                </div>
                <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-800/30 text-center">
                  <div className="text-xs text-purple-400 mb-1">Добросов.</div>
                  <div className="text-lg font-mono font-bold text-neutral-200">71%</div>
                  <div className="text-xs text-neutral-500">средний</div>
                </div>
              </div>
            </div>

            {/* Result - Profile Generated (No Pass/Fail) */}
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-neutral-900">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 mb-1">Общий балл</div>
                    <div className="text-3xl font-mono font-bold text-purple-400">79.7%</div>
                  </div>
                  <div className="h-12 w-px bg-neutral-700" />
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Сильные стороны</div>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded text-xs bg-emerald-900/50 text-emerald-400">Командная работа</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-emerald-900/50 text-emerald-400">Коммуникация</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Зоны развития</div>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-900/50 text-amber-400">Аналитика</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-semibold">ПРОФИЛЬ СФОРМИРОВАН</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <Callout type="tip" title="Рекомендации по интерпретации">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Используйте сценарий <strong>Overview</strong> для общего
                развития и планирования обучения
              </li>
              <li>
                Выбирайте <strong>Job Fit</strong> при найме на конкретные
                должности с четкими требованиями
              </li>
              <li>
                Применяйте <strong>Team Fit</strong> для формирования
                сбалансированных команд
              </li>
              <li>
                Обращайте внимание на перцентили для сравнительного анализа
              </li>
              <li>
                Регулярно анализируйте распределение результатов для калибровки
                порогов
              </li>
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
