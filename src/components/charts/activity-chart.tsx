import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { ScrollableChartContainer } from "./scrollable-chart-container"

type ActivityChartProps = {
	data: Array<{
		time: string
		activity: number
	}>
}

const chartConfig = {
	activity: {
		label: "Actividad",
		color: "var(--color-chart-4)",
	},
}

export function ActivityChart({ data }: ActivityChartProps) {
	return (
		<GreenhouseCard>
			<CardHeader>
				<CardTitle className="text-green-950">Actividad por hora</CardTitle>
				<CardDescription className="text-green-800/70">
					Detección de presencia en la zona de acceso durante el día.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollableChartContainer dataLength={data.length}>
					{(chartWidth) => (
						<ChartContainer
							config={chartConfig}
							className="aspect-auto h-full w-full min-h-[320px]"
							initialDimension={{ width: chartWidth, height: 320 }}
						>
							<BarChart data={data} margin={{ left: 8, right: 8 }}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="time"
									tickLine={false}
									axisLine={false}
									interval={0}
									minTickGap={16}
								/>
								<YAxis tickLine={false} axisLine={false} domain={[0, 1]} />
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatter={(value) =>
												value === 1 ? "Detectada" : "Sin actividad"
											}
										/>
									}
								/>
								<Bar
									dataKey="activity"
									fill="var(--color-activity)"
									radius={[8, 8, 0, 0]}
								/>
							</BarChart>
						</ChartContainer>
					)}
				</ScrollableChartContainer>
			</CardContent>
		</GreenhouseCard>
	)
}
