"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";
import { LucideProps, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
  variant?: "default" | "success" | "warning" | "info" | "destructive" | "primary" | "blue" | "green" | "purple";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

const variantStyles = {
  default: "",
  success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30",
  warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30",
  info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
  destructive: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
  primary: "",
  blue: "",
  green: "",
  purple: "",
};

// Icon background colors for different variants
const iconBgStyles = {
  default: "bg-muted",
  success: "bg-green-500/10",
  warning: "bg-yellow-500/10",
  info: "bg-blue-500/10",
  destructive: "bg-red-500/10",
  primary: "bg-primary/10",
  blue: "bg-blue-500/10",
  green: "bg-emerald-500/10",
  purple: "bg-purple-500/10",
};

const iconColorStyles = {
  default: "text-muted-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
  destructive: "text-red-600 dark:text-red-400",
  primary: "text-primary",
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-emerald-600 dark:text-emerald-400",
  purple: "text-purple-600 dark:text-purple-400",
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
  href,
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
  
  const getVariantStyles = (variant: keyof typeof variantStyles) => {
    return variantStyles[variant] || variantStyles.default;
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

  const isInteractive = !!onClick || !!href;

  const cardContent = (
    <Card 
      className={cn(
        styles.card,
        getVariantStyles(variant),
        "relative transition-all duration-200 group",
        isInteractive && "cursor-pointer hover:shadow-md active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        styles.header
      )}>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              iconBgStyles[variant] || iconBgStyles.default
            )}>
              <Icon 
                className={cn(
                  "h-5 w-5",
                  iconColorStyles[variant] || iconColorStyles.default
                )} 
                aria-hidden="true" 
              />
            </div>
          )}
          <CardTitle className={cn(styles.title, "line-clamp-2")}>
            {title}
            <span className="sr-only">, value is {value}</span>
          </CardTitle>
        </div>
        {isInteractive && (
          <ArrowUpRight 
            className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
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

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}

export default StatsCard;