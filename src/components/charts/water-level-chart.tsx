import { Maximize2 } from "lucide-react"
import { useState } from "react"
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import type { ChartRangeDays } from "@/lib/chart-range"
import {
	DISTANCE_DETECTION_THRESHOLD_CM,
	formatChartTimeTick,
	getChartDomain,
	getChartTicks,
} from "@/lib/chart-utils"
import { ChartFullscreenDialog } from "./chart-fullscreen-dialog"
import { ScrollableChartContainer } from "./scrollable-chart-container"

type WaterLevelChartProps = {
	days: ChartRangeDays
	data: Array<{
		timestamp: number
		waterLevel: number
	}>
}

const chartConfig = {
	waterLevel: {
		label: "Distancia",
		color: "var(--color-chart-4)",
	},
}

export function WaterLevelChart({ days, data }: WaterLevelChartProps) {
	const [fullscreenOpen, setFullscreenOpen] = useState(false)
	const domain = getChartDomain(days)
	const ticks = getChartTicks(days)

	const renderChart = (heightClass: string) => (
		<ScrollableChartContainer heightClassName={heightClass}>
			{(chartWidth) => (
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-full w-full"
					initialDimension={{ width: chartWidth, height: 320 }}
				>
					<AreaChart data={data} margin={{ left: 8, right: 8 }}>
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
						<YAxis tickLine={false} axisLine={false} />
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(_, payload) => {
										const ts = payload[0]?.payload?.timestamp
										return ts ? formatChartTimeTick(ts, days) : ""
									}}
								/>
							}
						/>
						<ReferenceLine
							y={DISTANCE_DETECTION_THRESHOLD_CM}
							stroke="var(--color-waterLevel)"
							strokeDasharray="5 3"
							strokeOpacity={0.45}
							label={{
								value: `${DISTANCE_DETECTION_THRESHOLD_CM} cm`,
								position: "insideTopRight",
								fontSize: 10,
								fill: "var(--color-waterLevel)",
								fillOpacity: 0.65,
							}}
						/>
						<Area
							type="monotone"
							dataKey="waterLevel"
							stroke="var(--color-waterLevel)"
							fill="var(--color-waterLevel)"
							fillOpacity={0.1}
							strokeWidth={1.5}
							dot={(props) => {
								const { cx, cy, value, index } = props
								if (typeof value !== "number" || value >= DISTANCE_DETECTION_THRESHOLD_CM) {
									return <g key={`nd-${index}`} />
								}
								return (
									<circle
										key={`d-${index}`}
										cx={cx}
										cy={cy}
										r={3}
										fill="var(--color-waterLevel)"
										stroke="white"
										strokeWidth={1.5}
									/>
								)
							}}
							activeDot={{ r: 4 }}
						/>
					</AreaChart>
				</ChartContainer>
			)}
		</ScrollableChartContainer>
	)

	return (
		<>
			<GreenhouseCard>
				<CardHeader>
					<CardTitle className="text-green-950">Distancia</CardTitle>
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
				<CardContent>{renderChart("h-[320px]")}</CardContent>
			</GreenhouseCard>

			<ChartFullscreenDialog
				open={fullscreenOpen}
				onOpenChange={setFullscreenOpen}
				title="Distancia"
			>
				{renderChart("h-[70vh] min-h-[300px]")}
			</ChartFullscreenDialog>
		</>
	)
}
