import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import {
	dashboardCardAccentClass,
	dashboardCardBlobLeftClass,
	dashboardCardBlobRightClass,
	dashboardCardClass,
} from "@/lib/greenhouse-styles"
import { cn } from "@/lib/utils"

type GreenhouseCardProps = {
	children: ReactNode
	className?: string
}

export function GreenhouseCard({ children, className }: GreenhouseCardProps) {
	return (
		<Card className={cn(dashboardCardClass, className)}>
			<div className={dashboardCardAccentClass} />
			<div className={dashboardCardBlobRightClass} />
			<div className={dashboardCardBlobLeftClass} />
			{children}
		</Card>
	)
}
