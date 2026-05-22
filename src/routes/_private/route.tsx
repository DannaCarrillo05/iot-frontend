import { createFileRoute, Outlet } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import Cookies from "universal-cookie"
import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
	SIDEBAR_COOKIE_NAME,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { navMain } from "@/constants/menu"
import { getUser } from "@/features/auth/authentication"

export const getSidebarState = createServerFn().handler(async () => {
	const headers = getRequestHeaders()
	const rawCookie = headers.get("cookie")
	const cookie = new Cookies(rawCookie || null)
	return cookie.get(SIDEBAR_COOKIE_NAME)
})

export const Route = createFileRoute("/_private")({
	component: RouteComponent,
	beforeLoad: async () => {
		const user = await getUser()
		return {
			user,
		}
	},
	loader: async () => {
		return {
			sidebarState: await getSidebarState(),
		}
	},
})

function RouteComponent() {
	const { user } = Route.useRouteContext()
	const { sidebarState } = Route.useLoaderData()

	return (
		<SidebarProvider defaultOpen={sidebarState}>
			<AppSidebar user={user} navMain={navMain} />
			<SidebarInset>
				<header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 overflow-hidden rounded-lg backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<AppBreadcrumb />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-6 pt-2">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
