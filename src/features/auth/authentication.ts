import { redirect } from "@tanstack/react-router"
import { createMiddleware, createServerFn } from "@tanstack/react-start"
import { getRequest, getRequestHeaders } from "@tanstack/react-start/server"
import { getFirstItem } from "@/constants/menu"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"

/**
 * Valida que una URL sea una ruta interna segura (relativa)
 * Previene ataques de open redirect al solo permitir rutas que empiecen con /
 */
export function validateInternalRedirect(url: string | null): string {
	if (!url) {
		return "/dashboard"
	}

	// Solo permitir rutas relativas que empiecen con /
	// Rechazar URLs absolutas, protocolos (http://, https://, javascript:, etc.)
	if (
		!url.startsWith("/") ||
		url.includes("//") ||
		url.includes(":") ||
		url.includes("..")
	) {
		return "/dashboard"
	}

	return url
}

export const findUser = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders()
	const session = await auth.api.getSession({ headers })
	return session?.user
})

export const requireUser = createMiddleware().server(async ({ next }) => {
	const request = getRequest()

	const user = await findUser()
	if (!user) {
		const url = new URL(request.url)
		const redirectTo = url.pathname
		throw redirect({
			to: "/login",
			search: {
				redirectTo: validateInternalRedirect(redirectTo),
			},
		})
	}
	return await next({
		context: {
			user,
		},
	})
})

export const getUser = createServerFn({ method: "GET" })
	.middleware([requireUser])
	.handler(({ context }) => {
		return context.user
	})

export const requireLoggedOut = createMiddleware({
	type: "function",
})
	.client(async ({ next }) => {
		const session = await authClient.getSession()
		if (session) {
			throw redirect({
				to: getFirstItem().url,
			})
		}
		return await next()
	})
	.server(async ({ next }) => {
		const request = getRequest()
		const redirectTo = new URL(request.url).searchParams.get("redirectTo")
		const user = await findUser()
		if (user) {
			throw redirect({
				to: validateInternalRedirect(redirectTo),
			})
		}
		return await next()
	})
