import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageContainerProps = {
	children: ReactNode
	className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
	return (
		<div
			className={cn(
				"mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 2xl:px-8",
				className,
			)}
		>
			{children}
		</div>
	)
}
