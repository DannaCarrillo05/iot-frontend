import type { ReactNode } from "react"
import { GreenhouseBackground } from "@/components/ui/greenhouse-background"
import { cn } from "@/lib/utils"

type DashboardLayoutProps = {
	header: ReactNode
	children: ReactNode
	className?: string
}

export function DashboardLayout({
	header,
	children,
	className,
}: DashboardLayoutProps) {
	return (
		<div className="relative min-h-screen">
			<GreenhouseBackground />

			<div className="relative z-10">
				<div className="mx-auto max-w-7xl px-6 pt-6">{header}</div>
				<main className={cn("pb-10", className)}>{children}</main>
			</div>
		</div>
	)
}
