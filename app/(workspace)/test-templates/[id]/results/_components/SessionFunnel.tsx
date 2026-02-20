'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { AnonymousSessionStats } from '@/services/api/results';

interface SessionFunnelProps {
  stats: AnonymousSessionStats;
}

const COLORS = {
  total: '#6366f1',      // indigo
  completed: '#22c55e',  // green
  inProgress: '#3b82f6', // blue
  abandoned: '#94a3b8',  // slate
};

/**
 * Session completion funnel visualization.
 * Shows the progression from total sessions to completed/abandoned.
 */
export function SessionFunnel({ stats }: SessionFunnelProps) {
  const data = useMemo(() => [
    { name: 'Total', value: stats.totalSessions, color: COLORS.total },
    { name: 'Completed', value: stats.completedSessions, color: COLORS.completed },
    { name: 'In Progress', value: stats.inProgressSessions, color: COLORS.inProgress },
    { name: 'Abandoned', value: stats.abandonedSessions, color: COLORS.abandoned },
  ], [stats]);

  if (stats.totalSessions === 0) {
    return null;
  }

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" fontSize={12} />
          <YAxis type="category" dataKey="name" fontSize={12} width={80} />
          <Tooltip
            formatter={(value: number) => [value, 'Sessions']}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
