import { LoaderCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type ChartRangeDays, chartRangeOptions } from "@/lib/chart-range"

type ChartRangeControlsProps = {
	value: ChartRangeDays
	onChange: (value: ChartRangeDays) => void
	onRefresh: () => void
	isLoading: boolean
}

export function ChartRangeControls({
	value,
	onChange,
	onRefresh,
	isLoading,
}: ChartRangeControlsProps) {
	return (
		<div className="flex flex-wrap gap-2 rounded-2xl border border-green-100/80 bg-white/50 p-1">
			{chartRangeOptions.map((option) => (
				<Button
					key={option.days}
					type="button"
					size="sm"
					variant={value === option.days ? "default" : "ghost"}
					onClick={() => onChange(option.days)}
				>
					{option.label}
				</Button>
			))}
			<Button
				type="button"
				size="sm"
				variant="outline"
				onClick={onRefresh}
				disabled={isLoading}
			>
				{isLoading ? (
					<LoaderCircle className="animate-spin" />
				) : (
					<RefreshCw />
				)}
				Actualizar
			</Button>
		</div>
	)
}
