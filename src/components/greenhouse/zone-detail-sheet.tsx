import { Activity, Bell, Waves } from "lucide-react"
import type { Alert } from "@/schemas/alert.schema"
import type { Sensor } from "@/schemas/sensor.schema"
import type { ZoneWithMetrics } from "@/hooks/use-sensor-data"
import { formatSensorUnit, formatSensorValue } from "@/lib/sensor-utils"
import { getSensorStatus, getStatusBadgeVariant } from "@/lib/status-utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"

type ZoneDetailSheetProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	zone: ZoneWithMetrics | undefined
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

export function ZoneDetailSheet({
	open,
	onOpenChange,
	zone,
	alerts,
	configThresholds,
}: ZoneDetailSheetProps) {
	if (!zone) {
		return null
	}

	const zoneAlerts = alerts.filter((alert) => alert.zoneId === zone.id)

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md">
				<SheetHeader>
					<SheetTitle>{zone.name}</SheetTitle>
					<SheetDescription>{zone.description}</SheetDescription>
				</SheetHeader>

				<ScrollArea className="h-full px-4 pb-6">
					<div className="space-y-6">
						<div className="grid gap-3 rounded-2xl bg-muted/50 p-4 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Estado</span>
								<Badge variant={getStatusBadgeVariant(zone.computedStatus)}>
									{zone.statusLabel}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Sensores</span>
								<span>{zone.sensors.length}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Alertas</span>
								<span>{zoneAlerts.length}</span>
							</div>
						</div>

						<section className="space-y-3">
							<div className="flex items-center gap-2 text-sm font-medium">
								<Waves className="size-4 text-primary" />
								Sensores asociados
							</div>
							<div className="space-y-3">
								{zone.sensors.map((sensor) => (
									<SensorRow
										key={sensor.id}
										sensor={sensor}
										configThresholds={configThresholds}
									/>
								))}
							</div>
						</section>

						<section className="space-y-3">
							<div className="flex items-center gap-2 text-sm font-medium">
								<Bell className="size-4 text-primary" />
								Alertas de la zona
							</div>
							<div className="space-y-3">
								{zoneAlerts.length > 0 ? (
									zoneAlerts.map((alert) => (
										<div
											key={alert.id}
											className="rounded-2xl border p-3 text-sm"
										>
											<div className="mb-2 flex items-center justify-between gap-3">
												<p className="font-medium">{alert.title}</p>
												<Badge variant={getStatusBadgeVariant(alert.severity)}>
													{alert.severity}
												</Badge>
											</div>
											<p className="text-muted-foreground">{alert.message}</p>
										</div>
									))
								) : (
									<p className="text-muted-foreground text-sm">
										No hay alertas activas en esta zona.
									</p>
								)}
							</div>
						</section>

						<section className="space-y-3">
							<div className="flex items-center gap-2 text-sm font-medium">
								<Activity className="size-4 text-primary" />
								Notas operativas
							</div>
							<div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
								Revisa ventilación, riego y acceso si la zona cambia a estado de
								atención o crítico de forma sostenida.
							</div>
						</section>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}

function SensorRow({
	sensor,
	configThresholds,
}: {
	sensor: Sensor
	configThresholds: ZoneDetailSheetProps["configThresholds"]
}) {
	const status = getSensorStatus(sensor, {
		thresholds: configThresholds,
		alertsEnabled: true,
		lightingSchedule: {
			startHour: 6,
			endHour: 18,
			enabled: true,
		},
		defaultZoneId: sensor.zoneId,
	})

	return (
		<div className="rounded-2xl border p-3">
			<div className="mb-2 flex items-center justify-between gap-3">
				<p className="font-medium">{sensor.name}</p>
				<Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
			</div>
			<p className="text-muted-foreground mb-3 text-sm">{sensor.description}</p>
			<p className="text-lg font-semibold">
				{formatSensorValue(sensor.type, sensor.currentValue)}
				{formatSensorUnit(sensor) && (
					<span className="text-muted-foreground ml-1 text-sm font-medium">
						{formatSensorUnit(sensor)}
					</span>
				)}
			</p>
		</div>
	)
}
