import type { FormEvent } from "react"
import { dashboardThresholdsSchema } from "@/schemas/dashboard-config.schema"
import { useAppForm } from "@/hooks/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SensorThresholdFormProps = {
	initialValues: {
		temperatureMin: number
		temperatureMax: number
		humidityMin: number
		humidityMax: number
		lightMin: number
		waterLevelMin: number
	}
	alertsEnabled: boolean
	onSave: (
		values: {
			temperatureMin: number
			temperatureMax: number
			humidityMin: number
			humidityMax: number
			lightMin: number
			waterLevelMin: number
			alertsEnabled: boolean
		},
	) => void
}

export function SensorThresholdForm({
	initialValues,
	alertsEnabled,
	onSave,
}: SensorThresholdFormProps) {
	const form = useAppForm({
		defaultValues: {
			temperatureMin: String(initialValues.temperatureMin),
			temperatureMax: String(initialValues.temperatureMax),
			humidityMin: String(initialValues.humidityMin),
			lightMin: String(initialValues.lightMin),
			humidityMax: initialValues.humidityMax,
			waterLevelMin: initialValues.waterLevelMin,
			alertsEnabled,
		},
		validators: {
			onSubmitAsync: async ({ value }) => {
				const thresholds = dashboardThresholdsSchema.parse({
					temperatureMin: Number(value.temperatureMin),
					temperatureMax: Number(value.temperatureMax),
					humidityMin: Number(value.humidityMin),
					humidityMax: value.humidityMax,
					lightMin: Number(value.lightMin),
					waterLevelMin: value.waterLevelMin,
				})

				onSave({
					...thresholds,
					alertsEnabled: value.alertsEnabled,
				})
			},
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configuración de umbrales</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(event) => handleSubmit(event, form.handleSubmit)}
					className="grid gap-4"
				>
					<div className="grid gap-4 md:grid-cols-2">
						<form.AppField name="temperatureMin">
							{(field) => (
								<field.TextField
									label="Temperatura mínima"
									type="number"
									placeholder="20"
								/>
							)}
						</form.AppField>
						<form.AppField name="temperatureMax">
							{(field) => (
								<field.TextField
									label="Temperatura máxima"
									type="number"
									placeholder="28"
								/>
							)}
						</form.AppField>
						<form.AppField name="humidityMin">
							{(field) => (
								<field.TextField
									label="Humedad mínima"
									type="number"
									placeholder="55"
								/>
							)}
						</form.AppField>
						<form.AppField name="lightMin">
							{(field) => (
								<field.TextField
									label="Luz mínima"
									type="number"
									placeholder="500"
								/>
							)}
						</form.AppField>
					</div>

					<form.AppField name="humidityMax">
						{(field) => (
							<field.Slider label="Humedad máxima" min={40} max={90} step={1} />
						)}
					</form.AppField>

					<form.AppField name="waterLevelMin">
						{(field) => (
							<field.Slider
								label="Nivel mínimo de agua"
								min={10}
								max={80}
								step={1}
							/>
						)}
					</form.AppField>

					<form.AppField name="alertsEnabled">
						{(field) => <field.Switch label="Activar alertas automáticas" />}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Guardar umbrales" />
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
