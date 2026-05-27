import { Maximize2 } from "lucide-react"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Button } from "@/components/ui/button"
import {
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
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

type ActivityChartProps = {
	days: ChartRangeDays
	data: Array<{
		timestamp: number
		activity: number
	}>
}

const chartConfig = {
	activity: {
		label: "Detecciones",
		color: "var(--color-chart-4)",
	},
}

const bucketLabel: Record<ChartRangeDays, string> = {
	1: "agrupadas por hora",
	4: "agrupadas cada 4 h",
	7: "agrupadas cada 8 h",
}

export function ActivityChart({ days, data }: ActivityChartProps) {
	const [fullscreenOpen, setFullscreenOpen] = useState(false)
	const domain = getChartDomain(days)
	const ticks = getChartTicks(days)

	const renderChart = (heightClass: string) => (
		<ScrollableChartContainer heightClassName={heightClass}>
			{(chartWidth) => {
				const barSize =
					Math.max(2, Math.floor(chartWidth / Math.max(data.length, 1)) - 2)
				return (
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-full w-full"
						initialDimension={{ width: chartWidth, height: 320 }}
					>
						<BarChart data={data} margin={{ left: 8, right: 8 }}>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="timestamp"
								type="number"
								scale="time"
								domain={domain}
								tickLine={false}
								axisLine={false}
								interval="preserveStartEnd"
								minTickGap={40}
								tickFormatter={(value) => formatChartTimeTick(value, days)}
							/>
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
							<Bar
								dataKey="activity"
								fill="var(--color-activity)"
								radius={[4, 4, 0, 0]}
								barSize={barSize}
							/>
						</BarChart>
					</ChartContainer>
				)
			}}
		</ScrollableChartContainer>
	)

	const description = `Detecciones de presencia ${bucketLabel[days]}.`

	return (
		<>
			<GreenhouseCard>
				<CardHeader>
					<CardTitle className="text-green-950">Actividad</CardTitle>
					<CardDescription className="text-green-800/70">
						{description}
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
				<CardContent>{renderChart("h-[320px]")}</CardContent>
			</GreenhouseCard>

			<ChartFullscreenDialog
				open={fullscreenOpen}
				onOpenChange={setFullscreenOpen}
				title="Actividad"
				description={description}
			>
				{renderChart("h-[70vh] min-h-[300px]")}
			</ChartFullscreenDialog>
		</>
	)
}
