"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface TouchTargetProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
  className?: string;
}

export function TouchTarget({ children, className, ref, ...props }: TouchTargetProps) {
  return (
    <Button
      ref={ref}
      className={cn(
        "min-h-11 min-w-11 touch-manipulation",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "active:scale-95 transition-transform duration-100",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

// Mobile-friendly container with safe areas
interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileContainer = ({ children, className }: MobileContainerProps) => {
  return (
    <div
      className={cn(
        // Safe area insets for mobile devices
        "px-4 sm:px-6",
        // Proper spacing on mobile
        "pb-safe-bottom pt-safe-top",
        className
      )}
    >
      {children}
    </div>
  );
};

// Screen reader only text for accessibility
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

export const ScreenReaderOnly = ({ children }: ScreenReaderOnlyProps) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

// Mobile-optimized text that scales appropriately
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

export const ResponsiveText = ({ 
  children, 
  className, 
  as: Component = "p" 
}: ResponsiveTextProps) => {
  return (
    <Component
      className={cn(
        // Base responsive text sizing
        "text-sm sm:text-base",
        // Improved line height for readability
        "leading-relaxed",
        className
      )}
    >
      {children}
    </Component>
  );
};

// Skip to main content link for accessibility
export const SkipToMain = () => {
  return (
    <a
      href="#main-content"
      className={cn(
        // Hidden by default, visible on focus
        "sr-only focus:not-sr-only",
        // Positioned at top when focused
        "fixed top-4 left-4 z-50",
        // Styled as a button
        "bg-primary text-primary-foreground px-4 py-2 rounded-md",
        // Enhanced focus styles
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      Skip to main content
    </a>
  );
};