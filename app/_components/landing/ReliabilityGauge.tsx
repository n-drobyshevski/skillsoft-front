'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface ReliabilityGaugeProps {
  value: number;
  className?: string;
}

export function ReliabilityGauge({ value, className }: ReliabilityGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('landing.psychometrics.gauge');

  const getColor = (v: number) => (v >= 0.8 ? '#10b981' : v >= 0.7 ? '#3b82f6' : v >= 0.6 ? '#f59e0b' : '#ef4444');
  const getLabel = (v: number) => (v >= 0.8 ? t('excellent') : v >= 0.7 ? t('good') : v >= 0.6 ? t('acceptable') : t('needsReview'));

  useEffect(() => {
    if (hasAnimated || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimatedValue(value);
      setHasAnimated(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const progress = Math.min((Date.now() - startTime) / 1200, 1);
            setAnimatedValue(value * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const strokeDashoffset = 157 * (1 - animatedValue);
  const color = getColor(value);

  return (
    <div ref={ref} className={cn('flex flex-col items-center', className)}>
      <svg width={120} height={72} viewBox="0 0 120 72" className="overflow-visible">
        <path d="M 8 62 A 52 52 0 0 1 112 62" fill="none" stroke="currentColor" strokeWidth={8} className="text-muted/30" strokeLinecap="round" />
        <path d="M 8 62 A 52 52 0 0 1 112 62" fill="none" stroke={color} strokeWidth={8} strokeDasharray="157" strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-100" />
      </svg>
      <div className="text-center mt-2">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>{animatedValue.toFixed(2)}</span>
        <p className="text-sm text-muted-foreground">{getLabel(value)}</p>
      </div>
    </div>
  );
}
