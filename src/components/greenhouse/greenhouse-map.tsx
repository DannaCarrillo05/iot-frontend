import { useMemo, useState } from "react"
import type { Alert } from "@/schemas/alert.schema"
import type { ZoneWithMetrics } from "@/hooks/use-sensor-data"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { GreenhouseZone } from "./greenhouse-zone"
import { ZoneDetailSheet } from "./zone-detail-sheet"

type GreenhouseMapProps = {
	zones: ZoneWithMetrics[]
	selectedZone: ZoneWithMetrics | undefined
	onSelectZone: (zoneId: string) => void
	alerts: Alert[]
	configThresholds: {
		temperatureMin: number
		temperatureMax: number
		humidityMin: number
		humidityMax: number
		lightMin: number
		waterLevelMin: number
	}
}

export function GreenhouseMap({
	zones,
	selectedZone,
	onSelectZone,
	alerts,
	configThresholds,
}: GreenhouseMapProps) {
	const [open, setOpen] = useState(false)

	const orderedZones = useMemo(
		() =>
			[...zones].sort((left, right) =>
				left.rowStart === right.rowStart
					? left.colStart - right.colStart
					: left.rowStart - right.rowStart,
			),
		[zones],
	)

	return (
		<>
			<GreenhouseCard className="h-full">
				<CardHeader>
					<CardTitle className="text-green-950">Mapa visual del invernadero</CardTitle>
					<CardDescription className="text-green-800/70">
						Cada zona es clicable y muestra detalle operativo, sensores y alertas.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid min-h-[420px] grid-cols-4 gap-3 rounded-[2rem_1rem_2rem_1rem] border border-green-100/80 bg-green-50/50 p-3">
						{orderedZones.map((zone) => (
							<GreenhouseZone
								key={zone.id}
								zone={zone}
								onClick={() => {
									onSelectZone(zone.id)
									setOpen(true)
								}}
							/>
						))}
					</div>
				</CardContent>
			</GreenhouseCard>

			<ZoneDetailSheet
				open={open}
				onOpenChange={setOpen}
				zone={selectedZone}
				alerts={alerts}
				configThresholds={configThresholds}
			/>
		</>
	)
}
