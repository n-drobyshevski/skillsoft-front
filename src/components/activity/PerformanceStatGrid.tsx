import { Card, CardContent } from '@/components/ui/card';
import { FileText, Trophy, BarChart3, Clock } from 'lucide-react';
import { formatTotalTime } from '@/lib/format-activity';

interface PerformanceStatGridProps {
  testsTaken: number;
  passed: number;
  averageScore: number; // 0-100
  totalTimeSeconds: number;
  labels: {
    testsTaken: string;
    passed: string;
    averageScore: string;
    totalTime: string;
  };
  locale: string;
}

/**
 * Reusable 2x2 / 4-column performance stat grid.
 * Used by both /test-templates/history (server) and /my-tests (client).
 */
export function PerformanceStatGrid({
  testsTaken,
  passed,
  averageScore,
  totalTimeSeconds,
  labels,
  locale,
}: PerformanceStatGridProps) {
  const stats = [
    { icon: <FileText className="h-4 w-4" />, label: labels.testsTaken, value: testsTaken.toString() },
    { icon: <Trophy className="h-4 w-4" />, label: labels.passed, value: passed.toString() },
    { icon: <BarChart3 className="h-4 w-4" />, label: labels.averageScore, value: `${Math.round(averageScore)}%` },
    { icon: <Clock className="h-4 w-4" />, label: labels.totalTime, value: formatTotalTime(totalTimeSeconds, locale) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground bg-muted p-2 rounded-lg">{stat.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
