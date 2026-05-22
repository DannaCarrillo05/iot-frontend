import type { Alert } from "@/schemas/alert.schema"
import { AlertCircle } from "lucide-react"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertItem } from "./alert-item"

type AlertsPanelProps = {
	alerts: Alert[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
	return (
		<GreenhouseCard>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-green-950">
					<AlertCircle className="size-5 text-green-700" />
					Alertas del sistema
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{alerts.map((alert) => (
						<AlertItem key={alert.id} alert={alert} />
					))}
				</div>
			</CardContent>
		</GreenhouseCard>
	)
}
