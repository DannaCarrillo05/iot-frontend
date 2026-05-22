import { z } from "zod"
import { sensorTypeSchema } from "./sensor.schema"

export const alertSeveritySchema = z.enum(["info", "warning", "critical"])

export const alertKindSchema = z.enum([
	"highHumidity",
	"highTemperature",
	"lowLight",
	"lowWaterLevel",
	"activityAfterHours",
	"sensorOffline",
])

export const alertSchema = z.object({
	id: z.string().min(1),
	kind: alertKindSchema,
	severity: alertSeveritySchema,
	title: z.string().min(1),
	message: z.string().min(1),
	sensorType: sensorTypeSchema.optional(),
	zoneId: z.string().min(1).optional(),
	createdAt: z.string().datetime(),
	acknowledged: z.boolean().default(false),
	recommendationIds: z.array(z.string().min(1)).default([]),
})

export type AlertSeverity = z.infer<typeof alertSeveritySchema>
export type AlertKind = z.infer<typeof alertKindSchema>
export type Alert = z.infer<typeof alertSchema>
