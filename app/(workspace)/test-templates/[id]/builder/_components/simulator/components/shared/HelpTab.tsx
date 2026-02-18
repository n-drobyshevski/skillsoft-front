'use client';

import { HelpCircle } from 'lucide-react';
import { Strategy, STRATEGY_HELP_CONTENT } from '../../strategy-context';

interface HelpTabProps {
  strategy: Strategy;
}

export function HelpTab({ strategy }: HelpTabProps) {
  const content = STRATEGY_HELP_CONTENT[strategy];

  return (
    <div className="space-y-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        {content.title}
      </div>
      <ul className="list-disc pl-4 space-y-1.5">
        {content.points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
      <div className="pt-2 border-t border-border mt-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Use personas to stress-test
          difficulty bands. Adjust strictness and saturation, then re-run to compare.
        </p>
      </div>
    </div>
  );
}
