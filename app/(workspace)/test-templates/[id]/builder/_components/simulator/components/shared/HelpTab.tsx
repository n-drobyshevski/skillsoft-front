'use client';

import { useTranslations } from 'next-intl';
import { HelpCircle } from 'lucide-react';
import { Strategy, STRATEGY_HELP_CONTENT } from '../../strategy-context';

interface HelpTabProps {
  strategy: Strategy;
}

export function HelpTab({ strategy }: HelpTabProps) {
  const t = useTranslations('builder.simulator');
  const content = STRATEGY_HELP_CONTENT[strategy];

  return (
    <div className="space-y-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        {t(content.titleKey as Parameters<typeof t>[0])}
      </div>
      <ul className="list-disc pl-4 space-y-1.5">
        {content.pointKeys.map((key, i) => (
          <li key={i}>{t(key as Parameters<typeof t>[0])}</li>
        ))}
      </ul>
      <div className="pt-2 border-t border-border mt-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">{t('results.tip')}</span>{' '}
          {t('results.tipContent')}
        </p>
      </div>
    </div>
  );
}
