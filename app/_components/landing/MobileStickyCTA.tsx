'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (approximately 600px)
      const shouldShow = window.scrollY > 600;
      setIsVisible(shouldShow && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'bg-background/95 backdrop-blur-lg border-t border-border',
        'p-4 safe-area-inset-bottom',
        'transition-transform duration-300',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="flex items-center gap-3">
        <Link href="/sign-up" className="flex-1">
          <Button className="w-full h-12 text-base">
            Начать бесплатно
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
