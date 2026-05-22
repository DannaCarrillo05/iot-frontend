import { z } from "zod"
import { telemetryNodes } from "@/data/node-presets"
import { nodeReadingSchema, type NodePreset } from "@/schemas/node.schema"

const timestamps = Array.from({ length: 24 }, (_, hour) => {
	const paddedHour = hour.toString().padStart(2, "0")
	return `2026-05-21T${paddedHour}:00:00.000Z`
})

function daylightFactor(hour: number) {
	if (hour < 6 || hour > 18) return 0
	const distanceFromNoon = Math.abs(hour - 12)
	return Math.max(0, 1 - distanceFromNoon / 6)
}

function workdayFactor(hour: number) {
	if (hour >= 8 && hour <= 11) return 1
	if (hour >= 14 && hour <= 16) return 0.85
	if (hour >= 7 && hour <= 17) return 0.45
	return 0.1
}

function nodeOffset(deviceId: string) {
	const match = deviceId.match(/(\d+)$/)
	return match ? Number(match[1]) : 1
}

function generateValue(
	preset: NodePreset,
	key: string,
	hour: number,
	offset: number,
): number {
	switch (preset) {
		case "logistica":
			if (key === "temperatura_almacen") {
				return Number((21 + offset * 0.4 + hour * 0.03).toFixed(1))
			}
			if (key === "humedad_almacen") {
				return Math.round(52 + offset * 1.5 + (hour > 12 ? 4 : 0))
			}
			if (key === "ocupacion") {
				return Math.round(35 + workdayFactor(hour) * 45 + offset * 2)
			}
			return Math.round(4 + workdayFactor(hour) * 18 + offset)

		case "clima_externo":
			if (key === "temperatura") {
				return Number((24 + daylightFactor(hour) * 8 + offset * 0.3).toFixed(1))
			}
			if (key === "humedad") {
				return Math.round(74 - daylightFactor(hour) * 12 + offset)
			}
			if (key === "luz") {
				return Math.round(daylightFactor(hour) * (680 + offset * 15))
			}
			if (key === "precipitacion") {
				return Number((hour >= 15 && hour <= 18 ? 1.2 + offset * 0.1 : 0).toFixed(1))
			}
			return Number((3 + daylightFactor(hour) * 9 + offset * 0.4).toFixed(1))

		case "energia":
			if (key === "consumo") {
				return Number((12 + workdayFactor(hour) * 8 + offset * 0.6 + hour * 0.08).toFixed(2))
			}
			if (key === "potencia") {
				return Math.round(420 + workdayFactor(hour) * 360 + offset * 12)
			}
			if (key === "voltaje") {
				return Number((218 + offset * 0.2 + Math.sin(hour / 4) * 1.5).toFixed(1))
			}
			return Number((1.8 + workdayFactor(hour) * 1.4 + offset * 0.05).toFixed(2))

		case "cultivo_cacao":
			if (key === "temperatura") {
				return Number((26 + daylightFactor(hour) * 4 + offset * 0.25).toFixed(1))
			}
			if (key === "humedad") {
				return Math.round(78 - daylightFactor(hour) * 6 + offset)
			}
			if (key === "luz") {
				return Math.round(daylightFactor(hour) * (520 + offset * 10))
			}
			if (key === "ph_suelo") {
				return Number((5.8 + offset * 0.05 + Math.sin(hour / 6) * 0.08).toFixed(1))
			}
			return Math.round(61 + offset + (hour > 10 ? 3 : 0))
	}
}

export const mockNodeReadings = z.array(nodeReadingSchema).parse(
	telemetryNodes.flatMap((node) => {
		const offset = nodeOffset(node.deviceId)

		return node.variables.flatMap((variable) =>
			timestamps.map((timestamp, hour) => ({
				id: `${node.id}-${variable.key}-${hour}`,
				nodeId: node.id,
				variableKey: variable.key,
				timestamp,
				value: generateValue(node.preset, variable.key, hour, offset),
			})),
		)
	}),
)
