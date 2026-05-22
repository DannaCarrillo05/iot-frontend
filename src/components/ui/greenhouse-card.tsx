import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import {
	dashboardAccentColor,
	dashboardCardBlobLeftClass,
	dashboardCardBlobRightClass,
	dashboardCardClass,
	getAccentCardStyle,
} from "@/lib/greenhouse-styles"
import { cn } from "@/lib/utils"

type GreenhouseCardProps = {
	children: ReactNode
	className?: string
	accentColor?: string
}

export function GreenhouseCard({
	children,
	className,
	accentColor = dashboardAccentColor,
}: GreenhouseCardProps) {
	return (
		<Card
			className={cn(dashboardCardClass, className)}
			style={getAccentCardStyle(accentColor)}
		>
			<div className={dashboardCardBlobRightClass} />
			<div className={dashboardCardBlobLeftClass} />
			{children}
		</Card>
	)
}
