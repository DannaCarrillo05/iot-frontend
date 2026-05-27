import { Activity, Bell, Cpu, Waves } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import { getPresetLabel, getSimulatorFleetNode } from "@/data/node-presets"
import type { ZoneWithMetrics } from "@/hooks/use-sensor-data"
import { formatSensorUnit, formatSensorValue } from "@/lib/sensor-utils"
import { getAlertSeverityLabel, getSensorStatus, getStatusBadgeVariant, getStatusLabel } from "@/lib/status-utils"
import type { Alert } from "@/schemas/alert.schema"
import type { Sensor } from "@/schemas/sensor.schema"

type ZoneDetailSheetProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	zone: ZoneWithMetrics | undefined
	nodes: ZoneWithMetrics[]
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
	nodes,
	alerts,
	configThresholds,
}: ZoneDetailSheetProps) {
	if (!zone) {
		return null
	}

	const zoneSensorZoneIds = new Set(zone.sensors.map((sensor) => sensor.zoneId))
	const zoneAlerts = alerts.filter(
		(alert) =>
			alert.zoneId === zone.id ||
			(alert.zoneId !== undefined && zoneSensorZoneIds.has(alert.zoneId)),
	)

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="pr-10 leading-snug">{zone.name}</SheetTitle>
					<SheetDescription className="pr-6 leading-6">
						{zone.description}
					</SheetDescription>
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
								<span className="text-muted-foreground">Variables</span>
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
								Variables asociadas
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
								Alertas del área
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
													{getAlertSeverityLabel(alert.severity)}
												</Badge>
											</div>
											<p className="text-muted-foreground">{alert.message}</p>
										</div>
									))
								) : (
									<p className="text-muted-foreground text-sm">
										No hay alertas activas en esta área.
									</p>
								)}
							</div>
						</section>

						{nodes.length > 0 && (
							<section className="space-y-3">
								<div className="flex items-center gap-2 text-sm font-medium">
									<Cpu className="size-4 text-primary" />
									Nodos relacionados
								</div>
								<div className="space-y-2">
									{nodes.map((node) => (
										<NodeRow key={node.id} node={node} />
									))}
								</div>
							</section>
						)}

						<section className="space-y-3">
							<div className="flex items-center gap-2 text-sm font-medium">
								<Activity className="size-4 text-primary" />
								Notas operativas
							</div>
							<div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
								Revisa alimentación, conectividad y calibración si el área cambia a
								estado de atención o crítico de forma sostenida.
							</div>
						</section>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}

function NodeRow({ node }: { node: ZoneWithMetrics }) {
	const fleetNode = getSimulatorFleetNode(node.id)
	const presetLabel = fleetNode ? getPresetLabel(fleetNode.preset) : node.id

	return (
		<div className="rounded-2xl border p-3 text-sm">
			<div className="mb-1 flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="min-w-0 break-words font-medium leading-snug">{node.id}</p>
					<p className="text-muted-foreground text-xs">{presetLabel}</p>
				</div>
				<Badge className="shrink-0" variant={getStatusBadgeVariant(node.computedStatus)}>
					{getStatusLabel(node.computedStatus)}
				</Badge>
			</div>
			<p className="text-muted-foreground">{node.sensors.length} variable{node.sensors.length !== 1 ? "s" : ""}</p>
		</div>
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
		<div className="min-w-0 rounded-2xl border p-3">
			<div className="mb-2 flex min-w-0 items-start justify-between gap-3">
				<p className="min-w-0 break-words font-medium leading-snug">{sensor.name}</p>
				<Badge className="shrink-0" variant={getStatusBadgeVariant(status)}>
					{getStatusLabel(status)}
				</Badge>
			</div>
			<p className="text-muted-foreground mb-3 text-sm leading-5">
				{sensor.description}
			</p>
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
