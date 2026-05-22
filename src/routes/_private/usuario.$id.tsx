import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_private/usuario/$id")({
	component: RouteComponent,
	loader: async ({ params }) => {
		return {
			crumb: "Erik",
		}
	},
})

function RouteComponent() {
	return <div>Hello "/_private/usuario/$id"!</div>
}
