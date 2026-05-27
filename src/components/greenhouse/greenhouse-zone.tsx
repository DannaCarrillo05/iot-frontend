import { Badge } from "@/components/ui/badge"
import type { ZoneWithMetrics } from "@/hooks/use-sensor-data"
import { getStatusBadgeVariant } from "@/lib/status-utils"
import { cn } from "@/lib/utils"

type GreenhouseZoneProps = {
	zone: ZoneWithMetrics
	nodeCount?: number
	presetLabels?: string[]
	variableCount?: number
	layoutClassName?: string
	onClick: () => void
}

const zoneStyles = {
	normal:
		"border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-lime-50 text-emerald-950 shadow-emerald-900/5",
	warning:
		"border-amber-200 bg-gradient-to-br from-white via-amber-50 to-lime-50 text-amber-950 shadow-amber-900/10",
	critical:
		"border-red-200 bg-gradient-to-br from-white via-red-50 to-orange-50 text-red-950 shadow-red-900/10",
	inactive:
		"border-slate-200 bg-gradient-to-br from-white via-slate-50 to-green-50 text-slate-700 shadow-slate-900/5",
}

export function GreenhouseZone({
	zone,
	nodeCount = 1,
	presetLabels = [],
	variableCount = zone.sensors.length,
	layoutClassName,
	onClick,
}: GreenhouseZoneProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={`Abrir detalle de ${zone.name}`}
			className={cn(
				"group flex min-h-40 min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-[1.75rem_0.875rem_1.75rem_0.875rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:outline-none",
				zoneStyles[zone.computedStatus],
				layoutClassName,
			)}
		>
			<div className="min-w-0 space-y-3">
				<div className="flex min-w-0 items-start justify-between gap-3">
					<div className="min-w-0 space-y-1">
						<p className="break-words text-base leading-tight font-semibold">
							{zone.name}
						</p>
						<p className="line-clamp-2 text-sm leading-5 opacity-75">
							{zone.description}
						</p>
					</div>

					<Badge
						className="max-w-24 shrink-0 truncate"
						variant={getStatusBadgeVariant(zone.computedStatus)}
					>
						{zone.statusLabel}
					</Badge>
				</div>

				{presetLabels.length > 0 ? (
					<div className="flex min-w-0 flex-wrap gap-1.5">
						{presetLabels.map((label) => (
							<span
								key={label}
								className="max-w-full truncate rounded-full border border-current/10 bg-white/60 px-2 py-0.5 text-xs font-medium opacity-80"
							>
								{label}
							</span>
						))}
					</div>
				) : null}
			</div>

			<div className="grid min-w-0 grid-cols-3 gap-2 text-xs font-medium">
				<Metric label="Nodos" value={nodeCount} />
				<Metric label="Variables" value={variableCount} />
				<Metric label="Alertas" value={zone.alertCount} />
			</div>
		</button>
	)
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<div className="min-w-0 rounded-2xl border border-current/10 bg-white/55 px-2 py-2 text-center backdrop-blur-sm">
			<p className="truncate text-[0.65rem] uppercase tracking-wide opacity-60">
				{label}
			</p>
			<p className="truncate text-sm font-semibold tabular-nums">{value}</p>
		</div>
	)
}
