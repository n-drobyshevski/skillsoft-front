// Glossary term data with enhanced structure for mobile experience

export interface GlossaryTerm {
  id: string;
  term: string;
  termEn?: string;
  definition: string;
  example?: string;
  relatedTerms?: string[];
}

export const domainTerms: GlossaryTerm[] = [
  {
    id: "competency",
    term: "Компетенция",
    termEn: "Competency",
    definition:
      "Измеримый навык или способность, которую можно наблюдать и развивать. Компетенция включает знания, навыки и поведенческие характеристики, необходимые для эффективного выполнения работы.",
    example: "Коммуникация, лидерство, критическое мышление, эмоциональный интеллект.",
    relatedTerms: ["Поведенческий индикатор", "Soft skills"],
  },
  {
    id: "behavioral-indicator",
    term: "Поведенческий индикатор",
    termEn: "Behavioral Indicator",
    definition:
      "Конкретное, наблюдаемое поведение, демонстрирующее уровень владения компетенцией. Индикаторы позволяют объективно оценить проявление компетенции в рабочих ситуациях.",
    example: "Адаптирует стиль общения к аудитории, активно слушает собеседника.",
    relatedTerms: ["Компетенция", "Оценочный вопрос"],
  },
  {
    id: "assessment-question",
    term: "Оценочный вопрос",
    termEn: "Assessment Question",
    definition:
      "Инструмент измерения для оценки поведенческих индикаторов. Вопросы разработаны с учетом психометрических требований и валидированы для надежной оценки.",
    example: "Вопросы могут быть типа: шкала Лайкерта, ситуационные суждения, множественный выбор.",
    relatedTerms: ["Поведенческий индикатор", "Шкала Лайкерта"],
  },
  {
    id: "test-template",
    term: "Шаблон теста",
    termEn: "Test Template",
    definition:
      "Предварительно настроенная конфигурация теста с выбранными компетенциями, параметрами оценки и целями. Позволяет стандартизировать процесс тестирования.",
    relatedTerms: ["Blueprint", "Тестовая сессия"],
  },
  {
    id: "blueprint",
    term: "Blueprint",
    termEn: "Test Blueprint",
    definition:
      "План распределения вопросов по компетенциям и индикаторам в тесте. Определяет структуру теста, охват контента и баланс между различными типами вопросов.",
    relatedTerms: ["Шаблон теста", "Компетенция"],
  },
];

export const psychometricTerms: GlossaryTerm[] = [
  {
    id: "difficulty-index",
    term: "Индекс сложности",
    termEn: "Difficulty Index (p-value)",
    definition:
      "Показатель того, насколько сложным является вопрос. Рассчитывается как доля правильных ответов среди всех респондентов.",
    example: "Значение 0.7 означает, что 70% респондентов ответили правильно. Оптимальный диапазон: 0.2-0.9.",
    relatedTerms: ["Индекс дискриминации"],
  },
  {
    id: "discrimination-index",
    term: "Индекс дискриминации",
    termEn: "Discrimination Index (rpb)",
    definition:
      "Показатель способности вопроса различать респондентов с высоким и низким уровнем компетенции. Измеряется точечно-бисериальной корреляцией.",
    example: "Хорошее значение: >= 0.25. Отрицательные значения указывают на проблемный вопрос.",
    relatedTerms: ["Индекс сложности", "Валидность"],
  },
  {
    id: "cronbachs-alpha",
    term: "Альфа Кронбаха",
    termEn: "Cronbach's Alpha",
    definition:
      "Мера внутренней согласованности теста. Показывает, насколько согласованно вопросы измеряют одну и ту же конструкцию.",
    example: "Значения >= 0.7 считаются приемлемыми, >= 0.8 — хорошими, >= 0.9 — отличными.",
    relatedTerms: ["Надежность", "Валидность"],
  },
  {
    id: "validity",
    term: "Валидность",
    termEn: "Validity",
    definition:
      "Степень, в которой тест измеряет то, что он должен измерять. Включает содержательную, критериальную и конструктную валидность.",
    relatedTerms: ["Надежность", "Альфа Кронбаха"],
  },
  {
    id: "reliability",
    term: "Надежность",
    termEn: "Reliability",
    definition:
      "Согласованность и воспроизводимость результатов теста при повторных измерениях. Надежный тест дает стабильные результаты в одинаковых условиях.",
    relatedTerms: ["Валидность", "Альфа Кронбаха"],
  },
];

export const technicalTerms: GlossaryTerm[] = [
  {
    id: "job-fit",
    term: "Job Fit",
    termEn: "Job Fit Assessment",
    definition:
      "Цель теста, направленная на оценку соответствия кандидата требованиям должности. Включает сравнение профиля компетенций с эталонным профилем позиции.",
    relatedTerms: ["Team Fit", "Overview"],
  },
  {
    id: "team-fit",
    term: "Team Fit",
    termEn: "Team Fit Assessment",
    definition:
      "Цель теста для оценки совместимости сотрудника с существующей командой. Анализирует дополняющие компетенции и потенциальные зоны синергии.",
    relatedTerms: ["Job Fit", "Overview"],
  },
  {
    id: "overview",
    term: "Overview",
    termEn: "Competency Overview",
    definition:
      "Цель теста для создания общего профиля компетенций без сравнения с эталоном. Используется для составления паспорта компетенций сотрудника.",
    relatedTerms: ["Job Fit", "Team Fit"],
  },
  {
    id: "test-drive-mode",
    term: "Test-Drive Mode",
    termEn: "Test-Drive Mode",
    definition:
      "Режим предварительного просмотра теста для HR-администраторов. Отображает психометрические данные, информацию о скоринге и техническую метаинформацию.",
    relatedTerms: ["Шаблон теста"],
  },
  {
    id: "lens",
    term: "Lens",
    termEn: "View Lens",
    definition:
      "Контекст просмотра интерфейса, определяющий доступные функции и отображаемую информацию в зависимости от роли пользователя.",
    example: "Роли: HR-администратор, Администратор системы, Сотрудник.",
  },
];

// Section configuration for navigation
export const glossarySections = [
  {
    id: "domain-terms",
    label: "Предметная",
    title: "Термины предметной области",
    terms: domainTerms,
    category: "domain" as const,
  },
  {
    id: "psychometric-terms",
    label: "Психометрия",
    title: "Психометрические термины",
    terms: psychometricTerms,
    category: "psychometric" as const,
  },
  {
    id: "technical-terms",
    label: "Техническая",
    title: "Технические термины",
    terms: technicalTerms,
    category: "technical" as const,
  },
] as const;

export type GlossaryCategory = (typeof glossarySections)[number]["category"];
