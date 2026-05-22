export function GreenhouseBackground() {
	return (
		<div className="leaf-pattern pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
			<div className="absolute left-10 top-20 h-40 w-20 rotate-45 rounded-[100%_0_100%_0] bg-green-300/20" />
			<div className="absolute right-20 top-32 h-32 w-16 -rotate-12 rounded-[100%_0_100%_0] bg-emerald-400/20" />
			<div className="absolute bottom-24 left-1/3 h-36 w-20 rotate-12 rounded-[100%_0_100%_0] bg-lime-400/20" />
			<div className="absolute bottom-10 right-12 h-44 w-24 -rotate-45 rounded-[100%_0_100%_0] bg-green-500/10" />

			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.14),transparent_35%)]" />
		</div>
	)
}
