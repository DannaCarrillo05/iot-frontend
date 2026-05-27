import { Maximize2 } from "lucide-react"
import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import type { ChartRangeDays } from "@/lib/chart-range"
import { formatChartTimeTick, getChartDomain, getChartTicks } from "@/lib/chart-utils"
import { ChartFullscreenDialog } from "./chart-fullscreen-dialog"
import { ScrollableChartContainer } from "./scrollable-chart-container"

type LightChartProps = {
	days: ChartRangeDays
	data: Array<{
		time: string
		timestamp: number
		light: number
	}>
}

const chartConfig = {
	light: {
		label: "Luz",
		color: "var(--color-chart-2)",
	},
}

export function LightChart({ days, data }: LightChartProps) {
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
						<Area
							type="monotone"
							dataKey="light"
							stroke="var(--color-light)"
							fill="var(--color-light)"
							fillOpacity={0.18}
							strokeWidth={2.5}
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
					<CardTitle className="text-green-950">Luz</CardTitle>
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
				title="Luz"
			>
				{renderChart("h-[70vh] min-h-[300px]")}
			</ChartFullscreenDialog>
		</>
	)
}
