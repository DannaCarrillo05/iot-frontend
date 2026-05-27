import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
	dashboardAccentColor,
	dashboardCardBlobLeftClass,
	dashboardCardBlobRightClass,
	getAccentCardStyle,
} from "@/lib/greenhouse-styles"
import { cn } from "@/lib/utils"

type ChartFullscreenDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	accentColor?: string
	children: ReactNode
}

export function ChartFullscreenDialog({
	open,
	onOpenChange,
	title,
	description,
	accentColor = dashboardAccentColor,
	children,
}: ChartFullscreenDialogProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs" />
				<DialogPrimitive.Content
					className={cn(
						"data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
						"fixed left-1/2 top-1/2 z-50 flex h-[90vh] w-[94vw] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 flex-col",
						"relative overflow-hidden rounded-[2rem_1rem_2rem_1rem] border backdrop-blur-md",
						"duration-150 focus:outline-none",
					)}
					style={getAccentCardStyle(accentColor)}
				>
					<div className={dashboardCardBlobRightClass} />
					<div className={dashboardCardBlobLeftClass} />

					<CardHeader className="relative shrink-0">
						<CardTitle className="text-green-950">{title}</CardTitle>
						{description ? (
							<CardDescription className="text-green-800/70">
								{description}
							</CardDescription>
						) : null}
						<div className="absolute right-4 top-3">
							<DialogPrimitive.Close asChild>
								<Button variant="ghost" size="icon-sm">
									<X className="size-4" />
									<span className="sr-only">Cerrar</span>
								</Button>
							</DialogPrimitive.Close>
						</div>
					</CardHeader>

					<CardContent className="relative min-h-0 flex-1 overflow-y-auto pb-4">
						{open ? children : null}
					</CardContent>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}
