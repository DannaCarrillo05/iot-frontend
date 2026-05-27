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
				<div className="mx-auto w-full max-w-[1600px] px-4 pt-6 sm:px-6 2xl:px-8">
						{header}
					</div>
				<main className={cn("pb-10", className)}>{children}</main>
			</div>
		</div>
	)
}
