"use client";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Upload, 
  Users, 
  ClipboardList, 
  Download,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

const quickActions = [
  {
    title: "New Competency",
    description: "Create a new competency framework",
    icon: Plus,
    href: "/competencies/new",
    variant: "default" as const,
    priority: 1,
    featured: true
  },
  {
    title: "Add Indicators",
    description: "Define behavioral indicators",
    icon: Users,
    href: "/behavioral-indicators/new",
    variant: "outline" as const,
    priority: 1,
    featured: true
  },
  {
    title: "Assessment Questions",
    description: "Create evaluation questions",
    icon: ClipboardList,
    href: "/assessment-questions/new",
    variant: "outline" as const,
    priority: 2,
    featured: false
  },
  {
    title: "Import Data",
    description: "Bulk import competencies",
    icon: Upload,
    href: "#",
    variant: "ghost" as const,
    priority: 2,
    featured: false
  },
  {
    title: "Generate Report",
    description: "Export analytics report",
    icon: Download,
    href: "#",
    variant: "ghost" as const,
    priority: 3,
    featured: false
  },
];

export default function QuickActionsCard() {
  const isMobile = useIsMobile();
  
  // On mobile, show only priority 1 and 2 actions
  const actionsToShow = isMobile ? quickActions.filter(action => action.priority <= 2) : quickActions;
  useEffect(() => {
    // For debugging: log which actions are shown
    console.log("QuickActionsCard - isMobile:", isMobile, "Actions to show:", actionsToShow);
  }, [isMobile, actionsToShow]);
  return (
    <div className="space-y-4">
      {/* Featured Actions */}
      <div className="grid gap-3">
        {actionsToShow.filter(action => action.featured).map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            size={isMobile ? "default" : "lg"}
            className={`
              group relative w-full h-auto min-h-[60px] p-4 
              justify-start text-left overflow-hidden
              transition-all duration-200 ease-in-out
              hover:shadow-md hover:scale-[1.02]
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              ${action.variant === "default" 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25" 
                : ""
              }
            `}
            asChild
          >
            <Link 
              href={action.href}
              aria-label={`${action.title}: ${action.description}`}
            >
              <div className="flex items-center gap-4 w-full">
                <div 
                  className={`
                    shrink-0 rounded-xl p-3 transition-all duration-200
                    ${action.variant === "default" 
                      ? "bg-primary-foreground/20 text-primary-foreground group-hover:bg-primary-foreground/30" 
                      : "bg-primary/10 text-primary group-hover:bg-primary/20"
                    }
                  `}
                >
                  <action.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div 
                    className={`
                      font-semibold text-base leading-tight
                      ${action.variant === "default" ? "text-primary-foreground" : "text-foreground"}
                    `}
                  >
                    {action.title}
                  </div>
                  {!isMobile && 
                  <div 
                    className={`
                      text-sm leading-tight
                      ${action.variant === "default" 
                        ? "text-primary-foreground/80" 
                        : "text-muted-foreground"
                      }
                    `}
                  >
                    {action.description}
                  </div> }
                </div>
                <ArrowRight 
                  className={`
                    h-4 w-4 transition-transform duration-200 group-hover:translate-x-1
                    ${action.variant === "default" ? "text-primary-foreground/60" : "text-muted-foreground"}
                  `}
                  aria-hidden="true"
                />
              </div>
            </Link>
          </Button>
        ))}
      </div>

      {/* Secondary Actions */}
      {actionsToShow.filter(action => !action.featured).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            More Actions
          </div>
          <div className="grid grid-cols-1 gap-2 w-full">
            {actionsToShow.filter(action => !action.featured).map((action, index) => (
              <Button
                key={`secondary-${index}`}
                variant={action.variant}
                size="sm"
                className={`
                  group w-full h-auto min-h-11 p-3 
                  justify-start text-left
                  transition-all duration-200 ease-in-out
                  hover:shadow-sm hover:bg-accent/80
                  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                `}
                asChild
              >
                <Link 
                  href={action.href}
                  aria-label={`${action.title}: ${action.description}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="shrink-0 rounded-lg p-2 bg-muted group-hover:bg-muted/80 transition-colors">
                      <action.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-sm text-foreground">
                        {action.title}
                      </div>
                      {!isMobile && (
                        <div className="text-xs text-muted-foreground line-clamp-1 ">
                          {action.description}
                        </div>
                      )}
                    </div>
                    <ArrowRight 
                      className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Mobile: Show link to view all actions if some are hidden */}
      {isMobile && quickActions.length > actionsToShow.length && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
          asChild
        >
          <Link href="/actions" aria-label="View all quick actions">
            <span>View all actions</span>
            <span className="text-xs">({quickActions.length - actionsToShow.length} more)</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
