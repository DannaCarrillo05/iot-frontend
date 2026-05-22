import { telemetryNodeSchema, type NodePreset, type NodeVariable } from "@/schemas/node.schema"
import { getAccentColor } from "@/lib/greenhouse-styles"

const presetVariables: Record<NodePreset, NodeVariable[]> = {
	logistica: [
		{ key: "temperatura_almacen", label: "Temperatura almacén", unit: "°C", decimals: 1 },
		{ key: "humedad_almacen", label: "Humedad almacén", unit: "%", decimals: 0 },
		{ key: "ocupacion", label: "Ocupación", unit: "%", decimals: 0 },
		{ key: "movimientos", label: "Movimientos", unit: "/h", decimals: 0 },
	],
	clima_externo: [
		{ key: "temperatura", label: "Temperatura", unit: "°C", decimals: 1 },
		{ key: "humedad", label: "Humedad", unit: "%", decimals: 0 },
		{ key: "luz", label: "Luz", unit: "lx", decimals: 0 },
		{ key: "precipitacion", label: "Precipitación", unit: "mm", decimals: 1 },
		{ key: "viento", label: "Viento", unit: "km/h", decimals: 1 },
	],
	energia: [
		{ key: "consumo", label: "Consumo", unit: "kWh", decimals: 2 },
		{ key: "potencia", label: "Potencia", unit: "W", decimals: 0 },
		{ key: "voltaje", label: "Voltaje", unit: "V", decimals: 1 },
		{ key: "corriente", label: "Corriente", unit: "A", decimals: 2 },
	],
	cultivo_cacao: [
		{ key: "temperatura", label: "Temperatura", unit: "°C", decimals: 1 },
		{ key: "humedad", label: "Humedad", unit: "%", decimals: 0 },
		{ key: "luz", label: "Luz", unit: "lx", decimals: 0 },
		{ key: "ph_suelo", label: "pH suelo", unit: "pH", decimals: 1 },
		{ key: "humedad_suelo", label: "Humedad suelo", unit: "%", decimals: 0 },
	],
}

const presetLabels: Record<NodePreset, string> = {
	logistica: "Logística",
	clima_externo: "Clima externo",
	energia: "Energía",
	cultivo_cacao: "Cultivo de cacao",
}

function buildNodeLabel(deviceId: string, preset: NodePreset) {
	const suffix = deviceId.split("-").slice(-1)[0]?.toUpperCase() ?? deviceId
	return `${presetLabels[preset]} ${suffix}`
}

const rawNodes = [
	{ deviceId: "nodo-logistica-01", preset: "logistica" as const },
	{ deviceId: "nodo-logistica-02", preset: "logistica" as const },
	{ deviceId: "nodo-clima-externo-01", preset: "clima_externo" as const },
	{ deviceId: "nodo-clima-externo-02", preset: "clima_externo" as const },
	{ deviceId: "nodo-energia-01", preset: "energia" as const },
	{ deviceId: "nodo-energia-02", preset: "energia" as const },
	{
		deviceId: "nodo-cultivo-cacao-01",
		preset: "cultivo_cacao" as const,
		gridFila: 1,
		gridCol: 1,
	},
	{
		deviceId: "nodo-cultivo-cacao-02",
		preset: "cultivo_cacao" as const,
		gridFila: 1,
		gridCol: 2,
	},
	{
		deviceId: "nodo-cultivo-cacao-03",
		preset: "cultivo_cacao" as const,
		gridFila: 1,
		gridCol: 3,
	},
	{
		deviceId: "nodo-cultivo-cacao-04",
		preset: "cultivo_cacao" as const,
		gridFila: 2,
		gridCol: 1,
	},
	{
		deviceId: "nodo-cultivo-cacao-05",
		preset: "cultivo_cacao" as const,
		gridFila: 2,
		gridCol: 2,
	},
]

export const telemetryNodes = telemetryNodeSchema.array().parse(
	rawNodes.map((node) => {
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

export function getPresetLabel(preset: NodePreset) {
	return presetLabels[preset]
}

const presetAccentColorIndex: Record<NodePreset, number> = {
	logistica: 1,
	clima_externo: 5,
	energia: 3,
	cultivo_cacao: 0,
}

export function getPresetAccentColor(preset: NodePreset) {
	return getAccentColor(presetAccentColorIndex[preset])
}
