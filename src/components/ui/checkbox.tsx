"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Checkbox Component
 *
 * WCAG 2.1 AA Compliant:
 * - Touch target wrapper provides minimum 44x44px clickable area
 * - Visual checkbox is 16x16px (size-4) for aesthetics
 * - Entire wrapper area is clickable for better accessibility
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    // Touch target wrapper - 44x44px minimum for WCAG AAA compliance
    <div className="relative flex items-center justify-center min-w-[44px] min-h-[44px] -m-3">
      <CheckboxPrimitive.Root
        data-slot="checkbox"
        className={cn(
          "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="grid place-content-center text-current transition-none"
        >
          <CheckIcon className="size-3.5" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {/* Invisible touch target expansion */}
      <span
        className="absolute inset-0 cursor-pointer"
        aria-hidden="true"
        onClick={(e) => {
          // Find and click the checkbox when the touch target is clicked
          const checkbox = e.currentTarget.previousElementSibling as HTMLElement;
          if (checkbox && !checkbox.hasAttribute('disabled')) {
            checkbox.click();
          }
        }}
      />
    </div>
  )
}

export { Checkbox }
