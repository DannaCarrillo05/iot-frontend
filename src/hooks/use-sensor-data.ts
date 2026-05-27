import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDeferredValue, useMemo, useState } from "react"
import type { mockDashboardConfig } from "@/data/mock-dashboard-config"
import { getTelemetryDashboardData } from "@/features/telemetry/telemetry-data"
import type { ChartRangeDays } from "@/lib/chart-range"
import {
	buildActivityCountSeries,
	buildDistanceSeries,
	buildEnvironmentSeries,
	buildLightSeries,
} from "@/lib/chart-utils"
import { buildAllNodeCharts } from "@/lib/node-chart-utils"
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
import {
	buildNodeReadings,
	buildTelemetryMeasurementIndex,
	buildTelemetryNodes,
	buildTelemetrySensorReadings,
	buildTelemetrySensors,
	buildTelemetryZones,
	emptyTelemetryData,
	telemetryDashboardConfig,
} from "@/lib/telemetry-dashboard-utils"
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

type EditableSensorFields = Pick<
	Sensor,
	"name" | "type" | "zoneId" | "unit" | "active"
>

export function useSensorData(
	chartRangeDays: ChartRangeDays,
	nodeChartRangeDays: ChartRangeDays = chartRangeDays,
) {
	const queryRangeDays = Math.max(chartRangeDays, nodeChartRangeDays) as ChartRangeDays
	const telemetryQuery = useQuery({
		queryKey: ["telemetry-dashboard", queryRangeDays],
		queryFn: () => getTelemetryDashboardData({ data: queryRangeDays }),
		placeholderData: keepPreviousData,
	})
	const [config, setConfig] = useState(telemetryDashboardConfig)
	const [selectedZoneId, setSelectedZoneId] = useState(config.defaultZoneId)

	const deferredTelemetryData = useDeferredValue(telemetryQuery.data)
	const telemetryData = deferredTelemetryData ?? emptyTelemetryData()
	const isApplyingData = telemetryQuery.data !== deferredTelemetryData
	const telemetryIndex = useMemo(
		() => buildTelemetryMeasurementIndex(telemetryData),
		[telemetryData],
	)

	const telemetrySensors = useMemo(
		() => buildTelemetrySensors(telemetryData, telemetryIndex, chartRangeDays),
		[chartRangeDays, telemetryData, telemetryIndex],
	)
	const [sensorOverrides, setSensorOverrides] = useState<
		Record<string, EditableSensorFields>
	>({})
	const sensors = useMemo(
		() =>
			telemetrySensors.map((sensor) => {
				const override = sensorOverrides[sensor.id]
				if (!override) {
					return sensor
				}

				return {
					...sensor,
					...override,
				}
			}),
		[sensorOverrides, telemetrySensors],
	)

	const [zoneOverrides, setZoneOverrides] = useState<Record<string, Zone>>({})
	const zones = useMemo(
		() => buildTelemetryZones(telemetryData, sensors, zoneOverrides, telemetryIndex),
		[sensors, telemetryData, telemetryIndex, zoneOverrides],
	)

	const sensorReadings = useMemo(
		() => buildTelemetrySensorReadings(chartRangeDays, telemetryIndex),
		[chartRangeDays, telemetryIndex],
	)

	const telemetryNodes = useMemo(
		() => buildTelemetryNodes(telemetryData, telemetryIndex),
		[telemetryData, telemetryIndex],
	)

	const nodeReadings = useMemo(
		() => buildNodeReadings(telemetryData, nodeChartRangeDays),
		[nodeChartRangeDays, telemetryData],
	)

	const nodeCharts = useMemo(
		() => buildAllNodeCharts(telemetryNodes, nodeReadings),
		[nodeReadings, telemetryNodes],
	)

	const alerts = useMemo(() => generateAlerts(sensors, config), [config, sensors])

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
			environment: buildEnvironmentSeries(sensorReadings),
			light: buildLightSeries(sensorReadings),
			waterLevel: buildDistanceSeries(telemetryData.distanceReadings, chartRangeDays),
			activity: buildActivityCountSeries(telemetryData.distanceReadings, chartRangeDays),
		}),
		[chartRangeDays, sensorReadings, telemetryData.distanceReadings],
	)

	const refreshTelemetry = () => {
		void telemetryQuery.refetch()
	}

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
		setZoneOverrides((current) => ({
			...current,
			[zone.id]: zone,
		}))
	}

	const saveSensor = (sensor: Sensor) => {
		setSensorOverrides((current) => ({
			...current,
			[sensor.id]: {
				name: sensor.name,
				type: sensor.type,
				zoneId: sensor.zoneId,
				unit: sensor.unit,
				active: sensor.active,
			},
		}))
	}

	return {
		config,
		sensors,
		zones: zonesWithMetrics,
		alerts,
		recommendations,
		chartData: charts,
		nodeCharts,
		telemetry: {
			isLoading: telemetryQuery.isLoading,
			isFetching: telemetryQuery.isFetching,
			isApplyingData,
			isError: telemetryQuery.isError,
			error: telemetryQuery.error,
			hasData: telemetryData.measurements.length > 0,
			refresh: refreshTelemetry,
		},
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
	if (!representative) {
		return {
			type,
			label: getSensorLabel(type),
			formattedValue: "Sin datos",
			unit: "",
			status: "offline",
			statusLabel: getStatusLabel("offline"),
			description: getSensorDescription(type),
		}
	}

	const currentValue =
		type === "activity"
			? Math.max(...sensorsByType.map((sensor) => sensor.currentValue))
			: averageValue(sensorsByType.map((sensor) => sensor.currentValue))
	const initialStatus = getSensorStatus(representative, config)
	const status = sensorsByType
		.map((sensor) => getSensorStatus(sensor, config))
		.reduce(
			(current: SensorStatus, next) =>
				priority(next) > priority(current) ? next : current,
			initialStatus,
		)

	return {
		type,
		label: getSensorLabel(type),
		formattedValue: formatSensorValue(type, currentValue),
		unit: formatSensorUnit(representative),
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
