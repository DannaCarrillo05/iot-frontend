import { z } from "zod"
import { sensorReadingSchema } from "@/schemas/sensor-reading.schema"

const timestamps = Array.from({ length: 24 }, (_, hour) => {
	const paddedHour = hour.toString().padStart(2, "0")
	return `2026-05-21T${paddedHour}:00:00.000Z`
})

function buildSeries(
	sensorId: string,
	sensorType: "humidity" | "temperature" | "light" | "activity" | "waterLevel",
	values: number[],
) {
	return values.map((value, index) => ({
		id: `${sensorId}-${index}`,
		sensorId,
		sensorType,
		timestamp: timestamps[index],
		value,
	}))
}

function daylightFactor(hour: number) {
	if (hour < 6 || hour > 18) return 0
	const distanceFromNoon = Math.abs(hour - 12)
	return Math.max(0, 1 - distanceFromNoon / 6)
}

const hours = Array.from({ length: 24 }, (_, hour) => hour)

const temperatureAValues = hours.map(
	(hour) => Number((22 + daylightFactor(hour) * 6 + hour * 0.05).toFixed(1)),
)
const temperatureBValues = hours.map(
	(hour) => Number((23 + daylightFactor(hour) * 7 + hour * 0.06).toFixed(1)),
)
const humidityAValues = hours.map((hour) =>
	Math.round(66 - daylightFactor(hour) * 4 + (hour > 12 ? 2 : 0)),
)
const humidityBValues = hours.map((hour) =>
	Math.round(68 - daylightFactor(hour) * 3 + (hour > 13 ? 4 : 0)),
)
const lightAValues = hours.map((hour) => Math.round(daylightFactor(hour) * 620))
const lightBValues = hours.map((hour) => Math.round(daylightFactor(hour) * 520))
const waterTankValues = hours.map((hour) => Math.max(28, 58 - hour * 1.2))
const activityValues = hours.map((hour) =>
	hour >= 8 && hour <= 11 ? 1 : hour >= 14 && hour <= 16 ? 1 : 0,
)

export const mockReadings = z.array(sensorReadingSchema).parse([
	...buildSeries("temperature-a", "temperature", temperatureAValues),
	...buildSeries("temperature-b", "temperature", temperatureBValues),
	...buildSeries("humidity-a", "humidity", humidityAValues),
	...buildSeries("humidity-b", "humidity", humidityBValues),
	...buildSeries("light-a", "light", lightAValues),
	...buildSeries("light-b", "light", lightBValues),
	...buildSeries("water-tank", "waterLevel", waterTankValues),
	...buildSeries("activity-entrance", "activity", activityValues),
])
