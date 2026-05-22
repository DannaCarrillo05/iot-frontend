import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import { ScrollableChartContainer } from "./scrollable-chart-container"

type TemperatureHumidityChartProps = {
	data: Array<{
		time: string
		temperature: number
		humidity: number
	}>
}

const chartConfig = {
	temperature: {
		label: "Temperatura",
		color: "var(--color-chart-3)",
	},
	humidity: {
		label: "Humedad",
		color: "var(--color-chart-1)",
	},
}

export function TemperatureHumidityChart({
	data,
}: TemperatureHumidityChartProps) {
	return (
		<GreenhouseCard>
			<CardHeader>
				<CardTitle className="text-green-950">Temperatura y humedad</CardTitle>
				<CardDescription className="text-green-800/70">
					Comportamiento conjunto de las condiciones ambientales.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollableChartContainer
					dataLength={data.length}
					heightClassName="h-[400px] min-h-[400px]"
				>
					{(chartWidth) => (
						<ChartContainer
							config={chartConfig}
							className="aspect-auto h-full w-full min-h-[400px]"
							initialDimension={{ width: chartWidth, height: 400 }}
						>
							<LineChart data={data} margin={{ left: 8, right: 8 }}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="time"
									tickLine={false}
									axisLine={false}
									interval={0}
									minTickGap={16}
								/>
								<YAxis yAxisId="left" tickLine={false} axisLine={false} />
								<YAxis
									yAxisId="right"
									orientation="right"
									tickLine={false}
									axisLine={false}
								/>
								<ChartTooltip content={<ChartTooltipContent indicator="line" />} />
								<ChartLegend content={<ChartLegendContent />} />
								<Line
									yAxisId="left"
									type="monotone"
									dataKey="temperature"
									stroke="var(--color-temperature)"
									strokeWidth={2.5}
									dot={false}
								/>
								<Line
									yAxisId="right"
									type="monotone"
									dataKey="humidity"
									stroke="var(--color-humidity)"
									strokeWidth={2.5}
									dot={false}
								/>
							</LineChart>
						</ChartContainer>
					)}
				</ScrollableChartContainer>
			</CardContent>
		</GreenhouseCard>
	)
}
