import type { ZoneWithMetrics } from "@/hooks/use-sensor-data"
import { cn } from "@/lib/utils"

type GreenhouseZoneProps = {
	zone: ZoneWithMetrics
	onClick: () => void
}

const zoneStyles = {
	normal: "border-emerald-200 bg-emerald-50 text-emerald-950",
	warning: "border-amber-200 bg-amber-50 text-amber-950",
	critical: "border-red-200 bg-red-50 text-red-950",
	inactive: "border-slate-200 bg-slate-50 text-slate-700",
}

export function GreenhouseZone({ zone, onClick }: GreenhouseZoneProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex h-full min-h-28 flex-col justify-between rounded-[1.5rem_0.75rem_1.5rem_0.75rem] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
				zoneStyles[zone.computedStatus],
			)}
			style={{
				gridColumn: `${zone.colStart} / span ${zone.colSpan}`,
				gridRow: `${zone.rowStart} / span ${zone.rowSpan}`,
			}}
		>
			<div className="space-y-1">
				<p className="text-base font-semibold">{zone.name}</p>
				<p className="line-clamp-2 text-sm opacity-80">{zone.description}</p>
			</div>
			<div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide opacity-80">
				<span>{zone.statusLabel}</span>
				<span>{zone.alertCount} alertas</span>
			</div>
		</button>
	)
}
