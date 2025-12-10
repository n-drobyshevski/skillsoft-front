'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsHeaderProps {
  isPassed: boolean;
}

export function ResultsHeader({ isPassed }: ResultsHeaderProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isPassed) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPassed]);

  return (
    <div className="relative flex justify-center mb-4">
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center">
          {/* Simple CSS Confetti */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 5)],
                width: '10px',
                height: '10px',
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}
      
      {isPassed ? (
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in duration-500">
          <Trophy className="h-12 w-12 text-green-600 dark:text-green-400 animate-bounce" />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Target className="h-12 w-12 text-amber-600 dark:text-amber-400" />
        </div>
      )}
    </div>
  );
}
