import type { Sensor, SensorType, SensorUnit } from "@/schemas/sensor.schema"

export const sensorTypeOrder: SensorType[] = [
	"humidity",
	"temperature",
	"light",
	"activity",
	"waterLevel",
]

export const sensorTypeLabels: Record<SensorType, string> = {
	humidity: "Humedad",
	temperature: "Temperatura",
	light: "Luz",
	activity: "Actividad",
	waterLevel: "Distancia",
	voltage: "Voltaje",
	current: "Corriente",
	power: "Potencia",
	signal: "Señal",
}

export const sensorUnitLabels: Record<SensorUnit, string> = {
	percent: "%",
	celsius: "°C",
	lux: "lx",
	activity: "",
	liters: "L",
	centimeters: "cm",
	volt: "V",
	ampere: "A",
	watt: "W",
	dbm: "dBm",
}

export const sensorDescriptions: Record<SensorType, string> = {
	humidity: "Controla la humedad del ambiente del cultivo.",
	temperature: "Monitorea el rango térmico del invernadero.",
	light: "Refleja la iluminación disponible para fotosíntesis.",
	activity: "Indica presencia de movimiento en la zona de acceso.",
	waterLevel: "Monitorea la distancia reportada por el nodo ESP32.",
	voltage: "Voltaje eléctrico del nodo de energía.",
	current: "Corriente eléctrica del nodo de energía.",
	power: "Potencia eléctrica del nodo de energía.",
	signal: "Intensidad de señal del nodo.",
}

export function formatSensorValue(type: SensorType, value: number) {
	switch (type) {
		case "activity":
			return value > 0 ? "Detectada" : "Inactiva"
		case "temperature":
			return value.toFixed(1)
		case "voltage":
			return value.toFixed(2)
		case "current":
			return value.toFixed(2)
		case "power":
			return value.toFixed(1)
		case "light":
		case "signal":
		default:
			return Math.round(value).toString()
	}
}

export function formatSensorUnit(sensor: Pick<Sensor, "type" | "unit">) {
	if (sensor.type === "activity") {
		return ""
	}

	return sensorUnitLabels[sensor.unit]
}

export function getSensorLabel(type: SensorType) {
	return sensorTypeLabels[type]
}

export function getSensorDescription(type: SensorType) {
	return sensorDescriptions[type]
}
