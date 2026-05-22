import { getAccentCardStyle } from "@/lib/greenhouse-styles"
import { cn } from "@/lib/utils"
import type { NodeLatestValue } from "@/schemas/node.schema"

type NodeLatestValuesProps = {
	values: NodeLatestValue[]
	hiddenKeys: Set<string>
	onToggle: (key: string) => void
	className?: string
}

export function NodeLatestValues({
	values,
	hiddenKeys,
	onToggle,
	className,
}: NodeLatestValuesProps) {
	return (
		<div className={cn("space-y-2", className)}>
			<p className="text-xs text-green-700/60">
				Haz clic en una tarjeta para mostrar u ocultar su línea en la gráfica.
			</p>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{values.map((entry) => {
					const isVisible = !hiddenKeys.has(entry.key)

					return (
						<button
							key={entry.key}
							type="button"
							onClick={() => onToggle(entry.key)}
							aria-pressed={isVisible}
							className={cn(
								"rounded-2xl border px-4 py-3 text-left transition-all",
								"focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:outline-none",
								isVisible
									? "hover:-translate-y-0.5"
									: "border-dashed border-green-200/70 opacity-55 hover:opacity-75",
							)}
							style={
								isVisible
									? getAccentCardStyle(entry.color)
									: {
											boxShadow: "0 1px 3px rgb(134 239 172 / 0.12)",
										}
							}
						>
							<div className="flex items-center gap-2">
								<span
									className="size-2.5 shrink-0 rounded-full"
									style={{ backgroundColor: entry.color }}
									aria-hidden
								/>
								<p
									className={cn(
										"text-xs font-medium tracking-wide uppercase",
										isVisible
											? "text-green-800/80"
											: "text-green-700/50 line-through",
									)}
								>
									{entry.label}
								</p>
								{!isVisible ? (
									<span className="ml-auto text-[10px] font-medium tracking-wide text-green-700/50 uppercase">
										Oculta
									</span>
								) : null}
							</div>
							<p
								className={cn(
									"mt-1 text-2xl font-semibold tracking-tight",
									isVisible ? "text-green-950" : "text-green-800/45",
								)}
							>
								{entry.formattedValue}
								{entry.unit ? (
									<span
										className={cn(
											"ml-1 text-sm font-medium",
											isVisible ? "text-green-800/70" : "text-green-700/40",
										)}
									>
										{entry.unit}
									</span>
								) : null}
							</p>
							<p className="mt-1 text-xs text-green-700/60">
								Último dato registrado
							</p>
						</button>
					)
				})}
			</div>
		</div>
	)
}
