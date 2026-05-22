import { createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/lib/auth"

export const logoutUser = createServerFn({ method: "POST" }).handler(
	async () => {
		const headers = getRequestHeaders()
		await auth.api.signOut({ headers })
		throw redirect({
			to: "/login",
		})
	},
)

export const Route = createFileRoute("/logout")({
	beforeLoad: async () => {
		await logoutUser()
	},
})
