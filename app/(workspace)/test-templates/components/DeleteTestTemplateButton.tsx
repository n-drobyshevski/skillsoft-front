'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
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
import { deleteTestTemplate } from '@/app/actions';

interface DeleteTestTemplateButtonProps {
  templateId: string;
  templateName: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export default function DeleteTestTemplateButton({
  templateId,
  templateName,
  variant = 'outline',
  size = 'default',
  showIcon = true,
  className,
}: DeleteTestTemplateButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteTestTemplate(templateId);
        toast.success('Тест удалён', {
          description: `Тест "${templateName}" был успешно удалён.`,
        });
        setOpen(false);
        router.push('/test-templates');
        router.refresh();
      } catch (error) {
        toast.error('Ошибка удаления', {
          description: error instanceof Error 
            ? error.message 
            : 'Не удалось удалить тест. Попробуйте позже.',
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : showIcon ? (
            <Trash2 className="h-4 w-4" />
          ) : null}
          <span className={showIcon ? 'ml-2' : ''}>Удалить</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить тест?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Вы уверены, что хотите удалить тест <strong>&quot;{templateName}&quot;</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              Это действие нельзя отменить. Все данные, связанные с этим шаблоном теста, 
              будут безвозвратно удалены.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Удаление...
              </>
            ) : (
              'Удалить тест'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
