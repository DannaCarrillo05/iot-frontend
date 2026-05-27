import { getAccentColor } from "@/lib/greenhouse-styles"
import { type NodePreset, type NodeVariable, telemetryNodeSchema } from "@/schemas/node.schema"

type SimulatorFleetNode = {
	deviceId: string
	preset: NodePreset
	gridFila?: number
	gridCol?: number
}

const presetVariables: Record<NodePreset, NodeVariable[]> = {
	logistica: [
		{ key: "pesoKg", label: "Peso", unit: "kg", decimals: 2, valueType: "number" },
		{ key: "presencia", label: "Presencia", unit: "", decimals: 0, valueType: "boolean" },
		{ key: "tempZonaC", label: "Temperatura zona", unit: "°C", decimals: 1, valueType: "number" },
		{ key: "bateriaPct", label: "Batería", unit: "%", decimals: 1, valueType: "number" },
	],
	clima_externo: [
		{ key: "tempExternaC", label: "Temperatura externa", unit: "°C", decimals: 1, valueType: "number" },
		{ key: "humedadExternaPct", label: "Humedad externa", unit: "%", decimals: 1, valueType: "number" },
		{ key: "vientoMps", label: "Viento", unit: "m/s", decimals: 1, valueType: "number" },
		{ key: "lluviaMm", label: "Lluvia", unit: "mm", decimals: 1, valueType: "number" },
	],
	energia: [
		{ key: "voltajeV", label: "Voltaje", unit: "V", decimals: 2, valueType: "number" },
		{ key: "corrienteA", label: "Corriente", unit: "A", decimals: 2, valueType: "number" },
		{ key: "potenciaW", label: "Potencia", unit: "W", decimals: 1, valueType: "number" },
		{ key: "rssiDbm", label: "Señal", unit: "dBm", decimals: 0, valueType: "number" },
	],
	cultivo_cacao: [
		{ key: "tempC", label: "Temperatura", unit: "°C", decimals: 1, valueType: "number" },
		{ key: "humedadAirePct", label: "Humedad aire", unit: "%", decimals: 1, valueType: "number" },
		{ key: "bateriaPct", label: "Batería", unit: "%", decimals: 1, valueType: "number" },
		{ key: "rssiDbm", label: "Señal", unit: "dBm", decimals: 0, valueType: "number" },
		{ key: "gridFila", label: "Fila", unit: "", decimals: 0, valueType: "number" },
		{ key: "gridCol", label: "Columna", unit: "", decimals: 0, valueType: "number" },
	],
	esp32: [
		{ key: "temperature", label: "Temperatura", unit: "°C", decimals: 1, valueType: "number" },
		{ key: "humidity", label: "Humedad", unit: "%", decimals: 1, valueType: "number" },
		{ key: "light", label: "Luz", unit: "lx", decimals: 0, valueType: "number" },
		{ key: "distance_cm", label: "Distancia", unit: "cm", decimals: 1, valueType: "number" },
	],
}

const presetLabels: Record<NodePreset, string> = {
	logistica: "Logística",
	clima_externo: "Clima externo",
	energia: "Energía",
	cultivo_cacao: "Cultivo de cacao",
	esp32: "ESP32",
}

function buildNodeLabel(deviceId: string, preset: NodePreset) {
	const suffix = deviceId.split("-").slice(-1)[0]?.toUpperCase() ?? deviceId
	return `${presetLabels[preset]} ${suffix}`
}

export const simulatorFleetNodes: SimulatorFleetNode[] = [
	{ deviceId: "nodo-logistica-01", preset: "logistica" },
	{ deviceId: "nodo-logistica-02", preset: "logistica" },
	{ deviceId: "nodo-clima-externo-01", preset: "clima_externo" },
	{ deviceId: "nodo-clima-externo-02", preset: "clima_externo" },
	{ deviceId: "nodo-energia-01", preset: "energia" },
	{ deviceId: "nodo-energia-02", preset: "energia" },
	{ deviceId: "esp32-node-01", preset: "esp32" },
	{
		deviceId: "nodo-cultivo-cacao-01",
		preset: "cultivo_cacao",
		gridFila: 1,
		gridCol: 1,
	},
	{
		deviceId: "nodo-cultivo-cacao-02",
		preset: "cultivo_cacao",
		gridFila: 1,
		gridCol: 2,
	},
	{
		deviceId: "nodo-cultivo-cacao-03",
		preset: "cultivo_cacao",
		gridFila: 1,
		gridCol: 3,
	},
	{
		deviceId: "nodo-cultivo-cacao-04",
		preset: "cultivo_cacao",
		gridFila: 2,
		gridCol: 1,
	},
	{
		deviceId: "nodo-cultivo-cacao-05",
		preset: "cultivo_cacao",
		gridFila: 2,
		gridCol: 2,
	},
]

export const telemetryNodes = telemetryNodeSchema.array().parse(
	simulatorFleetNodes.map((node) => {
		const variables = presetVariables[node.preset]
		const gridLabel =
			node.gridFila && node.gridCol
				? ` · Fila ${node.gridFila}, columna ${node.gridCol}`
				: ""

		return {
			id: node.deviceId,
			deviceId: node.deviceId,
			preset: node.preset,
			label: buildNodeLabel(node.deviceId, node.preset),
			description: `${presetLabels[node.preset]}${gridLabel} · ${variables.length} variables`,
			gridFila: node.gridFila,
			gridCol: node.gridCol,
			variables,
		}
	}),
)

export function getPresetVariables(preset: NodePreset) {
	return presetVariables[preset]
}

export function getSimulatorFleetNode(deviceId: string) {
	return simulatorFleetNodes.find((node) => node.deviceId === deviceId)
}

export function getPresetLabel(preset: NodePreset) {
	return presetLabels[preset]
}

const presetAccentColorIndex: Record<NodePreset, number> = {
	logistica: 1,
	clima_externo: 5,
	energia: 3,
	cultivo_cacao: 0,
	esp32: 2,
}

export function getPresetAccentColor(preset: NodePreset) {
	return getAccentColor(presetAccentColorIndex[preset])
}
