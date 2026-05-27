import { Maximize2 } from "lucide-react"
import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import type { ChartRangeDays } from "@/lib/chart-range"
import { formatChartTimeTick, getChartDomain, getChartTicks } from "@/lib/chart-utils"
import { ChartFullscreenDialog } from "./chart-fullscreen-dialog"
import { ScrollableChartContainer } from "./scrollable-chart-container"

type TemperatureHumidityChartProps = {
	days: ChartRangeDays
	data: Array<{
		time: string
		timestamp: number
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
	days,
	data,
}: TemperatureHumidityChartProps) {
	const [fullscreenOpen, setFullscreenOpen] = useState(false)
	const domain = getChartDomain(days)
	const ticks = getChartTicks(days)

	const renderChart = (heightClass: string) => (
		<ScrollableChartContainer heightClassName={heightClass}>
			{(chartWidth) => (
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-full w-full"
					initialDimension={{ width: chartWidth, height: 400 }}
				>
					<LineChart data={data} margin={{ left: 8, right: 8 }}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="timestamp"
							type="number"
							scale="time"
							domain={domain}
							tickLine={false}
							axisLine={false}
							ticks={ticks}
							interval={0}
							minTickGap={50}
							tickFormatter={(value) => formatChartTimeTick(value, days)}
						/>
						<YAxis yAxisId="left" tickLine={false} axisLine={false} />
						<YAxis
							yAxisId="right"
							orientation="right"
							tickLine={false}
							axisLine={false}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									indicator="line"
									labelFormatter={(_, payload) => {
										const ts = payload[0]?.payload?.timestamp
										return ts ? formatChartTimeTick(ts, days) : ""
									}}
								/>
							}
						/>
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
	)

	return (
		<>
			<GreenhouseCard>
				<CardHeader>
					<CardTitle className="text-green-950">Temperatura y humedad</CardTitle>
					<CardDescription className="text-green-800/70">
						Comportamiento conjunto de las condiciones ambientales.
					</CardDescription>
					<CardAction>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => setFullscreenOpen(true)}
						>
							<Maximize2 className="size-4" />
							<span className="sr-only">Pantalla completa</span>
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent>{renderChart("h-[400px] min-h-[400px]")}</CardContent>
			</GreenhouseCard>

			<ChartFullscreenDialog
				open={fullscreenOpen}
				onOpenChange={setFullscreenOpen}
				title="Temperatura y humedad"
				description="Comportamiento conjunto de las condiciones ambientales."
			>
				{renderChart("h-[70vh] min-h-[400px]")}
			</ChartFullscreenDialog>
		</>
	)
}
