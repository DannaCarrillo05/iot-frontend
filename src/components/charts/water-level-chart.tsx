import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { ScrollableChartContainer } from "./scrollable-chart-container"

type WaterLevelChartProps = {
	data: Array<{
		time: string
		waterLevel: number
	}>
}

const chartConfig = {
	waterLevel: {
		label: "Nivel de agua",
		color: "var(--color-chart-4)",
	},
}

export function WaterLevelChart({ data }: WaterLevelChartProps) {
	return (
		<GreenhouseCard>
			<CardHeader>
				<CardTitle className="text-green-950">Nivel de agua</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollableChartContainer dataLength={data.length}>
					{(chartWidth) => (
						<ChartContainer
							config={chartConfig}
							className="aspect-auto h-full w-full min-h-[320px]"
							initialDimension={{ width: chartWidth, height: 320 }}
						>
							<AreaChart data={data} margin={{ left: 8, right: 8 }}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="time"
									tickLine={false}
									axisLine={false}
									interval={0}
									minTickGap={16}
								/>
								<YAxis tickLine={false} axisLine={false} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Area
									type="monotone"
									dataKey="waterLevel"
									stroke="var(--color-waterLevel)"
									fill="var(--color-waterLevel)"
									fillOpacity={0.18}
									strokeWidth={2.5}
								/>
							</AreaChart>
						</ChartContainer>
					)}
				</ScrollableChartContainer>
			</CardContent>
		</GreenhouseCard>
	)
}
