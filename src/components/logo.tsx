import type React from "react"
import { cn } from "@/lib/utils"

export function Logo({ className, ...props }: React.ComponentProps<"img">) {
	return (
		<img
			{...props}
			src="/images/mederi-logo.png"
			alt="Logo de Mederi"
			className={cn("", className)}
			loading="lazy"
		/>
	)
}
