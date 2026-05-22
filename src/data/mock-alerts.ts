import { z } from "zod"
import { alertSchema } from "@/schemas/alert.schema"

export const mockAlerts = z.array(alertSchema).parse([
	{
		id: "alert-humidity-b",
		kind: "highHumidity",
		severity: "warning",
		title: "Humedad alta en Zona B",
		message:
			"La humedad se mantiene por encima del rango ideal y puede elevar el riesgo de hongos.",
		sensorType: "humidity",
		zoneId: "zone-b",
		createdAt: "2026-05-21T14:40:00.000Z",
		acknowledged: false,
		recommendationIds: ["rec-ventilation"],
	},
	{
		id: "alert-light-b",
		kind: "lowLight",
		severity: "warning",
		title: "Luz insuficiente en Zona B",
		message:
			"La iluminación disponible está por debajo del mínimo esperado para esta franja horaria.",
		sensorType: "light",
		zoneId: "zone-b",
		createdAt: "2026-05-21T14:50:00.000Z",
		acknowledged: false,
		recommendationIds: ["rec-lighting"],
	},
	{
		id: "alert-water-tank",
		kind: "lowWaterLevel",
		severity: "critical",
		title: "Nivel de agua bajo",
		message:
			"El tanque está descendiendo a un nivel que compromete el siguiente ciclo de riego.",
		sensorType: "waterLevel",
		zoneId: "tank",
		createdAt: "2026-05-21T14:55:00.000Z",
		acknowledged: false,
		recommendationIds: ["rec-refill-tank"],
	},
])
