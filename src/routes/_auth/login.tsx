import { createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn, useServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import z from "zod"
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { validateInternalRedirect } from "@/features/auth/authentication"
import { useAppForm } from "@/hooks/form"
import { auth } from "@/lib/auth"
import { handleAuthError } from "@/lib/better-auth-error"
import { tryCatch } from "@/lib/try-catch"

export const loginUser = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			email: z.string(),
			password: z.string(),
			rememberMe: z.boolean(),
		}),
	)
	.handler(async ({ data }) => {
		const request = getRequest()
		const redirectTo = new URL(request.url).searchParams.get("redirectTo")

		const { result, error } = await tryCatch(
			auth.api.signInEmail({
				body: {
					email: data.email,
					password: data.password,
					rememberMe: data.rememberMe,
				},
			}),
		)

		if (!result) {
			return handleAuthError(error)
		}

		throw redirect({
			to: validateInternalRedirect(redirectTo),
		})
	})

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
})

function RouteComponent() {
	const loginFn = useServerFn(loginUser)
	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
		validators: {
			onSubmitAsync: async ({ value }) =>
				await loginFn({
					data: {
						email: value.email,
						password: value.password,
						rememberMe: value.rememberMe,
					},
				}),
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		e.stopPropagation()
		form.handleSubmit()
	}

	return (
		<>
			<CardHeader className="space-y-3 p-3">
				<div className="flex justify-center">
					<img
						src="/images/mederi-logo.png"
						alt="Logo"
						width={200}
						height={100}
					/>
				</div>
				<CardTitle className="text-center text-2xl font-semibold tracking-tight">
					Bienvenido
				</CardTitle>
				<CardDescription className="text-muted-foreground text-center text-base">
					Ingresa tus credenciales para acceder
				</CardDescription>
			</CardHeader>

			<CardContent className="mb-2 h-full px-10 py-0">
				<form
					onSubmit={handleSubmit}
					className="flex h-full flex-col justify-center space-y-8"
				>
					<form.AppField name="email">
						{(field) => (
							<field.TextField
								label="Correo electrónico"
								placeholder="lsanchez@ejemplo.com"
								type="email"
								autoComplete="email"
								required
							/>
						)}
					</form.AppField>

					<form.AppField name="password">
						{(field) => (
							<field.TextField
								label="Contraseña"
								placeholder="********"
								type="password"
							/>
						)}
					</form.AppField>

					<div className="flex items-center space-x-2">
						<form.AppField name="rememberMe">
							{(field) => <field.Checkbox label="Mantener sesión iniciada" />}
						</form.AppField>
					</div>

					<form.Subscribe
						selector={(state) => [state.errorMap]}
						children={([errorMap]) =>
							errorMap.onSubmit ? (
								<div className="text-sm text-red-500">
									{errorMap.onSubmit.form}
								</div>
							) : null
						}
					/>

					<div className="space-y-2">
						<form.AppForm>
							<form.SubmitButton label="Iniciar sesión" className="w-full" />
						</form.AppForm>
					</div>

					<div className="text-muted-foreground text-center text-sm">
						<span>¿Necesitas ayuda? </span>
						<a
							href="https://plibots.atlassian.net/servicedesk/customer/portal/1"
							className="text-primary hover:underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							Contacta al soporte
						</a>
					</div>
				</form>
			</CardContent>
		</>
	)
}
