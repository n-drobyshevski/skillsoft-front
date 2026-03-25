"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { User, Pencil, Shield, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useLens, useLensConfig, useAvailableLenses, useLensKeyboardShortcuts } from "@/hooks/useLens";
import { getLensConfig } from "@/config/lens-configs";
import { type LensType } from "@/store/lens-store";
import { cn } from "@/lib/utils";

/**
 * Lens Switcher - Role-based view selector for sidebar
 *
 * Migrated to Zustand for better performance:
 * - Selective subscriptions (no unnecessary re-renders)
 * - Memoized handlers and computed values
 * - Respects reduced motion preferences
 *
 * Animation principles:
 * - Subtle micro-interactions (150-200ms duration)
 * - Hardware-accelerated transforms (scale, rotate)
 * - Easing: ease-out for snappy feel
 */

// Common animation classes - extracted to avoid lint warnings about duplication
const ANIM = {
  base: "transition-all duration-200 ease-out motion-reduce:transition-none",
  fast: "transition-all duration-150 ease-out motion-reduce:transition-none",
  transform: "transition-transform duration-200 ease-out motion-reduce:transition-none",
  colors: "transition-colors duration-150 motion-reduce:transition-none",
} as const;

// Icon component with memoization-friendly props
function LensIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "shield":
      return <Shield className={className} />;
    case "edit":
      return <Pencil className={className} />;
    case "user":
    default:
      return <User className={className} />;
  }
}


export function LensSwitcher() {
  // i18n translations for lens names and descriptions
  const t = useTranslations("lens");

  // Alt+1/2/3 keyboard shortcuts for lens switching
  useLensKeyboardShortcuts();

  // Subscribe only to what we need (selective subscriptions)
  const { activeLens, setLens } = useLens();
  const lensConfig = useLensConfig();
  const availableLenses = useAvailableLenses();

  // Memoize lens selection handler
  const handleLensSelect = useCallback(
    (lensId: LensType) => () => setLens(lensId),
    [setLens]
  );

  // Memoize available lens configs
  const lensOptions = useMemo(
    () => availableLenses.map((id) => ({ id, config: getLensConfig(id) })),
    [availableLenses]
  );

  // Only show if user has multiple lens options
  if (availableLenses.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className={cn(
            "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
            "group/lens"
          )}
          tooltip={t("currentView", { name: t(`${lensConfig.id}.name`) })}
        >
          {/* Lens Icon - with scale animation on hover */}
          <div
            className={cn(
              "flex aspect-square size-8 items-center justify-center rounded-lg",
              ANIM.base,
              "group-hover/lens:scale-105",
              "group-data-[state=open]/lens:scale-95",
              lensConfig.bgColor
            )}
          >
            <LensIcon
              type={lensConfig.icon}
              className={cn("size-4", ANIM.transform, lensConfig.color)}
            />
          </div>

          {/* Label & Description */}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {t(`${lensConfig.id}.name`)}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {t("mode")}
            </span>
          </div>

          {/* Chevron with rotation animation */}
          <ChevronDown
            className={cn(
              "ml-auto size-4",
              ANIM.transform,
              "group-data-[state=open]/lens:rotate-180"
            )}
          />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        className={cn(
          "w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg",
          // Subtle slide + fade animation
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2",
          "duration-150"
        )}
        sideOffset={4}
      >
        {lensOptions.map(({ id, config }, index) => {
          const isActive = activeLens === id;

          return (
            <DropdownMenuItem
              key={id}
              onClick={handleLensSelect(id)}
              className={cn(
                "flex items-center gap-3 cursor-pointer p-2",
                ANIM.colors,
                isActive && config.bgColor
              )}
              // Stagger animation delay for each item
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Icon with hover scale */}
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg shrink-0",
                  ANIM.fast,
                  "hover:scale-110",
                  isActive ? "bg-background/60" : config.bgColor
                )}
              >
                <LensIcon
                  type={config.icon}
                  className={cn(
                    "size-4",
                    ANIM.colors,
                    isActive ? config.color : "text-muted-foreground"
                  )}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  ANIM.colors,
                  isActive && config.color
                )}>
                  {t(`${id}.name`)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {t(`${id}.description`)}
                </p>
              </div>

              {/* Check indicator with scale-in animation */}
              {isActive && (
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    "animate-in zoom-in-50 duration-200 motion-reduce:animate-none",
                    config.color
                  )}
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact lens indicator for collapsed sidebar state
 */
export function LensIndicator() {
  const t = useTranslations("lens");
  const lensConfig = useLensConfig();
  const availableLenses = useAvailableLenses();

  if (availableLenses.length <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-lg",
        ANIM.base,
        "hover:scale-105",
        lensConfig.bgColor
      )}
      title={t("view", { name: t(`${lensConfig.id}.name`) })}
    >
      <LensIcon
        type={lensConfig.icon}
        className={cn("size-4", lensConfig.color)}
      />
    </div>
  );
}
