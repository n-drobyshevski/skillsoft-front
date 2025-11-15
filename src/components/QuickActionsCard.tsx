"use client";

import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Upload, 
  Users, 
  ClipboardList, 
  Download,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";

const quickActions = [
  {
    title: "New Competency",
    icon: Plus,
    href: "/competencies/new",
    variant: "default" as const,
    priority: 1
  },
  {
    title: "Add Indicators",
    icon: Users,
    href: "/behavioral-indicators/new",
    variant: "secondary" as const,
    priority: 1
  },
  {
    title: "Assessment Questions",
    description: "Create evaluation questions",
    icon: ClipboardList,
    href: "/assessment-questions/new",
    variant: "outline" as const,
    priority: 2
  },
  {
    title: "Import Data",
    description: "Bulk import competencies",
    icon: Upload,
    href: "#",
    variant: "ghost" as const,
    priority: 2
  },
  {
    title: "Generate Report",
    description: "Export analytics report",
    icon: Download,
    href: "#",
    variant: "ghost" as const,
    priority: 3
  },
];

export default function QuickActionsCard() {
  const isMobile = useIsMobile();
  
  // Show priority 1 and 2 actions on mobile, all on desktop
  const actionsToShow = isMobile ? quickActions.filter(action => action.priority <= 2) : quickActions;

  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className="space-y-2">
        {actionsToShow.slice(0, 2).map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            size={isMobile ? "sm" : "default"}
            className={`
              group relative w-full h-10 sm:h-11 px-3 sm:px-4 
              justify-between text-left
              hover:scale-[1.01] transition-all duration-150
              ${action.variant === "default" 
                ? "shadow-sm" 
                : ""
              }
            `}
            asChild
          >
            <Link 
              href={action.href}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div 
                  className={`
                    shrink-0 rounded-md p-1.5 sm:p-2
                    ${action.variant === "default" 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted"
                    }
                  `}
                >
                  <action.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs sm:text-sm truncate">
                    {action.title}
                  </div>
                  {!isMobile && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {action.description}
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </Button>
        ))}
      </div>

      {/* Secondary Actions */}
      {actionsToShow.length > 2 && (
        <div className="border-t pt-3 space-y-1.5">
          {actionsToShow.slice(2).map((action, index) => (
            <Button
              key={`secondary-${index}`}
              variant="ghost"
              size="sm"
              className={`
                group w-full h-8 sm:h-9 px-2 sm:px-3 
                justify-between text-left
                hover:bg-muted/60 transition-colors
              `}
              asChild
            >
              <Link 
                href={action.href}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <action.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium text-xs sm:text-sm text-foreground truncate">
                    {action.title}
                  </span>
                </div>
                <ChevronRight className="h-3 w-3 shrink-0 opacity-40 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </Button>
          ))}
        </div>
      )}
      
      {/* Mobile: Show remaining actions count */}
      {isMobile && quickActions.length > actionsToShow.length && (
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground justify-center"
            asChild
          >
            <Link href="/actions">
              {quickActions.length - actionsToShow.length} more actions
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
