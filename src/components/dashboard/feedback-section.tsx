import { AlertsPanel } from "@/components/alerts/alerts-panel"
import { RecommendationsPanel } from "@/components/alerts/recommendations-panel"
import type { Alert } from "@/schemas/alert.schema"
import type { Recommendation } from "@/schemas/recommendation.schema"

type FeedbackSectionProps = {
	alerts: Alert[]
	recommendations: Recommendation[]
}

export function FeedbackSection({
	alerts,
	recommendations,
}: FeedbackSectionProps) {
	return (
		<section className="grid items-start gap-6 xl:grid-cols-2">
			<AlertsPanel alerts={alerts} />
			<RecommendationsPanel recommendations={recommendations} />
		</section>
	)
}
