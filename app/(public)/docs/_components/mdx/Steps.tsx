import { ReactNode, Children, isValidElement, cloneElement } from "react";
import { cn } from "@/lib/utils";

interface StepsProps {
  /** Step items as children */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

interface StepProps {
  /** Step title */
  title: string;
  /** Step content */
  children: ReactNode;
  /** Step number (auto-assigned by Steps component) */
  stepNumber?: number;
  /** Whether this is the last step */
  isLast?: boolean;
}

/**
 * Steps Container Component
 *
 * Wraps Step components and provides numbering.
 *
 * @example
 * <Steps>
 *   <Step title="First Step">
 *     Content for step 1
 *   </Step>
 *   <Step title="Second Step">
 *     Content for step 2
 *   </Step>
 * </Steps>
 */
export function Steps({ children, className }: StepsProps) {
  const childArray = Children.toArray(children);

  return (
    <div className={cn("my-6", className)} role="list">
      {childArray.map((child, index) => {
        if (isValidElement(child) && child.type === Step) {
          return cloneElement(child as React.ReactElement<StepProps>, {
            stepNumber: index + 1,
            isLast: index === childArray.length - 1,
          });
        }
        return child;
      })}
    </div>
  );
}

/**
 * Individual Step Component
 *
 * Represents a single step in a step-by-step guide.
 * Should be used inside a Steps container.
 */
export function Step({ title, children, stepNumber = 1, isLast }: StepProps) {
  return (
    <div className="relative flex gap-4" role="listitem">
      {/* Step Number Circle and Connector Line */}
      <div className="flex flex-col items-center">
        {/* Number Circle */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          {stepNumber}
        </div>

        {/* Connector Line */}
        {!isLast && (
          <div className="mt-2 h-full w-0.5 bg-border flex-1 min-h-[24px]" />
        )}
      </div>

      {/* Step Content */}
      <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
        <h4 className="mb-2 font-semibold text-foreground leading-8">
          {title}
        </h4>
        <div className="text-sm text-muted-foreground [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2">
          {children}
        </div>
      </div>
    </div>
  );
}
