import { z } from "zod"

export const nodePresetSchema = z.enum([
	"logistica",
	"clima_externo",
	"energia",
	"cultivo_cacao",
	"esp32",
])

export type NodePreset = z.infer<typeof nodePresetSchema>

export const nodeVariableSchema = z.object({
	key: z.string(),
	label: z.string(),
	unit: z.string(),
	decimals: z.number().int().min(0).max(3).default(1),
	valueType: z.enum(["number", "boolean"]).default("number"),
})

export type NodeVariable = z.infer<typeof nodeVariableSchema>

export const telemetryNodeSchema = z.object({
	id: z.string(),
	deviceId: z.string(),
	preset: nodePresetSchema,
	label: z.string(),
	description: z.string(),
	gridFila: z.number().int().positive().optional(),
	gridCol: z.number().int().positive().optional(),
	variables: z.array(nodeVariableSchema).min(1),
})

export type TelemetryNode = z.infer<typeof telemetryNodeSchema>

export const nodeReadingSchema = z.object({
	id: z.string(),
	nodeId: z.string(),
	variableKey: z.string(),
	timestamp: z.string(),
	value: z.number(),
})

export type NodeReading = z.infer<typeof nodeReadingSchema>

export const nodeLatestValueSchema = z.object({
	key: z.string(),
	label: z.string(),
	unit: z.string(),
	color: z.string(),
	value: z.number(),
	formattedValue: z.string(),
	timestamp: z.string(),
})

export type NodeLatestValue = z.infer<typeof nodeLatestValueSchema>
