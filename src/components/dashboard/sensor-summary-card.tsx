import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import type { SensorSummary } from "@/hooks/use-sensor-data"
import { iconBadgeClass, sensorAccentColors } from "@/lib/greenhouse-styles"
import { getStatusBadgeVariant } from "@/lib/status-utils"
import type { LucideIcon } from "lucide-react"
import {
	Droplets,
	MoveUpRight,
	Radar,
	Signal,
	SunMedium,
	ThermometerSun,
	WalletCards,
	Zap,
} from "lucide-react"

const sensorIcons: Record<SensorSummary["type"], LucideIcon> = {
	humidity: Droplets,
	temperature: ThermometerSun,
	light: SunMedium,
	activity: Radar,
	waterLevel: WalletCards,
	voltage: Zap,
	current: Zap,
	power: Zap,
	signal: Signal,
}

type SensorSummaryCardProps = {
	summary: SensorSummary
}

export function SensorSummaryCard({ summary }: SensorSummaryCardProps) {
	const Icon = sensorIcons[summary.type]

	return (
		<GreenhouseCard
			className="flex h-full flex-col"
			accentColor={sensorAccentColors[summary.type]}
		>
			<CardHeader className="space-y-3 pb-0">
				<div className="flex items-start justify-between gap-3">
					<div className={iconBadgeClass}>
						<Icon className="size-5" />
					</div>
					<Badge variant={getStatusBadgeVariant(summary.status)}>
						{summary.statusLabel}
					</Badge>
				</div>
				<div className="space-y-1">
					<CardTitle className="text-green-950">{summary.label}</CardTitle>
					<p className="min-h-[3.75rem] text-sm leading-snug text-green-800/70">
						{summary.description}
					</p>
				</div>
			</CardHeader>
			<CardContent className="mt-auto flex flex-col gap-3 pt-0">
				<div className="flex min-h-9 items-baseline">
					<span className="text-3xl font-bold tracking-tight text-green-950">
						{summary.formattedValue}
					</span>
					{summary.unit ? (
						<span className="ml-1 text-lg font-medium text-green-800/70">
							{summary.unit}
						</span>
					) : null}
				</div>
				<div className="flex items-center gap-1 text-xs text-green-700/70">
					<MoveUpRight className="size-3.5 shrink-0" />
					<span>Actualizado</span>
				</div>
			</CardContent>
		</GreenhouseCard>
	)
}
