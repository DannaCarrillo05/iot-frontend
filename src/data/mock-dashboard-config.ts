import { dashboardConfigSchema } from "@/schemas/dashboard-config.schema"

export const mockDashboardConfig = dashboardConfigSchema.parse({
	thresholds: {
		temperatureMin: 20,
		temperatureMax: 28,
		humidityMin: 55,
		humidityMax: 72,
		lightMin: 500,
		waterLevelMin: 35,
	},
	alertsEnabled: true,
	lightingSchedule: {
		startHour: 6,
		endHour: 18,
		enabled: true,
	},
	defaultZoneId: "zone-a",
})
