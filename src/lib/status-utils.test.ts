import { describe, expect, it } from "vitest"
import { mockDashboardConfig } from "@/data/mock-dashboard-config"
import { mockSensors } from "@/data/mock-sensors"
import { mockZones } from "@/data/mock-zones"
import {
	generateAlerts,
	generateRecommendations,
	getCropHealth,
	getZoneStatus,
} from "@/lib/status-utils"

describe("status-utils", () => {
	it("calcula la salud general del cultivo con los sensores simulados", () => {
		expect(getCropHealth(mockSensors, mockDashboardConfig)).toBe(78)
	})

	it("genera alertas esperadas a partir de umbrales y lecturas", () => {
		const alerts = generateAlerts(mockSensors, mockDashboardConfig)

		expect(alerts).toHaveLength(5)
		expect(alerts.map((alert) => alert.kind)).toEqual([
			"highHumidity",
			"highTemperature",
			"lowLight",
			"activityAfterHours",
			"lowWaterLevel",
		])
	})

	it("genera recomendaciones coherentes y eleva la criticidad de la Zona B", () => {
		const alerts = generateAlerts(mockSensors, mockDashboardConfig)
		const recommendations = generateRecommendations(alerts)
		const zoneB = mockZones.find((zone) => zone.id === "zone-b")

		if (!zoneB) {
			throw new Error("La Zona B debe existir en los mocks")
		}

		expect(getZoneStatus(zoneB, mockSensors, mockDashboardConfig)).toBe(
			"critical",
		)
		expect(recommendations.map((item) => item.id)).toEqual([
			"rec-ventilation",
			"rec-cooling",
			"rec-lighting",
			"rec-access-review",
			"rec-refill-tank",
		])
	})
})
