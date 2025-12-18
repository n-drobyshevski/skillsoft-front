/**
 * Documentation Navigation Configuration
 *
 * Defines the navigation structure for the internal documentation hub.
 * All content is in Russian as specified for HR administrators.
 */

export interface NavItem {
  title: string;
  href: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const docsNavigation: NavSection[] = [
  {
    title: "Начало работы",
    items: [
      { title: "Обзор", href: "/docs" },
      { title: "Быстрый старт", href: "/docs/getting-started" },
      { title: "Глоссарий", href: "/docs/glossary" },
    ],
  },
  {
    title: "Как работает система",
    items: [
      { title: "Сборка тестов", href: "/docs/test-building" },
      { title: "Система оценивания", href: "/docs/scoring" },
      { title: "Психометрика", href: "/docs/psychometrics" },
    ],
  },
  {
    title: "Создание контента",
    items: [
      { title: "Обзор", href: "/docs/authoring" },
      { title: "Компетенции", href: "/docs/authoring/competencies" },
      { title: "Индикаторы", href: "/docs/authoring/indicators" },
      { title: "Вопросы", href: "/docs/authoring/questions" },
    ],
  },
  {
    title: "Руководства",
    items: [{ title: "Лучшие практики", href: "/docs/best-practices" }],
  },
];

/**
 * Flattens navigation into a single array of pages for iteration
 */
export function getAllPages(): NavItem[] {
  return docsNavigation.flatMap((section) => section.items);
}

/**
 * Gets the previous and next pages relative to the current path
 * Used for footer navigation
 */
export function getAdjacentPages(currentPath: string): {
  prev: NavItem | null;
  next: NavItem | null;
} {
  const allPages = getAllPages();
  const currentIndex = allPages.findIndex((item) => item.href === currentPath);

  return {
    prev: currentIndex > 0 ? allPages[currentIndex - 1] : null,
    next: currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null,
  };
}

/**
 * Gets the current page info by path
 */
export function getPageByPath(path: string): NavItem | undefined {
  return getAllPages().find((item) => item.href === path);
}

/**
 * Gets the section containing a specific path
 */
export function getSectionByPath(path: string): NavSection | undefined {
  return docsNavigation.find((section) =>
    section.items.some((item) => item.href === path)
  );
}

/**
 * Generates breadcrumb items for a given path
 */
export function getBreadcrumbs(
  path: string
): Array<{ title: string; href: string }> {
  const breadcrumbs: Array<{ title: string; href: string }> = [
    { title: "Документация", href: "/docs" },
  ];

  // Find the section and page
  const section = getSectionByPath(path);
  const page = getPageByPath(path);

  // If we're on a nested page (authoring/*), add the parent
  if (path.startsWith("/docs/authoring/") && path !== "/docs/authoring") {
    breadcrumbs.push({ title: "Создание контента", href: "/docs/authoring" });
  }

  // Add the current page if it's not the docs root
  if (page && path !== "/docs") {
    breadcrumbs.push({ title: page.title, href: page.href });
  }

  return breadcrumbs;
}
