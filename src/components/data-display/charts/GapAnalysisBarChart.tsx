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
import { useIsMobile } from "@/hooks/use-mobile";

interface GapAnalysisBarChartProps {
  data: {
    name: string;
    score: number;
    target: number;
  }[];
}

export default function GapAnalysisBarChart({ data }: GapAnalysisBarChartProps) {
  const isMobile = useIsMobile();

  // Responsive sizing
  const height = isMobile ? 220 : 300;
  const fontSize = isMobile ? 10 : 12;
  const yAxisWidth = isMobile ? 80 : 150;
  const barSize = isMobile ? 14 : 20;
  const margin = isMobile
    ? { top: 5, right: 10, left: 5, bottom: 5 }
    : { top: 5, right: 30, left: 20, bottom: 5 };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={margin}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            dataKey="name"
            type="category"
            width={yAxisWidth}
            tick={{ fill: "hsl(var(--foreground))", fontSize }}
            tickFormatter={(value) => isMobile && value.length > 12 ? `${value.slice(0, 12)}...` : value}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
              fontSize: isMobile ? "12px" : "14px",
              padding: isMobile ? "8px" : "12px"
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
            iconSize={isMobile ? 10 : 14}
          />
          <Bar dataKey="score" name="Your Score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={barSize} />
          <Bar dataKey="target" name="Target" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} barSize={barSize} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
