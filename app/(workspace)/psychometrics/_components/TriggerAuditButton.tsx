'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { RefreshCw, Loader2 } from 'lucide-react';
import { psychometricsApi } from '@/services/api';

export function TriggerAuditButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleTriggerAudit = async () => {
    setIsLoading(true);
    try {
      const result = await psychometricsApi.triggerAudit();
      toast.success('Аудит завершен', {
        description: result.message || `Обработано: ${result.itemsRecalculated} элементов, ${result.competenciesRecalculated} компетенций`,
      });
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось запустить аудит';
      toast.error('Ошибка аудита', {
        description: message,
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Запустить аудит
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Запустить психометрический аудит?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Аудит выполнит пересчет всех психометрических показателей:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Индексы сложности и различения для всех вопросов</li>
                <li>Коэффициенты Cronbach's Alpha для компетенций</li>
                <li>Надежность шкал Big Five</li>
                <li>Автоматическое обновление статусов элементов</li>
              </ul>
              <p className="text-amber-600 dark:text-amber-400">
                Это может занять несколько минут в зависимости от объема данных.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleTriggerAudit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Выполняется...
              </>
            ) : (
              'Запустить'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
