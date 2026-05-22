import { z } from "zod"

export const dashboardThresholdsSchema = z.object({
	temperatureMin: z.number().min(0).max(60),
	temperatureMax: z.number().min(0).max(60),
	humidityMin: z.number().min(0).max(100),
	humidityMax: z.number().min(0).max(100),
	lightMin: z.number().min(0).max(2000),
	waterLevelMin: z.number().min(0).max(100),
})

export const lightingScheduleSchema = z.object({
	startHour: z.number().int().min(0).max(23),
	endHour: z.number().int().min(0).max(23),
	enabled: z.boolean(),
})

export const dashboardConfigSchema = z.object({
	thresholds: dashboardThresholdsSchema,
	alertsEnabled: z.boolean(),
	lightingSchedule: lightingScheduleSchema,
	defaultZoneId: z.string().min(1),
})

export type DashboardThresholds = z.infer<typeof dashboardThresholdsSchema>
export type LightingSchedule = z.infer<typeof lightingScheduleSchema>
export type DashboardConfig = z.infer<typeof dashboardConfigSchema>
