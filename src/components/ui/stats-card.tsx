"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";
import { LucideProps, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  description?: string;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
  variant?: "default" | "success" | "warning" | "info" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const variantStyles = {
  default: "",
  success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30",
  warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30",
  info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
  destructive: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
};

const sizeStyles = {
  sm: {
    card: "h-auto",
    header: "p-3 pb-2",
    content: "p-3 pt-0",
    title: "text-xs font-medium",
    value: "text-lg font-bold",
    icon: "h-3 w-3",
  },
  md: {
    card: "h-auto",
    header: "p-4 pb-2 md:p-6 md:pb-3",
    content: "p-4 pt-0 md:p-6 md:pt-0",
    title: "text-sm font-medium",
    value: "text-xl md:text-2xl font-bold",
    icon: "h-4 w-4 md:h-5 md:w-5",
  },
  lg: {
    card: "h-auto min-h-[120px]",
    header: "p-6 pb-3",
    content: "p-6 pt-0",
    title: "text-base font-medium",
    value: "text-2xl md:text-3xl font-bold",
    icon: "h-5 w-5 md:h-6 md:w-6",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
  size = "md",
  loading = false,
  onClick,
  className,
  children,
}: StatsCardProps) {
  const getStyles = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return sizeStyles.sm;
      case "md":
        return sizeStyles.md;
      case "lg":
        return sizeStyles.lg;
      default:
        return sizeStyles.md;
    }
  };
  
  const getVariantStyles = (variant: "default" | "success" | "warning" | "info" | "destructive") => {
    switch (variant) {
      case "success":
        return variantStyles.success;
      case "warning":
        return variantStyles.warning;
      case "info":
        return variantStyles.info;
      case "destructive":
        return variantStyles.destructive;
      default:
        return variantStyles.default;
    }
  };

  const styles = getStyles(size);

  if (loading) {
    return (
      <Card className={cn(styles.card, "animate-pulse", className)}>
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", styles.header)}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className={cn("rounded", styles.icon)} />
        </CardHeader>
        <CardContent className={styles.content}>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        styles.card,
        getVariantStyles(variant),
        "relative transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        styles.header
      )}>
        <CardTitle className={cn(styles.title, "line-clamp-2")}>
          {title}
          <span className="sr-only">, value is {value}</span>
        </CardTitle>
        {Icon && (
          <Icon 
            className={cn(styles.icon, "text-muted-foreground shrink-0 ml-2")} 
            aria-hidden="true" 
          />
        )}
      </CardHeader>
      <CardContent className={styles.content}>
        <div className={cn(styles.value, "tracking-tight tabular-nums")}>
          {value}
        </div>
        
        {/* Trend Badge */}
        {trend && (
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium",
                trend.isPositive 
                  ? "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950" 
                  : "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="mr-1 h-2 w-2" />
              ) : (
                <TrendingDown className="mr-1 h-2 w-2" />
              )}
              {trend.value}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}
        
        {/* Description */}
        {description && (
          <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {description}
          </div>
        )}
        
        {/* Custom children content */}
        {children && (
          <div className="mt-2">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatsCard;