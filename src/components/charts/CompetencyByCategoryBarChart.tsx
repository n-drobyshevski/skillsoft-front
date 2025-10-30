"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BrainCircuit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CompetencyByCategoryBarChartProps {
  data: { name: string; value: number }[];
}

const chartConfig = {
  value: {
    label: "Competencies",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function CompetencyByCategoryBarChart({ data }: CompetencyByCategoryBarChartProps) {
  const isMobile = useIsMobile();
  
  // Format category names for better display
  const formatCategoryName = (name: string) => {
    return name
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format data with better category names
  const formattedData = data.map(item => ({
    ...item,
    name: formatCategoryName(item.name),
    originalName: item.name // Keep original for reference
  }));
  
  // Use more reliable color definitions with proper fallbacks
  const chartColors = [
    "#8b5cf6", // Purple-500
    "#f59e0b", // Amber-500  
    "#10b981", // Emerald-500
    "#ef4444", // Red-500
    "#3b82f6", // Blue-500
  ];
  
  const chartBorderColors = [
    "#7c3aed", // Purple-600
    "#d97706", // Amber-600
    "#059669", // Emerald-600
    "#dc2626", // Red-600
    "#2563eb", // Blue-600
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
    
    // Desktop: Use angled labels to prevent overlap with long category names
    return {
      xAxis: {
        fontSize: 12,
        angle: -30, // Slight angle for better readability
        textAnchor: 'end' as const,
        height: 70, // Increased height for angled labels
        dy: 10,
        dx: -2,
      },
      yAxis: {
        fontSize: 12,
        width: 40,
      },
      margin: { top: 20, right: 20, left: 20, bottom: 50 } // Increased bottom margin
    };
  };

  const axisConfig = getAxisConfig();

  return (
    
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] md:h-[350px] w-full mt-4 md:mt-8 md:mb-2 mb-0"
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
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={chartColors[index % chartColors.length]}
                  fillOpacity={0.7}
                  stroke={chartBorderColors[index % chartBorderColors.length]}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
  );
}
