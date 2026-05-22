import { useStore } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import * as ShadcnSelect from "@/components/ui/select"
import { Slider as ShadcnSlider } from "@/components/ui/slider"
import { Switch as ShadcnSwitch } from "@/components/ui/switch"
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"
import { useFieldContext, useFormContext } from "@/hooks/form-context"
import { Field, FieldDescription, FieldError, FieldLabel } from "./ui/field"

export function SubmitButton({
	label,
	...props
}: {
	label: string
} & React.ComponentProps<"button">) {
	const form = useFormContext()
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting} {...props}>
					{label}
				</Button>
			)}
		</form.Subscribe>
	)
}

export function TextField({
	label,
	placeholder,
	description,
	...props
}: {
	label: string
	placeholder?: string
	description?: string
} & React.ComponentProps<"input">) {
	const field = useFieldContext<string>()
	const errors = useStore(field.store, (state) => state.meta.errors)
	const hasErrors = errors.length > 0 && field.state.meta.isTouched

	return (
		<Field data-invalid={hasErrors}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				{...props}
				id={field.name}
				value={field.state.value}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={hasErrors}
			/>
			{description && (
				<FieldDescription className="text-sm">{description}</FieldDescription>
			)}
			{hasErrors && (
				<FieldError
					errors={errors.map((error) => ({
						message: typeof error === "string" ? error : error.message || "",
					}))}
				/>
			)}
		</Field>
	)
}

export function TextArea({
	label,
	description,
	rows = 3,
	...props
}: {
	label: string
	description?: string
	rows?: number
} & React.ComponentProps<"textarea">) {
	const field = useFieldContext<string>()
	const errors = useStore(field.store, (state) => state.meta.errors)
	const hasErrors = errors.length > 0 && field.state.meta.isTouched

	return (
		<Field data-invalid={hasErrors}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			{description && <FieldDescription>{description}</FieldDescription>}
			<ShadcnTextarea
				{...props}
				id={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				rows={rows}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={hasErrors}
			/>
			{hasErrors && (
				<FieldError
					errors={errors.map((error) => ({
						message: typeof error === "string" ? error : error.message || "",
					}))}
				/>
			)}
		</Field>
	)
}

export function Select({
	label,
	values,
	placeholder,
}: {
	label: string
	values: Array<{ label: string; value: string }>
	placeholder?: string
}) {
	const field = useFieldContext<string>()
	const errors = useStore(field.store, (state) => state.meta.errors)
	const hasErrors = errors.length > 0 && field.state.meta.isTouched

	return (
		<Field data-invalid={hasErrors}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			{placeholder && <FieldDescription>{placeholder}</FieldDescription>}
			<ShadcnSelect.Select
				name={field.name}
				value={field.state.value || null}
				onValueChange={(value) => field.handleChange(value || "")}
			>
				<ShadcnSelect.SelectTrigger
					id={field.name}
					className="w-full"
					aria-invalid={hasErrors}
				>
					<ShadcnSelect.SelectValue />
				</ShadcnSelect.SelectTrigger>
				<ShadcnSelect.SelectContent>
					<ShadcnSelect.SelectGroup>
						<ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
						{values.map((value) => (
							<ShadcnSelect.SelectItem key={value.value} value={value.value}>
								{value.label}
							</ShadcnSelect.SelectItem>
						))}
					</ShadcnSelect.SelectGroup>
				</ShadcnSelect.SelectContent>
			</ShadcnSelect.Select>
			{hasErrors && (
				<FieldError
					errors={errors.map((error) => ({
						message: typeof error === "string" ? error : error.message || "",
					}))}
				/>
			)}
		</Field>
	)
}

export function Slider({
	label,
	min = 0,
	max = 100,
	step = 1,
}: {
	label: string
	min?: number
	max?: number
	step?: number
}) {
	const field = useFieldContext<number>()
	const errors = useStore(field.store, (state) => state.meta.errors)
	const hasErrors = errors.length > 0 && field.state.meta.isTouched

	return (
		<Field data-invalid={hasErrors}>
			<div className="flex items-center justify-between">
				<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
				<span className="text-muted-foreground text-xs font-medium">
					{field.state.value}
				</span>
			</div>
			<ShadcnSlider
				id={field.name}
				min={min}
				max={max}
				step={step}
				onBlur={field.handleBlur}
				value={[field.state.value]}
				onValueChange={(value) => field.handleChange(value[0])}
				aria-invalid={hasErrors}
			/>
			{hasErrors && (
				<FieldError
					errors={errors.map((error) => ({
						message: typeof error === "string" ? error : error.message || "",
					}))}
				/>
			)}
		</Field>
	)
}

export function Switch({ label }: { label: string }) {
	const field = useFieldContext<boolean>()
	const errors = useStore(field.store, (state) => state.meta.errors)
	const hasErrors = errors.length > 0 && field.state.meta.isTouched

	return (
		<Field orientation="horizontal" data-invalid={hasErrors}>
			<ShadcnSwitch
				id={field.name}
				onBlur={field.handleBlur}
				checked={field.state.value}
				onCheckedChange={(checked) => field.handleChange(checked)}
				aria-invalid={hasErrors}
			/>
			<FieldLabel htmlFor={field.name} className="font-normal">
				{label}
			</FieldLabel>
			{hasErrors && (
				<FieldError
					errors={errors.map((error) => ({
						message: typeof error === "string" ? error : error.message || "",
					}))}
				/>
			)}
		</Field>
	)
}

export function Checkbox({ label }: { label: string }) {
	const field = useFieldContext<boolean>()
	const errors = useStore(field.store, (state) => state.meta.errors)
	const hasErrors = errors.length > 0 && field.state.meta.isTouched

	return (
		<Field orientation="horizontal" data-invalid={hasErrors}>
			<ShadcnCheckbox
				id={field.name}
				onBlur={field.handleBlur}
				checked={field.state.value}
				onCheckedChange={(checked) => field.handleChange(checked)}
				aria-invalid={hasErrors}
			/>
			<FieldLabel htmlFor={field.name} className="font-normal">
				{label}
			</FieldLabel>
			{hasErrors && (
				<FieldError
					errors={errors.map((error) => ({
						message: typeof error === "string" ? error : error.message || "",
					}))}
				/>
			)}
		</Field>
	)
}
