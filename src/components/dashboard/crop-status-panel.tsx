import { Activity, AlertTriangle, Sprout } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type CropStatusPanelProps = {
	state: string
	health: number
	summary: string
	observations: string[]
	alertCount: number
}

export function CropStatusPanel({
	state,
	health,
	summary,
	observations,
	alertCount,
}: CropStatusPanelProps) {
	return (
		<GreenhouseCard className="h-full">
			<CardHeader className="space-y-4">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-1">
						<CardTitle className="flex items-center gap-2 text-green-950">
							<Sprout className="size-5 text-green-700" />
							Estado general del cultivo
						</CardTitle>
						<CardDescription className="text-green-800/70">{summary}</CardDescription>
					</div>
					<Badge className="border-green-200 bg-green-50 text-green-800">
						{state}
					</Badge>
				</div>
				<div className="space-y-3 rounded-[1.5rem_0.75rem_1.5rem_0.75rem] border border-green-100 bg-green-50/60 p-4">
					<div className="flex items-center justify-between text-sm">
						<span className="text-green-800/70">Salud general</span>
						<span className="font-semibold text-green-950">{health}%</span>
					</div>
					<Progress value={health} className="h-2.5" />
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert className="border-green-200/80 bg-green-50/50">
					<Activity className="size-4 text-green-700" />
					<AlertTitle>Resumen automático</AlertTitle>
					<AlertDescription>
						El sistema consolida sensores, umbrales y actividad por zona para
						identificar desvíos antes de afectar el cultivo.
					</AlertDescription>
				</Alert>

				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-medium text-green-950">
						<AlertTriangle className="size-4 text-green-700" />
						Observaciones importantes
					</div>
					<ul className="space-y-2 text-sm text-green-800/75">
						{observations.map((observation) => (
							<li
								key={observation}
								className="rounded-[1rem_0.5rem_1rem_0.5rem] border border-dashed border-green-200 bg-white/60 px-3 py-2"
							>
								{observation}
							</li>
						))}
					</ul>
				</div>

				<div className="text-sm text-green-800/70">
					{alertCount > 0
						? `Hay ${alertCount} alertas activas que requieren seguimiento.`
						: "No hay alertas activas en este momento."}
				</div>
			</CardContent>
		</GreenhouseCard>
	)
}
