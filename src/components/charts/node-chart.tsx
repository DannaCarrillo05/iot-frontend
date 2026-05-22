import { Badge } from "@/components/ui/badge"
import {
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
import { getPresetAccentColor, getPresetLabel } from "@/data/node-presets"
import {
	buildNodeChartConfig,
	type NodeChartData,
} from "@/lib/node-chart-utils"
import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { NodeLatestValues } from "./node-latest-values"
import { ScrollableChartContainer } from "./scrollable-chart-container"

type NodeChartProps = {
	data: NodeChartData
}

export function NodeChart({ data }: NodeChartProps) {
	const { node, series, latestValues } = data
	const chartConfig = buildNodeChartConfig(node)
	const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(() => new Set())

	const chartData = useMemo(
		() =>
			series.map((point) => ({
				time: point.time,
				...point.raw,
			})),
		[series],
	)

	const toggleVariable = (key: string) => {
		setHiddenKeys((current) => {
			const next = new Set(current)
			if (next.has(key)) {
				next.delete(key)
			} else {
				next.add(key)
			}
			return next
		})
	}

	const isVisible = (key: string) => !hiddenKeys.has(key)

	return (
		<GreenhouseCard accentColor={getPresetAccentColor(node.preset)}>
			<CardHeader className="space-y-3">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-1">
						<CardTitle className="text-green-950">{node.label}</CardTitle>
						<CardDescription className="text-green-800/70">
							{node.description}
						</CardDescription>
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">{getPresetLabel(node.preset)}</Badge>
						<Badge variant="outline">{node.deviceId}</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<NodeLatestValues
					values={latestValues}
					hiddenKeys={hiddenKeys}
					onToggle={toggleVariable}
				/>

				<ScrollableChartContainer
					dataLength={chartData.length}
					heightClassName="h-[320px] min-h-[320px]"
				>
					{(chartWidth) => (
						<ChartContainer
							config={chartConfig}
							className="aspect-auto h-full min-h-[320px] w-full"
							initialDimension={{ width: chartWidth, height: 320 }}
						>
							<LineChart data={chartData} margin={{ left: 8, right: 8 }}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="time"
									tickLine={false}
									axisLine={false}
									interval={0}
									minTickGap={16}
								/>
								<YAxis tickLine={false} axisLine={false} width={48} />
								<ChartTooltip
									content={<ChartTooltipContent indicator="line" />}
								/>
								{node.variables.map((variable) => (
									<Line
										key={variable.key}
										type="monotone"
										dataKey={variable.key}
										name={variable.label}
										stroke={`var(--color-${variable.key})`}
										strokeWidth={2.5}
										dot={false}
										connectNulls
										hide={!isVisible(variable.key)}
									/>
								))}
							</LineChart>
						</ChartContainer>
					)}
				</ScrollableChartContainer>
			</CardContent>
		</GreenhouseCard>
	)
}
