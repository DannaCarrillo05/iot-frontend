import { mockDashboardConfig } from "@/data/mock-dashboard-config"
import {
	getPresetLabel,
	getPresetVariables,
	getSimulatorFleetNode,
	simulatorFleetNodes,
} from "@/data/node-presets"
import type {
	TelemetryDashboardData,
	TelemetryMeasurement,
} from "@/features/telemetry/telemetry-data"
import { type ChartRangeDays, isWithinChartRange } from "@/lib/chart-range"
import type { NodePreset, NodeReading, TelemetryNode } from "@/schemas/node.schema"
import type { Sensor, SensorTrend, SensorType, SensorUnit } from "@/schemas/sensor.schema"
import type { SensorReading } from "@/schemas/sensor-reading.schema"
import type { Zone } from "@/schemas/zone.schema"

type MetricSensorMapping = {
	metricKey: string
	sensorType: SensorType
	unit: SensorUnit
	name: string
	description: string
	zoneId: string
}

export type TelemetryMeasurementIndex = {
	byDevice: Map<string, TelemetryMeasurement[]>
	byDeviceAndMetric: Map<string, Map<string, TelemetryMeasurement[]>>
	byMetric: Map<string, TelemetryMeasurement[]>
}

const metricSensorMappings: MetricSensorMapping[] = [
	{
		metricKey: "temperature",
		sensorType: "temperature",
		unit: "celsius",
		name: "Temperatura ESP32",
		description: "Temperatura reportada por el nodo ESP32.",
		zoneId: "zone-a",
	},
	{
		metricKey: "humidity",
		sensorType: "humidity",
		unit: "percent",
		name: "Humedad ESP32",
		description: "Humedad reportada por el nodo ESP32.",
		zoneId: "zone-a",
	},
	{
		metricKey: "light",
		sensorType: "light",
		unit: "lux",
		name: "Luz ESP32",
		description: "Nivel de luz reportado por el nodo ESP32.",
		zoneId: "zone-a",
	},
	{
		metricKey: "distance_cm",
		sensorType: "waterLevel",
		unit: "centimeters",
		name: "Distancia ESP32",
		description: "Distancia en centímetros reportada por el nodo ESP32.",
		zoneId: "tank",
	},
	{
		metricKey: "tempC",
		sensorType: "temperature",
		unit: "celsius",
		name: "Temperatura cultivo",
		description: "Temperatura reportada por los nodos de cultivo.",
		zoneId: "zone-a",
	},
	{
		metricKey: "tempZonaC",
		sensorType: "temperature",
		unit: "celsius",
		name: "Temperatura logística",
		description: "Temperatura de zona logística reportada por la flota.",
		zoneId: "storage",
	},
	{
		metricKey: "tempExternaC",
		sensorType: "temperature",
		unit: "celsius",
		name: "Temperatura externa",
		description: "Temperatura ambiente externa reportada por los nodos climáticos.",
		zoneId: "zone-b",
	},
	{
		metricKey: "humedadAirePct",
		sensorType: "humidity",
		unit: "percent",
		name: "Humedad cultivo",
		description: "Humedad de aire reportada por los nodos de cultivo.",
		zoneId: "zone-a",
	},
	{
		metricKey: "humedadExternaPct",
		sensorType: "humidity",
		unit: "percent",
		name: "Humedad externa",
		description: "Humedad ambiente externa reportada por los nodos climáticos.",
		zoneId: "zone-b",
	},
	{
		metricKey: "presencia",
		sensorType: "activity",
		unit: "activity",
		name: "Presencia logística",
		description: "Detección de presencia reportada por los nodos logísticos.",
		zoneId: "entrance",
	},
	{
		metricKey: "voltajeV",
		sensorType: "voltage",
		unit: "volt",
		name: "Voltaje",
		description: "Voltaje eléctrico reportado por el nodo de energía.",
		zoneId: "energia",
	},
	{
		metricKey: "corrienteA",
		sensorType: "current",
		unit: "ampere",
		name: "Corriente",
		description: "Corriente eléctrica reportada por el nodo de energía.",
		zoneId: "energia",
	},
	{
		metricKey: "potenciaW",
		sensorType: "power",
		unit: "watt",
		name: "Potencia",
		description: "Potencia eléctrica reportada por el nodo de energía.",
		zoneId: "energia",
	},
	{
		metricKey: "rssiDbm",
		sensorType: "signal",
		unit: "dbm",
		name: "Señal",
		description: "Intensidad de señal reportada por el nodo.",
		zoneId: "energia",
	},
]

const latestFirst = (left: TelemetryMeasurement, right: TelemetryMeasurement) =>
	new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()

const emptyMeasurements: TelemetryMeasurement[] = []

export function buildTelemetryMeasurementIndex(
	data: TelemetryDashboardData,
): TelemetryMeasurementIndex {
	const byDevice = new Map<string, TelemetryMeasurement[]>()
	const byDeviceAndMetric = new Map<string, Map<string, TelemetryMeasurement[]>>()
	const byMetric = new Map<string, TelemetryMeasurement[]>()

	for (const measurement of data.measurements) {
		appendMeasurement(byDevice, measurement.deviceId, measurement)
		appendMeasurement(byMetric, measurement.metricKey, measurement)

		const deviceMetrics =
			byDeviceAndMetric.get(measurement.deviceId) ??
			new Map<string, TelemetryMeasurement[]>()
		appendMeasurement(deviceMetrics, measurement.metricKey, measurement)
		byDeviceAndMetric.set(measurement.deviceId, deviceMetrics)
	}

	return {
		byDevice: sortMeasurementMap(byDevice),
		byDeviceAndMetric: sortNestedMeasurementMap(byDeviceAndMetric),
		byMetric: sortMeasurementMap(byMetric),
	}
}

function appendMeasurement(
	map: Map<string, TelemetryMeasurement[]>,
	key: string,
	measurement: TelemetryMeasurement,
) {
	const current = map.get(key) ?? []
	current.push(measurement)
	map.set(key, current)
}

function sortMeasurementMap(map: Map<string, TelemetryMeasurement[]>) {
	for (const measurements of map.values()) {
		measurements.sort(latestFirst)
	}

	return map
}

function sortNestedMeasurementMap(
	map: Map<string, Map<string, TelemetryMeasurement[]>>,
) {
	for (const nestedMap of map.values()) {
		sortMeasurementMap(nestedMap)
	}

	return map
}

function getDeviceMeasurements(
	index: TelemetryMeasurementIndex,
	deviceId: string,
) {
	return index.byDevice.get(deviceId) ?? emptyMeasurements
}

function getDeviceMetricMeasurements(
	index: TelemetryMeasurementIndex,
	deviceId: string,
	metricKey: string,
) {
	return (
		index.byDeviceAndMetric.get(deviceId)?.get(metricKey) ?? emptyMeasurements
	)
}

function getMetricMeasurements(
	index: TelemetryMeasurementIndex,
	metricKey: string,
) {
	return index.byMetric.get(metricKey) ?? emptyMeasurements
}

export function buildTelemetryNodes(
	data: TelemetryDashboardData,
	index: TelemetryMeasurementIndex,
): TelemetryNode[] {
	return data.devices.map((device) => {
		const fleetNode = getSimulatorFleetNode(device.deviceId)
		const deviceMeasurements = getDeviceMeasurements(index, device.deviceId)
		const preset = fleetNode?.preset ?? inferPreset(device.deviceId, deviceMeasurements)
		const variables = getPresetVariables(preset)
		const gridFila = fleetNode?.gridFila ?? latestNumber(deviceMeasurements, "gridFila")
		const gridCol = fleetNode?.gridCol ?? latestNumber(deviceMeasurements, "gridCol")
		const gridLabel = gridFila && gridCol ? ` · Fila ${gridFila}, columna ${gridCol}` : ""

		return {
			id: device.deviceId,
			deviceId: device.deviceId,
			preset,
			label: buildNodeLabel(device.deviceId, preset),
			description: `${getPresetLabel(preset)}${gridLabel} · ${variables.length} variables`,
			gridFila,
			gridCol,
			variables,
		}
	})
}

export function buildNodeReadings(
	data: TelemetryDashboardData,
	rangeDays: ChartRangeDays,
): NodeReading[] {
	return data.measurements
		.filter((measurement) => isWithinChartRange(measurement.timestamp, rangeDays))
		.flatMap((measurement) => {
			const value = numericMeasurementValue(measurement)
			if (value === null) {
				return []
			}

			return [
				{
					id: measurement.id,
					nodeId: measurement.deviceId,
					variableKey: measurement.metricKey,
					timestamp: measurement.timestamp,
					value,
				},
			]
		})
		.sort(
			(left, right) =>
				new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
		)
}

// Must cover at least one full bucket for each range so the most recent
// bucketed measurement always falls inside the window.
const SENSOR_RECENCY_WINDOW_MS: Record<ChartRangeDays, number> = {
	1: 2 * 900 * 1000,    // 2 × 15-min buckets = 30 min
	4: 2 * 3600 * 1000,   // 2 × 1-h buckets   = 2 h
	7: 2 * 7200 * 1000,   // 2 × 2-h buckets   = 4 h
}

export function buildTelemetrySensors(
	data: TelemetryDashboardData,
	index: TelemetryMeasurementIndex,
	rangeDays: ChartRangeDays,
): Sensor[] {
	const recentWindowMs = SENSOR_RECENCY_WINDOW_MS[rangeDays]
	return data.devices.flatMap((device) =>
		metricSensorMappings.flatMap((mapping) => {
			const matchingMeasurements = getDeviceMetricMeasurements(
				index,
				device.deviceId,
				mapping.metricKey,
			)
			const lastHourMeasurements = matchingMeasurements.filter((measurement) =>
				isWithinRecentWindow(measurement.timestamp, recentWindowMs),
			)

			const latest = lastHourMeasurements[0]
			if (!latest) {
				return []
			}

			const currentValue = averageMeasurementValue(lastHourMeasurements)
			if (currentValue === null) {
				return []
			}

			const previousMeasurement = matchingMeasurements.find(
				(measurement) => measurement.id !== latest.id,
			)
			const previousValue = previousMeasurement
				? numericMeasurementValue(previousMeasurement)
				: null

			return [
				{
					id: `${device.deviceId}-${mapping.metricKey}`,
					name: `${mapping.name} · ${device.deviceId}`,
					type: mapping.sensorType,
					zoneId: device.deviceId,
					unit: mapping.unit,
					currentValue,
					active: true,
					description: mapping.description,
					lastUpdated: latest.timestamp,
					trend: buildTrend(currentValue, previousValue),
				},
			]
		}),
	)
}

export function buildTelemetrySensorReadings(
	rangeDays: ChartRangeDays,
	index: TelemetryMeasurementIndex,
): SensorReading[] {
	return metricSensorMappings.flatMap((mapping) =>
		getMetricMeasurements(index, mapping.metricKey).flatMap((measurement) => {
			if (!isWithinChartRange(measurement.timestamp, rangeDays)) {
				return []
			}

			const value = numericMeasurementValue(measurement)
			if (value === null) {
				return []
			}

			return [
				{
					id: measurement.id,
					sensorId: mapping.metricKey,
					sensorType: mapping.sensorType,
					timestamp: measurement.timestamp,
					value,
				},
			]
		}),
	)
}

export function buildTelemetryZones(
	data: TelemetryDashboardData,
	sensors: Sensor[],
	overrides: Record<string, Zone>,
	index: TelemetryMeasurementIndex,
): Zone[] {
	return knownNodeIds(data).map((deviceId) => {
		const deviceMeasurements = getDeviceMeasurements(index, deviceId)
		const fleetNode = getSimulatorFleetNode(deviceId)
		const preset = fleetNode?.preset ?? inferPreset(deviceId, deviceMeasurements)
		const variables = getPresetVariables(preset)
		const nodeSensors = sensors.filter((sensor) => sensor.zoneId === deviceId)
		const position = getNodeMapPosition(deviceId, preset)
		const override = overrides[deviceId]

		return {
			id: deviceId,
			name: override?.name ?? buildNodeLabel(deviceId, preset),
			description:
				override?.description ??
				`${deviceId} · ${getPresetLabel(preset)} · ${variables.length} variables`,
			kind: override?.kind ?? getNodeZoneKind(preset),
			status: override?.status ?? (nodeSensors.length > 0 ? "normal" : "inactive"),
			sensorIds: nodeSensors.map((sensor) => sensor.id),
			rowStart: override?.rowStart ?? position.rowStart,
			rowSpan: override?.rowSpan ?? position.rowSpan,
			colStart: override?.colStart ?? position.colStart,
			colSpan: override?.colSpan ?? position.colSpan,
		}
	})
}

export function emptyTelemetryData(): TelemetryDashboardData {
	return {
		devices: [],
		measurements: [],
		distanceReadings: [],
	}
}

function numericMeasurementValue(measurement: TelemetryMeasurement) {
	if (measurement.valueType === "number") {
		return measurement.valueNumber
	}

	if (measurement.valueType === "boolean") {
		return measurement.valueBool ? 1 : 0
	}

	return null
}

function averageMeasurementValue(measurements: TelemetryMeasurement[]) {
	const values = measurements.flatMap((measurement) => {
		const value = numericMeasurementValue(measurement)
		return value === null ? [] : [value]
	})

	if (values.length === 0) {
		return null
	}

	return values.reduce((total, value) => total + value, 0) / values.length
}

function isWithinRecentWindow(timestamp: string, windowMs: number) {
	return new Date(timestamp).getTime() >= Date.now() - windowMs
}

function latestNumber(measurements: TelemetryMeasurement[], metricKey: string) {
	const latest = measurements
		.filter((measurement) => measurement.metricKey === metricKey)
		.sort(latestFirst)[0]

	if (!latest) {
		return undefined
	}

	const value = numericMeasurementValue(latest)
	return typeof value === "number" ? Math.round(value) : undefined
}

function knownNodeIds(data: TelemetryDashboardData) {
	const nodeIds = new Map<string, string>()
	for (const node of simulatorFleetNodes) {
		nodeIds.set(node.deviceId, node.deviceId)
	}

	for (const device of data.devices) {
		nodeIds.set(device.deviceId, device.deviceId)
	}

	return Array.from(nodeIds.values())
}

function inferPreset(deviceId: string, measurements: TelemetryMeasurement[]): NodePreset {
	if (deviceId === "esp32-node-01" || deviceId.includes("esp32")) {
		return "esp32"
	}

	if (deviceId.includes("logistica")) {
		return "logistica"
	}

	if (deviceId.includes("clima")) {
		return "clima_externo"
	}

	if (deviceId.includes("energia")) {
		return "energia"
	}

	if (deviceId.includes("cacao") || deviceId.includes("cultivo")) {
		return "cultivo_cacao"
	}

	const keys = new Set(measurements.map((measurement) => measurement.metricKey))
	if (
		keys.has("temperature") ||
		keys.has("humidity") ||
		keys.has("light") ||
		keys.has("distance_cm")
	) {
		return "esp32"
	}

	if (keys.has("pesoKg") || keys.has("presencia")) {
		return "logistica"
	}

	if (keys.has("tempExternaC") || keys.has("humedadExternaPct")) {
		return "clima_externo"
	}

	if (keys.has("voltajeV") || keys.has("corrienteA")) {
		return "energia"
	}

	return "cultivo_cacao"
}

function buildNodeLabel(deviceId: string, preset: ReturnType<typeof inferPreset>) {
	const suffix = deviceId.split("-").filter(Boolean).at(-1)?.toUpperCase() ?? deviceId
	return `${getPresetLabel(preset)} ${suffix}`
}

function getNodeZoneKind(preset: NodePreset): Zone["kind"] {
	switch (preset) {
		case "cultivo_cacao":
		case "esp32":
			return "crop"
		case "energia":
			return "tank"
		case "logistica":
			return "storage"
		case "clima_externo":
			return "access"
	}
}

function getNodeMapPosition(deviceId: string, preset: NodePreset) {
	const knownPositions: Record<
		string,
		{ rowStart: number; rowSpan: number; colStart: number; colSpan: number }
	> = {
		"esp32-node-01": { rowStart: 1, rowSpan: 1, colStart: 1, colSpan: 2 },
		"nodo-clima-externo-01": { rowStart: 1, rowSpan: 1, colStart: 3, colSpan: 1 },
		"nodo-clima-externo-02": { rowStart: 1, rowSpan: 1, colStart: 4, colSpan: 1 },
		"nodo-cultivo-cacao-01": { rowStart: 2, rowSpan: 1, colStart: 1, colSpan: 1 },
		"nodo-cultivo-cacao-02": { rowStart: 2, rowSpan: 1, colStart: 2, colSpan: 1 },
		"nodo-cultivo-cacao-03": { rowStart: 2, rowSpan: 1, colStart: 3, colSpan: 1 },
		"nodo-cultivo-cacao-04": { rowStart: 3, rowSpan: 1, colStart: 1, colSpan: 1 },
		"nodo-cultivo-cacao-05": { rowStart: 3, rowSpan: 1, colStart: 2, colSpan: 1 },
		"nodo-energia-01": { rowStart: 2, rowSpan: 1, colStart: 4, colSpan: 1 },
		"nodo-energia-02": { rowStart: 3, rowSpan: 1, colStart: 4, colSpan: 1 },
		"nodo-logistica-01": { rowStart: 4, rowSpan: 1, colStart: 1, colSpan: 2 },
		"nodo-logistica-02": { rowStart: 4, rowSpan: 1, colStart: 3, colSpan: 2 },
	}
	const knownPosition = knownPositions[deviceId]
	if (knownPosition) {
		return knownPosition
	}

	const fallbackIndex = deviceId.length + getPresetVariables(preset).length
	return {
		rowStart: 5 + Math.floor(fallbackIndex / 4),
		rowSpan: 1,
		colStart: (fallbackIndex % 4) + 1,
		colSpan: 1,
	}
}

function buildTrend(currentValue: number, previousValue: number | null): SensorTrend {
	if (previousValue === null) {
		return "stable"
	}

	if (currentValue > previousValue) {
		return "up"
	}

	if (currentValue < previousValue) {
		return "down"
	}

	return "stable"
}

export const telemetryDashboardConfig = {
	...mockDashboardConfig,
	defaultZoneId: "esp32-node-01",
}
