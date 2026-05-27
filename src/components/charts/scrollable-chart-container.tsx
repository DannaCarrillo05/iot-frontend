import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const INITIAL_CHART_WIDTH = 720

type ScrollableChartContainerProps = {
	children: (chartWidth: number) => ReactNode
	heightClassName?: string
	className?: string
}

export function ScrollableChartContainer({
	children,
	heightClassName = "h-[320px]",
	className,
}: ScrollableChartContainerProps) {
	return (
		<div className={cn("space-y-2", className)}>
			<div className="overflow-hidden rounded-[1rem_0.5rem_1rem_0.5rem] border border-green-100/80 bg-white/40">
				<div className={cn("min-w-0", heightClassName)}>
					{children(INITIAL_CHART_WIDTH)}
				</div>
			</div>
		</div>
	)
}
