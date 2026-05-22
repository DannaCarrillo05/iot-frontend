import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_private/usuario")({
	component: RouteComponent,
	loader: () => {
		return {
			crumb: "Usuario",
		}
	},
})

function RouteComponent() {
	return <div>Hello "/_private/dashboard/usuario"!</div>
}
