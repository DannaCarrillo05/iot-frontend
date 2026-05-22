import type {
	NodeLatestValue,
	NodeReading,
	NodeVariable,
	TelemetryNode,
} from "@/schemas/node.schema"
import { getAccentColor } from "@/lib/greenhouse-styles"

export type NodeChartPoint = {
	time: string
	timestamp: string
	raw: Record<string, number>
}

const timeFormatter = new Intl.DateTimeFormat("es-CO", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
	timeZone: "UTC",
})

export function formatNodeValue(value: number, decimals: number) {
	return value.toFixed(decimals)
}

export function buildNodeChartSeries(
	node: TelemetryNode,
	readings: NodeReading[],
): NodeChartPoint[] {
	const nodeReadings = readings.filter((reading) => reading.nodeId === node.id)
	const grouped = new Map<string, NodeChartPoint>()

	for (const reading of nodeReadings) {
		const time = timeFormatter.format(new Date(reading.timestamp))
		const current = grouped.get(reading.timestamp) ?? {
			time,
			timestamp: reading.timestamp,
			raw: {},
		}

		current.raw[reading.variableKey] = reading.value
		grouped.set(reading.timestamp, current)
	}

	return Array.from(grouped.values()).sort(
		(left, right) =>
			new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
	)
}

export function getNodeLatestValues(
	node: TelemetryNode,
	series: NodeChartPoint[],
): NodeLatestValue[] {
	const latestPoint = series.at(-1)
	if (!latestPoint) return []

	return node.variables.map((variable, index) =>
		buildLatestValue(
			variable,
			latestPoint.raw[variable.key] ?? 0,
			latestPoint.timestamp,
			getNodeVariableColor(index),
		),
	)
}

export function getNodeVariableColor(index: number) {
	return getAccentColor(index)
}

function buildLatestValue(
	variable: NodeVariable,
	value: number,
	timestamp: string,
	color: string,
): NodeLatestValue {
	return {
		key: variable.key,
		label: variable.label,
		unit: variable.unit,
		color,
		value,
		formattedValue: formatNodeValue(value, variable.decimals),
		timestamp,
	}
}

export function buildNodeChartConfig(node: TelemetryNode) {
	return Object.fromEntries(
		node.variables.map((variable, index) => [
			variable.key,
			{
				label: variable.label,
				color: getNodeVariableColor(index),
			},
		]),
	)
}

export type NodeChartData = {
	node: TelemetryNode
	series: NodeChartPoint[]
	latestValues: NodeLatestValue[]
}

export function buildAllNodeCharts(
	nodes: TelemetryNode[],
	readings: NodeReading[],
): NodeChartData[] {
	return nodes.map((node) => {
		const series = buildNodeChartSeries(node, readings)
		return {
			node,
			series,
			latestValues: getNodeLatestValues(node, series),
		}
	})
}
