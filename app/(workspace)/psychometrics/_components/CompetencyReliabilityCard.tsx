'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CompetencyReliability, ReliabilityStatus } from '@/types/psychometrics';
import { ReliabilityStatusBadge } from './ReliabilityStatusBadge';
import { ArrowRight, Shield, Users, FileText } from 'lucide-react';

interface CompetencyReliabilityCardProps {
  reliability: CompetencyReliability;
  showLink?: boolean;
}

// Alpha gauge colors
function getAlphaColor(alpha: number | null): string {
  if (alpha === null) return 'bg-gray-200';
  if (alpha >= 0.7) return 'bg-emerald-500';
  if (alpha >= 0.6) return 'bg-amber-500';
  return 'bg-red-500';
}

function getAlphaTextColor(alpha: number | null): string {
  if (alpha === null) return 'text-gray-500';
  if (alpha >= 0.7) return 'text-emerald-600';
  if (alpha >= 0.6) return 'text-amber-600';
  return 'text-red-600';
}

function AlphaGauge({ alpha }: { alpha: number | null }) {
  // Display alpha as a progress bar (0-1 range, showing as percentage)
  const percentage = alpha != null ? alpha * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Cronbach's Alpha</span>
        <span className={`text-lg font-bold ${getAlphaTextColor(alpha)}`}>
          {alpha != null ? alpha.toFixed(2) : '-'}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-500 ${getAlphaColor(alpha)}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Threshold markers */}
        <div className="absolute top-0 left-[60%] h-full w-px bg-amber-600/50" title="0.6 - Acceptable" />
        <div className="absolute top-0 left-[70%] h-full w-px bg-emerald-600/50" title="0.7 - Reliable" />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>0.6</span>
        <span>0.7</span>
        <span>1.0</span>
      </div>
    </div>
  );
}

export function CompetencyReliabilityCard({
  reliability,
  showLink = true
}: CompetencyReliabilityCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate" title={reliability.competencyName}>
              {reliability.competencyName}
            </CardTitle>
            <ReliabilityStatusBadge status={reliability.reliabilityStatus} />
          </div>
          {showLink && (
            <Link href={`/psychometrics/competencies/${reliability.competencyId}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AlphaGauge alpha={reliability.cronbachAlpha} />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="font-medium">{reliability.sampleSize ?? '-'}</span>
              <span className="text-muted-foreground ml-1">респондентов</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="font-medium">{reliability.itemCount ?? '-'}</span>
              <span className="text-muted-foreground ml-1">вопросов</span>
            </div>
          </div>
        </div>

        {reliability.lastCalculatedAt && (
          <p className="text-xs text-muted-foreground">
            Обновлено: {new Date(reliability.lastCalculatedAt).toLocaleString('ru-RU')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Compact list item version for lists
interface CompetencyReliabilityListItemProps {
  reliability: CompetencyReliability;
}

export function CompetencyReliabilityListItem({ reliability }: CompetencyReliabilityListItemProps) {
  return (
    <Link href={`/psychometrics/competencies/${reliability.competencyId}`}>
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Shield className={`h-5 w-5 shrink-0 ${getAlphaTextColor(reliability.cronbachAlpha)}`} />
          <div className="min-w-0">
            <p className="font-medium truncate">{reliability.competencyName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{reliability.itemCount ?? 0} вопросов</span>
              <span>|</span>
              <span>{reliability.sampleSize ?? 0} ответов</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`font-mono font-bold ${getAlphaTextColor(reliability.cronbachAlpha)}`}>
            {reliability.cronbachAlpha != null ? reliability.cronbachAlpha.toFixed(2) : '-'}
          </span>
          <ReliabilityStatusBadge status={reliability.reliabilityStatus} />
        </div>
      </div>
    </Link>
  );
}
