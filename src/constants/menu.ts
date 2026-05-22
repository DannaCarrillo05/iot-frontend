import type { LucideIcon } from "lucide-react"
import { HardHat, PcCase, Settings } from "lucide-react"

/**
 * Base navigation item properties
 */
interface NavItemBase {
	title: string
	isActive?: boolean
}

/**
 * Child navigation item that represents a final navigation destination
 */
export interface NavChildItem extends NavItemBase {
	url: string
	/**
	 * Permission required to display this item.
	 * If omitted, the item is always visible.
	 */
	permission?: {
		action: string
		resourceType: string
	}
}

/**
 * Parent/grouper navigation item that contains child items
 */
export interface NavParentItem extends NavItemBase {
	icon: LucideIcon
	url?: string // Optional URL for the parent
	items: NavChildItem[]
}

/**
 * Type representing any navigation item (parent or child)
 */
export type NavItem = NavParentItem | NavChildItem

/**
 * Constant definition of the main navigation menu.
 * Parent items group related functionality, while child items
 * represent the actual navigation destinations.
 */
export const navMain: NavParentItem[] = [
	{
		title: "Permiso de Trabajo",
		url: "/permiso-de-trabajo",
		icon: HardHat,
		items: [
			{
				title: "Lista de Permisos",
				url: "/permiso-de-trabajo",
			},
			{
				title: "Mis Permisos",
				url: "/mis-permisos",
			},
		],
	},
	{
		title: "Configuración",
		url: "/configuracion",
		icon: Settings,
		items: [
			{
				title: "Usuarios",
				url: "/configuracion/usuarios",
			},
			{
				title: "EPP",
				url: "/configuracion/epp",
			},
			{
				title: "Equipos Requeridos",
				url: "/configuracion/equipos-requeridos",
			},
			{
				title: "Sistemas de Acceso",
				url: "/configuracion/sistemas-de-acceso",
			},
			{
				title: "Ejecutantes",
				url: "/configuracion/ejecutantes",
			},
		],
	},
	{
		title: "Administracion del sistema",
		url: "/administracion-del-sistema",
		icon: PcCase,
		items: [
			{
				title: "Roles y permisos",
				url: "/administracion-del-sistema",
			},
		],
	},
]

export function getFirstItem() {
	return navMain[0].items[0]
}
