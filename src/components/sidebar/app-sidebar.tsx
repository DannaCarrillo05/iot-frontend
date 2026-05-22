import type { User } from "better-auth"
import { LifeBuoy } from "lucide-react"
import type * as React from "react"
import { Logo } from "@/components/logo"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { NavItem } from "@/constants/menu"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	user: User
	navMain: NavItem[]
}

const navSecondary = [
	{
		title: "Soporte",
		url: "https://plibots.atlassian.net/servicedesk/customer/portal/1",
		icon: LifeBuoy,
	},
]

export function AppSidebar({ navMain, user, ...props }: AppSidebarProps) {
	return (
		<Sidebar collapsible="icon" variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem className="mx-auto">
						<Logo
							className={`${
								props.collapsible === "icon" ? "h-auto w-4" : "h-auto w-48"
							}`}
						/>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="overflow-hidden">
				<NavMain items={navMain} />
				<NavSecondary items={navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	)
}
