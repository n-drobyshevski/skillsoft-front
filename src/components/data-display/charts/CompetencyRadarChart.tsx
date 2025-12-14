"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface CompetencyRadarChartProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
}

export default function CompetencyRadarChart({ data }: CompetencyRadarChartProps) {
  const isMobile = useIsMobile();

  // Responsive sizing
  const height = isMobile ? 220 : 300;
  const fontSize = isMobile ? 10 : 12;
  const outerRadius = isMobile ? "70%" : "80%";

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius={outerRadius} data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "hsl(var(--foreground))", fontSize }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
              fontSize: isMobile ? "12px" : "14px",
              padding: isMobile ? "8px" : "12px"
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
