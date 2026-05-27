import type { CSSProperties } from "react"
import type { SensorType } from "@/schemas/sensor.schema"

export const accentColors = [
	"oklch(0.58 0.16 145)",
	"oklch(0.55 0.18 250)",
	"oklch(0.68 0.17 85)",
	"oklch(0.6 0.2 35)",
	"oklch(0.52 0.16 305)",
	"oklch(0.56 0.14 205)",
	"oklch(0.5 0.12 170)",
	"oklch(0.62 0.19 15)",
] as const

export const dashboardAccentColor = accentColors[0]

export function getAccentColor(index: number) {
	return accentColors[index % accentColors.length]
}

export function getAccentCardStyle(accentColor: string): CSSProperties {
	return {
		borderColor: `color-mix(in oklch, ${accentColor} 38%, white)`,
		backgroundColor: `color-mix(in oklch, ${accentColor} 5%, white)`,
		boxShadow: `0 3px 10px -2px color-mix(in oklch, ${accentColor} 22%, transparent)`,
	}
}

export const sensorAccentColors: Record<SensorType, string> = {
	humidity: accentColors[1],
	temperature: accentColors[3],
	light: accentColors[2],
	activity: accentColors[4],
	waterLevel: accentColors[5],
	voltage: accentColors[6],
	current: accentColors[7],
	power: accentColors[6],
	signal: accentColors[7],
}

export const dashboardCardClass =
	"relative overflow-hidden rounded-[2rem_1rem_2rem_1rem] border backdrop-blur-md transition-all hover:-translate-y-0.5"

export const dashboardCardBlobRightClass =
	"pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-200/30"

export const dashboardCardBlobLeftClass =
	"pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-lime-200/20"

export const sectionTitleClass = "text-xl font-semibold tracking-tight text-green-950"

export const sectionDescriptionClass = "text-sm text-green-800/70"

export const iconBadgeClass =
	"flex size-11 items-center justify-center rounded-2xl bg-green-100 text-green-700"
