'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  MessageSquareText,
  Printer,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import type { CompetencyScore } from '@/types/domain';

// ============================================================================
// Competency Category Detection
// ============================================================================

/**
 * Normalized competency categories mapped from competency names.
 * Used to select relevant STAR behavioral interview questions.
 */
type CompetencyCategory =
  | 'leadership'
  | 'communication'
  | 'problem_solving'
  | 'teamwork'
  | 'adaptability'
  | 'technical'
  | 'planning'
  | 'creativity'
  | 'ethics'
  | 'customer_focus'
  | 'general';

/**
 * Keywords for mapping competency names to categories.
 * Case-insensitive matching supports both English and transliterated names.
 */
const CATEGORY_KEYWORDS: Record<CompetencyCategory, string[]> = {
  leadership: ['leadership', 'lead', 'manage', 'direct', 'supervise', 'mentor', 'delegate', 'лидер', 'руковод', 'управлен'],
  communication: ['communication', 'communicat', 'present', 'negotiat', 'persuad', 'influence', 'коммуникац', 'общен', 'перегов'],
  problem_solving: ['problem', 'solving', 'analytical', 'analysis', 'critical thinking', 'decision', 'решен', 'аналитич', 'критическ'],
  teamwork: ['teamwork', 'collaborat', 'cooperat', 'interpersonal', 'team', 'команд', 'сотруднич', 'взаимодейств'],
  adaptability: ['adaptab', 'flexib', 'resilien', 'change', 'agil', 'адаптив', 'гибк', 'устойчив'],
  technical: ['technical', 'technology', 'engineer', 'develop', 'programming', 'техническ', 'технолог', 'инженер'],
  planning: ['planning', 'organiz', 'time management', 'priorit', 'project', 'планирован', 'организац', 'приоритет'],
  creativity: ['creativ', 'innovat', 'design thinking', 'ideation', 'креатив', 'инновац', 'творчес'],
  ethics: ['ethic', 'integrity', 'compliance', 'responsib', 'этик', 'честност', 'ответствен'],
  customer_focus: ['customer', 'client', 'service', 'user', 'клиент', 'сервис', 'обслужив'],
  general: [],
};

/**
 * Detects the competency category from name using keyword matching.
 */
function detectCategory(competencyName: string): CompetencyCategory {
  const lowerName = competencyName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue;
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category as CompetencyCategory;
    }
  }
  return 'general';
}

// ============================================================================
// Question Template Keys
// ============================================================================

/**
 * Each category maps to 3 i18n question keys.
 * The actual question text lives in the translations file under
 * results.nextSteps.interviewGuide.questions.<category>.q1/q2/q3
 */
const QUESTIONS_PER_CATEGORY = 3;

// ============================================================================
// Component
// ============================================================================

interface InterviewGuideProps {
  competencyScores: CompetencyScore[];
  passingScore: number;
}

/**
 * Interview Guide component for JobFit results.
 *
 * Identifies competency gaps (scores below the passing threshold) and generates
 * behavioral interview question suggestions using STAR-format prompts.
 * Each gap competency is presented in a collapsible card with severity indicator
 * and 2-3 targeted questions.
 *
 * Includes a print button for HR managers to generate a print-friendly version.
 */
export function InterviewGuide({ competencyScores, passingScore }: InterviewGuideProps) {
  const t = useTranslations('results.nextSteps.interviewGuide');
  const [isOpen, setIsOpen] = useState(true);

  // Identify gap competencies (below passing threshold)
  const gapCompetencies = useMemo(() => {
    return competencyScores
      .filter(c => c.percentage < passingScore)
      .sort((a, b) => a.percentage - b.percentage) // worst gaps first
      .map(c => ({
        ...c,
        category: detectCategory(c.competencyName),
        gapSize: passingScore - c.percentage,
      }));
  }, [competencyScores, passingScore]);

  if (gapCompetencies.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="animate-fadeInUp-4 print:shadow-none print:border-0">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:bg-muted/30 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10">
                  <MessageSquareText className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                </div>
                {t('title')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex print:hidden h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.print();
                  }}
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  {t('print')}
                </Button>
                <ChevronDown
                  className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform duration-200 print:hidden ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('description', { count: gapCompetencies.length })}
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 px-3 sm:px-6">
            {gapCompetencies.map((gap) => (
              <GapCompetencyCard
                key={gap.competencyId}
                competencyName={gap.competencyName}
                score={Math.round(gap.percentage)}
                threshold={passingScore}
                gapSize={Math.round(gap.gapSize)}
                category={gap.category}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// Gap Competency Card
// ============================================================================

interface GapCompetencyCardProps {
  competencyName: string;
  score: number;
  threshold: number;
  gapSize: number;
  category: CompetencyCategory;
}

function GapCompetencyCard({
  competencyName,
  score,
  threshold,
  gapSize,
  category,
}: GapCompetencyCardProps) {
  const t = useTranslations('results.nextSteps.interviewGuide');
  const [expanded, setExpanded] = useState(true);

  // Determine severity color based on gap size
  const severityColor = gapSize >= 30
    ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20'
    : gapSize >= 15
      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20';

  const severityLabel = gapSize >= 30
    ? t('severityHigh')
    : gapSize >= 15
      ? t('severityMedium')
      : t('severityLow');

  // Generate question keys for this category
  const questionKeys = Array.from(
    { length: QUESTIONS_PER_CATEGORY },
    (_, i) => `questions.${category}.q${i + 1}`
  );

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className={`rounded-xl border ${severityColor} overflow-hidden print:break-inside-avoid`}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {competencyName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="text-xs sm:text-sm">
                  {t('gapSeverity', { score, threshold })}
                </span>
                <span className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                  {severityLabel}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2 print:hidden ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
            <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 shrink-0" />
              {t('suggestedQuestions')}
            </h5>
            <div className="space-y-2.5">
              {questionKeys.map((key, index) => (
                <div
                  key={key}
                  className="flex gap-2.5 p-2.5 sm:p-3 bg-background/60 rounded-lg border border-border/30"
                >
                  <span className="text-xs font-bold text-muted-foreground tabular-nums shrink-0 mt-0.5">
                    {index + 1}.
                  </span>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    {t(key)}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground italic">
              {t('starNote')}
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
