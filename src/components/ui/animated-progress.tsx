'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps
  extends React.ComponentPropsWithRef<typeof ProgressPrimitive.Root> {
  value?: number;
  indicatorClassName?: string;
  animationDelay?: number;
  animationDuration?: number;
}

function AnimatedProgress({
  className,
  value = 0,
  indicatorClassName,
  animationDelay = 0,
  animationDuration = 600,
  ref,
  ...props
}: AnimatedProgressProps) {
  const [animatedValue, setAnimatedValue] = React.useState(0);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAnimatedValue(value);
    }, animationDelay);

    return () => clearTimeout(timeoutId);
  }, [value, animationDelay]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 bg-primary rounded-full',
          indicatorClassName
        )}
        style={{
          transform: `translateX(-${100 - animatedValue}%)`,
          transition: `transform ${animationDuration}ms cubic-bezier(0.65, 0, 0.35, 1)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { AnimatedProgress };
