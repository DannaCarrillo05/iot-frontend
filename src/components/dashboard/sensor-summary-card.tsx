import type { LucideIcon } from "lucide-react"
import {
	Droplets,
	MoveUpRight,
	Radar,
	SunMedium,
	ThermometerSun,
	WalletCards,
} from "lucide-react"
import type { SensorSummary } from "@/hooks/use-sensor-data"
import { getStatusBadgeVariant } from "@/lib/status-utils"
import { iconBadgeClass } from "@/lib/greenhouse-styles"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sensorIcons: Record<SensorSummary["type"], LucideIcon> = {
	humidity: Droplets,
	temperature: ThermometerSun,
	light: SunMedium,
	activity: Radar,
	waterLevel: WalletCards,
}

type SensorSummaryCardProps = {
	summary: SensorSummary
}

export function SensorSummaryCard({ summary }: SensorSummaryCardProps) {
	const Icon = sensorIcons[summary.type]

	return (
		<GreenhouseCard className="h-full">
			<CardHeader className="space-y-3">
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
					<p className="text-sm text-green-800/70">{summary.description}</p>
				</div>
			</CardHeader>
			<CardContent className="flex items-end justify-between">
				<div>
					<p className="text-3xl font-bold tracking-tight text-green-950">
						{summary.formattedValue}
						{summary.unit && (
							<span className="ml-1 text-lg font-medium text-green-800/70">
								{summary.unit}
							</span>
						)}
					</p>
				</div>
				<div className="flex items-center gap-1 text-xs text-green-700/70">
					<MoveUpRight className="size-3.5" />
					<span>Actualizado</span>
				</div>
			</CardContent>
		</GreenhouseCard>
	)
}
