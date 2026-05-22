import { z } from "zod"
import { sensorTypeSchema } from "./sensor.schema"

export const sensorReadingSchema = z.object({
	id: z.string().min(1),
	sensorId: z.string().min(1),
	sensorType: sensorTypeSchema,
	timestamp: z.string().datetime(),
	value: z.number(),
})

export type SensorReading = z.infer<typeof sensorReadingSchema>
