import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "lucide-react"
import type { ReactNode } from "react"
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
				<DialogPrimitive.Overlay
					className={cn(
						"fixed inset-0 z-50 bg-green-950/40",
						"supports-backdrop-filter:bg-green-950/25 supports-backdrop-filter:backdrop-blur-sm",
						"data-[state=open]:animate-in data-[state=open]:fade-in-0",
						"data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
						"duration-150",
					)}
				/>
				<DialogPrimitive.Content
					aria-describedby={description ? undefined : undefined}
					className={cn(
						"fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
						"flex h-[90vh] w-[94vw] max-w-[1400px] flex-col",
						"overflow-hidden rounded-3xl border shadow-2xl shadow-green-950/20 backdrop-blur-md",
						"focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600/40",
						"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
						"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
						"duration-150",
					)}
					style={getAccentCardStyle(accentColor)}
				>
					<div className={dashboardCardBlobRightClass} />
					<div className={dashboardCardBlobLeftClass} />

					<header className="relative flex shrink-0 items-start justify-between gap-6 border-b border-green-900/10 px-6 pb-5 pt-6 sm:px-8">
						<div className="flex min-w-0 flex-col gap-1.5">
							<DialogPrimitive.Title className="truncate text-xl font-semibold leading-tight text-green-950 sm:text-2xl">
								{title}
							</DialogPrimitive.Title>
							{description ? (
								<DialogPrimitive.Description className="text-sm leading-relaxed text-green-800/70">
									{description}
								</DialogPrimitive.Description>
							) : null}
						</div>
						<DialogPrimitive.Close
							aria-label="Cerrar"
							className={cn(
								"inline-flex size-9 shrink-0 items-center justify-center rounded-full",
								"border border-green-900/10 bg-white/70 text-green-900",
								"transition-colors hover:bg-white hover:text-green-950",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/40",
							)}
						>
							<X className="size-4" />
						</DialogPrimitive.Close>
					</header>

					<div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
						{open ? children : null}
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}
