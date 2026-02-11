import type React from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { BehavioralIndicator } from "@/types/domain";
import { BarChart3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface WeightDistributionPieProps {
	indicators: BehavioralIndicator[];
	compact?: boolean;
}

const chartConfig = {
	weight: {
		label: "Weight Distribution",
	},
} satisfies ChartConfig;

const WeightDistributionPie: React.FC<WeightDistributionPieProps> = ({
	indicators,
	compact = false,
}) => {
	const isMobile = useIsMobile();

	// Calculate total weight for percentage calculation
	const totalWeight = indicators.reduce((sum, i) => sum + i.weight, 0);

	// Prepare data for pie chart with percentage values
	const data = indicators.map((indicator) => {
		const percentage = (indicator.weight / totalWeight) * 100;
		return {
			name: indicator.title,
			value: percentage,
			displayValue: `${percentage.toFixed(1)}%`,
			weight: indicator.weight,
			description: indicator.description,
		};
	});

	// Use shadcn-ui chart colors with lighter opacity and borders
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

	// Responsive sizing
	const chartHeight = compact
		? (isMobile ? 180 : 200)
		: (isMobile ? 220 : 300);
	const innerRadius = compact
		? (isMobile ? 35 : 50)
		: (isMobile ? 45 : 70);
	const outerRadius = compact
		? (isMobile ? 55 : 70)
		: (isMobile ? 65 : 90);

	return (
		<Card>
			<CardHeader className={compact ? "pb-2 sm:pb-3" : "pb-2 sm:pb-4"}>
				<CardTitle className={`flex items-center gap-2 ${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"}`}>
					<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
					{compact ? "Weight Distribution" : (isMobile ? "Weight Distribution (%)" : "Indicators Weight Distribution (%)")}
				</CardTitle>
			</CardHeader>
			<CardContent className={compact ? "pt-0 px-2 sm:px-6" : "pt-0 px-2 sm:px-6"}>
				<ChartContainer
					config={chartConfig}
					className={`aspect-square w-full`}
					style={{ height: chartHeight }}
				>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={innerRadius}
							outerRadius={outerRadius}
							paddingAngle={2}
							dataKey="value"
							nameKey="name"
							label={false}
						>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={chartColors[index % chartColors.length]}
									stroke={chartBorderColors[index % chartBorderColors.length]}
									strokeWidth={1}
									className="hover:opacity-80 transition-opacity"
								/>
							))}
						</Pie>
						<ChartTooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const tooltipData = payload[0].payload;
									return (
										<div className="p-2 sm:p-3 bg-background border rounded-lg shadow-lg max-w-[250px] sm:max-w-[300px]">
											<p className="text-xs sm:text-sm font-medium mb-1">{tooltipData.name}</p>
											{tooltipData.description && (
												<p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">
													{tooltipData.description}
												</p>
											)}
											<div className="text-[10px] sm:text-xs space-y-1">
												<p className="font-medium">
													Contribution: {tooltipData.displayValue}
												</p>
												<p className="text-muted-foreground">
													Weight: {tooltipData.weight}
												</p>
											</div>
										</div>
									);
								}
								return null;
							}}
						/>
						<Legend
							layout={isMobile ? "horizontal" : "vertical"}
							align={isMobile ? "center" : "right"}
							verticalAlign={isMobile ? "bottom" : "middle"}
							formatter={(value: string, entry) => {
								const legendPayload = entry.payload as { name?: string; displayValue?: string } | undefined;
								const name = legendPayload?.name || value;
								const displayValue = legendPayload?.displayValue || '';
								const maxLength = isMobile ? 12 : (compact ? 15 : 20);
								const truncatedName = name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
								return `${truncatedName} (${displayValue})`;
							}}
							wrapperStyle={{
								paddingLeft: isMobile ? "0" : (compact ? "10px" : "20px"),
								paddingTop: isMobile ? "10px" : "0",
								maxHeight: isMobile ? "80px" : (compact ? "160px" : "240px"),
								overflowY: "auto",
								fontSize: isMobile ? "10px" : (compact ? "12px" : "14px"),
							}}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};

export default WeightDistributionPie;
