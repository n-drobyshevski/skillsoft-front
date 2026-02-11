"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import { LucideProps } from "lucide-react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  children,
}: {
  title: string;
  value: number | string;
  children?: React.ReactNode;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}) {
  return (
    <Card className={cn(
      "relative transition-all duration-200 h-full",
      "hover:shadow-lg",
      // Mobile touch feedback
      "touch-manipulation active:scale-[0.98]",
      // Focus visible for accessibility
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2.5 sm:p-3 md:p-6 pb-1.5 sm:pb-2 md:pb-3">
        <CardTitle className="text-[11px] sm:text-[13px] md:text-sm lg:text-base font-medium line-clamp-1 sm:line-clamp-2">
          {title}
          <span className="sr-only">, value is {value}</span>
        </CardTitle>
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground shrink-0 ml-1.5 sm:ml-2" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-2.5 sm:p-3 md:p-6 pt-0">
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">{value}</div>
        {children && (
          <div className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm text-muted-foreground mt-1 sm:mt-1.5 line-clamp-1 sm:line-clamp-2">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
