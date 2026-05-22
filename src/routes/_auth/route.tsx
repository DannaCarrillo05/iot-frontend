import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getFirstItem } from "@/constants/menu"

export const Route = createFileRoute("/_auth")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (context.user) {
			throw redirect({
				to: getFirstItem().url,
			})
		}
	},
})

function RouteComponent() {
	return (
		<main className="from-primary/5 via-background to-primary/10 relative min-h-dvh overflow-hidden bg-linear-to-br">
			{/* Decorative Elements */}
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
				<div className="border-primary/30 h-[800px] w-[800px] animate-pulse rounded-full border" />
				<div className="border-primary/50 absolute h-[600px] w-[600px] animate-pulse rounded-full border" />
				<div className="border-primary/70 absolute h-[400px] w-[400px] animate-pulse rounded-full border" />
			</div>

			{/* Content Container */}
			<div className="relative flex min-h-dvh items-center justify-center p-8">
				<div className="grid w-full max-w-6xl grid-cols-5 justify-items-center gap-8 lg:grid lg:justify-items-stretch">
					{/* Left Section - Hero */}
					<div className="col-span-3 hidden lg:block">
						<div className="relative h-full overflow-hidden rounded-2xl">
							{/* Carousel with two images */}
							<CarouselImages />
						</div>
					</div>

					{/* Right Section - Content */}
					<div className="col-span-5 flex w-full max-w-xl flex-col lg:col-span-2">
						<Card className="flex h-auto min-h-[500px] flex-col shadow-2xl">
							<Outlet />
							<div className="border-border/30 mt-auto flex flex-col items-center justify-center gap-2 border-t px-10 pt-4">
								<span className="text-muted-foreground text-xs">
									Powered by
								</span>
								<a
									href="https://plibots.com"
									target="_blank"
									rel="noopener noreferrer"
									className="transition-opacity hover:opacity-80"
								>
									<img
										src="https://landing-plibots.s3.us-east-1.amazonaws.com/logo_plibots.svg"
										alt="Plibots Logo"
										width={100}
										height={40}
										className="h-auto max-w-full"
									/>
								</a>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</main>
	)
}

// Carousel component for the left section
function CarouselImages() {
	const images = ["/images/imagen-2.webp", "/images/carrousel-2.png"]
	const [index, setIndex] = useState(0)
	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prev) => (prev + 1) % images.length)
		}, 4000)
		return () => clearInterval(interval)
	}, [])

	return (
		<div className="absolute inset-0 h-full w-full">
			{images.map((src, i) => (
				<img
					key={src}
					src={src}
					alt="Industrial background"
					className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
						i === index ? "z-10 opacity-100" : "z-0 opacity-0"
					}`}
					style={{ transitionProperty: "opacity" }}
				/>
			))}
			{/* Dots navigation */}
			<div className="absolute right-0 bottom-4 left-0 z-20 flex justify-center gap-2">
				{images.map((src, i) => (
					<button
						key={src}
						type="button"
						onClick={() => setIndex(i)}
						className={`h-2 w-2 rounded-full transition-all duration-300 focus:outline-none ${
							i === index ? "bg-white" : "bg-neutral-400"
						}`}
						aria-label={`Go to slide ${i + 1}`}
					/>
				))}
			</div>
		</div>
	)
}
