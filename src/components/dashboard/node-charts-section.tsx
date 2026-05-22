import { NodeChart } from "@/components/charts/node-chart"
import { mockNodeReadings } from "@/data/mock-node-readings"
import { telemetryNodes } from "@/data/node-presets"
import {
	sectionDescriptionClass,
	sectionTitleClass,
} from "@/lib/greenhouse-styles"
import { buildAllNodeCharts } from "@/lib/node-chart-utils"
import { useMemo } from "react"

export function NodeChartsSection() {
	const nodeCharts = useMemo(
		() => buildAllNodeCharts(telemetryNodes, mockNodeReadings),
		[],
	)

	return (
		<section className="space-y-4">
			<div>
				<h2 className={sectionTitleClass}>Telemetría por nodo</h2>
				<p className={sectionDescriptionClass}>
					Cada gráfica muestra todas las variables del nodo simulado y un
					contador con el último valor registrado de cada una.
				</p>
			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				{nodeCharts.map((chartData) => (
					<NodeChart key={chartData.node.id} data={chartData} />
				))}
			</div>
		</section>
	)
}
