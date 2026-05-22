import { z } from "zod"

export const sensorTypeSchema = z.enum([
	"humidity",
	"temperature",
	"light",
	"activity",
	"waterLevel",
])

export const sensorStatusSchema = z.enum([
	"normal",
	"warning",
	"critical",
	"offline",
])

export const sensorUnitSchema = z.enum([
	"percent",
	"celsius",
	"lux",
	"activity",
	"liters",
])

export const sensorTrendSchema = z.enum(["up", "down", "stable"])

export const sensorSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	type: sensorTypeSchema,
	zoneId: z.string().min(1),
	unit: sensorUnitSchema,
	currentValue: z.number(),
	active: z.boolean(),
	description: z.string().min(1),
	lastUpdated: z.string().datetime(),
	trend: sensorTrendSchema,
})

export type SensorType = z.infer<typeof sensorTypeSchema>
export type SensorStatus = z.infer<typeof sensorStatusSchema>
export type SensorUnit = z.infer<typeof sensorUnitSchema>
export type SensorTrend = z.infer<typeof sensorTrendSchema>
export type Sensor = z.infer<typeof sensorSchema>
