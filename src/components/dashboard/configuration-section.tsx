import { Settings2 } from "lucide-react"
import { LightingScheduleForm } from "@/components/forms/lighting-schedule-form"
import { SensorConfigForm } from "@/components/forms/sensor-config-form"
import { SensorThresholdForm } from "@/components/forms/sensor-threshold-form"
import { ZoneForm } from "@/components/forms/zone-form"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ZoneWithMetrics } from "@/hooks/use-sensor-data"
import {
	sectionDescriptionClass,
	sectionTitleClass,
} from "@/lib/greenhouse-styles"
import type {
	DashboardConfig,
	DashboardThresholds,
	LightingSchedule,
} from "@/schemas/dashboard-config.schema"
import type { Sensor } from "@/schemas/sensor.schema"
import type { Zone } from "@/schemas/zone.schema"

type ConfigurationSectionProps = {
	config: DashboardConfig
	zones: ZoneWithMetrics[]
	zoneSensors: Sensor[]
	selectedZone: ZoneWithMetrics | undefined
	selectedZoneId: string
	selectedSensor: Sensor | undefined
	selectedSensorId: string
	onSelectedZoneChange: (value: string) => void
	onSelectedSensorChange: (value: string) => void
	onSaveThresholds: (values: DashboardThresholds & { alertsEnabled: boolean }) => void
	onSaveLightingSchedule: (values: LightingSchedule) => void
	onSaveZone: (zone: Zone) => void
	onSaveSensor: (sensor: Sensor) => void
}

export function ConfigurationSection({
	config,
	zones,
	zoneSensors,
	selectedZone,
	selectedZoneId,
	selectedSensor,
	selectedSensorId,
	onSelectedZoneChange,
	onSelectedSensorChange,
	onSaveThresholds,
	onSaveLightingSchedule,
	onSaveZone,
	onSaveSensor,
}: ConfigurationSectionProps) {
	return (
		<section className="space-y-4">
			<div>
				<h2 className={sectionTitleClass}>Configuración</h2>
				<p className={sectionDescriptionClass}>
					Ajusta umbrales, zonas, sensores y horarios desde el mismo dashboard.
				</p>
			</div>

			<GreenhouseCard>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-green-950">
						<Settings2 className="size-5 text-green-700" />
						Panel de configuración
					</CardTitle>
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
								onSave={onSaveThresholds}
							/>
						</TabsContent>

						<TabsContent value="zone" className="space-y-4">
							<p className={sectionDescriptionClass}>
								Edita el nombre, descripción y tipo de la zona seleccionada.
							</p>
							<div className="flex flex-col gap-3 sm:flex-row">
								<Select value={selectedZoneId} onValueChange={onSelectedZoneChange}>
									<SelectTrigger className="w-full sm:w-56">
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
								<Select value={selectedSensorId} disabled>
									<SelectTrigger className="w-full sm:w-56">
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
							{selectedZone ? (
								<ZoneForm
									key={selectedZone.id}
									zone={selectedZone}
									onSave={onSaveZone}
								/>
							) : null}
						</TabsContent>

						<TabsContent value="sensor" className="space-y-4">
							<p className={sectionDescriptionClass}>
								Edita el nombre, tipo y zona asignada al sensor seleccionado.
							</p>
							<div className="flex flex-col gap-3 sm:flex-row">
								<Select value={selectedZoneId} onValueChange={onSelectedZoneChange}>
									<SelectTrigger className="w-full sm:w-56">
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
								<Select value={selectedSensorId} onValueChange={onSelectedSensorChange}>
									<SelectTrigger className="w-full sm:w-56">
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
							{selectedSensor ? (
								<SensorConfigForm
									key={selectedSensor.id}
									sensor={selectedSensor}
									zones={zones}
									onSave={onSaveSensor}
								/>
							) : null}
						</TabsContent>

						<TabsContent value="lighting">
							<LightingScheduleForm
								key={`${config.lightingSchedule.startHour}-${config.lightingSchedule.endHour}-${config.lightingSchedule.enabled}`}
								initialValues={config.lightingSchedule}
								onSave={onSaveLightingSchedule}
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
			</GreenhouseCard>
		</section>
	)
}
