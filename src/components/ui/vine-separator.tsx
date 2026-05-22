import { Leaf } from "lucide-react"

export function VineSeparator() {
	return (
		<div className="my-2 flex items-center gap-3">
			<div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300/80 to-green-300/80" />
			<div className="flex size-8 items-center justify-center rounded-full border border-green-200/80 bg-white/70 text-green-600 shadow-sm">
				<Leaf className="size-4" />
			</div>
			<div className="h-px flex-1 bg-gradient-to-r from-green-300/80 via-green-300/80 to-transparent" />
		</div>
	)
}
