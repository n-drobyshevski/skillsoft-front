'use client';

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { LineChart as LineChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
} from 'recharts';
import { SimulationResult, Difficulty, difficultyLevelMap, selectionReasonLabels } from '../types';

interface TimelineTabProps {
  result: SimulationResult;
}

export default function TimelineTab({ result }: TimelineTabProps) {
  const difficultyLineData = useMemo(() => {
    return (result.sampleQuestions || []).map((q, index) => {
      const difficulty = (q.difficulty || 'INTERMEDIATE') as Difficulty;
      return {
        index: index + 1,
        label: `Q${index + 1}`,
        difficulty,
        difficultyValue: difficultyLevelMap[difficulty] ?? 2,
        text: q.text,
      };
    });
  }, [result.sampleQuestions]);

  if (!result.sampleQuestions.length) {
    return <p className="text-xs text-muted-foreground">No sample questions available.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Adaptive curve chart */}
      <div className="p-3 rounded-xl border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Adaptive curve</span>
        </div>
        {difficultyLineData.length === 0 ? (
          <p className="text-xs text-muted-foreground">Run a simulation to view the adaptive path</p>
        ) : (
          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer>
              <LineChart data={difficultyLineData} margin={{ top: 10, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  domain={[1, 4]}
                  tickFormatter={(value) => {
                    const entry = Object.entries(difficultyLevelMap).find(([, v]) => v === value);
                    return entry ? entry[0].charAt(0) + entry[0].toLowerCase().slice(1, 3) : value;
                  }}
                />
                <RechartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const datum = payload[0].payload as { label: string; difficulty: Difficulty; text: string };
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs max-w-xs">
                        <div className="font-semibold mb-1">
                          {datum.label} · {datum.difficulty}
                        </div>
                        <div className="text-muted-foreground line-clamp-3">{datum.text}</div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="difficultyValue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1, stroke: '#6366f1', fill: '#ffffff' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Question timeline cards */}
      {result.sampleQuestions.map((question, index) => (
        <div
          key={question.id || index}
          className="flex items-start gap-3 p-3 rounded-xl border bg-background/80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold shrink-0">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-semibold">
                {question.competencyName}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {question.difficulty}
              </Badge>
              {question.selectionReason && (
                <Badge variant="outline" className="text-[10px]">
                  {selectionReasonLabels[question.selectionReason] || question.selectionReason}
                </Badge>
              )}
              <span className="text-[11px] text-muted-foreground ml-auto">
                ~{Math.round(question.estimatedTimeSeconds / 60)}m
              </span>
            </div>
            <p className="text-sm font-medium line-clamp-2">{question.text}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {question.indicatorTitle}
            </p>
            {typeof question.abilityDelta === 'number' && (
              <div className="text-[11px] text-muted-foreground">
                Ability shift: {question.abilityDelta > 0 ? '+' : ''}{question.abilityDelta}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
