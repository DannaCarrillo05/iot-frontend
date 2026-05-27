import { LoaderCircle } from "lucide-react"
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react"
import { ChartRangeControls } from "@/components/charts/chart-range-controls"
import { NodeChart } from "@/components/charts/node-chart"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import type { ChartRangeDays } from "@/lib/chart-range"
import {
	sectionDescriptionClass,
	sectionTitleClass,
} from "@/lib/greenhouse-styles"
import type { NodeChartData } from "@/lib/node-chart-utils"

const NODE_CHARTS_PER_PAGE = 4

type NodeChartsSectionProps = {
	nodeCharts: NodeChartData[]
	isLoading: boolean
	isError: boolean
	hasData: boolean
	rangeDays: ChartRangeDays
	onRangeChange: (value: ChartRangeDays) => void
	isRangeLoading: boolean
	onRefresh: () => void
}

export function NodeChartsSection({
	nodeCharts,
	isLoading,
	isError,
	hasData,
	rangeDays,
	onRangeChange,
	isRangeLoading,
	onRefresh,
}: NodeChartsSectionProps) {
	const [pageIndex, setPageIndex] = useState(0)
	const deferredPageIndex = useDeferredValue(pageIndex)
	const [isPagePending, startPageTransition] = useTransition()
	const pageCount = Math.max(
		1,
		Math.ceil(nodeCharts.length / NODE_CHARTS_PER_PAGE),
	)
	const firstVisibleChart = deferredPageIndex * NODE_CHARTS_PER_PAGE
	const visibleNodeCharts = useMemo(
		() => nodeCharts.slice(firstVisibleChart, firstVisibleChart + NODE_CHARTS_PER_PAGE),
		[firstVisibleChart, nodeCharts],
	)
	const isChangingPage = isPagePending || pageIndex !== deferredPageIndex

	useEffect(() => {
		if (pageIndex >= pageCount) {
			setPageIndex(pageCount - 1)
		}
	}, [pageCount, pageIndex])
	const goToPreviousPage = () => {
		startPageTransition(() => {
			setPageIndex((current) => Math.max(0, current - 1))
		})
	}
	const goToNextPage = () => {
		startPageTransition(() => {
			setPageIndex((current) => Math.min(pageCount - 1, current + 1))
		})
	}

	return (
		<section className="space-y-4">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<h2 className={sectionTitleClass}>Telemetría por nodo</h2>
					<p className={sectionDescriptionClass}>
						Cada gráfica muestra todas las variables del nodo y un contador con
						el último valor registrado de cada una.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<ChartRangeControls
						value={rangeDays}
						onChange={onRangeChange}
						onRefresh={onRefresh}
						isLoading={isRangeLoading}
					/>
					{nodeCharts.length > NODE_CHARTS_PER_PAGE ? (
						<NodeChartPagination
							pageIndex={pageIndex}
							pageCount={pageCount}
							onPrevious={goToPreviousPage}
							onNext={goToNextPage}
							isLoading={isChangingPage}
						/>
					) : null}
				</div>
			</div>

			<div className="relative grid gap-6 xl:grid-cols-2">
				{nodeCharts.length > 0 ? (
					visibleNodeCharts.map((chartData) => (
						<NodeChart key={chartData.node.id} data={chartData} rangeDays={rangeDays} />
					))
				) : (
					<NodeTelemetryState
						isLoading={isLoading}
						isError={isError}
						hasData={hasData}
					/>
				)}
				{isRangeLoading ? <NodeChartsUpdatingOverlay label="Actualizando datos" /> : null}
				{!isRangeLoading && isChangingPage ? <NodeChartsUpdatingOverlay label="Cambiando página" /> : null}
			</div>
		</section>
	)
}

type NodeChartPaginationProps = {
	pageIndex: number
	pageCount: number
	onPrevious: () => void
	onNext: () => void
	isLoading: boolean
}

function NodeChartPagination({
	pageIndex,
	pageCount,
	onPrevious,
	onNext,
	isLoading,
}: NodeChartPaginationProps) {
	return (
		<div className="flex items-center gap-2 rounded-2xl border border-green-100/80 bg-white/50 p-1">
			<Button
				type="button"
				size="sm"
				variant="ghost"
				onClick={onPrevious}
				disabled={pageIndex === 0 || isLoading}
			>
				Anterior
			</Button>
			<span className="px-2 text-sm text-green-800/70">
				{isLoading ? (
					<LoaderCircle className="inline size-3.5 animate-spin" />
				) : (
					`${pageIndex + 1} / ${pageCount}`
				)}
			</span>
			<Button
				type="button"
				size="sm"
				variant="ghost"
				onClick={onNext}
				disabled={pageIndex + 1 >= pageCount || isLoading}
			>
				Siguiente
			</Button>
		</div>
	)
}

function NodeChartsUpdatingOverlay({ label }: { label: string }) {
	return (
		<div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/45 backdrop-blur-[2px]">
			<div className="flex items-center gap-2 rounded-full border border-green-100 bg-white/90 px-4 py-2 text-sm font-medium text-green-800 shadow-sm">
				<LoaderCircle className="size-4 animate-spin" />
				{label}
			</div>
		</div>
	)
}

function NodeTelemetryState({
	isLoading,
	isError,
	hasData,
}: NodeTelemetryStateProps) {
	const title = isError
		? "No se pudo leer la telemetría"
		: isLoading
			? "Cargando nodos"
			: hasData
				? "Sin nodos disponibles"
				: "Sin mediciones registradas"
	const message = isError
		? "Revisa DATABASE_URL y que la base de datos del gateway esté disponible."
		: isLoading
			? "Consultando dispositivos y mediciones recientes desde PostgreSQL."
			: "Cuando los simuladores publiquen datos, los nodos aparecerán aquí automáticamente."

	return (
		<GreenhouseCard className="xl:col-span-2">
			<CardHeader>
				<CardTitle className="text-green-950">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-green-800/70">{message}</p>
			</CardContent>
		</GreenhouseCard>
	)
}

type NodeTelemetryStateProps = {
	isLoading: boolean
	isError: boolean
	hasData: boolean
}
