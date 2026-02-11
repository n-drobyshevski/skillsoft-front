"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Layers } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CompetencyByLevelBarChartProps {
  data: { name: string; value: number }[];
}

const chartConfig = {
  value: {
    label: "Competencies",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function CompetencyByLevelBarChart({ data }: CompetencyByLevelBarChartProps) {
  const isMobile = useIsMobile();
  
  // Format level names for better display
  const formatLevelName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Format data with better level names
  const formattedData = data.map(item => ({
    ...item,
    name: formatLevelName(item.name),
    originalName: item.name // Keep original for reference
  }));
  
  const chartColors = [
    "oklch(var(--chart-1) / 0.7)",
    "oklch(var(--chart-2) / 0.7)",
    "oklch(var(--chart-3) / 0.7)",
    "oklch(var(--chart-4) / 0.7)",
    "oklch(var(--chart-5) / 0.7)",
  ];
  
  const chartBorderColors = [
    "oklch(var(--chart-1) / 0.9)",
    "oklch(var(--chart-2) / 0.9)",
    "oklch(var(--chart-3) / 0.9)",
    "oklch(var(--chart-4) / 0.9)",
    "oklch(var(--chart-5) / 0.9)",
  ];

  // Mobile-responsive axis configuration with smart label handling
  const getAxisConfig = () => {
    if (isMobile) {
      return {
        xAxis: {
          fontSize: 11,
          angle: -45,
          textAnchor: 'end' as const,
          height: 80,
          dy: 10,
          dx: -5,
        },
        yAxis: {
          fontSize: 11,
          width: 35,
        },
        margin: { top: 20, right: 15, left: 15, bottom: 60 }
      };
    }
    
    // Desktop: Use slight angle for longer level names (DEVELOPING, PROFICIENT, etc.)
    return {
      xAxis: {
        fontSize: 12,
        angle: -20, // Gentler angle for level names
        textAnchor: 'end' as const,
        height: 60,
        dy: 8,
        dx: -2,
      },
      yAxis: {
        fontSize: 12,
        width: 40,
      },
      margin: { top: 20, right: 20, left: 20, bottom: 40 }
    };
  };

  const axisConfig = getAxisConfig();

  return (
    <Card className="min-h-[300px] md:min-h-[400px]">
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 md:h-5 md:w-5" />
          <CardTitle className="text-base md:text-lg">Competencies by Level</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] md:h-[350px] w-full"
        >
          <BarChart data={formattedData} margin={axisConfig.margin}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ 
                fontSize: axisConfig.xAxis.fontSize,
                textAnchor: axisConfig.xAxis.textAnchor,
                transform: `translate(${axisConfig.xAxis.dx}, ${axisConfig.xAxis.dy})`,
              }}
              height={axisConfig.xAxis.height}
              angle={axisConfig.xAxis.angle}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              width={axisConfig.yAxis.width}
              tick={{ fontSize: axisConfig.yAxis.fontSize }}
            />
            <ChartTooltip
              cursor={{ fill: "oklch(var(--muted) / 0.3)" }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={chartColors[index % chartColors.length]}
                  stroke={chartBorderColors[index % chartBorderColors.length]}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
