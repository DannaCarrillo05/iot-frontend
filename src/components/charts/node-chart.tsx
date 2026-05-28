import { Maximize2 } from "lucide-react"
import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import type { ChartRangeDays } from "@/lib/chart-range"
import { formatChartTimeTick, getChartDomain } from "@/lib/chart-utils"
import { cn } from "@/lib/utils"
import {
	buildNodeChartConfig,
	type NodeChartData,
} from "@/lib/node-chart-utils"
import { ChartFullscreenDialog } from "./chart-fullscreen-dialog"
import { NodeLatestValues } from "./node-latest-values"
import { ScrollableChartContainer } from "./scrollable-chart-container"

type NodeChartProps = {
	data: NodeChartData
	rangeDays: ChartRangeDays
}

export function NodeChart({ data, rangeDays }: NodeChartProps) {
	const { node, series, latestValues } = data
	const chartConfig = useMemo(() => buildNodeChartConfig(node), [node])
	const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(() => new Set())
	const [fsHiddenKeys, setFsHiddenKeys] = useState<Set<string>>(() => new Set())
	const [fullscreenOpen, setFullscreenOpen] = useState(false)
	const domain = getChartDomain(rangeDays)

	const chartData = useMemo(
		() =>
			series.map((point) => ({
				ts: point.ts,
				...point.raw,
			})),
		[series],
	)

	const makeToggle =
		(setter: React.Dispatch<React.SetStateAction<Set<string>>>) =>
		(key: string) => {
			setter((current) => {
				const next = new Set(current)
				if (next.has(key)) {
					next.delete(key)
				} else {
					next.add(key)
				}
				return next
			})
		}

	const renderChart = (
		hidden: Set<string>,
		onToggle: (key: string) => void,
		options: { fullscreen?: boolean; heightClass?: string } = {},
	) => {
		const { fullscreen = false, heightClass = "h-[320px] min-h-[320px]" } = options
		const containerClass = fullscreen
			? "flex h-full min-h-0 flex-1 flex-col gap-3"
			: "space-y-4"
		const chartWrapperClass = fullscreen
			? "min-h-0 flex-1 overflow-hidden rounded-[1rem_0.5rem_1rem_0.5rem] border border-green-100/80 bg-white/40"
			: cn(
					"overflow-hidden rounded-[1rem_0.5rem_1rem_0.5rem] border border-green-100/80 bg-white/40",
					heightClass,
				)

		const chart = (
			<ChartContainer
				config={chartConfig}
				className="aspect-auto h-full w-full"
				initialDimension={{ width: 720, height: 320 }}
			>
				<LineChart data={chartData} margin={{ left: 8, right: 8 }}>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="ts"
						type="number"
						scale="time"
						domain={domain}
						tickLine={false}
						axisLine={false}
						interval="preserveStartEnd"
						minTickGap={40}
						tickFormatter={(value) => formatChartTimeTick(value, rangeDays)}
					/>
					<YAxis tickLine={false} axisLine={false} width={48} />
					<ChartTooltip
						content={
							<ChartTooltipContent
								indicator="line"
								labelFormatter={(_, payload) => {
									const ts = payload[0]?.payload?.ts
									return ts ? formatChartTimeTick(ts, rangeDays) : ""
								}}
							/>
						}
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
							hide={hidden.has(variable.key)}
						/>
					))}
				</LineChart>
			</ChartContainer>
		)

		return (
			<div className={containerClass}>
				<NodeLatestValues
					values={latestValues}
					hiddenKeys={hidden}
					onToggle={onToggle}
					variant={fullscreen ? "compact" : "default"}
					className={fullscreen ? "shrink-0" : undefined}
				/>
				{fullscreen ? (
					<div className={chartWrapperClass}>{chart}</div>
				) : (
					<ScrollableChartContainer heightClassName={heightClass}>
						{() => chart}
					</ScrollableChartContainer>
				)}
			</div>
		)
	}

	const accentColor = getPresetAccentColor(node.preset)

	return (
		<>
			<GreenhouseCard accentColor={accentColor}>
				<CardHeader className="space-y-3">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div className="space-y-1">
							<CardTitle className="text-green-950">{node.label}</CardTitle>
							<CardDescription className="text-green-800/70">
								{node.description}
							</CardDescription>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="secondary">{getPresetLabel(node.preset)}</Badge>
							<Badge variant="outline">{node.deviceId}</Badge>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={() => setFullscreenOpen(true)}
							>
								<Maximize2 className="size-4" />
								<span className="sr-only">Pantalla completa</span>
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{renderChart(hiddenKeys, makeToggle(setHiddenKeys))}
				</CardContent>
			</GreenhouseCard>

			<ChartFullscreenDialog
				open={fullscreenOpen}
				onOpenChange={setFullscreenOpen}
				title={node.label}
				description={node.description}
				accentColor={accentColor}
			>
				{renderChart(fsHiddenKeys, makeToggle(setFsHiddenKeys), {
					fullscreen: true,
				})}
			</ChartFullscreenDialog>
		</>
	)
}
