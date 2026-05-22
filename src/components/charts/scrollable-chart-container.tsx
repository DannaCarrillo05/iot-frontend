import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const DEFAULT_POINT_WIDTH = 72
const MIN_CHART_WIDTH = 360

type ScrollableChartContainerProps = {
	children: (chartWidth: number) => ReactNode
	dataLength: number
	pointWidth?: number
	heightClassName?: string
	className?: string
}

export function ScrollableChartContainer({
	children,
	dataLength,
	pointWidth = DEFAULT_POINT_WIDTH,
	heightClassName = "h-[320px]",
	className,
}: ScrollableChartContainerProps) {
	const chartWidth = Math.max(dataLength * pointWidth, MIN_CHART_WIDTH)
	const showHint = dataLength * pointWidth > MIN_CHART_WIDTH

	return (
		<div className={cn("space-y-2", className)}>
			<div className="overflow-x-auto rounded-[1rem_0.5rem_1rem_0.5rem] border border-green-100/80 bg-white/40 [scrollbar-color:rgb(134_239_172)_transparent] [scrollbar-width:thin]">
				<div
					className={cn("min-w-full", heightClassName)}
					style={{ width: chartWidth }}
				>
					{children(chartWidth)}
				</div>
			</div>
			{showHint ? (
				<p className="text-xs text-green-700/60">
					Desliza horizontalmente para explorar las diferentes horas
				</p>
			) : null}
		</div>
	)
}
