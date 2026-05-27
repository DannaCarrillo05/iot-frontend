import { LoaderCircle } from "lucide-react"
import {
	lazy,
	Suspense,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react"
import { ActivityChart } from "@/components/charts/activity-chart"
import { ChartRangeControls } from "@/components/charts/chart-range-controls"
import { LightChart } from "@/components/charts/light-chart"
import { TemperatureHumidityChart } from "@/components/charts/temperature-humidity-chart"
import { WaterLevelChart } from "@/components/charts/water-level-chart"
import { CropStatusPanel } from "@/components/dashboard/crop-status-panel"
import { SensorSummaryGrid } from "@/components/dashboard/sensor-summary-grid"
import { GreenhouseMap } from "@/components/greenhouse/greenhouse-map"
import { AppHeader } from "@/components/layout/app-header"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageContainer } from "@/components/layout/page-container"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import { VineSeparator } from "@/components/ui/vine-separator"
import { useCropStatus } from "@/hooks/use-crop-status"
import { useSensorData } from "@/hooks/use-sensor-data"
import type { ChartRangeDays } from "@/lib/chart-range"
import {
	sectionDescriptionClass,
	sectionTitleClass,
} from "@/lib/greenhouse-styles"

const LazyNodeChartsSection = lazy(() =>
	import("@/components/dashboard/node-charts-section").then((module) => ({
		default: module.NodeChartsSection,
	})),
)

const LazyFeedbackSection = lazy(() =>
	import("@/components/dashboard/feedback-section").then((module) => ({
		default: module.FeedbackSection,
	})),
)

const LazyConfigurationSection = lazy(() =>
	import("@/components/dashboard/configuration-section").then((module) => ({
		default: module.ConfigurationSection,
	})),
)

export function DashboardPage() {
	const [chartRangeDays, setChartRangeDays] = useState<ChartRangeDays>(1)
	const [nodeChartRangeDays, setNodeChartRangeDays] = useState<ChartRangeDays>(1)
	const [isRangePending, startRangeTransition] = useTransition()
	const [isNodeRangePending, startNodeRangeTransition] = useTransition()
	const {
		config,
		sensors,
		zones,
		alerts,
		recommendations,
		chartData,
		nodeCharts,
		telemetry,
		sensorSummaries,
		selectedZone,
		selectedZoneId,
		setSelectedZoneId,
		updateThresholds,
		updateLightingSchedule,
		saveZone,
		saveSensor,
	} = useSensorData(chartRangeDays, nodeChartRangeDays)
	const isTelemetryUpdating =
		telemetry.isFetching || telemetry.isApplyingData || isRangePending
	const isNodeTelemetryUpdating =
		telemetry.isFetching || telemetry.isApplyingData || isNodeRangePending
	const handleChartRangeChange = (value: ChartRangeDays) => {
		startRangeTransition(() => {
			setChartRangeDays(value)
		})
	}
	const handleNodeChartRangeChange = (value: ChartRangeDays) => {
		startNodeRangeTransition(() => {
			setNodeChartRangeDays(value)
		})
	}
	const chartRangeControls = (
		<ChartRangeControls
			value={chartRangeDays}
			onChange={handleChartRangeChange}
			onRefresh={telemetry.refresh}
			isLoading={isTelemetryUpdating}
		/>
	)

	const cropStatus = useCropStatus({
		sensors,
		alerts,
		config,
	})

	const zoneSensors = useMemo(
		() => sensors.filter((sensor) => sensor.zoneId === selectedZoneId),
		[selectedZoneId, sensors],
	)

	const [selectedSensorId, setSelectedSensorId] = useState(
		zoneSensors[0]?.id ?? sensors[0]?.id ?? "",
	)

	useEffect(() => {
		if (!zoneSensors.some((sensor) => sensor.id === selectedSensorId)) {
			setSelectedSensorId(zoneSensors[0]?.id ?? sensors[0]?.id ?? "")
		}
	}, [selectedSensorId, sensors, zoneSensors])

	const selectedSensor =
		sensors.find((sensor) => sensor.id === selectedSensorId) ?? sensors[0]

	return (
		<DashboardLayout
			header={
				<AppHeader
					alertCount={alerts.length}
					health={cropStatus.health}
					state={cropStatus.state}
				/>
			}
		>
			<PageContainer>
				<SensorSummaryGrid summaries={sensorSummaries} />

				<VineSeparator />

				<section className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
					<CropStatusPanel
						state={cropStatus.state}
						health={cropStatus.health}
						summary={cropStatus.summary}
						observations={cropStatus.observations}
						alerts={alerts}
					/>
					<GreenhouseMap
						zones={zones}
						selectedZone={selectedZone}
						onSelectZone={setSelectedZoneId}
						alerts={alerts}
						configThresholds={config.thresholds}
					/>
				</section>

				<VineSeparator />

				<section className="relative space-y-4">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
						<div>
							<h2 className={sectionTitleClass}>Gráficas históricas</h2>
							<p className={sectionDescriptionClass}>
								Analiza el comportamiento del invernadero con horario GMT-5.
							</p>
						</div>
						{chartRangeControls}
					</div>

					<TemperatureHumidityChart days={chartRangeDays} data={chartData.environment} />

					<div className="grid gap-6 lg:grid-cols-3">
						<LightChart days={chartRangeDays} data={chartData.light} />
						<WaterLevelChart days={chartRangeDays} data={chartData.waterLevel} />
						<ActivityChart days={chartRangeDays} data={chartData.activity} />
					</div>
					{isTelemetryUpdating ? <DashboardUpdatingOverlay /> : null}
				</section>

				<VineSeparator />

				<Suspense fallback={<DashboardSectionFallback />}>
					<LazyNodeChartsSection
						nodeCharts={nodeCharts}
						isLoading={telemetry.isLoading}
						isError={telemetry.isError}
						hasData={telemetry.hasData}
						rangeDays={nodeChartRangeDays}
						onRangeChange={handleNodeChartRangeChange}
						isRangeLoading={isNodeTelemetryUpdating}
						onRefresh={telemetry.refresh}
					/>
				</Suspense>

				<VineSeparator />

				<Suspense fallback={<DashboardSectionFallback />}>
					<LazyFeedbackSection
						alerts={alerts}
						recommendations={recommendations}
					/>
				</Suspense>

				<VineSeparator />

				<Suspense fallback={<DashboardSectionFallback />}>
					<LazyConfigurationSection
						config={config}
						zones={zones}
						zoneSensors={zoneSensors}
						selectedZone={selectedZone}
						selectedZoneId={selectedZoneId}
						selectedSensor={selectedSensor}
						selectedSensorId={selectedSensorId}
						onSelectedZoneChange={setSelectedZoneId}
						onSelectedSensorChange={setSelectedSensorId}
						onSaveThresholds={updateThresholds}
						onSaveLightingSchedule={updateLightingSchedule}
						onSaveZone={saveZone}
						onSaveSensor={saveSensor}
					/>
				</Suspense>
			</PageContainer>
		</DashboardLayout>
	)
}

function DashboardUpdatingOverlay() {
	return (
		<div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/45 backdrop-blur-[2px]">
			<div className="flex items-center gap-2 rounded-full border border-green-100 bg-white/90 px-4 py-2 text-sm font-medium text-green-800 shadow-sm">
				<LoaderCircle className="size-4 animate-spin" />
				Actualizando datos
			</div>
		</div>
	)
}

function DashboardSectionFallback() {
	return <GreenhouseCard className="h-40 animate-pulse" />
}
