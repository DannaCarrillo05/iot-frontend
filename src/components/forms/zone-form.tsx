import type { FormEvent } from "react"
import type { Zone } from "@/schemas/zone.schema"
import { zoneSchema } from "@/schemas/zone.schema"
import { useAppForm } from "@/hooks/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ZoneFormProps = {
	zone: Zone
	onSave: (zone: Zone) => void
}

export function ZoneForm({ zone, onSave }: ZoneFormProps) {
	const form = useAppForm({
		defaultValues: {
			name: zone.name,
			description: zone.description,
			status: zone.status,
			sensorIds: zone.sensorIds.join(", "),
		},
		validators: {
			onSubmitAsync: async ({ value }) => {
				onSave(
					zoneSchema.parse({
						...zone,
						name: value.name,
						description: value.description,
						status: value.status,
						sensorIds: value.sensorIds
							.split(",")
							.map((item) => item.trim())
							.filter(Boolean),
					}),
				)
			},
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Registro de zona</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(event) => handleSubmit(event, form.handleSubmit)}
					className="grid gap-4"
				>
					<form.AppField name="name">
						{(field) => <field.TextField label="Nombre de zona" />}
					</form.AppField>

					<form.AppField name="description">
						{(field) => (
							<field.TextArea
								label="Descripción"
								description="Breve contexto operativo de la zona."
							/>
						)}
					</form.AppField>

					<form.AppField name="status">
						{(field) => (
							<field.Select
								label="Estado"
								values={[
									{ label: "Estable", value: "normal" },
									{ label: "Atención", value: "warning" },
									{ label: "Crítico", value: "critical" },
									{ label: "Inactiva", value: "inactive" },
								]}
							/>
						)}
					</form.AppField>

					<form.AppField name="sensorIds">
						{(field) => (
							<field.TextField
								label="Sensores asociados"
								placeholder="humidity-a, temperature-a"
							/>
						)}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Guardar zona" />
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
