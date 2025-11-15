"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import { LucideProps } from "lucide-react";

interface MobileStatsCardProps {
  title: string;
  value: number | string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
  description?: string;
}

export default function MobileStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: MobileStatsCardProps) {
  return (
    <Card className={cn(
      "relative transition-all duration-200 h-full overflow-hidden",
      "hover:shadow-md active:scale-[0.99]",
      // Mobile-optimized styling
      "min-h-[110px] p-0"
    )}>
      <CardHeader className="flex flex-col space-y-1 p-3 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 min-w-0 flex-1">
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-0 space-y-1.5">
        {/* Large value display */}
        <div className="text-xl sm:text-2xl font-bold tracking-tight">
          {value}
        </div>
        
        {/* Trend and description in compact layout */}
        <div className="flex items-start justify-between text-xs gap-1 min-w-0">
          {trend && (
            <div className={cn(
              "flex items-center gap-1 font-medium shrink-0",
              trend.isPositive ? "text-emerald-600" : "text-red-600"
            )}>
              <span>{trend.isPositive ? "↗" : "↘"}</span>
              <span className="text-xs">{trend.value}</span>
            </div>
          )}
          
          {description && (
            <div className="text-muted-foreground text-right min-w-0 truncate">
              {description}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}