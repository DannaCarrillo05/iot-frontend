import type { FormEvent } from "react"
import type { Sensor } from "@/schemas/sensor.schema"
import { sensorSchema } from "@/schemas/sensor.schema"
import type { Zone } from "@/schemas/zone.schema"
import { useAppForm } from "@/hooks/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SensorConfigFormProps = {
	sensor: Sensor
	zones: Zone[]
	onSave: (sensor: Sensor) => void
}

export function SensorConfigForm({
	sensor,
	zones,
	onSave,
}: SensorConfigFormProps) {
	const form = useAppForm({
		defaultValues: {
			name: sensor.name,
			type: sensor.type,
			zoneId: sensor.zoneId,
			unit: sensor.unit,
			active: sensor.active,
		},
		validators: {
			onSubmitAsync: async ({ value }) => {
				onSave(
					sensorSchema.parse({
						...sensor,
						name: value.name,
						type: value.type,
						zoneId: value.zoneId,
						unit: value.unit,
						active: value.active,
					}),
				)
			},
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configuración de sensor</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(event) => handleSubmit(event, form.handleSubmit)}
					className="grid gap-4"
				>
					<form.AppField name="name">
						{(field) => <field.TextField label="Nombre" />}
					</form.AppField>

					<div className="grid gap-4 md:grid-cols-2">
						<form.AppField name="type">
							{(field) => (
								<field.Select
									label="Tipo"
									values={[
										{ label: "Humedad", value: "humidity" },
										{ label: "Temperatura", value: "temperature" },
										{ label: "Luz", value: "light" },
										{ label: "Actividad", value: "activity" },
										{ label: "Nivel de agua", value: "waterLevel" },
									]}
								/>
							)}
						</form.AppField>

						<form.AppField name="zoneId">
							{(field) => (
								<field.Select
									label="Zona"
									values={zones.map((zone) => ({
										label: zone.name,
										value: zone.id,
									}))}
								/>
							)}
						</form.AppField>
					</div>

					<form.AppField name="unit">
						{(field) => (
							<field.Select
								label="Unidad"
								values={[
									{ label: "%", value: "percent" },
									{ label: "°C", value: "celsius" },
									{ label: "Lux", value: "lux" },
									{ label: "Actividad", value: "activity" },
									{ label: "Litros", value: "liters" },
								]}
							/>
						)}
					</form.AppField>

					<form.AppField name="active">
						{(field) => <field.Switch label="Sensor activo" />}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Guardar sensor" />
					</form.AppForm>
				</form>
			</CardContent>
		</Card>
	)
}

function handleSubmit(event: FormEvent, submit: () => void) {
	event.preventDefault()
	event.stopPropagation()
	submit()
}
