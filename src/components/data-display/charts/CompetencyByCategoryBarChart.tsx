"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { FolderOpen } from "lucide-react";

interface CompetencyByCategoryBarChartProps {
  data: { name: string; value: number }[];
}

const chartConfig = {
  value: {
    label: "Competencies",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Semantic chart colors from the design system (supports light/dark mode)
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function CompetencyByCategoryBarChart({ data }: CompetencyByCategoryBarChartProps) {
  const isMobile = useIsMobile();

  // Format category names for display
  const formatCategoryName = (name: string) =>
    name
      .replace(/_/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  // Truncate long labels for axis display
  const truncateLabel = (name: string, max: number) =>
    name.length > max ? name.slice(0, max - 1) + "…" : name;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const formattedData = data.map((item, i) => ({
    ...item,
    name: formatCategoryName(item.name),
    originalName: item.name,
    fill: CHART_COLORS[i % CHART_COLORS.length],
    pct: total > 0 ? ((item.value / total) * 100).toFixed(0) : "0",
  }));

  // Empty state
  if (!data.length || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] md:h-[300px] text-muted-foreground gap-3">
        <FolderOpen className="w-10 h-10 opacity-40" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">No competencies yet</p>
          <p className="text-xs">Create competencies to see their distribution here.</p>
        </div>
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] md:h-[300px] w-full mt-2"
    >
      <BarChart
        data={formattedData}
        margin={
          isMobile
            ? { top: 24, right: 8, left: -8, bottom: 0 }
            : { top: 24, right: 12, left: 0, bottom: 0 }
        }
      >
        <defs>
          {CHART_COLORS.map((color, i) => (
            <linearGradient key={`grad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          interval={0}
          tickFormatter={(v) => truncateLabel(v, isMobile ? 8 : 14)}
          tick={{ fontSize: isMobile ? 11 : 12 }}
          height={isMobile ? 40 : 36}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={isMobile ? 28 : 36}
          tick={{ fontSize: isMobile ? 10 : 12 }}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.25, radius: 4 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                <p className="font-medium text-foreground mb-1">{d.name}</p>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: d.fill }}
                  />
                  <span className="text-muted-foreground">
                    {d.value} competenc{d.value === 1 ? "y" : "ies"}
                  </span>
                  <span className="ml-auto font-medium tabular-nums text-foreground">{d.pct}%</span>
                </div>
              </div>
            );
          }}
        />
        <Bar
          dataKey="value"
          radius={[6, 6, 0, 0]}
          maxBarSize={isMobile ? 40 : 56}
          animationDuration={600}
          animationEasing="ease-out"
          activeBar={{ opacity: 1, strokeWidth: 1.5, stroke: "var(--foreground)", strokeOpacity: 0.2 }}
        >
          {formattedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`url(#barGrad-${index % CHART_COLORS.length})`}
            />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            className="fill-muted-foreground text-[10px] md:text-xs"
            offset={6}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
