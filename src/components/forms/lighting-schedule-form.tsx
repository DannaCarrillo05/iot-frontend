import type { FormEvent } from "react"
import type { LightingSchedule } from "@/schemas/dashboard-config.schema"
import { lightingScheduleSchema } from "@/schemas/dashboard-config.schema"
import { useAppForm } from "@/hooks/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type LightingScheduleFormProps = {
	initialValues: LightingSchedule
	onSave: (schedule: LightingSchedule) => void
}

const hourOptions = Array.from({ length: 24 }, (_, hour) => ({
	label: `${hour.toString().padStart(2, "0")}:00`,
	value: String(hour),
}))

export function LightingScheduleForm({
	initialValues,
	onSave,
}: LightingScheduleFormProps) {
	const form = useAppForm({
		defaultValues: {
			startHour: String(initialValues.startHour),
			endHour: String(initialValues.endHour),
			enabled: initialValues.enabled,
		},
		validators: {
			onSubmitAsync: async ({ value }) => {
				onSave(
					lightingScheduleSchema.parse({
						startHour: Number(value.startHour),
						endHour: Number(value.endHour),
						enabled: value.enabled,
					}),
				)
			},
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Horario de iluminación</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(event) => handleSubmit(event, form.handleSubmit)}
					className="grid gap-4"
				>
					<div className="grid gap-4 md:grid-cols-2">
						<form.AppField name="startHour">
							{(field) => (
								<field.Select label="Inicio" values={hourOptions} />
							)}
						</form.AppField>
						<form.AppField name="endHour">
							{(field) => <field.Select label="Fin" values={hourOptions} />}
						</form.AppField>
					</div>

					<form.AppField name="enabled">
						{(field) => <field.Switch label="Programación activa" />}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Guardar horario" />
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
