import { BellRing, Leaf, ShieldCheck, Sprout } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { dashboardCardAccentClass } from "@/lib/greenhouse-styles"
import { cn } from "@/lib/utils"

type AppHeaderProps = {
	alertCount: number
	health: number
	state: string
}

export function AppHeader({ alertCount, health, state }: AppHeaderProps) {
	return (
		<header
			className={cn(
				"relative overflow-hidden rounded-[2rem_1rem_2rem_1rem]",
				"border border-green-200/70 bg-white/85 p-5 shadow-sm backdrop-blur-md",
			)}
		>
			<div className={dashboardCardAccentClass} />
			<div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-200/25" />

			<div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm font-medium text-green-700">
						<Leaf className="size-4" />
						<span>Sistema IoT agrícola</span>
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-green-950">
							Invernadero inteligente
						</h1>
						<p className="max-w-2xl text-sm text-green-800/70">
							Monitoreo en tiempo real de sensores, zonas, alertas y
							configuración operativa.
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
						<Sprout className="size-4 text-green-700" />
						<span>Estado: {state}</span>
					</div>
					<Badge
						className="gap-1.5 border-green-200/80 bg-white/80 text-green-800"
						variant="outline"
					>
						<ShieldCheck className="size-3.5" />
						Salud general {health}%
					</Badge>
					<Badge
						className="gap-1.5"
						variant={alertCount > 0 ? "secondary" : "default"}
					>
						<BellRing className="size-3.5" />
						{alertCount} alertas activas
					</Badge>
				</div>
			</div>
		</header>
	)
}
