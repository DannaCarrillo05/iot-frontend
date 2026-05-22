import { z } from "zod"

export const recommendationPrioritySchema = z.enum([
	"low",
	"medium",
	"high",
])

export const recommendationSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	description: z.string().min(1),
	priority: recommendationPrioritySchema,
	actionLabel: z.string().min(1),
	target: z.string().min(1),
	automated: z.boolean().default(true),
	relatedAlertIds: z.array(z.string().min(1)).default([]),
})

export type RecommendationPriority = z.infer<
	typeof recommendationPrioritySchema
>
export type Recommendation = z.infer<typeof recommendationSchema>
