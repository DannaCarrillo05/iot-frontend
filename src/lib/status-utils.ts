import type { Alert, AlertKind, AlertSeverity } from "@/schemas/alert.schema"
import type { DashboardConfig } from "@/schemas/dashboard-config.schema"
import type { Recommendation, RecommendationPriority } from "@/schemas/recommendation.schema"
import type { Sensor, SensorStatus } from "@/schemas/sensor.schema"
import type { Zone, ZoneStatus } from "@/schemas/zone.schema"
import { getSensorLabel } from "./sensor-utils"

const sensorStatusPriority: Record<SensorStatus, number> = {
	normal: 0,
	warning: 1,
	critical: 2,
	offline: 3,
}

const zoneStatusPriority: Record<ZoneStatus, number> = {
	normal: 0,
	warning: 1,
	critical: 2,
	inactive: 3,
}

const sensorHealthScore: Record<SensorStatus, number> = {
	normal: 100,
	warning: 72,
	critical: 38,
	offline: 20,
}

function isOutsideLightingSchedule(config: DashboardConfig) {
	const currentHour = 20
	if (!config.lightingSchedule.enabled) {
		return false
	}

	return (
		currentHour < config.lightingSchedule.startHour ||
		currentHour > config.lightingSchedule.endHour
	)
}

export function getSensorStatus(
	sensor: Sensor,
	config: DashboardConfig,
): SensorStatus {
	if (!sensor.active) {
		return "offline"
	}

	switch (sensor.type) {
		case "humidity":
			if (sensor.currentValue >= config.thresholds.humidityMax + 4) {
				return "critical"
			}
			if (
				sensor.currentValue > config.thresholds.humidityMax ||
				sensor.currentValue < config.thresholds.humidityMin
			) {
				return "warning"
			}
			return "normal"
		case "temperature":
			if (sensor.currentValue >= config.thresholds.temperatureMax + 1.5) {
				return "critical"
			}
			if (
				sensor.currentValue > config.thresholds.temperatureMax ||
				sensor.currentValue < config.thresholds.temperatureMin
			) {
				return "warning"
			}
			return "normal"
		case "light":
			if (sensor.currentValue <= config.thresholds.lightMin * 0.8) {
				return "critical"
			}
			if (sensor.currentValue < config.thresholds.lightMin) {
				return "warning"
			}
			return "normal"
		case "waterLevel":
			if (sensor.currentValue <= config.thresholds.waterLevelMin - 8) {
				return "critical"
			}
			if (sensor.currentValue < config.thresholds.waterLevelMin) {
				return "warning"
			}
			return "normal"
		case "activity":
			if (sensor.currentValue > 0 && isOutsideLightingSchedule(config)) {
				return "warning"
			}
			return "normal"
		case "voltage":
		case "current":
		case "power":
		case "signal":
			return "normal"
	}
}

export function getStatusLabel(status: SensorStatus | ZoneStatus) {
	switch (status) {
		case "normal":
			return "Estable"
		case "warning":
			return "Atención"
		case "critical":
			return "Crítico"
		case "offline":
			return "Sin conexión"
		case "inactive":
			return "Inactiva"
	}
}

export function getAlertSeverityLabel(severity: AlertSeverity) {
	switch (severity) {
		case "critical":
			return "Crítico"
		case "warning":
			return "Advertencia"
		case "info":
			return "Información"
	}
}

export function getPriorityLabel(priority: RecommendationPriority) {
	switch (priority) {
		case "high":
			return "Alta"
		case "medium":
			return "Media"
		case "low":
			return "Baja"
	}
}

export function getStatusBadgeVariant(
	status: SensorStatus | ZoneStatus | AlertSeverity,
) : "default" | "destructive" | "outline" | "secondary" {
	switch (status) {
		case "critical":
			return "destructive"
		case "warning":
			return "secondary"
		case "info":
			return "outline"
		case "offline":
			return "outline"
		default:
			return "default"
	}
}

export function getZoneStatus(
	zone: Zone,
	sensors: Sensor[],
	config: DashboardConfig,
): ZoneStatus {
	const zoneSensors = sensors.filter((sensor) => sensor.zoneId === zone.id)
	if (zoneSensors.length === 0) {
		return zone.status
	}

	const initialStatus = getSensorStatus(zoneSensors[0], config)
	const mostSevere = zoneSensors
		.map((sensor) => getSensorStatus(sensor, config))
		.reduce(
			(current: SensorStatus, next) =>
				sensorStatusPriority[next] > sensorStatusPriority[current]
					? next
					: current,
			initialStatus,
		)

	if (mostSevere === "offline") {
		return "inactive"
	}

	return mostSevere
}

export function getCropHealth(sensors: Sensor[], config: DashboardConfig) {
	if (sensors.length === 0) {
		return 0
	}

	const score =
		sensors.reduce(
			(total, sensor) => total + sensorHealthScore[getSensorStatus(sensor, config)],
			0,
		) / sensors.length

	return Math.round(score)
}

function buildAlertId(sensor: Sensor, kind: AlertKind) {
	return `${kind}-${sensor.id}`
}

function buildAlertSeverity(status: SensorStatus): AlertSeverity {
	return status === "critical" || status === "offline" ? "critical" : "warning"
}

export function generateAlerts(
	sensors: Sensor[],
	config: DashboardConfig,
): Alert[] {
	if (!config.alertsEnabled) {
		return []
	}

	const alerts: Alert[] = []

	for (const sensor of sensors) {
		const status = getSensorStatus(sensor, config)
		const label = getSensorLabel(sensor.type)

		if (!sensor.active) {
			alerts.push({
				id: buildAlertId(sensor, "sensorOffline"),
				kind: "sensorOffline",
				severity: "critical",
				title: `${label} sin conexión`,
				message: `El sensor ${sensor.name} dejó de reportar datos y necesita revisión.`,
				sensorType: sensor.type,
				zoneId: sensor.zoneId,
				createdAt: sensor.lastUpdated,
				acknowledged: false,
				recommendationIds: [],
			})
			continue
		}

		switch (sensor.type) {
			case "humidity":
				if (sensor.currentValue > config.thresholds.humidityMax) {
					alerts.push({
						id: buildAlertId(sensor, "highHumidity"),
						kind: "highHumidity",
						severity: buildAlertSeverity(status),
						title: `Humedad alta en ${sensor.name}`,
						message:
							"La humedad supera el rango configurado y puede afectar la sanidad del cultivo.",
						sensorType: sensor.type,
						zoneId: sensor.zoneId,
						createdAt: sensor.lastUpdated,
						acknowledged: false,
						recommendationIds: [],
					})
				}
				break
			case "temperature":
				if (sensor.currentValue > config.thresholds.temperatureMax) {
					alerts.push({
						id: buildAlertId(sensor, "highTemperature"),
						kind: "highTemperature",
						severity: buildAlertSeverity(status),
						title: `Temperatura elevada en ${sensor.name}`,
						message:
							"La temperatura está por encima del máximo recomendado y puede estresar el cultivo.",
						sensorType: sensor.type,
						zoneId: sensor.zoneId,
						createdAt: sensor.lastUpdated,
						acknowledged: false,
						recommendationIds: [],
					})
				}
				break
			case "light":
				if (sensor.currentValue < config.thresholds.lightMin) {
					alerts.push({
						id: buildAlertId(sensor, "lowLight"),
						kind: "lowLight",
						severity: buildAlertSeverity(status),
						title: `Luz insuficiente en ${sensor.name}`,
						message:
							"La iluminación disponible está por debajo del mínimo necesario para esta fase.",
						sensorType: sensor.type,
						zoneId: sensor.zoneId,
						createdAt: sensor.lastUpdated,
						acknowledged: false,
						recommendationIds: [],
					})
				}
				break
			case "waterLevel":
				if (sensor.currentValue < config.thresholds.waterLevelMin) {
					alerts.push({
						id: buildAlertId(sensor, "lowWaterLevel"),
						kind: "lowWaterLevel",
						severity: buildAlertSeverity(status),
						title: "Distancia bajo umbral",
						message:
							"La distancia reportada por el nodo está por debajo del mínimo configurado.",
						sensorType: sensor.type,
						zoneId: sensor.zoneId,
						createdAt: sensor.lastUpdated,
						acknowledged: false,
						recommendationIds: [],
					})
				}
				break
			case "activity":
				if (sensor.currentValue > 0 && isOutsideLightingSchedule(config)) {
					alerts.push({
						id: buildAlertId(sensor, "activityAfterHours"),
						kind: "activityAfterHours",
						severity: "warning",
						title: "Actividad fuera de horario",
						message:
							"Se detectó presencia en una franja no prevista por la programación actual.",
						sensorType: sensor.type,
						zoneId: sensor.zoneId,
						createdAt: sensor.lastUpdated,
						acknowledged: false,
						recommendationIds: [],
					})
				}
				break
		}
	}

	return alerts
}

export function generateRecommendations(alerts: Alert[]): Recommendation[] {
	const recommendations = new Map<string, Recommendation>()

	for (const alert of alerts) {
		const recommendation = getRecommendationFromAlert(alert)
		recommendations.set(recommendation.id, recommendation)
	}

	return Array.from(recommendations.values())
}

function getRecommendationFromAlert(alert: Alert): Recommendation {
	switch (alert.kind) {
		case "highHumidity":
			return {
				id: "rec-ventilation",
				title: "Activar ventilación",
				description:
					"Aumenta el intercambio de aire para reducir la acumulación de humedad en la zona afectada.",
				priority: "high",
				actionLabel: "Activar ventilación",
				target: "Zona de cultivo",
				automated: true,
				relatedAlertIds: [alert.id],
			}
		case "highTemperature":
			return {
				id: "rec-cooling",
				title: "Disminuir temperatura",
				description:
					"Abre ventilación superior o reduce carga térmica para evitar estrés por calor.",
				priority: "high",
				actionLabel: "Revisar enfriamiento",
				target: "Clima interior",
				automated: true,
				relatedAlertIds: [alert.id],
			}
		case "lowLight":
			return {
				id: "rec-lighting",
				title: "Revisar iluminación artificial",
				description:
					"Complementa la luz disponible para mantener un desarrollo uniforme del cultivo.",
				priority: "medium",
				actionLabel: "Encender luminarias",
				target: "Zona B",
				automated: true,
				relatedAlertIds: [alert.id],
			}
		case "lowWaterLevel":
			return {
				id: "rec-check-distance-sensor",
				title: "Revisar sensor de distancia",
				description:
					"Verifica calibración, orientación y obstrucciones en el sensor de distancia.",
				priority: "high",
				actionLabel: "Revisar sensor",
				target: "ESP32",
				automated: true,
				relatedAlertIds: [alert.id],
			}
		case "activityAfterHours":
			return {
				id: "rec-access-review",
				title: "Revisar zona de acceso",
				description:
					"Verifica si la actividad registrada corresponde a ingreso autorizado o mantenimiento.",
				priority: "medium",
				actionLabel: "Revisar acceso",
				target: "Entrada",
				automated: true,
				relatedAlertIds: [alert.id],
			}
		case "sensorOffline":
			return {
				id: "rec-sensor-check",
				title: "Inspeccionar sensor",
				description:
					"Comprueba alimentación, conectividad y calibración del sensor que dejó de reportar.",
				priority: "high",
				actionLabel: "Diagnosticar sensor",
				target: alert.zoneId ?? "Sistema",
				automated: true,
				relatedAlertIds: [alert.id],
			}
	}
}

export function getCropStatusOverview(
	sensors: Sensor[],
	alerts: Alert[],
	config: DashboardConfig,
) {
	const health = getCropHealth(sensors, config)

	const state =
		health >= 80 ? "Estable" : health >= 60 ? "En observación" : "Comprometido"

	const observations = [
		"La temperatura está dentro del rango esperado en la Zona A.",
		"La humedad presenta una ligera tendencia al alza en la Zona B.",
		"La iluminación fue baja durante la mañana y conviene compensarla.",
	]

	const summary =
		alerts.length === 0
			? "El cultivo mantiene condiciones equilibradas y sin alertas activas."
			: `Se detectaron ${alerts.length} alertas que requieren seguimiento para evitar desviaciones del cultivo.`

	return {
		health,
		state,
		summary,
		observations,
	}
}

export function sortZonesBySeverity(
	zones: Zone[],
	sensors: Sensor[],
	config: DashboardConfig,
) {
	return [...zones].sort((left, right) => {
		const leftStatus = getZoneStatus(left, sensors, config)
		const rightStatus = getZoneStatus(right, sensors, config)

		return zoneStatusPriority[rightStatus] - zoneStatusPriority[leftStatus]
	})
}
