import type React from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import type { BehavioralIndicator } from "../../../app/interfaces/domain-interfaces";
import { BarChart3 } from "lucide-react";

interface WeightDistributionPieProps {
	indicators: BehavioralIndicator[];
}

const chartConfig = {
	weight: {
		label: "Weight Distribution",
	},
} satisfies ChartConfig;

const WeightDistributionPie: React.FC<WeightDistributionPieProps> = ({
	indicators,
}) => {
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

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="w-5 h-5" />
					Indicators Weight Distribution (%)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-square h-[300px] w-full"
				>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={70}
							outerRadius={90}
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
									const data = payload[0].payload;
									return (
										<div className="p-3 bg-background border rounded-lg shadow-lg max-w-[300px]">
											<p className="text-sm font-medium mb-1">{data.name}</p>
											{data.description && (
												<p className="text-xs text-muted-foreground mb-2">
													{data.description}
												</p>
											)}
											<div className="text-xs space-y-1">
												<p className="font-medium">
													Contribution: {data.displayValue}
												</p>
												<p className="text-muted-foreground">
													Weight: {data.weight}
												</p>
											</div>
										</div>
									);
								}
								return null;
							}}
						/>
						<Legend
							layout="vertical"
							align="right"
							verticalAlign="middle"
							formatter={(value: string, entry: any) => {
								const data = entry.payload;
								return `${data.name} (${data.displayValue})`;
							}}
							wrapperStyle={{
								paddingLeft: "20px",
								maxHeight: "240px",
								overflowY: "auto",
							}}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};

export default WeightDistributionPie;
