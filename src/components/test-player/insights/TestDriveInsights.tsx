'use client';

import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { useTestDriveStore } from '@/store/test-drive-store';
import { AnalyticsPanel } from './AnalyticsPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TestDriveInsights() {
  const isTestDriveMode = useTestDriveStore((state) => state.isTestDriveMode);
  const isPanelOpen = useTestDriveStore((state) => state.isPanelOpen);
  const closePanel = useTestDriveStore((state) => state.closePanel);
  const isMobile = useIsMobile();

  if (!isTestDriveMode) return null;
  if (!isMobile) return null;

  return (
    <Drawer open={isPanelOpen} onOpenChange={(open) => !open && closePanel()}>
      <DrawerContent className="max-h-[85vh] bg-[var(--zen-surface)] border-t border-amber-500/30 backdrop-blur-xl flex flex-col">
        <DrawerTitle className="sr-only">Панель анализа Test-Drive</DrawerTitle>
        <DrawerDescription className="sr-only">
          Детальная информация о текущем вопросе
        </DrawerDescription>
        <DrawerHeader className="px-3 py-3 border-b border-amber-500/20 bg-amber-500/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/30 w-8 h-8">
              <Eye className="h-4 w-4 text-[var(--zen-warning)]" />
            </div>
            <div className="flex-1">
              <div className="text-[var(--zen-text)] flex items-center gap-2 font-semibold">
                Панель анализа
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 border-amber-500/30 text-[var(--zen-warning)] text-[10px]"
                >
                  Test-Drive
                </Badge>
              </div>
            </div>
          </div>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <AnalyticsPanel />
        </div>
        <div className="border-t border-[var(--zen-border)] bg-[var(--zen-card)] px-3 py-2 pb-safe shrink-0">
          <p className="text-xs text-[var(--zen-text-muted)] text-center">Свайпните вниз для закрытия</p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
