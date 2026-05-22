import type { SensorReading } from "@/schemas/sensor-reading.schema"
import type { SensorType } from "@/schemas/sensor.schema"

function buildTimeLabel(timestamp: string) {
	return new Intl.DateTimeFormat("es-CO", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "UTC",
	}).format(new Date(timestamp))
}

function average(values: number[]) {
	return values.reduce((total, value) => total + value, 0) / values.length
}

function buildAverageSeries(
	readings: SensorReading[],
	type: SensorType,
	key: string,
) {
	const grouped = new Map<string, number[]>()

	for (const reading of readings.filter((entry) => entry.sensorType === type)) {
		const label = buildTimeLabel(reading.timestamp)
		const values = grouped.get(label) ?? []
		values.push(reading.value)
		grouped.set(label, values)
	}

	return Array.from(grouped.entries()).map(([time, values]) => ({
		time,
		[key]: Number(average(values).toFixed(type === "temperature" ? 1 : 0)),
	}))
}

export function buildEnvironmentSeries(readings: SensorReading[]) {
	const temperatureSeries = buildAverageSeries(readings, "temperature", "temperature")
	const humiditySeries = buildAverageSeries(readings, "humidity", "humidity")

	return temperatureSeries.map((entry, index) => ({
		time: entry.time,
		temperature: entry.temperature,
		humidity: humiditySeries[index]?.humidity ?? 0,
	}))
}

export function buildLightSeries(readings: SensorReading[]) {
	return buildAverageSeries(readings, "light", "light")
}

export function buildWaterLevelSeries(readings: SensorReading[]) {
	return buildAverageSeries(readings, "waterLevel", "waterLevel")
}

export function buildActivitySeries(readings: SensorReading[]) {
	return buildAverageSeries(readings, "activity", "activity")
}
