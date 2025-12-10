"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GapAnalysisBarChartProps {
  data: {
    name: string;
    score: number;
    target: number;
  }[];
}

export default function GapAnalysisBarChart({ data }: GapAnalysisBarChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="name" type="category" width={150} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
          <Tooltip 
             cursor={{fill: 'transparent'}}
             contentStyle={{ 
                backgroundColor: "hsl(var(--background))", 
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))"
            }}
          />
          <Legend />
          <Bar dataKey="score" name="Your Score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
          <Bar dataKey="target" name="Target" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
