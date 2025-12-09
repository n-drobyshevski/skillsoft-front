'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  FileText, 
  Send, 
  GitBranch, 
  ChevronRight,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransition } from 'react';
import { publishTemplate, createNewVersion } from '../actions';
import { useEffect } from 'react';
import { useHeader } from '@/context/HeaderContext';

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface TemplateHeaderProps {
  templateId: string;
  templateName: string;
  status: TemplateStatus;
}

/**
 * Status badge styling based on template status
 */
function getStatusBadgeVariant(status: TemplateStatus) {
  switch (status) {
    case 'DRAFT':
      return 'outline';
    case 'PUBLISHED':
      return 'default';
    case 'ARCHIVED':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getStatusColorClasses(status: TemplateStatus) {
  switch (status) {
    case 'DRAFT':
      return 'border-yellow-500/50 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
    case 'PUBLISHED':
      return 'border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/30';
    case 'ARCHIVED':
      return 'border-gray-500/50 text-gray-500 bg-gray-100 dark:bg-gray-800/50';
    default:
      return '';
  }
}

/**
 * Sticky header for the Test Template Hub
 * Contains breadcrumb navigation, status badge, and action buttons
 */
export function TemplateHeader({
  templateId,
  templateName,
  status,
}: TemplateHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const { setTitle, setSubtitle, setEntityName } = useHeader();

  useEffect(() => {
    setTitle(templateName);
    setSubtitle('Управление шаблоном теста');
    setEntityName('шаблон');

    return () => {
      setTitle('');
      setSubtitle('');
      setEntityName('');
    };
  }, [setEntityName, setSubtitle, setTitle, templateName]);

  const handlePublish = () => {
    startTransition(async () => {
      await publishTemplate(templateId);
    });
  };

  const handleNewVersion = () => {
    startTransition(async () => {
      await createNewVersion(templateId);
    });
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 lg:px-6 h-14">
      {/* Left: Breadcrumb + Status */}
      <div className="flex items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/test-templates" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>Templates</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2 font-medium">
                <span className="max-w-[200px] truncate">{templateName}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Status Badge */}
        <Badge 
          variant={getStatusBadgeVariant(status)}
          className={cn(
            'text-xs font-medium',
            getStatusColorClasses(status)
          )}
        >
          {status}
        </Badge>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {status === 'DRAFT' && (
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Publish
          </Button>
        )}

        {status === 'PUBLISHED' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewVersion}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitBranch className="h-4 w-4" />
            )}
            New Version
          </Button>
        )}
      </div>
    </header>
  );
}
