"use client"

import { Link, useLocation } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import { useState } from "react"

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar"
import type { NavChildItem, NavItem, NavParentItem } from "@/constants/menu"

export function NavMain({ items }: { items: NavItem[] }) {
	const location = useLocation()
	const pathname = location.pathname
	const [openItem, setOpenItem] = useState<string | undefined>(() => {
		const activeParentViaChild = items.find(
			(item): item is NavParentItem =>
				"items" in item &&
				item.items.some((subItem: NavChildItem) =>
					pathname.startsWith(subItem.url),
				),
		)
		const explicitlyActiveParent = items.find(
			(item): item is NavParentItem => "items" in item && !!item.isActive,
		)
		return activeParentViaChild?.title ?? explicitlyActiveParent?.title
	})
	const sidebar = useSidebar()

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) => {
					if (!("items" in item)) return null

					return (
						<Collapsible
							key={item.title}
							asChild
							open={openItem === item.title}
							onOpenChange={(isOpen) =>
								setOpenItem(isOpen ? item.title : undefined)
							}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								{item.items?.length ? (
									<>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton
												tooltip={item.title}
												data-active={item.items?.some((sub: NavChildItem) =>
													pathname.startsWith(sub.url),
												)}
												onClick={() => {
													// Only toggle sidebar on desktop when collapsed
													// On mobile, we don't want to close the sidebar when expanding submenus
													if (
														!sidebar.isMobile &&
														sidebar.state === "collapsed"
													) {
														sidebar.toggleSidebar()
													}
												}}
											>
												{item.icon && <item.icon className="text-primary" />}
												<span className="text-primary">{item.title}</span>
												<ChevronRight className="text-primary ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.items?.map((subItem: NavChildItem) => (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton
															asChild
															isActive={pathname.startsWith(subItem.url)}
														>
															<Link
																to={subItem.url}
																viewTransition
																onClick={() => {
																	// Close mobile sidebar when clicking on submenu items
																	if (sidebar.isMobile) {
																		sidebar.setOpenMobile(false)
																	}
																}}
															>
																<span>{subItem.title}</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</>
								) : null}
							</SidebarMenuItem>
						</Collapsible>
					)
				})}
			</SidebarMenu>
		</SidebarGroup>
	)
}
