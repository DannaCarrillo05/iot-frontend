import { useEffect, useMemo, useState } from "react"
import { Settings2 } from "lucide-react"
import { AlertsPanel } from "@/components/alerts/alerts-panel"
import { RecommendationsPanel } from "@/components/alerts/recommendations-panel"
import { ActivityChart } from "@/components/charts/activity-chart"
import { LightChart } from "@/components/charts/light-chart"
import { TemperatureHumidityChart } from "@/components/charts/temperature-humidity-chart"
import { WaterLevelChart } from "@/components/charts/water-level-chart"
import { CropStatusPanel } from "@/components/dashboard/crop-status-panel"
import { SensorSummaryGrid } from "@/components/dashboard/sensor-summary-grid"
import { LightingScheduleForm } from "@/components/forms/lighting-schedule-form"
import { SensorConfigForm } from "@/components/forms/sensor-config-form"
import { SensorThresholdForm } from "@/components/forms/sensor-threshold-form"
import { ZoneForm } from "@/components/forms/zone-form"
import { GreenhouseMap } from "@/components/greenhouse/greenhouse-map"
import { AppHeader } from "@/components/layout/app-header"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageContainer } from "@/components/layout/page-container"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import { VineSeparator } from "@/components/ui/vine-separator"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCropStatus } from "@/hooks/use-crop-status"
import { useSensorData } from "@/hooks/use-sensor-data"
import { sectionDescriptionClass, sectionTitleClass } from "@/lib/greenhouse-styles"

export function DashboardPage() {
	const {
		config,
		sensors,
		zones,
		alerts,
		recommendations,
		chartData,
		sensorSummaries,
		selectedZone,
		selectedZoneId,
		setSelectedZoneId,
		updateThresholds,
		updateLightingSchedule,
		saveZone,
		saveSensor,
	} = useSensorData()

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
						alertCount={alerts.length}
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

				<section className="space-y-4">
					<div>
						<h2 className={sectionTitleClass}>Gráficas históricas</h2>
						<p className={sectionDescriptionClass}>
							Analiza el comportamiento del invernadero a lo largo del día.
						</p>
					</div>

					<TemperatureHumidityChart data={chartData.environment} />

					<div className="grid gap-6 lg:grid-cols-3">
						<LightChart data={chartData.light} />
						<WaterLevelChart data={chartData.waterLevel} />
						<ActivityChart data={chartData.activity} />
					</div>
				</section>

				<VineSeparator />

				<section className="grid items-start gap-6 xl:grid-cols-2">
					<AlertsPanel alerts={alerts} />
					<RecommendationsPanel recommendations={recommendations} />
				</section>

				<VineSeparator />

				<section className="space-y-4">
					<div>
						<h2 className={sectionTitleClass}>Configuración</h2>
						<p className={sectionDescriptionClass}>
							Ajusta umbrales, zonas, sensores y horarios desde el mismo
							dashboard.
						</p>
					</div>

					<GreenhouseCard>
						<CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div className="space-y-1">
								<CardTitle className="flex items-center gap-2 text-green-950">
									<Settings2 className="size-5 text-green-700" />
									Panel de configuración
								</CardTitle>
								<p className={sectionDescriptionClass}>
									Elige una zona y un sensor para editar sus parámetros
									operativos.
								</p>
							</div>

							<div className="grid gap-3 md:grid-cols-2">
								<Select
									value={selectedZoneId}
									onValueChange={(value) => setSelectedZoneId(value)}
								>
									<SelectTrigger className="w-full min-w-52">
										<SelectValue placeholder="Selecciona una zona" />
									</SelectTrigger>
									<SelectContent>
										{zones.map((zone) => (
											<SelectItem key={zone.id} value={zone.id}>
												{zone.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Select
									value={selectedSensorId}
									onValueChange={(value) => setSelectedSensorId(value)}
								>
									<SelectTrigger className="w-full min-w-52">
										<SelectValue placeholder="Selecciona un sensor" />
									</SelectTrigger>
									<SelectContent>
										{zoneSensors.map((sensor) => (
											<SelectItem key={sensor.id} value={sensor.id}>
												{sensor.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="thresholds" className="gap-4">
								<TabsList>
									<TabsTrigger value="thresholds">Umbrales</TabsTrigger>
									<TabsTrigger value="zone">Zona</TabsTrigger>
									<TabsTrigger value="sensor">Sensor</TabsTrigger>
									<TabsTrigger value="lighting">Iluminación</TabsTrigger>
								</TabsList>

								<TabsContent value="thresholds">
									<SensorThresholdForm
										key={`${config.thresholds.temperatureMin}-${config.thresholds.temperatureMax}-${config.alertsEnabled}`}
										initialValues={config.thresholds}
										alertsEnabled={config.alertsEnabled}
										onSave={updateThresholds}
									/>
								</TabsContent>
								<TabsContent value="zone">
									{selectedZone ? (
										<ZoneForm
											key={selectedZone.id}
											zone={selectedZone}
											onSave={saveZone}
										/>
									) : null}
								</TabsContent>
								<TabsContent value="sensor">
									{selectedSensor ? (
										<SensorConfigForm
											key={selectedSensor.id}
											sensor={selectedSensor}
											zones={zones}
											onSave={saveSensor}
										/>
									) : null}
								</TabsContent>
								<TabsContent value="lighting">
									<LightingScheduleForm
										key={`${config.lightingSchedule.startHour}-${config.lightingSchedule.endHour}-${config.lightingSchedule.enabled}`}
										initialValues={config.lightingSchedule}
										onSave={updateLightingSchedule}
									/>
								</TabsContent>
							</Tabs>
						</CardContent>
					</GreenhouseCard>
				</section>
			</PageContainer>
		</DashboardLayout>
	)
}
