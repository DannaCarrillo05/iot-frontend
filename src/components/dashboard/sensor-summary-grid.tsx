import type { SensorSummary } from "@/hooks/use-sensor-data"
import { SensorSummaryCard } from "./sensor-summary-card"

type SensorSummaryGridProps = {
	summaries: SensorSummary[]
}

export function SensorSummaryGrid({ summaries }: SensorSummaryGridProps) {
	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
			{summaries.map((summary) => (
				<SensorSummaryCard key={summary.type} summary={summary} />
			))}
		</section>
	)
}
