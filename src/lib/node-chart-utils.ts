import { downsampleByVariance } from "@/lib/downsample-series"
import { getAccentColor } from "@/lib/greenhouse-styles"
import type {
	NodeLatestValue,
	NodeReading,
	NodeVariable,
	TelemetryNode,
} from "@/schemas/node.schema"

export type NodeChartPoint = {
	time: string
	timestamp: string
	ts: number
	raw: Record<string, number>
}

const MAX_NODE_CHART_POINTS = 72

const timeFormatter = new Intl.DateTimeFormat("es-CO", {
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	month: "2-digit",
	hour12: false,
	timeZone: "America/Bogota",
})

export function formatNodeValue(variable: NodeVariable, value: number) {
	if (variable.valueType === "boolean") {
		return value > 0 ? "Sí" : "No"
	}

	return value.toFixed(variable.decimals)
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
			ts: new Date(reading.timestamp).getTime(),
			raw: {},
		}

		current.raw[reading.variableKey] = reading.value
		grouped.set(reading.timestamp, current)
	}

	return downsampleNodeSeries(Array.from(grouped.values()).sort(
		(left, right) =>
			new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
	))
}

function downsampleNodeSeries(series: NodeChartPoint[]) {
	return downsampleByVariance({
		series,
		maxPoints: MAX_NODE_CHART_POINTS,
		getValues: (point) => Object.values(point.raw),
	})
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
		formattedValue: formatNodeValue(variable, value),
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
