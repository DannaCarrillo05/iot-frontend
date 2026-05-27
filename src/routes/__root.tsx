import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { Home, Leaf, Sprout } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GreenhouseBackground } from "@/components/ui/greenhouse-background"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools"
import appCss from "../styles.css?url"

interface MyRouterContext {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Dashboard de Invernadero",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				href: "/favicon.png",
			},
		],
	}),

	notFoundComponent: NotFoundPage,
	shellComponent: RootDocument,
})

function NotFoundPage() {
	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
			<GreenhouseBackground />

			<section className="relative z-10 w-full max-w-3xl">
				<div className="mb-4 flex justify-center">
					<div className="flex items-center gap-2 rounded-full border border-green-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-green-800 shadow-sm backdrop-blur-md">
						<Leaf className="size-4 text-green-700" />
						Ruta fuera del invernadero
					</div>
				</div>

				<GreenhouseCard className="text-center shadow-xl shadow-green-900/5">
					<CardHeader className="items-center gap-4 px-6 pt-8">
						<div className="relative flex size-20 items-center justify-center rounded-[2rem_1rem_2rem_1rem] bg-green-100 text-green-700">
							<div className="absolute -right-2 -top-2 size-7 rounded-full bg-lime-200/70" />
							<Sprout className="relative size-10" />
						</div>

						<div className="space-y-3">
							<p className="text-sm font-semibold uppercase tracking-[0.35em] text-green-700/80">
								Error 404
							</p>
							<CardTitle className="text-3xl font-bold tracking-tight text-green-950 sm:text-5xl">
								Esta zona no está monitoreada
							</CardTitle>
						</div>
					</CardHeader>

					<CardContent className="flex flex-col items-center gap-6 px-6 pb-8">
						<p className="max-w-xl text-base leading-7 text-green-800/70">
							La ruta que intentaste abrir no existe en el panel del
							invernadero. Vuelve al dashboard para revisar sensores, alertas y
							zonas activas.
						</p>

						<Button asChild className="rounded-full px-5" size="lg">
							<Link to="/">
								<Home className="size-4" />
								Volver al inicio
							</Link>
						</Button>
					</CardContent>
				</GreenhouseCard>
			</section>
		</main>
	)
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="es">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	)
}
