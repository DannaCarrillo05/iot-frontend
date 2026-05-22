import { AlertTriangle } from "lucide-react"
import type { Alert } from "@/schemas/alert.schema"
import { getStatusBadgeVariant } from "@/lib/status-utils"
import { Badge } from "@/components/ui/badge"

type AlertItemProps = {
	alert: Alert
}

export function AlertItem({ alert }: AlertItemProps) {
	return (
		<div className="rounded-[1.25rem_0.75rem_1.25rem_0.75rem] border border-green-200/70 bg-white/70 p-4 shadow-sm">
			<div className="mb-2 flex items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					<div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-green-100 text-green-700">
						<AlertTriangle className="size-4" />
					</div>
					<div>
						<p className="font-medium text-green-950">{alert.title}</p>
						<p className="mt-1 text-sm text-green-800/70">{alert.message}</p>
					</div>
				</div>
				<Badge variant={getStatusBadgeVariant(alert.severity)}>{alert.severity}</Badge>
			</div>
			<div className="text-xs text-green-700/70">
				{alert.zoneId ? `Zona: ${alert.zoneId}` : "Sistema general"}
			</div>
		</div>
	)
}
