"use client";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Upload, 
  Users, 
  ClipboardList, 
  Download
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "New Competency",
    description: "Create a new competency framework",
    icon: Plus,
    href: "/competencies/new",
    variant: "default" as const
  },
  {
    title: "Add Indicators",
    description: "Define behavioral indicators",
    icon: Users,
    href: "/behavioral-indicators/new",
    variant: "secondary" as const
  },
  {
    title: "Assessment Questions",
    description: "Create evaluation questions",
    icon: ClipboardList,
    href: "/assessment-questions/new",
    variant: "secondary" as const
  },
  {
    title: "Import Data",
    description: "Bulk import competencies",
    icon: Upload,
    href: "#",
    variant: "outline" as const
  },
  {
    title: "Generate Report",
    description: "Export analytics report",
    icon: Download,
    href: "#",
    variant: "outline" as const
  },
];

export default function QuickActionsCard() {
  return (
    <div className="@container/actions">
      {/* Mobile: 2 columns for primary actions, stacked for others */}
      <div className="grid grid-cols-1 gap-3 @[280px]/actions:grid-cols-2 @[400px]/actions:grid-cols-1">
        {quickActions.map((action, index) => {
          // Primary actions get featured treatment on mobile
          const isPrimary = index < 2;
          
          return (
            <Button
              key={index}
              variant={action.variant}
              className={`
                w-full justify-start h-auto touch-target focus-mobile
                ${isPrimary 
                  ? "p-4 @[280px]/actions:p-3 @[400px]/actions:p-4" 
                  : "p-3 @[400px]/actions:p-4"
                }
                ${isPrimary && index < 2 
                  ? "@[280px]/actions:col-span-1" 
                  : "col-span-full @[280px]/actions:col-span-2 @[400px]/actions:col-span-1"
                }
              `}
              asChild
            >
              <Link href={action.href}>
                <action.icon className={`
                  shrink-0 
                  ${isPrimary 
                    ? "mr-3 h-5 w-5 @[280px]/actions:mr-2 @[280px]/actions:h-4 @[280px]/actions:w-4 @[400px]/actions:mr-3 @[400px]/actions:h-5 @[400px]/actions:w-5" 
                    : "mr-3 h-4 w-4"
                  }
                `} />
                <div className="text-left min-w-0 flex-1">
                  <div className={`
                    font-medium truncate
                    ${isPrimary 
                      ? "text-sm @[280px]/actions:text-xs @[400px]/actions:text-sm" 
                      : "text-sm"
                    }
                  `}>
                    {action.title}
                  </div>
                  <div className={`
                    text-muted-foreground line-clamp-2
                    ${isPrimary 
                      ? "text-xs @[280px]/actions:text-xs @[280px]/actions:hidden @[400px]/actions:block @[400px]/actions:text-xs" 
                      : "text-xs"
                    }
                  `}>
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
