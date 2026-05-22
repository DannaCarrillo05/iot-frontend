import { useMemo, useState } from "react"
import { mockAlerts } from "@/data/mock-alerts"
import { mockDashboardConfig } from "@/data/mock-dashboard-config"
import { mockReadings } from "@/data/mock-readings"
import { mockSensors } from "@/data/mock-sensors"
import { mockZones } from "@/data/mock-zones"
import {
	buildActivitySeries,
	buildEnvironmentSeries,
	buildLightSeries,
	buildWaterLevelSeries,
} from "@/lib/chart-utils"
import {
	formatSensorUnit,
	formatSensorValue,
	getSensorDescription,
	getSensorLabel,
	sensorTypeOrder,
} from "@/lib/sensor-utils"
import {
	generateAlerts,
	generateRecommendations,
	getSensorStatus,
	getStatusLabel,
	getZoneStatus,
	sortZonesBySeverity,
} from "@/lib/status-utils"
import { dashboardConfigSchema } from "@/schemas/dashboard-config.schema"
import type { Sensor, SensorStatus, SensorType } from "@/schemas/sensor.schema"
import type { Zone, ZoneStatus } from "@/schemas/zone.schema"

export type SensorSummary = {
	type: SensorType
	label: string
	formattedValue: string
	unit: string
	status: SensorStatus
	statusLabel: string
	description: string
}

export function useSensorData() {
	const [config, setConfig] = useState(mockDashboardConfig)
	const [zones, setZones] = useState(mockZones)
	const [sensors, setSensors] = useState(mockSensors)
	const [selectedZoneId, setSelectedZoneId] = useState(config.defaultZoneId)

	const alerts = useMemo(() => {
		const generated = generateAlerts(sensors, config)
		return generated.length > 0 ? generated : mockAlerts
	}, [config, sensors])

	const recommendations = useMemo(
		() => generateRecommendations(alerts),
		[alerts],
	)

	const sensorSummaries = useMemo(
		() => sensorTypeOrder.map((type) => buildSensorSummary(type, sensors, config)),
		[config, sensors],
	)

	const zonesWithMetrics = useMemo(
		() =>
			sortZonesBySeverity(zones, sensors, config).map((zone) => ({
				...zone,
				computedStatus: getZoneStatus(zone, sensors, config),
				statusLabel: getStatusLabel(getZoneStatus(zone, sensors, config)),
				sensors: sensors.filter((sensor) => sensor.zoneId === zone.id),
				alertCount: alerts.filter((alert) => alert.zoneId === zone.id).length,
			})),
		[alerts, config, sensors, zones],
	)

	const selectedZone =
		zonesWithMetrics.find((zone) => zone.id === selectedZoneId) ?? zonesWithMetrics[0]

	const charts = useMemo(
		() => ({
			environment: buildEnvironmentSeries(mockReadings),
			light: buildLightSeries(mockReadings),
			waterLevel: buildWaterLevelSeries(mockReadings),
			activity: buildActivitySeries(mockReadings),
		}),
		[],
	)

	const updateThresholds = (
		values: typeof mockDashboardConfig.thresholds & { alertsEnabled: boolean },
	) => {
		setConfig((current) =>
			dashboardConfigSchema.parse({
				...current,
				alertsEnabled: values.alertsEnabled,
				thresholds: {
					temperatureMin: values.temperatureMin,
					temperatureMax: values.temperatureMax,
					humidityMin: values.humidityMin,
					humidityMax: values.humidityMax,
					lightMin: values.lightMin,
					waterLevelMin: values.waterLevelMin,
				},
			}),
		)
	}

	const updateLightingSchedule = (
		values: typeof mockDashboardConfig.lightingSchedule,
	) => {
		setConfig((current) =>
			dashboardConfigSchema.parse({
				...current,
				lightingSchedule: values,
			}),
		)
	}

	const saveZone = (zone: Zone) => {
		setZones((current) => {
			const exists = current.some((item) => item.id === zone.id)
			if (exists) {
				return current.map((item) => (item.id === zone.id ? zone : item))
			}

			return [...current, zone]
		})
	}

	const saveSensor = (sensor: Sensor) => {
		setSensors((current) =>
			current.map((item) => (item.id === sensor.id ? sensor : item)),
		)
	}

	return {
		config,
		sensors,
		zones: zonesWithMetrics,
		alerts,
		recommendations,
		chartData: charts,
		sensorSummaries,
		selectedZone,
		selectedZoneId,
		setSelectedZoneId,
		updateThresholds,
		updateLightingSchedule,
		saveZone,
		saveSensor,
	}
}

function buildSensorSummary(
	type: SensorType,
	sensors: Sensor[],
	config: typeof mockDashboardConfig,
): SensorSummary {
	const sensorsByType = sensors.filter((sensor) => sensor.type === type)
	const representative = sensorsByType[0]
	const currentValue =
		type === "activity"
			? Math.max(...sensorsByType.map((sensor) => sensor.currentValue))
			: averageValue(sensorsByType.map((sensor) => sensor.currentValue))
	const status = sensorsByType
		.map((sensor) => getSensorStatus(sensor, config))
		.reduce<SensorStatus>((current, next) =>
			priority(next) > priority(current) ? next : current,
		)

	return {
		type,
		label: getSensorLabel(type),
		formattedValue: formatSensorValue(type, currentValue),
		unit: representative ? formatSensorUnit(representative) : "",
		status,
		statusLabel: getStatusLabel(status),
		description: getSensorDescription(type),
	}
}

function priority(status: SensorStatus) {
	const order: Record<SensorStatus, number> = {
		normal: 0,
		warning: 1,
		critical: 2,
		offline: 3,
	}

	return order[status]
}

function averageValue(values: number[]) {
	return values.reduce((total, value) => total + value, 0) / values.length
}

export type ZoneWithMetrics = Zone & {
	computedStatus: ZoneStatus
	statusLabel: string
	sensors: Sensor[]
	alertCount: number
}
