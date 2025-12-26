import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileQuestion, Search, BookOpen } from 'lucide-react';
import Link from 'next/link';

/**
 * Not Found page for Documentation section
 *
 * Server component that displays when a docs page doesn't exist.
 * Provides options to search or return to main docs.
 */
export default function DocsNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <FileQuestion className="h-7 w-7 text-muted-foreground" />
          </div>
          <CardTitle>Страница не найдена</CardTitle>
          <CardDescription className="text-base">
            Запрашиваемая страница документации не существует. Возможно, она
            была перемещена или удалена.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/docs">
              <Search className="w-4 h-4 mr-2" />
              Поиск по документации
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/docs">
              <BookOpen className="w-4 h-4 mr-2" />
              Главная документации
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
