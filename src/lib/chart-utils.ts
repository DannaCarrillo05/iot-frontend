import type { DistanceReading } from "@/features/telemetry/telemetry-data"
import type { ChartRangeDays } from "@/lib/chart-range"
import { downsampleByVariance } from "@/lib/downsample-series"
import type { SensorType } from "@/schemas/sensor.schema"
import type { SensorReading } from "@/schemas/sensor-reading.schema"

const MAX_CHART_POINTS = 72

function buildTimeLabel(timestamp: string) {
	return new Intl.DateTimeFormat("es-CO", {
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		month: "2-digit",
		hour12: false,
		timeZone: "America/Bogota",
	}).format(new Date(timestamp))
}

function average(values: number[]) {
	return values.reduce((total, value) => total + value, 0) / values.length
}

function buildAveragePoints(readings: SensorReading[], type: SensorType) {
	const grouped = new Map<string, { timestamp: number; values: number[] }>()

	for (const reading of readings.filter((entry) => entry.sensorType === type)) {
		const label = buildTimeLabel(reading.timestamp)
		const timestamp = new Date(reading.timestamp).getTime()
		const current = grouped.get(label) ?? { timestamp, values: [] }
		current.timestamp = Math.min(current.timestamp, timestamp)
		current.values.push(reading.value)
		grouped.set(label, current)
	}

	return Array.from(grouped.entries())
		.sort((left, right) => left[1].timestamp - right[1].timestamp)
		.map(([time, group]) => ({
			time,
			timestamp: group.timestamp,
			value: Number(average(group.values).toFixed(type === "temperature" ? 1 : 0)),
		}))
}

export function buildEnvironmentSeries(readings: SensorReading[]) {
	const temperatureSeries = buildAveragePoints(readings, "temperature")
	const humiditySeries = buildAveragePoints(readings, "humidity")
	const humidityByTime = new Map(
		humiditySeries.map((entry) => [entry.time, entry.value]),
	)

	return downsampleByVariance({
		series: temperatureSeries.map((entry) => ({
			time: entry.time,
			timestamp: entry.timestamp,
			temperature: entry.value,
			humidity: humidityByTime.get(entry.time) ?? 0,
		})),
		maxPoints: MAX_CHART_POINTS,
		getValues: (point) => [point.temperature, point.humidity],
	})
}

export function buildLightSeries(readings: SensorReading[]) {
	return downsampleByVariance({
		series: buildAveragePoints(readings, "light").map((entry) => ({
			time: entry.time,
			timestamp: entry.timestamp,
			light: entry.value,
		})),
		maxPoints: MAX_CHART_POINTS,
		getValues: (point) => [point.light],
	})
}

export function buildWaterLevelSeries(readings: SensorReading[]) {
	return downsampleByVariance({
		series: buildAveragePoints(readings, "waterLevel").map((entry) => ({
			time: entry.time,
			timestamp: entry.timestamp,
			waterLevel: entry.value,
		})),
		maxPoints: MAX_CHART_POINTS,
		getValues: (point) => [point.waterLevel],
	})
}

const timeOnlyFormatter = new Intl.DateTimeFormat("es-CO", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
	timeZone: "America/Bogota",
})

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
	day: "2-digit",
	month: "2-digit",
	hour: "2-digit",
	hour12: false,
	timeZone: "America/Bogota",
})

export function formatChartTimeTick(timestamp: number, days: ChartRangeDays): string {
	if (days === 1) {
		return timeOnlyFormatter.format(new Date(timestamp))
	}
	return dateTimeFormatter.format(new Date(timestamp))
}

export function getChartDomain(days: ChartRangeDays): [number, number] {
	const end = Date.now()
	return [end - days * 24 * 60 * 60 * 1000, end]
}

const TICK_INTERVAL_MS: Record<ChartRangeDays, number> = {
	1: 4 * 60 * 60 * 1000,  // every 4 h  → ~6 ticks/day
	4: 12 * 60 * 60 * 1000, // every 12 h → 8 ticks
	7: 24 * 60 * 60 * 1000, // every day  → 7 ticks
}

export function getChartTicks(days: ChartRangeDays): number[] {
	const [start, end] = getChartDomain(days)
	const intervalMs = TICK_INTERVAL_MS[days]
	const firstTick = Math.ceil(start / intervalMs) * intervalMs
	const ticks: number[] = []
	for (let t = firstTick; t <= end; t += intervalMs) {
		ticks.push(t)
	}
	return ticks
}

const ACTIVITY_BUCKET_MS: Record<ChartRangeDays, number> = {
	1: 60 * 60 * 1000,       // 1-hour buckets → 24 bars
	4: 4 * 60 * 60 * 1000,  // 4-hour buckets → 24 bars
	7: 8 * 60 * 60 * 1000,  // 8-hour buckets → 21 bars
}

export const DISTANCE_DETECTION_THRESHOLD_CM = 100

// ~288 representative points per selected range
const DISTANCE_WINDOW_MS: Record<ChartRangeDays, number> = {
	1: 5 * 60 * 1000,   // 5-min windows  → max 288 pts/day
	4: 20 * 60 * 1000,  // 20-min windows → max 288 pts
	7: 35 * 60 * 1000,  // 35-min windows → max 288 pts
}

function medianOf(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 === 0
		? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
		: (sorted[mid] ?? 0)
}

export function buildDistanceSeries(
	distanceReadings: DistanceReading[],
	days: ChartRangeDays,
): Array<{ timestamp: number; waterLevel: number }> {
	const windowMs = DISTANCE_WINDOW_MS[days]
	const windows = new Map<number, number[]>()

	for (const { timestamp, value } of distanceReadings) {
		const bucket = Math.floor(new Date(timestamp).getTime() / windowMs) * windowMs
		const values = windows.get(bucket) ?? []
		values.push(value)
		windows.set(bucket, values)
	}

	return Array.from(windows.entries())
		.sort(([a], [b]) => a - b)
		.map(([bucket, values]) => {
			const min = Math.min(...values)
			// Detection dip: preserve the actual minimum so the spike is visible.
			// Background: median is robust to brief sensor noise.
			const waterLevel = min < DISTANCE_DETECTION_THRESHOLD_CM ? min : medianOf(values)
			return { timestamp: bucket, waterLevel }
		})
}

export function buildActivityCountSeries(
	distanceReadings: DistanceReading[],
	days: ChartRangeDays,
): Array<{ timestamp: number; activity: number }> {
	const bucketMs = ACTIVITY_BUCKET_MS[days]
	const now = Date.now()
	const rangeStart = now - days * 24 * 60 * 60 * 1000
	const firstBucket = Math.floor(rangeStart / bucketMs) * bucketMs

	// Rising-edge detection: count only the first reading that crosses below the
	// threshold in each consecutive run of sub-threshold values.
	// distanceReadings are already sorted ASC by the server query.
	const counts = new Map<number, number>()
	let prevTriggered = false
	for (const { timestamp, value } of distanceReadings) {
		const ts = new Date(timestamp).getTime()
		const triggered = value < DISTANCE_DETECTION_THRESHOLD_CM
		if (triggered && !prevTriggered && ts >= rangeStart && ts <= now) {
			const bucket = Math.floor(ts / bucketMs) * bucketMs
			counts.set(bucket, (counts.get(bucket) ?? 0) + 1)
		}
		prevTriggered = triggered
	}

	const result: Array<{ timestamp: number; activity: number }> = []
	for (let t = firstBucket; t <= now; t += bucketMs) {
		result.push({ timestamp: t, activity: counts.get(t) ?? 0 })
	}
	return result
}
