'use client';

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Gauge } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
} from 'recharts';
import { SimulationResult, Difficulty, difficultyColors, selectionReasonLabels, SelectionReason } from '../types';

interface AnalyticsTabProps {
  result: SimulationResult;
}

const colors = ['#6366f1', '#22c55e', '#f97316', '#0ea5e9', '#8b5cf6', '#f59e0b'];

export default function AnalyticsTab({ result }: AnalyticsTabProps) {
  const competencyData = useMemo(() => {
    if (result?.distributionByCompetency?.length) {
      return result.distributionByCompetency.map((entry) => ({
        name: entry.competencyName,
        value: entry.questionCount,
      }));
    }

    if (result?.composition) {
      return Object.entries(result.composition).map(([name, value]) => ({
        name,
        value,
      }));
    }

    return [];
  }, [result]);

  const difficultyData = useMemo(() => {
    const distribution = result?.distributionByDifficulty || result?.difficultyDistribution;
    if (!distribution) return [];
    return Object.entries(distribution).map(([difficulty, value]) => ({
      name: difficulty,
      value,
    }));
  }, [result]);

  const selectionData = useMemo(() => {
    if (!result?.selectionReasons) return [];
    return Object.entries(result.selectionReasons).map(([reason, value]) => ({
      name: selectionReasonLabels[reason as SelectionReason] || reason,
      value,
    }));
  }, [result]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {/* Coverage by competency */}
        <div className="p-3 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Coverage by competency</span>
          </div>
          {competencyData.length === 0 ? (
            <p className="text-xs text-muted-foreground">No competencies selected</p>
          ) : (
            <div className="h-[180px] sm:h-[220px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={competencyData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius="75%"
                    innerRadius="40%"
                  >
                    {competencyData.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <RechartTooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
            {competencyData.map((entry, index) => (
              <span
                key={entry.name}
                className="inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-background"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                {entry.name}
              </span>
            ))}
          </div>
        </div>

        {/* Difficulty balance */}
        <div className="p-3 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Difficulty balance</span>
          </div>
          {difficultyData.length === 0 ? (
            <p className="text-xs text-muted-foreground">No difficulty data</p>
          ) : (
            <div className="h-[180px] sm:h-[220px]">
              <ResponsiveContainer>
                <BarChart data={difficultyData} margin={{ top: 10, left: 0, right: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <RechartTooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {difficultyData.map((entry) => (
                      <Cell key={entry.name} fill={difficultyColors[entry.name as Difficulty] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Selection reasons */}
        <div className="p-3 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Selection reasons</span>
          </div>
          {selectionData.length === 0 ? (
            <p className="text-xs text-muted-foreground">Run a simulation to see selection logic</p>
          ) : (
            <div className="flex flex-wrap gap-2 text-[11px]">
              {selectionData.map((item) => (
                <Badge key={item.name} variant="outline" className="gap-1 rounded-full">
                  <span className="font-semibold text-xs">{item.value}</span>
                  {item.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
