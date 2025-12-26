'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { useLensStore } from '@/store/lens-store';
import { getLensConfig } from '@/config/lens-configs';
import { springConfig, timing } from '@/lib/animation-config';
import {
  Home,
  FileText,
  User,
  MoreHorizontal,
  BarChart3,
  ClipboardList,
  Settings,
  PlusCircle,
  History,
  Target,
  Lightbulb,
  FileQuestion,
  Network,
  Users,
  Activity,
  Flag,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface NavItem {
  href: string;
  icon: LucideIcon;
  /** Filled icon variant for active state */
  activeIcon?: LucideIcon;
  label: string;
  /** Match pattern for active state (defaults to startsWith href) */
  matchPattern?: RegExp;
}

interface MoreMenuItem {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  /** Badge text (e.g., "New") */
  badge?: string;
}

interface MoreMenuSection {
  id: string;
  title: string;
  items: MoreMenuItem[];
  /** Which lenses can see this section */
  lenses: string[];
}

// All possible primary navigation items
const ALL_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Главная' },
  { href: '/my-tests', icon: ClipboardList, label: 'Мои тесты' },
  { href: '/test-templates', icon: FileText, label: 'Тесты' },
  { href: '/psychometrics', icon: BarChart3, label: 'Анализ' },
  { href: '/profile', icon: User, label: 'Профиль' },
];

// Lens-specific nav item selection
// User lens: dashboard, my-tests, test-templates, profile (4 items)
// Editor lens: dashboard, test-templates, profile (3 items + more)
// Admin lens: dashboard, test-templates, psychometrics, profile (4 items + more)
const LENS_NAV_ITEMS: Record<string, string[]> = {
  user: ['/dashboard', '/my-tests', '/test-templates', '/profile'],
  editor: ['/dashboard', '/test-templates', '/profile'],
  admin: ['/dashboard', '/test-templates', '/psychometrics', '/profile'],
};

// Organized sections for "More" sheet - filtered by lens
const MORE_MENU_SECTIONS: MoreMenuSection[] = [
  // Quick Actions - Editor/Admin
  {
    id: 'quick-actions',
    title: 'Быстрые действия',
    lenses: ['editor', 'admin'],
    items: [
      {
        href: '/test-templates/new',
        icon: PlusCircle,
        label: 'Создать тест',
        description: 'Новый шаблон',
      },
      {
        href: '/test-templates/history',
        icon: History,
        label: 'История',
        description: 'Сессии тестов',
      },
    ],
  },
  // Library - Editor/Admin
  {
    id: 'library',
    title: 'Библиотека',
    lenses: ['editor', 'admin'],
    items: [
      {
        href: '/hr/competencies',
        icon: Target,
        label: 'Компетенции',
        description: 'Управление',
      },
      {
        href: '/hr/behavioral-indicators',
        icon: Lightbulb,
        label: 'Индикаторы',
        description: 'Поведенческие',
      },
      {
        href: '/hr/assessment-questions',
        icon: FileQuestion,
        label: 'Вопросы',
        description: 'Банк вопросов',
      },
      {
        href: '/skill-mapper',
        icon: Network,
        label: 'Skill Mapper',
        description: 'Связи навыков',
        badge: 'New',
      },
    ],
  },
  // Analytics - Admin only
  {
    id: 'analytics',
    title: 'Аналитика',
    lenses: ['admin'],
    items: [
      {
        href: '/psychometrics/items',
        icon: Activity,
        label: 'Статистика',
        description: 'Вопросов',
      },
      {
        href: '/psychometrics/flagged',
        icon: Flag,
        label: 'Отмеченные',
        description: 'Требуют внимания',
      },
    ],
  },
  // System - Admin only
  {
    id: 'system',
    title: 'Система',
    lenses: ['admin'],
    items: [
      {
        href: '/admin/users',
        icon: Users,
        label: 'Пользователи',
        description: 'Управление',
      },
      {
        href: '/settings',
        icon: Settings,
        label: 'Настройки',
        description: 'Системные',
      },
    ],
  },
  // Settings - Editor only (Admin has it in System)
  {
    id: 'editor-settings',
    title: 'Настройки',
    lenses: ['editor'],
    items: [
      {
        href: '/settings',
        icon: Settings,
        label: 'Настройки',
        description: 'Приложения',
      },
    ],
  },
  // Help - All lenses with More menu
  {
    id: 'help',
    title: 'Помощь',
    lenses: ['editor', 'admin'],
    items: [
      {
        href: '/help',
        icon: HelpCircle,
        label: 'Справка',
        description: 'Документация',
      },
    ],
  },
];

/**
 * Paths that should hide the mobile bottom nav
 * These pages have their own mobile navigation (e.g., builder has canvas/simulate tabs)
 */
const HIDDEN_NAV_PATTERNS = [
  /^\/test-templates\/[^/]+\/builder/, // Builder page has its own bottom nav
] as const;

interface MobileBottomNavProps {
  /** Hide the nav (e.g., during immersive mode) */
  hidden?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * NavItem Component - Individual navigation item with animated indicator
 */
interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  itemWidth: string;
}

function NavItemComponent({ item, isActive, itemWidth }: NavItemComponentProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      style={{ width: itemWidth }}
      className={cn(
        // Layout - dynamic width based on item count
        'relative flex flex-col items-center justify-center',
        'max-w-[80px]',
        // Responsive padding - tighter on xs
        'py-1.5 px-1 sm:px-2',
        // Touch target height (min 48px for WCAG AAA)
        'min-h-[48px]',
        // Touch manipulation for better response
        'touch-manipulation select-none',
        // Rounded for visual feedback
        'rounded-lg',
        // GPU-accelerated transitions
        'will-change-transform',
        'transition-colors duration-150',
        // Colors
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        // Active press feedback
        'active:scale-95 active:opacity-80'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon container with scale animation */}
      <motion.div
        animate={{
          scale: isActive ? 1.02 : 1,
        }}
        transition={springConfig.stiff}
        className="relative"
      >
        <Icon
          className={cn(
            'size-5',
            isActive && 'stroke-[2.5]'
          )}
        />
      </motion.div>

      {/* Label */}
      <span
        className={cn(
          // 10px on xs, 11px on sm+ for readability
          'text-[10px] sm:text-[11px] leading-none whitespace-nowrap mt-0.5',
          isActive ? 'font-semibold' : 'font-medium'
        )}
      >
        {item.label}
      </span>

      {/* Active indicator pill - animated with layoutId */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={springConfig.stiff}
          />
        )}
      </AnimatePresence>
    </Link>
  );
}

/**
 * MoreButton Component - Trigger for additional menu
 */
interface MoreButtonProps {
  onClick: () => void;
  isOpen: boolean;
  itemWidth: string;
}

function MoreButton({ onClick, isOpen, itemWidth }: MoreButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: itemWidth }}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'max-w-[80px]',
        'py-1.5 px-1 sm:px-2',
        'min-h-[48px]',
        'touch-manipulation select-none',
        'rounded-lg',
        'transition-colors duration-150',
        'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        'active:scale-95 active:opacity-80'
      )}
      aria-label="More options"
      aria-expanded={isOpen}
    >
      <MoreHorizontal className="size-5" />
      <span className="text-[10px] sm:text-[11px] font-medium leading-none mt-0.5">
        Ещё
      </span>
    </button>
  );
}

/**
 * MobileBottomNav - Lens-aware, thumb-zone friendly bottom navigation for mobile.
 *
 * Design Pattern:
 * - Lens-aware navigation - shows different items based on active lens
 * - Dynamic width per item based on item count (100% / totalItems)
 * - 48px container height (optimized from 56px)
 * - Responsive sizing: tighter on xs, roomier on sm+
 *
 * Lens Configuration:
 * - User lens: Главная, Мои тесты, Тесты, Профиль (4 items, no "More")
 * - Editor lens: Главная, Тесты, Профиль (3 items + "More" with HR routes)
 * - Admin lens: Главная, Тесты, Анализ, Профиль (4 items + "More" with HR/Settings)
 *
 * Features:
 * - Only visible on mobile (< 768px)
 * - Fixed to bottom with safe area inset support
 * - Glassmorphism background with blur
 * - Animated pill indicator under active item (Framer Motion layoutId)
 * - Scroll-based hide/show (slide down on scroll down, slide up on scroll up)
 * - "More" menu enhanced sheet with grid layout
 * - Spring animations for smooth transitions
 *
 * UX Research compliance:
 * - WCAG 2.2 AAA touch targets (48px minimum)
 * - Apple Human Interface Guidelines (49pt tab bar)
 * - Material Design 3 (80dp navigation bar concept)
 * - Thumb-zone ergonomics (equal width distribution)
 * - Fitts's Law optimized (predictable touch zones)
 *
 * @example
 * ```tsx
 * // In your layout
 * <MobileBottomNav />
 * ```
 */
export function MobileBottomNav({ hidden = false, className }: MobileBottomNavProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { shouldShowNav } = useScrollDirection();
  const activeLens = useLensStore((state) => state.activeLens);
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  // Get lens-filtered navigation items
  const lensConfig = getLensConfig(activeLens);
  const visibleRoutes = lensConfig.visibleRoutes;

  // Filter primary nav items based on lens-specific selection
  const lensNavRoutes = LENS_NAV_ITEMS[activeLens] || LENS_NAV_ITEMS.user;
  const primaryNavItems = React.useMemo(
    () => ALL_NAV_ITEMS.filter((item) => lensNavRoutes.includes(item.href)),
    [lensNavRoutes]
  );

  // Filter more menu sections based on lens and visible routes
  const moreMenuSections = React.useMemo(
    () =>
      MORE_MENU_SECTIONS.filter((section) => section.lenses.includes(activeLens))
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => visibleRoutes.includes(item.href)),
        }))
        .filter((section) => section.items.length > 0),
    [activeLens, visibleRoutes]
  );

  // Calculate item width based on number of items (including "More" button if needed)
  const showMoreButton = moreMenuSections.length > 0;
  const totalItems = primaryNavItems.length + (showMoreButton ? 1 : 0);
  const itemWidthPercent = `${Math.floor(100 / totalItems)}%`;

  // Check if current path should hide the nav (e.g., builder has its own nav)
  const isHiddenByPath = React.useMemo(
    () => HIDDEN_NAV_PATTERNS.some((pattern) => pattern.test(pathname)),
    [pathname]
  );

  // Don't render on desktop, when explicitly hidden, or on paths with their own nav
  if (!isMobile || hidden || isHiddenByPath) {
    return null;
  }

  const isActive = (item: NavItem) => {
    if (item.matchPattern) {
      return item.matchPattern.test(pathname);
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Main Navigation */}
      <motion.nav
        initial={false}
        animate={{
          y: shouldShowNav ? 0 : '100%',
        }}
        transition={{
          duration: timing.slow / 1000,
          ease: [0.4, 0, 0.2, 1], // Standard easing
        }}
        className={cn(
          // Fixed positioning
          'fixed bottom-0 inset-x-0 z-50',
          // Background with blur - enhanced glassmorphism
          'bg-background/95 backdrop-blur-lg',
          // Border
          'border-t border-border/50',
          // Safe area support for notched devices
          'pb-safe',
          // Hide on desktop via media query as backup
          'md:hidden',
          // GPU acceleration hint
          'will-change-transform',
          className
        )}
        aria-label="Mobile navigation"
      >
        {/* Container with reduced height (48px from 56px) */}
        <div className="flex items-center justify-evenly h-12 w-full">
          {primaryNavItems.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              isActive={isActive(item)}
              itemWidth={itemWidthPercent}
            />
          ))}

          {/* More menu trigger */}
          {showMoreButton && (
            <MoreButton
              onClick={() => setShowMoreMenu(true)}
              isOpen={showMoreMenu}
              itemWidth={itemWidthPercent}
            />
          )}
        </div>
      </motion.nav>

      {/* More menu sheet */}
      <Sheet open={showMoreMenu} onOpenChange={setShowMoreMenu}>
        <SheetContent
          side="bottom"
          className="h-auto max-h-[85dvh] rounded-t-2xl pb-safe"
          showCloseButton={false}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-3">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          <SheetHeader className="text-left px-4 pb-3">
            <SheetTitle>Меню</SheetTitle>
            <SheetDescription>
              Быстрый доступ ко всем разделам
            </SheetDescription>
          </SheetHeader>

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[calc(85dvh-120px)] px-4 pb-4 space-y-4">
            {moreMenuSections.map((section) => (
              <div key={section.id}>
                {/* Section title */}
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {section.title}
                </h3>

                {/* Grid layout for section items */}
                <div className="grid grid-cols-3 gap-2">
                  {section.items.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowMoreMenu(false)}
                        className={cn(
                          // Layout
                          'relative flex flex-col items-center gap-1.5 p-3 rounded-xl',
                          // Touch target
                          'min-h-[76px]',
                          'touch-manipulation select-none',
                          // Transitions
                          'transition-colors duration-150',
                          'active:scale-[0.98]',
                          // Colors
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/50 hover:bg-muted active:bg-muted/80'
                        )}
                      >
                        {/* Badge */}
                        {item.badge && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}

                        {/* Icon container */}
                        <div
                          className={cn(
                            'flex items-center justify-center size-9 rounded-full shrink-0',
                            active ? 'bg-primary/20' : 'bg-background'
                          )}
                        >
                          <item.icon className="size-4" />
                        </div>

                        {/* Label */}
                        <span
                          className={cn(
                            'text-[11px] font-medium text-center leading-tight',
                            active && 'text-primary'
                          )}
                        >
                          {item.label}
                        </span>

                        {/* Description */}
                        {item.description && (
                          <span className="text-[9px] text-muted-foreground text-center leading-tight truncate w-full">
                            {item.description}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-12 pb-safe md:hidden" aria-hidden="true" />
    </>
  );
}

/**
 * Hook to control mobile bottom nav visibility
 * Useful for hiding during immersive experiences (e.g., test-taking)
 */
export function useMobileBottomNav() {
  const [isHidden, setIsHidden] = React.useState(false);

  return {
    isHidden,
    hide: () => setIsHidden(true),
    show: () => setIsHidden(false),
    toggle: () => setIsHidden((prev) => !prev),
  };
}
