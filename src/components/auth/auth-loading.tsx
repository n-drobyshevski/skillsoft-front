"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuthLoadingSpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function AuthLoadingSpinner({ className, size = "default" }: AuthLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading..."
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}

// Animated dots for subtle loading indication
export function AuthLoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="h-1.5 w-1.5 bg-current rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="h-1.5 w-1.5 bg-current rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="h-1.5 w-1.5 bg-current rounded-full animate-pulse"></div>
    </div>
  );
}