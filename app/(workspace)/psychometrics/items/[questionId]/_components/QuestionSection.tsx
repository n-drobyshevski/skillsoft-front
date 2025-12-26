'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layers, ExternalLink } from 'lucide-react';

interface QuestionSectionProps {
  /** Question text */
  questionText: string;
  /** Competency name */
  competencyName: string;
  /** Indicator title */
  indicatorTitle: string;
  /** Additional className */
  className?: string;
}

/**
 * QuestionSection - Responsive question text with hierarchy
 *
 * Mobile: Collapsible accordion (collapsed by default to reduce scroll)
 * Desktop: Always-visible card
 *
 * The question text is often long and can consume significant viewport space.
 * On mobile, users primarily want to see metrics first, so we collapse this.
 */
export function QuestionSection({
  questionText,
  competencyName,
  indicatorTitle,
  className,
}: QuestionSectionProps) {
  const isMobile = useIsMobile();

  // Truncate question text for accordion preview
  const previewText = questionText.length > 60
    ? `${questionText.slice(0, 60)}...`
    : questionText;

  const content = (
    <>
      <p className="text-base leading-relaxed">{questionText}</p>

      {/* Hierarchy Links */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Layers className="h-4 w-4" />
          <span>Иерархия:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={`/psychometrics/competencies/${competencyName}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors min-h-[32px]"
          >
            {competencyName}
            <ExternalLink className="h-3 w-3" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
            {indicatorTitle}
          </span>
        </div>
      </div>
    </>
  );

  // Desktop: Always-visible Card
  if (!isMobile) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Текст вопроса
          </CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  // Mobile: Collapsible accordion (collapsed by default)
  return (
    <Accordion
      type="single"
      collapsible
      className={cn('rounded-lg border bg-card', className)}
    >
      <AccordionItem value="question" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-start gap-2 min-w-0 flex-1 text-left">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-medium block">Текст вопроса</span>
              <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {previewText}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default QuestionSection;
