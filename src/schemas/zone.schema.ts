import { z } from "zod"

export const zoneKindSchema = z.enum([
	"crop",
	"tank",
	"access",
	"circulation",
	"storage",
])

export const zoneStatusSchema = z.enum([
	"normal",
	"warning",
	"critical",
	"inactive",
])

export const zoneSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	description: z.string().min(1),
	kind: zoneKindSchema,
	status: zoneStatusSchema,
	sensorIds: z.array(z.string().min(1)).default([]),
	rowStart: z.number().int().positive(),
	rowSpan: z.number().int().positive(),
	colStart: z.number().int().positive(),
	colSpan: z.number().int().positive(),
})

export type ZoneKind = z.infer<typeof zoneKindSchema>
export type ZoneStatus = z.infer<typeof zoneStatusSchema>
export type Zone = z.infer<typeof zoneSchema>
