import { useMemo, useState } from "react"
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import {
	getPresetLabel,
	getPresetVariables,
	getSimulatorFleetNode,
} from "@/data/node-presets"
import type { ZoneWithMetrics } from "@/hooks/use-sensor-data"
import { getStatusLabel } from "@/lib/status-utils"
import type { Alert } from "@/schemas/alert.schema"
import type { NodePreset } from "@/schemas/node.schema"
import type { SensorType } from "@/schemas/sensor.schema"
import type { ZoneStatus } from "@/schemas/zone.schema"
import { GreenhouseZone } from "./greenhouse-zone"
import { ZoneDetailSheet } from "./zone-detail-sheet"

type GreenhouseMapAreaDefinition = {
	id: string
	name: string
	description: string
	kind: ZoneWithMetrics["kind"]
	nodeIds: string[]
	presets: NodePreset[]
	sensorTypes?: SensorType[]
	variableKeys?: string[]
	layoutClassName: string
}

type GreenhouseMapArea = {
	zone: ZoneWithMetrics
	nodes: ZoneWithMetrics[]
	nodeCount: number
	variableCount: number
	presetLabels: string[]
	layoutClassName: string
	primaryZoneId: string
}

const mapAreaDefinitions: GreenhouseMapAreaDefinition[] = [
	{
		id: "zona-a-cultivo",
		name: "Zona A · Cultivo principal",
		description: "ESP32 ambiental y primera franja de nodos cacao.",
		kind: "crop",
		nodeIds: [
			"esp32-node-01",
			"nodo-cultivo-cacao-01",
			"nodo-cultivo-cacao-02",
			"nodo-cultivo-cacao-03",
		],
		presets: ["esp32", "cultivo_cacao"],
		sensorTypes: ["temperature", "humidity", "light"],
		layoutClassName: "lg:col-span-2",
	},
	{
		id: "clima-externo",
		name: "Clima exterior",
		description: "Lectura perimetral de temperatura, humedad, viento y lluvia.",
		kind: "access",
		nodeIds: ["nodo-clima-externo-01", "nodo-clima-externo-02"],
		presets: ["clima_externo"],
		sensorTypes: ["temperature", "humidity"],
		layoutClassName: "lg:col-span-1",
	},
	{
		id: "energia-control",
		name: "Energía y control",
		description: "Supervisión eléctrica de voltaje, corriente, potencia y señal.",
		kind: "tank",
		nodeIds: ["nodo-energia-01", "nodo-energia-02"],
		presets: ["energia"],
		layoutClassName: "lg:col-span-1",
	},
	{
		id: "zona-b-cultivo",
		name: "Zona B · Cultivo secundario",
		description: "Segunda franja de cacao para contraste de microclima.",
		kind: "crop",
		nodeIds: ["nodo-cultivo-cacao-04", "nodo-cultivo-cacao-05"],
		presets: ["cultivo_cacao"],
		sensorTypes: ["temperature", "humidity"],
		layoutClassName: "lg:col-span-2",
	},
	{
		id: "logistica-almacen",
		name: "Logística y almacén",
		description: "Peso, presencia y temperatura de apoyo operativo.",
		kind: "storage",
		nodeIds: ["nodo-logistica-01", "nodo-logistica-02"],
		presets: ["logistica"],
		sensorTypes: ["temperature", "activity"],
		layoutClassName: "lg:col-span-1",
	},
	{
		id: "tanque-riego",
		name: "Tanque / riego",
		description: "Nivel interpretado desde la distancia reportada por el ESP32.",
		kind: "tank",
		nodeIds: ["esp32-node-01"],
		presets: ["esp32"],
		sensorTypes: ["waterLevel"],
		variableKeys: ["distance_cm"],
		layoutClassName: "lg:col-span-1",
	},
]

const zoneStatusPriority: Record<ZoneStatus, number> = {
	normal: 0,
	warning: 1,
	critical: 2,
	inactive: 3,
}

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
	const [selectedMapZone, setSelectedMapZone] = useState<
		ZoneWithMetrics | undefined
	>(undefined)
	const [selectedMapNodes, setSelectedMapNodes] = useState<ZoneWithMetrics[]>([])

	const mapAreas = useMemo(
		() => buildMapAreas(zones, alerts),
		[alerts, zones],
	)

	return (
		<>
			<GreenhouseCard className="h-full">
				<CardHeader>
					<CardTitle className="text-green-950">Mapa visual del invernadero</CardTitle>
					<CardDescription className="text-green-800/70">
						Agrupa los nodos IoT conocidos por zona operativa, preset y función
						dentro del invernadero.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-3 overflow-hidden rounded-[2rem_1rem_2rem_1rem] border border-green-100/80 bg-green-50/50 p-3 sm:grid-cols-2 lg:grid-cols-4">
						{mapAreas.map((area) => (
							<GreenhouseZone
								key={area.zone.id}
								zone={area.zone}
								nodeCount={area.nodeCount}
								presetLabels={area.presetLabels}
								variableCount={area.variableCount}
								layoutClassName={area.layoutClassName}
								onClick={() => {
									setSelectedMapZone(area.zone)
									setSelectedMapNodes(area.nodes)
									onSelectZone(area.primaryZoneId)
									setOpen(true)
								}}
							/>
						))}
					</div>
				</CardContent>
			</GreenhouseCard>

			<ZoneDetailSheet
				open={open}
				onOpenChange={(nextOpen) => {
					setOpen(nextOpen)
					if (!nextOpen) {
						setSelectedMapZone(undefined)
						setSelectedMapNodes([])
					}
				}}
				zone={selectedMapZone ?? selectedZone}
				nodes={selectedMapNodes}
				alerts={alerts}
				configThresholds={configThresholds}
			/>
		</>
	)
}

function buildMapAreas(
	zones: ZoneWithMetrics[],
	alerts: Alert[],
): GreenhouseMapArea[] {
	const knownAreas = mapAreaDefinitions.flatMap((definition) => {
		const areaZones = zones.filter((zone) => definition.nodeIds.includes(zone.id))
		if (areaZones.length === 0) {
			return []
		}

		return [buildMapArea(definition, areaZones, alerts)]
	})

	const groupedNodeIds = new Set(
		mapAreaDefinitions.flatMap((definition) => definition.nodeIds),
	)
	const ungroupedZones = zones.filter((zone) => !groupedNodeIds.has(zone.id))
	if (ungroupedZones.length === 0) {
		return knownAreas
	}

	return [
		...knownAreas,
		buildMapArea(
			{
				id: "otros-nodos",
				name: "Otros nodos",
				description: "Dispositivos detectados fuera de la distribución conocida.",
				kind: "storage",
				nodeIds: ungroupedZones.map((zone) => zone.id),
				presets: [],
				layoutClassName: "lg:col-span-4",
			},
			ungroupedZones,
			alerts,
		),
	]
}

function buildMapArea(
	definition: GreenhouseMapAreaDefinition,
	zones: ZoneWithMetrics[],
	alerts: Alert[],
): GreenhouseMapArea {
	const sensors = zones
		.flatMap((zone) => zone.sensors)
		.filter((sensor) =>
			definition.sensorTypes ? definition.sensorTypes.includes(sensor.type) : true,
		)
	const areaAlerts = getAreaAlerts(alerts, sensors, definition.sensorTypes)
	const variableCount = getAreaVariableCount(definition, zones)
	const computedStatus = getAreaStatus(
		sensors.length,
		variableCount,
		areaAlerts,
		zones,
	)
	const presetLabels = definition.presets.map((preset) => getPresetLabel(preset))
	const primaryZoneId = zones[0]?.id ?? definition.id

	return {
		zone: {
			id: definition.id,
			name: definition.name,
			description: definition.description,
			kind: definition.kind,
			status: computedStatus,
			sensorIds: sensors.map((sensor) => sensor.id),
			rowStart: 1,
			rowSpan: 1,
			colStart: 1,
			colSpan: 1,
			computedStatus,
			statusLabel: getStatusLabel(computedStatus),
			sensors,
			alertCount: areaAlerts.length,
		},
		nodes: zones,
		nodeCount: zones.length,
		variableCount,
		presetLabels,
		layoutClassName: definition.layoutClassName,
		primaryZoneId,
	}
}

function getAreaAlerts(
	alerts: Alert[],
	sensors: ZoneWithMetrics["sensors"],
	sensorTypes: SensorType[] | undefined,
) {
	const sensorZoneIds = new Set(sensors.map((sensor) => sensor.zoneId))

	return alerts.filter((alert) => {
		if (!alert.zoneId || !sensorZoneIds.has(alert.zoneId)) {
			return false
		}

		if (!sensorTypes || !alert.sensorType) {
			return true
		}

		return sensorTypes.includes(alert.sensorType)
	})
}

function getAreaStatus(
	sensorCount: number,
	variableCount: number,
	alerts: Alert[],
	zones: ZoneWithMetrics[],
): ZoneStatus {
	if (alerts.some((alert) => alert.severity === "critical")) {
		return "critical"
	}

	if (alerts.some((alert) => alert.severity === "warning")) {
		return "warning"
	}

	if (sensorCount > 0 || variableCount > 0) {
		return "normal"
	}

	return zones
		.map((zone) => zone.computedStatus)
		.reduce((current, next) =>
			zoneStatusPriority[next] > zoneStatusPriority[current] ? next : current,
		)
}

function getAreaVariableCount(
	definition: GreenhouseMapAreaDefinition,
	zones: ZoneWithMetrics[],
) {
	return zones.reduce((total, zone) => {
		const fleetNode = getSimulatorFleetNode(zone.id)
		if (!fleetNode) {
			return total + zone.sensors.length
		}

		const variables = getPresetVariables(fleetNode.preset)
		if (!definition.variableKeys) {
			return total + variables.length
		}

		return (
			total +
			variables.filter((variable) => definition.variableKeys?.includes(variable.key))
				.length
		)
	}, 0)
}
