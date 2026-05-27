import { ArrowRight, Sparkles } from "lucide-react"
import type { Recommendation } from "@/schemas/recommendation.schema"
import { getPriorityLabel } from "@/lib/status-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RecommendationCardProps = {
	recommendation: Recommendation
}

const priorityVariant = {
	low: "outline",
	medium: "secondary",
	high: "default",
} as const

export function RecommendationCard({
	recommendation,
}: RecommendationCardProps) {
	return (
		<Card className="rounded-[1.25rem_0.75rem_1.25rem_0.75rem] border border-green-200/70 bg-white/70 shadow-sm">
			<CardHeader className="space-y-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-full bg-green-100 text-green-700">
							<Sparkles className="size-4" />
						</div>
						<CardTitle className="text-green-950">{recommendation.title}</CardTitle>
					</div>
					<Badge variant={priorityVariant[recommendation.priority]}>
						{getPriorityLabel(recommendation.priority)}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-green-800/70">{recommendation.description}</p>
				<div className="flex items-center justify-between gap-3">
					<span className="text-xs uppercase tracking-wide text-green-700/70">
						{recommendation.target}
					</span>
					<Button
						size="sm"
						variant="outline"
						className="border-green-200 text-green-800 hover:bg-green-50"
					>
						{recommendation.actionLabel}
						<ArrowRight className="size-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
