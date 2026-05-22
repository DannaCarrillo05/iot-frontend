import type { Recommendation } from "@/schemas/recommendation.schema"
import { GreenhouseCard } from "@/components/ui/greenhouse-card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecommendationCard } from "./recommendation-card"

type RecommendationsPanelProps = {
	recommendations: Recommendation[]
}

export function RecommendationsPanel({
	recommendations,
}: RecommendationsPanelProps) {
	return (
		<GreenhouseCard>
			<CardHeader>
				<CardTitle className="text-green-950">
					Recomendaciones automáticas
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3">
					{recommendations.map((recommendation) => (
						<RecommendationCard
							key={recommendation.id}
							recommendation={recommendation}
						/>
					))}
				</div>
			</CardContent>
		</GreenhouseCard>
	)
}
